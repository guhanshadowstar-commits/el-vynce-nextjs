"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/CartContext";
import PlaceholderSwatch from "@/components/PlaceholderSwatch";

/* showQuickAdd: renders a "+" that adds the default color/size to cart
   without leaving the grid (used on /shop; skip elsewhere to match the
   static site's scope). onRemove: renders a "x" instead of the "New" badge
   (used on /wishlist) — the two never need to coexist on the same card. */
export default function ProductCard({ product, delay = 0, showQuickAdd = false, onRemove }) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        color: product.colors[0],
        size: product.sizes[0],
        image: (product.images && product.images[0]) || "",
        placeholderSwatch: product.placeholderSwatch || null,
        drop: product.drop,
        qty: 1,
      },
      { silent: true }
    );
    const icon = e.currentTarget.querySelector(".material-symbols-outlined");
    if (icon) {
      icon.textContent = "check";
      setTimeout(() => { icon.textContent = "add"; }, 1200);
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(product.id);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className={`product-card group block ${!product.inStock ? "opacity-80" : ""}`}
      data-reveal
      data-reveal-delay={delay}
    >
      <div className="relative aspect-[3/4] overflow-hidden border border-outline-variant/40 mb-6 bg-surface-container">
        <div className="absolute top-4 left-4 z-10 glass px-2.5 py-1 label-sm text-[9px] tracking-wide hidden sm:block">{product.drop}</div>
        {onRemove ? (
          <button
            onClick={handleRemove}
            className="absolute top-4 right-4 z-10 glass w-9 h-9 flex items-center justify-center hover:bg-white transition-colors"
            aria-label={`Remove ${product.name} from wishlist`}
          >
            <span className="material-symbols-outlined text-primary text-[18px]">close</span>
          </button>
        ) : (
          product.isNew && (
            <div className="absolute top-4 right-4 z-10 glass bg-white/90 px-3 py-1 label-sm text-[10px]">New</div>
          )
        )}
        {!product.inStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="glass-dark text-white px-6 py-2 dot label-sm">Sold Out</div>
          </div>
        )}
        {product.images && product.images.length ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className={`product-image w-full h-full object-cover ${!product.inStock ? "grayscale" : ""}`}
          />
        ) : (
          <PlaceholderSwatch product={product} sizeClass="product-image w-full h-full" />
        )}
        {showQuickAdd && product.inStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-4 right-4 z-10 w-9 h-9 glass text-primary flex items-center justify-center hover:bg-white transition-colors"
            aria-label={`Quick add ${product.name} to cart`}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-body-md text-body-md tracking-tight">{product.name}</h3>
        <p className="label-sm text-secondary">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
