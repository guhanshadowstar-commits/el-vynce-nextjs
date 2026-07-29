"use client";

import { useState } from "react";
import Link from "next/link";
import { EL_VYNCE_PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { formatPrice } from "@/lib/format";
import PlaceholderSwatch from "@/components/PlaceholderSwatch";
import PdpViewer from "@/components/PdpViewer";

export default function ProductDetail({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.inStock ? product.sizes[0] : null);
  const [show3D, setShow3D] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [feedback, setFeedback] = useState(false);

  const others = EL_VYNCE_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      image: (product.images && product.images[0]) || "",
      placeholderSwatch: product.placeholderSwatch || null,
      drop: product.drop,
      qty: 1,
    });
    setFeedback(true);
    setTimeout(() => setFeedback(false), 2500);
  };

  return (
    <main className="pt-24 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-16">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative aspect-[4/5] bg-surface-container overflow-hidden group">
            {product.images && product.images.length ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="w-full h-full object-cover" src={product.images[activeImage]} alt={product.name} />
            ) : (
              <PlaceholderSwatch product={product} sizeClass="w-full h-full" />
            )}
            <div className="absolute top-6 left-6 glass px-4 py-2">
              <span className="label-sm">{product.drop}</span>
            </div>
            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">
              <button
                className="glass h-12 w-12 flex items-center justify-center hover:bg-white transition-colors"
                onClick={() => setShow3D((v) => !v)}
                aria-label="Toggle 3D preview"
              >
                <span className="material-symbols-outlined text-primary">3d_rotation</span>
              </button>
            </div>
            {show3D && (
              <div className="absolute inset-0 z-10 bg-surface-container">
                <PdpViewer />
                <button
                  className="absolute top-6 right-6 glass h-10 w-10 flex items-center justify-center z-20"
                  onClick={() => setShow3D(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {(product.images || []).map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`w-24 h-32 flex-shrink-0 bg-surface-container border overflow-hidden ${
                  i === activeImage ? "border-primary/30" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover" src={img} alt={`${product.name} detail ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="sticky top-24">
            <div className="flex flex-col gap-2 mb-8">
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg tracking-tight">{product.name}</h1>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="material-symbols-outlined text-primary flex-shrink-0 mt-2"
                  style={{ fontVariationSettings: isWishlisted(product.id) ? "'FILL' 1" : "'FILL' 0" }}
                  aria-label="Save to wishlist"
                >
                  {isWishlisted(product.id) ? "bookmark" : "bookmark_border"}
                </button>
              </div>
              <p className="text-secondary italic">Cut only after you order — this exact piece doesn't exist yet.</p>
              <span className="font-body-lg text-body-lg mt-4">{formatPrice(product.price)}</span>
              {!product.inStock && <span className="label-sm text-[#ba1a1a] mt-2">Currently sold out</span>}
            </div>

            <div className="mb-10">
              <span className="label-sm block mb-4">Color</span>
              <div className="flex gap-1">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    aria-label={`Color ${c}`}
                    className="min-w-11 min-h-11 flex items-center justify-center"
                  >
                    <span
                      className={`dot w-8 h-8 block ${selectedColor === c ? "swatch-selected" : ""}`}
                      style={{ background: c, border: "1px solid #e5e5e5" }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <span className="label-sm">Select Size</span>
                <button
                  className="label-sm underline underline-offset-4 text-secondary hover:text-primary"
                  onClick={() => setSizeChartOpen(true)}
                >
                  Size Chart — {product.drop}
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    disabled={!product.inStock}
                    onClick={() => setSelectedSize(s)}
                    className={`border border-outline-variant py-4 label-sm hover:border-primary transition-colors ${
                      selectedSize === s ? "size-selected" : ""
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              data-magnetic
              disabled={!product.inStock}
              onClick={handleAddToCart}
              className="w-full bg-primary text-on-primary py-6 label-sm uppercase tracking-[0.2em] hover:opacity-90 transition-opacity mb-12 disabled:opacity-40"
            >
              {product.inStock ? "Add to Cart" : "Sold Out"}
            </button>
            {feedback && <p className="label-sm text-center -mt-10 mb-10">Added to cart.</p>}

            <div className="border-t border-outline-variant/40 pt-8">
              <h3 className="label-sm mb-6">The Details</h3>
              <p className="text-secondary">{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* You may also like */}
      <section className="mt-section-gap">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-headline-md text-headline-md tracking-tight">You may also like</h2>
          <Link className="label-sm underline underline-offset-8" href="/shop">
            Explore the Shop
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {others.map((p, i) => (
            <Link key={p.id} href={`/product/${p.id}`} className="group block" data-reveal data-reveal-delay={i * 90}>
              <div className="aspect-[3/4] bg-surface-container overflow-hidden mb-4">
                {p.images && p.images.length ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={p.images[0]}
                    alt={p.name}
                  />
                ) : (
                  <PlaceholderSwatch product={p} sizeClass="w-full h-full" />
                )}
              </div>
              <h3 className="label-sm tracking-wider text-primary">{p.name}</h3>
              <p className="text-secondary">{formatPrice(p.price)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Size Chart Modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSizeChartOpen(false)} />
          <div className="glass-strong relative w-full max-w-2xl p-8 md:p-12">
            <button
              className="absolute top-3 right-3 min-w-11 min-h-11 flex items-center justify-center text-primary"
              onClick={() => setSizeChartOpen(false)}
              aria-label="Close size chart"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="font-headline-md text-headline-md mb-8">Size Chart — {product.drop}</h2>
            {product.sizeChart ? (
              (() => {
                const columns = ["chest", "length", "shoulder", "sleeve"].filter((key) =>
                  product.sizes.some((s) => product.sizeChart[s]?.[key])
                );
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left label-sm border-collapse">
                      <thead>
                        <tr className="border-b border-primary/20">
                          <th className="py-4 font-medium">Size</th>
                          {columns.map((col) => (
                            <th key={col} className="py-4 font-medium capitalize">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-secondary">
                        {product.sizes.map((s) => (
                          <tr key={s} className="border-b border-outline-variant/40">
                            <td className="py-4 text-primary">{s}</td>
                            {columns.map((col) => (
                              <td key={col} className="py-4">
                                {product.sizeChart[s]?.[col] || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()
            ) : (
              <p className="text-secondary">
                Size chart for this piece is coming soon — email elvynceofficial@gmail.com for measurements.
              </p>
            )}
            <p className="mt-8 text-secondary italic text-sm">
              *Every EL VYNCE piece is cut after you order — not pulled off a shelf. Want it tailored to your exact
              frame? Email elvynceofficial@gmail.com and we&apos;ll fit it to your measurements before it&apos;s cut.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
