import { EL_VYNCE_PRODUCTS } from "@/lib/products";

const BASE = "https://elvynce.in";

export default function sitemap() {
  const staticRoutes = [
    { url: `${BASE}/`, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE}/shop`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/about`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/faq`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/contact`, priority: 0.5, changeFrequency: "yearly" },
    { url: `${BASE}/shipping-returns`, priority: 0.4, changeFrequency: "yearly" },
    { url: `${BASE}/privacy-policy`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/terms-of-service`, priority: 0.3, changeFrequency: "yearly" },
  ];

  const productRoutes = EL_VYNCE_PRODUCTS.map((p) => ({
    url: `${BASE}/product/${p.id}`,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...productRoutes];
}
