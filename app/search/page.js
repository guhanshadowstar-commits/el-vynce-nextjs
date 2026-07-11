"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EL_VYNCE_PRODUCTS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

function SearchResults() {
  const params = useSearchParams();
  const query = (params.get("q") || "").trim();

  const matches = useMemo(() => {
    if (!query) return [];
    const lower = query.toLowerCase();
    return EL_VYNCE_PRODUCTS.filter((p) => p.name.toLowerCase().includes(lower));
  }, [query]);

  return (
    <main className="pt-32 pb-section-gap">
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center md:text-left" data-reveal>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 tracking-tight">
          {query ? `Results for "${query}"` : "Search"}
        </h1>
        <p className="label-sm text-secondary mb-12">
          {query ? "Made to order. Production begins after you place your order." : "Enter a search term to find a piece."}
        </p>
        <div className="w-full h-px bg-outline-variant opacity-70 mb-16" />
      </section>

      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {query && matches.length === 0 && (
          <div className="text-center py-24">
            <p className="font-body-lg text-body-lg text-secondary mb-8">
              No pieces found for &quot;{query}&quot;. Try browsing our Drops instead.
            </p>
            <Link href="/shop" data-magnetic className="bg-primary text-on-primary px-8 py-4 label-sm inline-block">
              Browse Our Drops
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-16">
          {matches.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={(i % 4) * 90} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
