import Link from "next/link";
import { formatPrice } from "@/lib/format";
import PlaceholderSwatch from "@/components/PlaceholderSwatch";

export default function ProductCard({ product, delay = 0 }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className={`product-card group block ${!product.inStock ? "opacity-80" : ""}`}
      data-reveal
      data-reveal-delay={delay}
    >
      <div className="relative aspect-[3/4] overflow-hidden border border-outline-variant/40 mb-6 bg-surface-container">
        <div className="absolute top-4 left-4 z-10 glass px-2.5 py-1 label-sm text-[9px] tracking-wide hidden sm:block">{product.drop}</div>
        {product.isNew && (
          <div className="absolute top-4 right-4 z-10 glass bg-white/90 px-3 py-1 label-sm text-[10px]">New</div>
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
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-body-md text-body-md tracking-tight">{product.name}</h3>
        <p className="label-sm text-secondary">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
