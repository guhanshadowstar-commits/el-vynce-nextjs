"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EL_VYNCE_PRODUCTS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const drops = useMemo(() => ["All", ...new Set(EL_VYNCE_PRODUCTS.map((p) => p.drop))], []);
  const searchParams = useSearchParams();
  const [drop, setDrop] = useState("All");
  const [sort, setSort] = useState("default");

  // Deep-link support for "Shop by Drop" chips on the homepage (/shop?drop=X).
  useEffect(() => {
    const dropParam = searchParams.get("drop");
    if (dropParam && drops.includes(dropParam)) setDrop(dropParam);
  }, [searchParams, drops]);

  const list = useMemo(() => {
    let l = EL_VYNCE_PRODUCTS.filter((p) => drop === "All" || p.drop === drop);
    if (sort === "price-asc") l = l.slice().sort((a, b) => a.price - b.price);
    if (sort === "price-desc") l = l.slice().sort((a, b) => b.price - a.price);
    if (sort === "name-asc") l = l.slice().sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [drop, sort]);

  return (
    <main className="pt-32 pb-section-gap">
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center md:text-left" data-reveal>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 tracking-tight">
          {drop === "All" ? "All Drops" : drop.toUpperCase()}
        </h1>
        <p className="label-sm text-secondary mb-12">Made to order. Production begins after you place your order.</p>
        <div className="w-full h-px bg-outline-variant opacity-70 mb-16" />
      </section>

      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="relative w-full md:w-auto">
            <div className="flex gap-3 overflow-x-auto pb-4 md:pb-0 no-scrollbar w-full md:w-auto">
              {drops.map((d) => (
                <button
                  key={d}
                  onClick={() => setDrop(d)}
                  className={`px-8 py-3 dot whitespace-nowrap label-sm transition-all ${
                    d === drop ? "bg-primary text-on-primary" : "glass text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {d === "All" ? "All Drops" : d}
                </button>
              ))}
            </div>
            {/* Right-edge fade hints that the chip row scrolls horizontally on mobile. */}
            <div className="md:hidden pointer-events-none absolute top-0 right-0 h-[calc(100%-1rem)] w-10 bg-gradient-to-l from-white to-transparent" />
          </div>
          <div className="relative w-full md:w-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="glass px-8 py-3 pr-11 label-sm uppercase w-full md:w-48 appearance-none cursor-pointer"
            >
              <option value="default">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
            </select>
            <span className="material-symbols-outlined absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-primary text-lg">
              expand_more
            </span>
          </div>
        </div>
      </section>

      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-16">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={(i % 4) * 90} />
          ))}
        </div>
      </section>

      <section className="mt-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex justify-center">
        <div className="flex gap-4">
          <button data-magnetic className="dot w-12 h-12 glass flex items-center justify-center label-sm border border-primary">
            1
          </button>
        </div>
      </section>
    </main>
  );
}
