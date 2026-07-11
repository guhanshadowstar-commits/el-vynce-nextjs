# EL VYNCE — Going Live Checklist

The code is fully wired. Going live = pasting four secrets into env vars.
Everything below is done from your own accounts — no code changes needed.

## 1. Razorpay keys (~5 min)

1. Log in at dashboard.razorpay.com
2. Account & Settings → API Keys → Generate Key (start in **Test Mode** first)
3. Copy the **Key ID** and **Key Secret** into env vars:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

Test mode lets you make fake payments (card 4111 1111 1111 1111, any CVV/expiry)
to try the whole flow end-to-end before switching to live keys.

## 2. Notion CRM (~5 min)

1. Go to notion.so/my-integrations → New integration (internal) → copy the token → `NOTION_TOKEN`
2. In Notion, create (or pick) a page to hold the orders board, click Share →
   invite your integration to it
3. Run once:
   `NOTION_TOKEN=secret_xxx node scripts/setup-notion.mjs <that-page-id>`
   → it creates the "EL VYNCE Orders" database and prints `NOTION_DATABASE_ID`

Every paid order then appears as a row: customer, phone, address, items,
amount, payment id — with a Status you drag from New → In Production →
Packed → Shipped → Delivered.

## 3. Deploy on Vercel (~10 min)

1. Push this folder to a GitHub repo
2. vercel.com → New Project → import the repo (zero config — it detects Next.js)
3. Project → Settings → Environment Variables → add all values from `.env.example`
4. Deploy

## 4. Razorpay webhook (after deploy, ~3 min)

1. Razorpay Dashboard → Settings → Webhooks → Add:
   - URL: `https://<your-vercel-domain>/api/razorpay-webhook`
   - Secret: make up a strong random string → also set it as `RAZORPAY_WEBHOOK_SECRET` in Vercel
   - Event: `payment.captured`

This is the safety net: even if a customer's phone dies right after paying,
Razorpay itself tells the server and the order still lands in Notion.

## 5. Domain (when ready)

Vercel → Project → Settings → Domains → add your domain, then set the DNS
records it shows you at your registrar (replacing the ones pointing at
GitHub Pages). HTTPS is automatic.

## Security notes (how it stays safe)

- Prices are computed on the server from the catalogue — the browser never
  sends a price, so a tampered request can't change what an item costs.
- The Key Secret exists only in env vars, used only inside `/api/*` routes.
- Every "payment succeeded" claim is verified with an HMAC signature that
  only Razorpay and the server can produce.
- Card/UPI details go directly from the customer to Razorpay's checkout —
  they never pass through this codebase.
