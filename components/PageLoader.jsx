"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/* Page loader — ported from the static site's partials/page-loader.html +
   initPageLoader() in js/interactions.js. That version intercepted <a> clicks
   and re-showed itself before a real full-page navigation. The App Router
   doesn't do full page reloads, so there's nothing to intercept — instead
   this re-triggers on every pathname change via usePathname(), which covers
   the same "branded moment on every navigation" intent within Next's
   client-side routing model. */
export default function PageLoader() {
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(null);

  useEffect(() => {
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
    } else if (prevPathname.current === pathname) {
      return;
    } else {
      prevPathname.current = pathname;
      setHidden(false);
    }

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Minimum time up even on an instant transition — without this a fast
    // route change just flickers, reading as a glitch instead of a
    // deliberate brand moment.
    const MIN_VISIBLE = reduceMotion ? 150 : 550;
    const t = setTimeout(() => setHidden(true), MIN_VISIBLE);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div id="ev-page-loader" className={hidden ? "is-hidden" : ""} aria-hidden="true">
      <div className="ev-page-loader-mark" />
      <div className="ev-page-loader-bar">
        <span />
      </div>
    </div>
  );
}
