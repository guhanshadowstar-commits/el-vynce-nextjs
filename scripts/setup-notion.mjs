/* One-time Notion CRM setup for EL VYNCE.
   Creates the "EL VYNCE Orders" database with the exact schema lib/notion.js
   writes to, then prints the database id to put in NOTION_DATABASE_ID.

   Usage:
     NOTION_TOKEN=secret_xxx node scripts/setup-notion.mjs <parent-page-id>

   <parent-page-id> = the id of any Notion page the integration has been
   given access to (Share → invite the integration). It's the 32-char hex
   part at the end of the page URL. */

const token = process.env.NOTION_TOKEN;
const parentPageId = process.argv[2];

if (!token || !parentPageId) {
  console.error("Usage: NOTION_TOKEN=secret_xxx node scripts/setup-notion.mjs <parent-page-id>");
  process.exit(1);
}

const res = await fetch("https://api.notion.com/v1/databases", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ text: { content: "EL VYNCE Orders" } }],
    properties: {
      Order: { title: {} },
      Status: {
        select: {
          options: [
            { name: "New", color: "red" },
            { name: "In Production", color: "yellow" },
            { name: "Packed", color: "blue" },
            { name: "Shipped", color: "purple" },
            { name: "Delivered", color: "green" },
          ],
        },
      },
      Customer: { rich_text: {} },
      Email: { email: {} },
      Phone: { phone_number: {} },
      Address: { rich_text: {} },
      Items: { rich_text: {} },
      Amount: { number: { format: "rupee" } },
      "Payment ID": { rich_text: {} },
      "Razorpay Order ID": { rich_text: {} },
      Placed: { date: {} },
    },
  }),
});

if (!res.ok) {
  console.error("Failed:", res.status, await res.text());
  process.exit(1);
}

const db = await res.json();
console.log("\n✓ Database created: EL VYNCE Orders");
console.log("\nAdd this to your env vars:\n");
console.log(`NOTION_DATABASE_ID=${db.id.replace(/-/g, "")}`);
