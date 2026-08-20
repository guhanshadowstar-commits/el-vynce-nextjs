/* Server-side GA4 Measurement Protocol — fire-and-forget purchase tracking.
   Posts purchase events directly to GA4 after order confirmation.
   Never blocks, never throws into the response. */

export async function sendPurchaseEvent({
  clientId,
  transactionId,
  amount,
  currency = 'INR',
  items = [],
}) {
  if (!clientId || !transactionId || !amount) {
    console.warn('GA4: Missing required fields for purchase event', {
      clientId: !!clientId,
      transactionId: !!transactionId,
      amount: !!amount,
    });
    return;
  }

  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    console.warn('GA4: Measurement ID or API Secret not configured');
    return;
  }

  try {
    const payload = {
      api_secret: apiSecret,
      measurement_id: measurementId,
      client_id: clientId,
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: transactionId,
            value: amount,
            currency: currency,
            items: items.map(item => ({
              item_id: String(item.id || ''),
              item_name: String(item.name || ''),
              price: parseFloat(item.price) || 0,
              quantity: parseInt(item.qty, 10) || 1,
              item_category: String(item.category || 'Uncategorized'),
            })),
          },
        },
      ],
    };

    const res = await fetch('https://www.google-analytics.com/mp/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn(`GA4 Measurement Protocol HTTP ${res.status}: ${text.slice(0, 200)}`);
    } else {
      console.log(`GA4: Purchase event sent (transaction_id=${transactionId})`);
    }
  } catch (err) {
    // Non-fatal: purchase is already in Notion, GA4 tracking is best-effort
    console.error('GA4: sendPurchaseEvent failed (non-fatal):', err.message);
  }
}

/* Validate a purchase event against GA4 debug endpoint before sending to production.
   Use this during testing to catch field name typos and schema errors early. */
export async function validatePurchaseEvent({
  clientId,
  transactionId,
  amount,
  currency = 'INR',
  items = [],
}) {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    console.warn('GA4: Measurement ID or API Secret not configured');
    return null;
  }

  try {
    const payload = {
      api_secret: apiSecret,
      measurement_id: measurementId,
      client_id: clientId,
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: transactionId,
            value: amount,
            currency: currency,
            items: items.map(item => ({
              item_id: String(item.id || ''),
              item_name: String(item.name || ''),
              price: parseFloat(item.price) || 0,
              quantity: parseInt(item.qty, 10) || 1,
              item_category: String(item.category || 'Uncategorized'),
            })),
          },
        },
      ],
    };

    const res = await fetch('https://www.google-analytics.com/debug/mp/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    return result;
  } catch (err) {
    console.error('GA4: validatePurchaseEvent failed:', err);
    return null;
  }
}
