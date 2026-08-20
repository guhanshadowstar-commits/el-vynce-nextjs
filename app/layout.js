import { Bodoni_Moda, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SiteInteractions from "@/components/SiteInteractions";
import PageLoader from "@/components/PageLoader";
import GA4PageViewTracker from "@/components/GA4PageViewTracker";

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
  title: "EL VYNCE — Minimalist Luxury. Quiet Power.",
  description:
    "EL VYNCE creates minimalist luxury clothing — clean lines and careful craftsmanship for people who lead without needing to prove it.",
};

export default function RootLayout({ children }) {
  const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

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
              url: "https://elvynce.in/",
              description:
                "EL VYNCE creates minimalist luxury clothing — clean lines and careful craftsmanship for people who lead without needing to prove it.",
              address: { "@type": "PostalAddress", addressCountry: "IN" },
            }),
          }}
        />
        {ga4MeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4MeasurementId)}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', ${JSON.stringify(ga4MeasurementId)}, {
                    'anonymize_ip': true,
                    'allow_google_signals': false,
                    'allow_ad_personalization_signals': false
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="bg-white text-primary font-body-md overflow-x-hidden">
        <PageLoader />
        <CartProvider>
          <WishlistProvider>
            <GA4PageViewTracker />
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
