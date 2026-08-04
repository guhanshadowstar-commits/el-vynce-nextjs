import Link from "next/link";
import { EL_VYNCE_PRODUCTS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

/* "Shop by Drop" chips + one full product section per drop — ported from
   index.html's evRenderDropSections(). The homepage previously showed only
   4 products total (NewArrivals' featured slice); this surfaces the full
   15-product catalogue, grouped by drop, same as the static site. Server
   component — the data is static, no client JS needed to render it. */
export default function DropSections() {
  const visibleProducts = EL_VYNCE_PRODUCTS.filter((p) => !p.hidden);
  const drops = [...new Set(visibleProducts.map((p) => p.drop))];

  return (
    <>
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-section-gap">
        <div className="mb-10" data-reveal>
          <p className="label-sm text-secondary mb-3">Browse</p>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg tracking-tight">Shop by Drop</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar w-full">
          {drops.map((d) => (
            <Link
              key={d}
              href={`/shop?drop=${encodeURIComponent(d)}`}
              data-magnetic
              className="px-8 py-3 dot whitespace-nowrap label-sm glass text-on-surface-variant hover:bg-surface-container transition-all"
            >
              {d}
            </Link>
          ))}
        </div>
      </section>

      {drops.map((d) => {
        const items = visibleProducts.filter((p) => p.drop === d);
        return (
          <section key={d} className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-section-gap">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16" data-reveal>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg tracking-tight">{d}</h2>
              <Link
                href={`/shop?drop=${encodeURIComponent(d)}`}
                data-magnetic
                className="label-sm underline underline-offset-4 hover:text-secondary transition-colors"
              >
                View All {d}
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-16">
              {items.map((p, i) => (
                <ProductCard key={p.id} product={p} delay={i * 90} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
