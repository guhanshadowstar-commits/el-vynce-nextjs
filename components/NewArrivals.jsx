import Link from "next/link";
import { EL_VYNCE_PRODUCTS } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import PlaceholderSwatch from "@/components/PlaceholderSwatch";

/* "New Arrivals" / "The Latest Drop" featured grid — ported from index.html's
   #featured-grid, which was populated client-side by evRenderFeatured() in
   the inline <script> at the bottom of the old page (reading window.EL_VYNCE_PRODUCTS,
   slicing the first 4). Here it's just server-rendered JSX reading the same
   data. Each card links to /product/{id} (route built separately). */
export default function NewArrivals() {
  const featured = EL_VYNCE_PRODUCTS.slice(0, 4);

  return (
    <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pt-section-gap pb-section-gap">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16" data-reveal>
        <div>
          <p className="label-sm text-secondary mb-3">New Arrivals</p>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg tracking-tight">
            The Latest Drop
          </h2>
        </div>
        <Link href="/shop" data-magnetic className="label-sm underline underline-offset-4 hover:text-secondary transition-colors">
          View All Products
        </Link>
      </div>

      <div id="featured-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-16">
        {featured.map((p, i) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="product-card group block"
            data-reveal
            data-reveal-delay={i * 90}
          >
            <div className="relative aspect-[3/4] overflow-hidden border border-outline-variant/40 mb-6 bg-surface-container">
              <div className="absolute top-4 left-4 z-10 glass px-3 py-1 label-sm text-[10px]">{p.drop}</div>
              {p.isNew && (
                <div className="absolute top-4 right-4 z-10 glass bg-white/90 px-3 py-1 label-sm text-[10px]">New</div>
              )}
              {p.images && p.images.length ? (
                <img src={p.images[0]} alt={p.name} className="product-image w-full h-full object-cover" />
              ) : (
                <PlaceholderSwatch product={p} sizeClass="product-image w-full h-full" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-body-md text-body-md tracking-tight">{p.name}</h3>
              <p className="label-sm text-secondary">{formatPrice(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
