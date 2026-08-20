/* POST /api/create-order — server half of Razorpay checkout, step 1.

   The browser sends only { items: [{ id, size, color, qty }], customer }.
   The AMOUNT is computed here from lib/products.js — the client never sends
   prices, so a tampered request can't buy a ₹18,500 bandhgala for ₹1.

   The full customer + item detail gets stashed in the Razorpay order's
   `notes` (name, phone, email, address, and a compact machine-readable item
   encoding). This is what lets the webhook in app/api/razorpay-webhook —
   which hears about a payment straight from Razorpay, independent of the
   customer's browser — reconstruct a COMPLETE order record even if the
   browser died before ever calling /api/verify-payment. Without this, a
   dropped connection right after payment would mean the order is captured
   for real money but never fully recorded anywhere.

   RAZORPAY_KEY_SECRET lives only in env vars (Vercel dashboard / .env.local)
   and only ever runs here on the server. The browser receives just the order
   id + public key id needed to open Razorpay's checkout modal. */

import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products";
import { encodeItemsForNotes } from "@/lib/orderItems";

export async function POST(request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "payments_not_configured", message: "Payments are not live yet. Razorpay keys are not configured." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length || items.length > 50) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  // Recompute the total from the server-side catalogue.
  let amountInr = 0;
  const lineItems = [];
  for (const item of items) {
    const product = getProductById(item.id);
    const qty = Math.min(Math.max(parseInt(item.qty, 10) || 0, 1), 20);
    if (!product || !product.inStock) {
      return NextResponse.json({ error: "unknown_or_unavailable_item", id: item.id }, { status: 400 });
    }
    amountInr += product.price * qty;
    lineItems.push({ name: product.name, price: product.price, qty, size: item.size, color: item.color });
  }

  const customer = body.customer || {};
  const ga4ClientId = body.clientId || "";
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInr * 100, // Razorpay counts in paise
      currency: "INR",
      // Razorpay caps each note value at 256 chars — everything here is
      // pre-truncated to fit with margin. `items_encoded` carries the exact
      // {id, size, color, qty} list (see lib/orderItems.js) so the webhook
      // can reconstruct real line items, not just a human-readable summary.
      notes: {
        customer_name: String(customer.name || "").slice(0, 100),
        customer_phone: String(customer.phone || "").slice(0, 20),
        customer_email: String(customer.email || "").slice(0, 100),
        customer_address: String(customer.address || "").slice(0, 240),
        items_summary: lineItems.map((l) => `${l.qty}x ${l.name}`).join(", ").slice(0, 240),
        items_encoded: encodeItemsForNotes(items),
        ga4_client_id: String(ga4ClientId).slice(0, 100),
      },
    }),
  });

  if (!res.ok) {
    console.error("Razorpay order creation failed:", res.status, await res.text());
    return NextResponse.json({ error: "razorpay_error" }, { status: 502 });
  }

  const order = await res.json();
  return NextResponse.json({
    orderId: order.id,
    amount: order.amount, // paise, echoed back for the checkout modal
    currency: order.currency,
    keyId, // public by design — it's the "publishable" half of the pair
  });
}
