import { notFound } from "next/navigation";
import { getProductById, EL_VYNCE_PRODUCTS } from "@/lib/products";
import ProductDetail from "@/components/ProductDetail";

export async function generateStaticParams() {
  return EL_VYNCE_PRODUCTS.map((p) => ({ slug: p.id }));
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images && product.images.length ? product.images.map((i) => `https://elvynce.com${i}`) : undefined,
    brand: { "@type": "Brand", name: "EL VYNCE" },
    category: product.drop,
    offers: {
      "@type": "Offer",
      url: `https://elvynce.com/product/${product.id}`,
      priceCurrency: product.currency || "INR",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductById(slug);
  return { title: product ? `${product.name} — EL VYNCE` : "Product — EL VYNCE" };
}
