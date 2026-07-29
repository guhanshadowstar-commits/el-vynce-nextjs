/* EL VYNCE — transactional email (server-side only).
   Sends the customer an order confirmation and the shop owner a heads-up,
   right after a payment signature verifies. Uses Resend's REST API directly
   (fetch, no SDK) — same pattern as lib/notion.js.

   RESEND_API_KEY / EMAIL_FROM / OWNER_EMAIL live in env vars. If they're
   missing, callers treat email as "not configured": payment verification
   still succeeds — a missing/misconfigured email account must never eat an
   order, same rule as the Notion CRM write. */

const RESEND_API = "https://api.resend.com/emails";

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

async function sendEmail({ to, subject, html }) {
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
  });
  if (!res.ok) {
    throw new Error(`Resend API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function itemsRows(items) {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">${esc(i.qty)}× ${esc(i.name)} (${esc(i.size || "-")} / ${esc(i.color || "-")})</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">₹${esc(i.price * i.qty)}</td></tr>`
    )
    .join("");
}

/* order shape: { orderId, paymentId, amount, customer: {name,email,phone,address}, items } */
export async function sendOrderConfirmationEmail(order) {
  const rows = itemsRows(order.items);
  const customerHtml = `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#111;">
      <h2 style="letter-spacing:0.05em;">EL VYNCE</h2>
      <p>Hi ${esc(order.customer.name)},</p>
      <p>Your order is confirmed and payment received. Every EL VYNCE piece is made to order — production starts now.
      We'll follow up on WhatsApp/email with tracking once it ships.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">${rows}
        <tr><td style="padding:12px 0;font-weight:bold;">Total</td><td style="padding:12px 0;text-align:right;font-weight:bold;">₹${esc(order.amount)}</td></tr>
      </table>
      <p style="color:#555;font-size:14px;">Delivering to: ${esc(order.customer.address)}</p>
      <p style="color:#555;font-size:14px;">Payment reference: ${esc(order.paymentId)}</p>
      <p style="color:#555;font-size:14px;">Questions? Reply to this email or reach us at elvynceofficial@gmail.com</p>
    </div>`;

  const ownerHtml = `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#111;">
      <h2>New order — ₹${esc(order.amount)}</h2>
      <p><strong>${esc(order.customer.name)}</strong> · ${esc(order.customer.phone)} · ${esc(order.customer.email)}</p>
      <p>${esc(order.customer.address)}</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">${rows}</table>
      <p style="color:#555;font-size:14px;">Razorpay order: ${esc(order.orderId)} · Payment: ${esc(order.paymentId)}</p>
    </div>`;

  const jobs = [sendEmail({ to: order.customer.email, subject: "Your EL VYNCE order is confirmed", html: customerHtml })];
  if (process.env.OWNER_EMAIL) {
    jobs.push(sendEmail({ to: process.env.OWNER_EMAIL, subject: `New order — ₹${order.amount} from ${order.customer.name}`, html: ownerHtml }));
  }
  // Send both, but don't let one failure hide from the other — caller already
  // wraps this whole function in try/catch and treats it as best-effort.
  await Promise.all(jobs);
}
