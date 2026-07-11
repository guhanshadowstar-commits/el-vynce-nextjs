import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import ProductDetail from "@/components/ProductDetail";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductById(slug);
  return { title: product ? `${product.name} — EL VYNCE` : "Product — EL VYNCE" };
}
