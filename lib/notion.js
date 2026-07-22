/* EL VYNCE — Notion CRM (server-side only).
   Writes each verified order into a Notion database so the shop can be run
   from a Notion board (Status: New → Packed → Shipped → Delivered).

   Uses plain fetch against Notion's REST API — no SDK dependency.
   NOTION_TOKEN and NOTION_DATABASE_ID live in env vars (Vercel dashboard /
   .env.local). If they're missing, callers treat CRM as "not configured":
   payments still verify and succeed — a CRM outage must never eat an order.

   Database schema (created by scripts/setup-notion.mjs):
   Order (title), Status (select), Customer, Email (email), Phone (phone),
   Address, Items, Amount (number), Payment ID, Razorpay Order ID, Placed (date). */

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
    const pageId = existing.results[0].id;
    const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties: props }),
    });
    if (!res.ok) throw new Error(`Notion PATCH ${res.status}: ${await res.text()}`);
    return res.json();
  }

  return notionFetch("/pages", {
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: props,
  });
}

/* Webhook upsert: if a row with this Razorpay order id exists, confirm its
   Status; otherwise create a minimal row (covers the edge where the browser
   died before /api/verify-payment ran but Razorpay still captured payment). */
export async function confirmOrderPaid(razorpayOrderId, paymentId, amountInr) {
  const found = await notionFetch(`/databases/${process.env.NOTION_DATABASE_ID}/query`, {
    filter: { property: "Razorpay Order ID", rich_text: { equals: razorpayOrderId } },
    page_size: 1,
  });

  if (found.results && found.results.length) {
    const pageId = found.results[0].id;
    const existingStatus = found.results[0].properties?.Status?.select?.name;
    // Only set Status to "New" if it hasn't moved past the initial state already
    // (avoids resetting an in-progress fulfillment on a late Razorpay retry).
    const patchProps = { "Payment ID": rt(paymentId || "") };
    if (!existingStatus || existingStatus === "New") {
      patchProps.Status = { select: { name: "New" } };
    }
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
    return res.json();
  }

  return notionFetch("/pages", {
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: {
      Order: { title: [{ text: { content: `Webhook order ${razorpayOrderId}` } }] },
      Status: { select: { name: "New" } },
      Items: rt("Captured via webhook — customer details in Razorpay dashboard"),
      Amount: { number: amountInr },
      "Payment ID": rt(paymentId || ""),
      "Razorpay Order ID": rt(razorpayOrderId),
      Placed: { date: { start: new Date().toISOString() } },
    },
  });
}
