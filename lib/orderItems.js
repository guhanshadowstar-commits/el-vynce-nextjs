/* Shared cart-item handling for both order-recording paths:
   - app/api/verify-payment/route.js gets raw items straight from the browser.
   - app/api/razorpay-webhook/route.js gets them decoded back out of the
     Razorpay order's `notes` (the browser never talked to us in that path).
   Both need to turn a bare { id, qty, size, color } list into the same
   priced, named line items — kept here once so the two paths can't drift. */

import { getProductById } from "@/lib/products";

export function buildSafeItems(rawItems) {
  return (Array.isArray(rawItems) ? rawItems : []).slice(0, 50).map((i) => {
    const product = getProductById(i.id);
    return {
      name: product ? product.name : String(i.id),
      price: product ? product.price : 0,
      qty: Math.min(Math.max(parseInt(i.qty, 10) || 1, 1), 20),
      size: i.size,
      color: i.color,
    };
  });
}

export function computeAmount(safeItems) {
  return safeItems.reduce((sum, i) => sum + i.price * i.qty, 0);
}

const ITEM_SEP = ";";
const FIELD_SEP = "|";
// Razorpay caps each notes value at 256 chars — stay well under that.
const NOTES_VALUE_LIMIT = 240;

/* Compact "id|size|color|qty;id|size|color|qty" encoding that fits in a
   Razorpay order note, so the webhook path can reconstruct exactly what was
   in the cart (not just a human-readable summary) without ever having heard
   from the browser. Truncates from the end if the cart is too big to fit —
   better to record the first few items precisely than none at all. */
export function encodeItemsForNotes(rawItems) {
  const encoded = [];
  for (const i of Array.isArray(rawItems) ? rawItems : []) {
    const chunk = [i.id, i.size || "", i.color || "", i.qty ?? 1].join(FIELD_SEP);
    const next = encoded.concat(chunk).join(ITEM_SEP);
    if (next.length > NOTES_VALUE_LIMIT) break;
    encoded.push(chunk);
  }
  return encoded.join(ITEM_SEP);
}

export function decodeItemsFromNotes(str) {
  if (!str) return [];
  return String(str)
    .split(ITEM_SEP)
    .map((chunk) => {
      const [id, size, color, qty] = chunk.split(FIELD_SEP);
      return { id, size, color, qty };
    })
    .filter((i) => i.id);
}
