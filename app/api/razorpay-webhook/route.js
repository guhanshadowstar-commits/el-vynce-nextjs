/* POST /api/razorpay-webhook — Razorpay calling US directly.

   The browser callback (verify-payment) can be lost — customer's phone dies
   mid-payment, tab closed, network drop. The webhook is the safety net:
   Razorpay's own servers POST here on payment.captured, so every captured
   payment reaches the CRM even if the customer never saw the success page.

   Authenticity check: Razorpay signs the RAW request body with the webhook
   secret (a separate secret, set when creating the webhook in the Razorpay
   dashboard → Settings → Webhooks). We recompute the HMAC over the exact raw
   bytes — parsing JSON first and re-stringifying would break the signature. */

import crypto from "crypto";
import { NextResponse } from "next/server";
import { confirmOrderPaid, notionConfigured } from "@/lib/notion";

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

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity || {};
    if (notionConfigured()) {
      try {
        await confirmOrderPaid(payment.order_id || "", payment.id || "", (payment.amount || 0) / 100);
      } catch (err) {
        // Non-2xx tells Razorpay to retry later — exactly what we want if Notion was down.
        console.error("Webhook → Notion failed, asking Razorpay to retry:", err);
        return NextResponse.json({ error: "crm_write_failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
