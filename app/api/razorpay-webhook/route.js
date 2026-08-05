/* POST /api/razorpay-webhook — Razorpay calling US directly.

   The browser callback (verify-payment) can be lost — customer's phone dies
   mid-payment, tab closed, network drop. The webhook is the safety net:
   Razorpay's own servers POST here on payment.captured, so every captured
   payment reaches the CRM even if the customer never saw the success page.

   Because this path never hears from the browser, the only place customer
   name/phone/email/address/items can come from is the `notes` that
   create-order stashed on the Razorpay order when it was first created (see
   app/api/create-order/route.js). We decode those and write a FULL row via
   the same createOrderRow used by verify-payment — not a bare stub — so a
   dead browser doesn't mean an incomplete CRM record.

   Authenticity check: Razorpay signs the RAW request body with the webhook
   secret (a separate secret, generated when the webhook was registered via
   the Razorpay API — see RAZORPAY_WEBHOOK_SECRET). We recompute the HMAC
   over the exact raw bytes — parsing JSON first and re-stringifying would
   break the signature. */

import crypto from "crypto";
import { NextResponse } from "next/server";
import { buildSafeItems, decodeItemsFromNotes } from "@/lib/orderItems";
import { createOrderRow, flagIfDuplicate, notionConfigured } from "@/lib/notion";

export async function POST(request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  let givenBuf;
  try {
    givenBuf = Buffer.from(signature, "hex");
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }
  if (expectedBuf.length !== givenBuf.length || !crypto.timingSafeEqual(expectedBuf, givenBuf)) {
    console.warn("Razorpay webhook: signature verification FAILED");
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity || {};
    const notes = payment.notes || event.payload?.order?.entity?.notes || {};

    // Amount comes straight from Razorpay's own payment entity — authoritative,
    // no client involved on this path at all, so no cross-check needed here
    // (contrast with verify-payment, which has to distrust the browser).
    const amountInr = (payment.amount || 0) / 100;
    const decodedItems = decodeItemsFromNotes(notes.items_encoded);
    const safeItems = decodedItems.length
      ? buildSafeItems(decodedItems)
      : [{ name: notes.items_summary || "Captured via webhook — item detail unavailable, check Razorpay dashboard", price: 0, qty: 1 }];

    if (notionConfigured()) {
      try {
        await createOrderRow({
          orderId: payment.order_id || "",
          paymentId: payment.id || "",
          amount: amountInr,
          customer: {
            name: notes.customer_name || "",
            email: notes.customer_email || "",
            phone: notes.customer_phone || "",
            address: notes.customer_address || "",
          },
          items: safeItems,
          status: "New",
        });
      } catch (err) {
        // Non-2xx tells Razorpay to retry later — exactly what we want if Notion was down.
        console.error("Webhook → Notion failed, asking Razorpay to retry:", err);
        return NextResponse.json({ error: "crm_write_failed" }, { status: 500 });
      }
      // Best-effort: catches the rare case where this webhook call and a
      // verify-payment call (or a Razorpay retry of this same webhook) land
      // close enough together to both write. Never allowed to fail the
      // response — Notion already has the order recorded either way.
      try {
        await flagIfDuplicate(payment.order_id || "");
      } catch (err) {
        console.error("Duplicate-row check failed (non-fatal):", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
