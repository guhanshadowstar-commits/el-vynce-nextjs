import Link from "next/link";
import { EL_VYNCE_PRODUCTS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

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

      <div id="featured-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-16">
        {featured.map((p, i) => (
          <ProductCard key={p.id} product={p} delay={i * 90} />
        ))}
      </div>
    </section>
  );
}
