export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account"],
      },
    ],
    sitemap: "https://elvynce.in/sitemap.xml",
  };
}
