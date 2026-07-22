"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/format";
import PlaceholderSwatch from "@/components/PlaceholderSwatch";

export default function CartDrawer() {
  const router = useRouter();
  const { cart, subtotal, isOpen, closeCart, updateQty, removeItem } = useCart();

  return (
    <div
      id="cart-overlay"
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-400 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0" onClick={closeCart} />
      <aside
        id="cart-drawer"
        className={`absolute top-0 right-0 h-full w-full max-w-md glass-strong border-l border-outline-variant/30 flex flex-col transition-transform duration-400 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-8 h-20 border-b border-outline-variant/20">
          <h2 className="font-headline-md text-headline-md">Your Cart</h2>
          <button
            className="min-w-11 min-h-11 flex items-center justify-center -mr-2 material-symbols-outlined text-primary"
            onClick={closeCart}
            aria-label="Close cart"
          >
            close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar">
          {cart.length === 0 ? (
            <p className="label-sm text-secondary py-12 text-center">Your cart is empty.</p>
          ) : (
            <div className="space-y-10">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-6 items-start fade-in">
                  <div className="w-24 h-24 bg-surface-container flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <PlaceholderSwatch product={item} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-body-md text-primary font-medium">{item.name}</h3>
                      <span className="label-sm text-primary">{formatPrice(item.price)}</span>
                    </div>
                    <p className="label-sm text-on-surface-variant">
                      {item.color || ""} / Size {item.size || ""}
                    </p>
                    <p className="label-sm text-on-surface-variant/60">{item.drop || ""}</p>
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center border border-[#E5E5E5] gap-1">
                        <button
                          className="min-w-11 min-h-11 flex items-center justify-center material-symbols-outlined text-xs"
                          style={{ fontSize: "16px" }}
                          onClick={() => updateQty(index, -1)}
                          aria-label="Decrease quantity"
                        >
                          remove
                        </button>
                        <span className="label-sm">{item.qty}</span>
                        <button
                          className="min-w-11 min-h-11 flex items-center justify-center material-symbols-outlined text-xs"
                          style={{ fontSize: "16px" }}
                          onClick={() => updateQty(index, 1)}
                          aria-label="Increase quantity"
                        >
                          add
                        </button>
                      </div>
                      <button
                        className="label-sm text-on-surface-variant hover:text-primary underline underline-offset-4 transition-colors"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <footer className="border-t border-outline-variant/20 p-8 space-y-6">
          <div className="flex justify-between items-center">
            <span className="label-sm text-secondary">Subtotal</span>
            <span className="font-body-lg text-body-lg font-bold">{formatPrice(subtotal)}</span>
          </div>
          <p className="label-sm text-secondary/70 text-center">
            Shipping, taxes, and discounts calculated at checkout.
          </p>
          <button
            data-magnetic
            disabled={cart.length === 0}
            onClick={() => {
              closeCart();
              router.push("/checkout");
            }}
            className="w-full bg-primary text-on-primary py-5 font-headline-md text-[20px] hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Checkout
          </button>
        </footer>
      </aside>
    </div>
  );
}
