/* POST /api/verify-payment — server half of Razorpay checkout, step 2.

   After the customer pays, Razorpay's checkout hands the browser a signature:
   HMAC-SHA256(order_id + "|" + payment_id) keyed with our KEY SECRET. Only
   Razorpay and this server know that secret, so a valid signature proves the
   payment really happened — a customer can't forge a "successful payment" by
   calling this endpoint with made-up ids.

   Only after the signature verifies does the order get written to the Notion
   CRM. A Notion outage logs an error but still returns success — the payment
   is real regardless of whether the CRM write landed (the Razorpay webhook
   provides a second chance to record it). */

import crypto from "crypto";
import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products";
import { createOrderRow, notionConfigured } from "@/lib/notion";

export async function POST(request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
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

  // Signature is genuine — record the order in the CRM.
  const safeItems = (Array.isArray(items) ? items : []).slice(0, 50).map((i) => {
    const product = getProductById(i.id);
    return {
      name: product ? product.name : String(i.id),
      price: product ? product.price : 0,
      qty: Math.min(Math.max(parseInt(i.qty, 10) || 1, 1), 20),
      size: i.size,
      color: i.color,
    };
  });
  const amount = safeItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (notionConfigured()) {
    try {
      await createOrderRow({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount,
        customer: {
          name: String(customer?.name || "").slice(0, 200),
          email: String(customer?.email || "").slice(0, 200),
          phone: String(customer?.phone || "").slice(0, 30),
          address: String(customer?.address || "").slice(0, 1000),
        },
        items: safeItems,
        status: "New",
      });
    } catch (err) {
      console.error("Notion CRM write failed (payment IS verified, order IS real):", err);
    }
  } else {
    console.warn("Notion CRM not configured — verified order not recorded:", razorpay_order_id);
  }

  return NextResponse.json({ ok: true, paymentId: razorpay_payment_id });
}
