"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "elvynce_cart_v1";
const CartContext = createContext(null);

function readCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("EL VYNCE cart: failed to read localStorage", e);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const api = useMemo(() => {
    const addToCart = (item, { silent = false } = {}) => {
      setCart((prev) => {
        const next = [...prev];
        const existing = next.find(
          (c) => c.id === item.id && c.color === item.color && c.size === item.size
        );
        if (existing) {
          existing.qty += item.qty || 1;
        } else {
          next.push({ ...item, qty: item.qty || 1 });
        }
        return next;
      });
      // Quick-add (from a grid card) stays silent so browsing isn't
      // interrupted — the button's own checkmark flash is the feedback.
      if (!silent) setIsOpen(true);
    };

    const updateQty = (index, delta) => {
      setCart((prev) => {
        const next = [...prev];
        if (!next[index]) return prev;
        next[index] = { ...next[index], qty: next[index].qty + delta };
        return next[index].qty <= 0 ? next.filter((_, i) => i !== index) : next;
      });
    };

    const removeItem = (index) => {
      setCart((prev) => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => setCart([]);

    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

    return {
      cart,
      count,
      subtotal,
      addToCart,
      updateQty,
      removeItem,
      clearCart,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((v) => !v),
    };
  }, [cart, isOpen]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
