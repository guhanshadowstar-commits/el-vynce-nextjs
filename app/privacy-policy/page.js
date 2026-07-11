export const metadata = {
  title: "Privacy Policy — EL VYNCE",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="pt-32 pb-section-gap max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
      <header className="mb-16" data-reveal>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4">Privacy Policy</h1>
        <p className="text-secondary">Last updated: 2026-06-27</p>
      </header>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Information We Collect</h2>
        <p className="text-secondary leading-relaxed">
          We collect only the information necessary to process your order: your name, contact number,
          shipping address, and payment details.
        </p>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">How We Use Your Information</h2>
        <div className="space-y-3 text-secondary leading-relaxed">
          <p>Your information is used to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process orders and provide delivery updates</li>
            <li>Confirm payment and prevent fraud</li>
            <li>Communicate with you about your purchase</li>
          </ul>
        </div>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Data Sharing</h2>
        <p className="text-secondary leading-relaxed">
          We do not sell, trade, or rent your personal data to any third party.
        </p>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Payments</h2>
        <p className="text-secondary leading-relaxed">
          Payments are processed through secure third-party gateways (such as Razorpay). Your card or UPI
          details are never stored on EL VYNCE servers.
        </p>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Data Security</h2>
        <p className="text-secondary leading-relaxed">
          We maintain reasonable administrative, technical, and physical safeguards designed to protect your
          information against loss, misuse, and unauthorized access.
        </p>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Policy Updates</h2>
        <p className="text-secondary leading-relaxed">
          This policy is revised periodically. The latest version is always posted on this page along with
          its revision date.
        </p>
      </section>
    </main>
  );
}
