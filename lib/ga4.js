/* Client-side GA4 event tracking — safe wrapper around gtag.js.
   All calls guard against gtag not being loaded yet (ad blockers, slow script).
   Never throw; failures are logged only. */

export function ensureGtag(callback) {
  if (typeof window.gtag === 'function') {
    callback();
  } else {
    // Gtag hasn't loaded yet (ad blocker or slow script)
    // Set up a listener to retry once it's available
    let attempts = 0;
    const check = setInterval(() => {
      if (typeof window.gtag === 'function') {
        clearInterval(check);
        callback();
      } else if (++attempts > 50) {
        // Stop trying after ~5 seconds
        clearInterval(check);
        console.warn('GA4: gtag.js never loaded (likely ad blocker)');
      }
    }, 100);
  }
}

export function captureClientId() {
  ensureGtag(() => {
    try {
      // GA4 auto-generates a client_id; capture it from the config
      window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, {
        'allow_google_signals': false,
        'allow_ad_personalization_signals': false,
      });

      // The client_id is available via a callback in newer gtag
      // For compatibility, we'll capture it from the cookie after a short delay.
      // Polling interval: 50ms, max attempts: 100 (~5 seconds total).
      let attempts = 0;
      const captureInterval = setInterval(() => {
        try {
          const gaeCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('_ga='))
            ?.split('=')[1];
          if (gaeCookie) {
            // Extract client_id from GA4 cookie format: GA1.1.xxxxxxxxxx.yyyyyyyy
            const parts = gaeCookie.split('.');
            if (parts.length >= 4) {
              const clientId = `${parts[2]}.${parts[3]}`;
              localStorage.setItem('ga4_client_id', clientId);
              clearInterval(captureInterval);
              return clientId;
            }
          }
        } catch (err) {
          console.error('GA4: Failed to extract client_id from cookie:', err);
        }

        if (++attempts > 100) {
          clearInterval(captureInterval);
          console.warn('GA4: Could not capture client_id from cookie within 5 seconds (likely ad blocker)');
        }
      }, 50);
    } catch (err) {
      console.error('GA4: captureClientId failed:', err);
    }
  });
}

export function trackPageView(path, title) {
  ensureGtag(() => {
    try {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        currency: 'INR',
      });
    } catch (err) {
      console.error('GA4: trackPageView failed:', err);
    }
  });
}

export function trackProductView(product) {
  if (!product) return;
  ensureGtag(() => {
    try {
      window.gtag('event', 'view_item', {
        currency: 'INR',
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            item_category: product.drop || 'Uncategorized',
          },
        ],
      });
    } catch (err) {
      console.error('GA4: trackProductView failed:', err);
    }
  });
}

export function trackAddToCart(items, totalAmount) {
  if (!items || !Array.isArray(items)) return;
  ensureGtag(() => {
    try {
      window.gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: totalAmount,
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.qty || 1,
          item_category: item.drop || 'Uncategorized',
        })),
      });
    } catch (err) {
      console.error('GA4: trackAddToCart failed:', err);
    }
  });
}

export function trackBeginCheckout(items, cartTotal) {
  if (!items || !Array.isArray(items)) return;
  ensureGtag(() => {
    try {
      window.gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: cartTotal,
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.qty || 1,
          item_category: item.drop || 'Uncategorized',
        })),
      });
    } catch (err) {
      console.error('GA4: trackBeginCheckout failed:', err);
    }
  });
}

export function getClientId() {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('ga4_client_id') || '';
  } catch (err) {
    console.error('GA4: getClientId failed:', err);
    return '';
  }
}
