'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, captureClientId } from '@/lib/ga4';

/* Tracks page views on every route change in Next.js App Router.
   Mounts once in root layout and fires page_view event for each navigation. */
export default function GA4PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Capture GA4 client ID once on mount
    captureClientId();
  }, []);

  useEffect(() => {
    // Fire page_view event on every route change
    trackPageView(pathname, document.title);
  }, [pathname]);

  return null; // This is a tracking component, no visual output
}
