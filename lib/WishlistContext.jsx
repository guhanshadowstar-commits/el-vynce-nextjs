"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

/* localStorage-based wishlist — no backend, mirrors the static site's
   js/wishlist.js. Ids only, resolved against EL_VYNCE_PRODUCTS at render
   time so it never goes stale if a product's price/images change. */
const WISHLIST_KEY = "ev-wishlist";
const WishlistContext = createContext(null);

function readWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(readWishlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  }, [ids, hydrated]);

  const api = useMemo(
    () => ({
      ids,
      count: ids.length,
      isWishlisted: (id) => ids.includes(id),
      toggleWishlist: (id) =>
        setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      removeFromWishlist: (id) => setIds((prev) => prev.filter((x) => x !== id)),
    }),
    [ids]
  );

  return <WishlistContext.Provider value={api}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
