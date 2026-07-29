import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SiteInteractions from "@/components/SiteInteractions";
import PageLoader from "@/components/PageLoader";

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "EL VYNCE — Made-to-Order Indian Clothing",
  description:
    "EL VYNCE — luxury minimal made-to-order Indian clothing. Achromatic, architectural, made for stillness.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='white'/%3E%3Ctext x='32' y='44' font-family='Georgia,serif' font-size='32' text-anchor='middle' fill='black'%3EEL%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              name: "EL VYNCE",
              url: "https://elvynce.com/",
              description:
                "EL VYNCE — luxury minimal made-to-order Indian clothing. Achromatic, architectural, made for stillness.",
              address: { "@type": "PostalAddress", addressCountry: "IN" },
            }),
          }}
        />
      </head>
      <body className="bg-white text-primary font-body-md overflow-x-hidden">
        <PageLoader />
        <CartProvider>
          <WishlistProvider>
            <Nav />
            {children}
            <Footer />
            <CartDrawer />
            <SiteInteractions />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
