import Link from "next/link";

export const metadata = {
  title: "About — EL VYNCE",
};

export default function AboutPage() {
  return (
    <main className="pt-32 pb-section-gap max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
      <header className="mb-16 text-center md:text-left" data-reveal>
        <p className="label-sm text-secondary mb-3">About EL VYNCE</p>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4">
          An Embodiment of Luxury, Elegance, and Sophistication
        </h1>
      </header>

      <section className="mb-16 space-y-6 text-secondary leading-relaxed" data-reveal data-reveal-delay="80">
        <p>
          EL Vynce is not just a brand it is an embodiment of luxury, elegance, and sophistication. Rooted in
          Indian artistry and inspired by international couture, EL Vynce stands at the intersection of
          old-money charm and modern minimalism. Every creation is carefully designed to express power,
          refinement, and quiet confidence — a tribute to those who value understated distinction over loud
          display.
        </p>
        <p>
          Our collections combine classic tailoring with modern sensibility, allowing each piece to transcend
          trends and remain timeless. From comfort classics for everyday wear to statement pieces for elite
          occasions, EL Vynce ensures every garment mirrors its wearer&apos;s individuality, grace, and
          strength. Each item is meticulously crafted, ensuring premium comfort, flawless fit, and a sense of
          effortless prestige.
        </p>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">More Than Fashion</h2>
        <div className="space-y-6 text-secondary leading-relaxed">
          <p>
            EL Vynce is more than fashion, it is an attitude, a lifestyle, and a legacy of timeless taste.
            Every product tells a story of excellence, designed for those who don&apos;t just wear luxury —
            they live it.
          </p>
        </div>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Made in Chennai, Made to Order</h2>
        <div className="space-y-6 text-secondary leading-relaxed">
          <p>
            EL Vynce is based in Chennai, Tamil Nadu, India, and operates as a made-to-order partnership firm
            — every piece is crafted only after you place your order. Production timelines and delivery
            details are outlined on our{" "}
            <Link className="text-primary underline" href="/shipping-returns">
              Shipping &amp; Returns
            </Link>{" "}
            page.
          </p>
          <p>
            Questions about a piece, a Drop, or a custom fitting?{" "}
            <Link className="text-primary underline" href="/contact">
              Get in touch
            </Link>{" "}
            — we typically respond within 24 hours.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-4" data-reveal>
        <Link href="/shop" data-magnetic className="bg-primary text-on-primary px-8 py-4 label-sm">
          Shop the Collection
        </Link>
        <Link href="/contact" className="border border-primary text-primary px-8 py-4 label-sm">
          Contact Us
        </Link>
      </div>
    </main>
  );
}
