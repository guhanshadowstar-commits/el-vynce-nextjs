export const metadata = {
  title: "Terms of Service — EL VYNCE",
};

export default function TermsOfServicePage() {
  return (
    <main className="pt-32 pb-section-gap max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
      <header className="mb-16" data-reveal>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4">Terms of Service</h1>
        <p className="text-secondary">Last updated: 2026-06-27</p>
      </header>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">About EL Vynce</h2>
        <p className="text-secondary leading-relaxed">
          EL Vynce operates as an online clothing and lifestyle brand based in Chennai, Tamil Nadu, India, as
          a partnership firm specializing in made-to-order apparel. Due to the bespoke nature of our
          products, sales are final once production begins.
        </p>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Eligibility &amp; Conduct</h2>
        <div className="space-y-3 text-secondary leading-relaxed">
          <ul className="list-disc pl-6 space-y-2">
            <li>Users must be 18 years or older, or use the site under parental supervision.</li>
            <li>Users must provide accurate information when placing an order.</li>
            <li>Users must not misuse the site.</li>
          </ul>
        </div>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Intellectual Property</h2>
        <p className="text-secondary leading-relaxed">
          All content on this site — including text, images, designs, logos, and photographs — is the
          exclusive intellectual property of EL Vynce. No reproduction is permitted without express
          permission. This content is protected under Indian copyright and trademark law.
        </p>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Pricing &amp; Product Information</h2>
        <div className="space-y-3 text-secondary leading-relaxed">
          <p>
            Prices and descriptions are accurate at the time of listing. Minor color variation is possible
            due to individual screen display differences.
          </p>
          <p>
            Prices are subject to change without notice. EL Vynce reserves the right to cancel orders
            affected by pricing or listing errors.
          </p>
        </div>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Limitation of Liability</h2>
        <div className="space-y-3 text-secondary leading-relaxed">
          <p>
            EL Vynce is not liable for indirect or incidental damages. Our total liability is capped at the
            value of the product purchased.
          </p>
          <p>EL Vynce is not liable for delays caused by force majeure events beyond our reasonable control.</p>
        </div>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Changes to These Terms</h2>
        <p className="text-secondary leading-relaxed">
          These Terms may be updated at EL Vynce&apos;s discretion. The revision date will be posted on this
          page.
        </p>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Governing Law</h2>
        <p className="text-secondary leading-relaxed">
          These Terms are governed by the laws of India, with exclusive jurisdiction in the courts of
          Chennai.
        </p>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Contact</h2>
        <div className="text-secondary leading-relaxed space-y-1">
          <p>
            Email:{" "}
            <a className="text-primary underline" href="mailto:elvynceofficial@gmail.com">
              elvynceofficial@gmail.com
            </a>
          </p>
          <p>
            Instagram:{" "}
            <a className="text-primary underline" href="https://instagram.com/el.vynce" target="_blank" rel="noopener">
              @el.vynce
            </a>
          </p>
          <p>Support Hours: Mon–Fri, 10:00 AM – 6:00 PM IST</p>
        </div>
      </section>
    </main>
  );
}
