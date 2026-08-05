/* POST /api/verify-payment — server half of Razorpay checkout, step 2.

   After the customer pays, Razorpay's checkout hands the browser a signature:
   HMAC-SHA256(order_id + "|" + payment_id) keyed with our KEY SECRET. Only
   Razorpay and this server know that secret, so a valid signature proves the
   payment really happened — a customer can't forge a "successful payment" by
   calling this endpoint with made-up ids.

   IMPORTANT: that signature only binds order_id + payment_id — it says
   nothing about `items`/`amount`/`customer`, which the browser also sends.
   Without a further check, a customer could replay a genuine low-value
   payment with a forged `items` array and get a fabricated high-value order
   written to the CRM. So right after the signature check, we fetch the order
   back from Razorpay's own API (authenticated with our secret — can't be
   spoofed, retried a couple times against transient network blips) and
   compare it to the client-recomputed amount.

   Every branch below still writes SOMETHING to Notion once the signature is
   genuine — a real payment must never go unrecorded just because our own
   bookkeeping hit a snag:
     - amounts match            → full "New" row, trusted item breakdown.
     - amounts don't match      → "Needs Review" row using Razorpay's own
                                   authoritative amount (not the client's
                                   claimed items, which are now suspect).
     - order lookup itself fails  → "Needs Review" row with the client's
                                   claimed amount, flagged as unverified.
   A Notion outage on top of that logs an error but still returns success —
   the payment is real regardless of whether the CRM write landed (the
   Razorpay webhook, registered separately, is the second safety net for
   browsers that never reach this endpoint at all — closed tab, dead network,
   etc). */

import crypto from "crypto";
import { NextResponse } from "next/server";
import { buildSafeItems, computeAmount } from "@/lib/orderItems";
import { createOrderRow, flagIfDuplicate, notionConfigured } from "@/lib/notion";
import { sendOrderConfirmationEmail, emailConfigured } from "@/lib/email";

export async function POST(request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "payments_not_configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer, items } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const givenBuf = Buffer.from(String(razorpay_signature), "hex");
  const valid = expectedBuf.length === givenBuf.length && crypto.timingSafeEqual(expectedBuf, givenBuf);
  if (!valid) {
    console.warn("Payment signature verification FAILED for order", razorpay_order_id);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  // Signature is genuine, but items/amount/customer are still just what the
  // browser sent — recompute the total from our own catalogue exactly like
  // create-order did, then cross-check it against what Razorpay actually
  // captured for this order_id before trusting it for the CRM/email.
  const safeItems = buildSafeItems(items);
  const amount = computeAmount(safeItems);

  // Retry the lookup a couple of times — a transient blip on Razorpay's API
  // must not be the reason a genuine, already-verified payment goes unrecorded.
  let razorpayOrder = null;
  let lookupError = null;
  for (let attempt = 0; attempt < 3 && !razorpayOrder; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 400 * attempt));
    try {
      const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpay_order_id)}`, {
        headers: { Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64") },
      });
      if (!orderRes.ok) throw new Error(`Razorpay order lookup ${orderRes.status}`);
      razorpayOrder = await orderRes.json();
    } catch (err) {
      lookupError = err;
    }
  }

  // needsReview stays false only when we positively confirmed the client's
  // claimed amount against Razorpay's own captured order amount. Either
  // failure mode below still produces a Notion row — never a silent drop.
  let needsReview = false;
  let recordedAmount = amount;
  let reviewNote = "";
  if (!razorpayOrder) {
    console.error("Could not fetch Razorpay order for amount verification after retries:", lookupError);
    needsReview = true;
    reviewNote = "Could not reach Razorpay to verify the paid amount — confirm manually in the Razorpay dashboard before fulfilling.";
  } else if (razorpayOrder.amount !== amount * 100) {
    console.warn(
      `Payment ${razorpay_payment_id} verified but claimed items (₹${amount}) don't match the captured order amount (₹${razorpayOrder.amount / 100}).`
    );
    needsReview = true;
    recordedAmount = razorpayOrder.amount / 100; // trust Razorpay's own figure, not the client's
    reviewNote = `Claimed items totalled ₹${amount}, but Razorpay actually captured ₹${recordedAmount} for this order — item breakdown below is unverified, do not fulfill without checking the Razorpay dashboard.`;
  }

  const safeCustomer = {
    name: String(customer?.name || "").slice(0, 200),
    email: String(customer?.email || "").slice(0, 200),
    phone: String(customer?.phone || "").slice(0, 30),
    address: String(customer?.address || "").slice(0, 1000),
  };

  // Idempotency: a retried/replayed call for an order already recorded must
  // not re-send the confirmation email (arbitrary-address spam vector) or
  // spuriously re-notify the owner. createOrderRow reports whether this call
  // was the first time a real customer email got attached to this order —
  // covers the case where the webhook wrote a bare stub row first.
  let isFirstRecord = true;
  if (notionConfigured()) {
    try {
      const result = await createOrderRow({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: recordedAmount,
        customer: safeCustomer,
        items: needsReview ? [{ name: reviewNote, price: 0, qty: 1 }] : safeItems,
        status: needsReview ? "Needs Review" : "New",
      });
      isFirstRecord = result.isFirstRecord;
    } catch (err) {
      console.error("Notion CRM write failed (payment IS verified, order IS real):", err);
    }
    // Best-effort: if a race with the webhook still produced two rows for
    // this order, flag them instead of leaving it for someone to notice by
    // accident. Never allowed to affect the response — the order write above
    // already succeeded regardless of what this finds.
    try {
      await flagIfDuplicate(razorpay_order_id);
    } catch (err) {
      console.error("Duplicate-row check failed (non-fatal):", err);
    }
  } else {
    console.warn("Notion CRM not configured — verified order not recorded:", razorpay_order_id);
  }

  // Best-effort, same rule as the CRM write: an email outage must never fail
  // a verified payment. Runs after Notion so the order is already recorded
  // even if sending the email throws. Skipped for needs-review orders — the
  // item breakdown isn't trustworthy enough to put in a customer-facing email.
  if (!needsReview && isFirstRecord && emailConfigured() && safeCustomer.email) {
    try {
      await sendOrderConfirmationEmail({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount,
        customer: safeCustomer,
        items: safeItems,
      });
    } catch (err) {
      console.error("Order confirmation email failed (payment IS verified, order IS real):", err);
    }
  }

  return NextResponse.json({ ok: true, paymentId: razorpay_payment_id });
}
