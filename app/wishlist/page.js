"use client";

import Link from "next/link";
import { EL_VYNCE_PRODUCTS } from "@/lib/products";
import { useWishlist } from "@/lib/WishlistContext";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { ids, removeFromWishlist } = useWishlist();
  const items = EL_VYNCE_PRODUCTS.filter((p) => ids.includes(p.id));

  return (
    <main className="pt-32 pb-section-gap">
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center md:text-left" data-reveal>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 tracking-tight">Wishlist</h1>
        <p className="label-sm text-secondary mb-12">Saved on this device. Nothing&apos;s reserved until you order.</p>
        <div className="w-full h-px bg-outline-variant opacity-70 mb-16" />
      </section>

      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="label-sm text-secondary mb-6">Your wishlist is empty.</p>
            <Link href="/shop" data-magnetic className="bg-primary text-on-primary px-8 py-4 label-sm inline-block hover:opacity-90 transition-opacity">
              Shop the Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-16">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 90} onRemove={removeFromWishlist} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
