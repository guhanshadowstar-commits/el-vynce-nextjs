/* EL VYNCE — Notion CRM (server-side only).
   Writes each verified order into a Notion database so the shop can be run
   from a Notion board (Status: New → Needs Review / In Production → Packed
   → Shipped → Delivered).

   Uses plain fetch against Notion's REST API — no SDK dependency.
   NOTION_TOKEN and NOTION_DATABASE_ID live in env vars (Vercel dashboard /
   .env.local). If they're missing, callers treat CRM as "not configured":
   payments still verify and succeed — a CRM outage must never eat an order.

   Two independent callers can both write the same order — app/api/verify-
   payment (from the browser) and app/api/razorpay-webhook (from Razorpay
   directly, in case the browser died) — in either order. createOrderRow
   below is the single upsert both go through, so whichever arrives first
   creates the row and whichever arrives second enriches/confirms it without
   duplicating or regressing it (see the Status-downgrade guard inline).

   Database schema (created by scripts/setup-notion.mjs):
   Order (title), Status (select: New / Needs Review / In Production / Packed
   / Shipped / Delivered), Customer, Email (email), Phone (phone), Address,
   Items, Amount (number), Payment ID, Razorpay Order ID, Placed (date). */

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export function notionConfigured() {
  return Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID);
}

async function notionFetch(path, body) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API ${res.status}: ${text}`);
  }
  return res.json();
}

const rt = (content) => ({ rich_text: [{ text: { content: String(content).slice(0, 2000) } }] });

/* Create one order row — or patch the existing row if the webhook beat us to it.
   `order` shape: { orderId, paymentId, amount (INR rupees), customer: { name,
   email, phone, address }, items: [{ name, size, color, qty, price }], status } */
export async function createOrderRow(order) {
  const itemsText = order.items
    .map((i) => `${i.qty}× ${i.name} (${i.size || "-"} / ${i.color || "-"}) — ₹${i.price}`)
    .join("\n");

  // Guard against duplicate rows: if the webhook handler already wrote a stub
  // row for this Razorpay order ID, patch it with full customer details instead
  // of creating a second row.
  const existing = await notionFetch(`/databases/${process.env.NOTION_DATABASE_ID}/query`, {
    filter: { property: "Razorpay Order ID", rich_text: { equals: order.orderId || "" } },
    page_size: 1,
  });

  const props = {
    Order: { title: [{ text: { content: `${order.customer.name} — ₹${order.amount}` } }] },
    Status: { select: { name: order.status || "New" } },
    Customer: rt(order.customer.name),
    Email: { email: order.customer.email || null },
    Phone: { phone_number: order.customer.phone || null },
    Address: rt(order.customer.address || ""),
    Items: rt(itemsText),
    Amount: { number: order.amount },
    "Payment ID": rt(order.paymentId || ""),
    "Razorpay Order ID": rt(order.orderId || ""),
    Placed: { date: { start: new Date().toISOString() } },
  };

  if (existing.results && existing.results.length) {
    const existingProps = existing.results[0].properties;
    // A row already exists — most often the webhook landing first (or vice
    // versa). Only treat this as a fresh record (worth emailing about) if it
    // didn't already have a real customer email attached; otherwise this is
    // a genuine retry/replay and must not trigger a second notification.
    const hadEmail = Boolean(existingProps?.Email?.email);
    // Never let an automated write drag a row backwards — if the shop owner
    // has already moved this order to "In Production"/"Packed"/etc. in
    // Notion, a late-arriving webhook or a replayed verify-payment call must
    // not silently reset it to "New"/"Needs Review".
    const existingStatus = existingProps?.Status?.select?.name;
    const patchProps = { ...props };
    if (existingStatus && existingStatus !== "New" && existingStatus !== "Needs Review") {
      delete patchProps.Status;
    }
    const pageId = existing.results[0].id;
    const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties: patchProps }),
    });
    if (!res.ok) throw new Error(`Notion PATCH ${res.status}: ${await res.text()}`);
    const page = await res.json();
    return { ...page, isFirstRecord: !hadEmail };
  }

  const page = await notionFetch("/pages", {
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: props,
  });
  return { ...page, isFirstRecord: true };
}

/* Belt-and-suspenders for the race the two order-recording paths can still
   theoretically hit (a webhook retry landing at the same instant as a
   browser call, say): rather than trying to make the check-then-write above
   perfectly atomic (which would need an external lock), just check right
   after every write whether more than one row now exists for this Razorpay
   order ID, and if so, flag ALL of them "Duplicate — Review" so it's
   impossible to miss in Notion. The order itself is never lost either way —
   this only ever adds a visible flag, never deletes or hides data. Runs
   after createOrderRow and must never throw into the caller — a failed
   dedup-check is not a reason to fail an otherwise-successful order write. */
export async function flagIfDuplicate(orderId) {
  if (!orderId) return;
  const found = await notionFetch(`/databases/${process.env.NOTION_DATABASE_ID}/query`, {
    filter: { property: "Razorpay Order ID", rich_text: { equals: orderId } },
    page_size: 10,
  });
  const rows = found.results || [];
  if (rows.length < 2) return;

  console.warn(`Duplicate Notion rows detected for Razorpay order ${orderId}: ${rows.length} rows — flagging for review.`);
  await Promise.all(
    rows.map((row) =>
      fetch(`${NOTION_API}/pages/${row.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ properties: { Status: { select: { name: "Duplicate — Review" } } } }),
      })
    )
  );
}
