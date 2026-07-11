export const metadata = {
  title: "Shipping & Returns — EL VYNCE",
};

export default function ShippingReturnsPage() {
  return (
    <main className="pt-32 pb-section-gap max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
      <header className="mb-16" data-reveal>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4">Shipping &amp; Returns</h1>
        <p className="text-secondary">Last updated: 2026-06-27</p>
      </header>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Shipping</h2>
        <div className="space-y-5 text-secondary leading-relaxed">
          <p>
            Every EL VYNCE piece is made to order. Production begins once your order has been placed, and
            orders are processed within <strong className="text-primary">3–5 business days</strong> after
            payment confirmation.
          </p>
          <p>
            Estimated delivery is <strong className="text-primary">5–7 working days</strong> within India.
            Delivery timelines may vary depending on your location and the courier partner handling your
            shipment.
          </p>
          <p>Once your order ships, you will receive tracking information via email.</p>
          <p>
            If an order is undelivered due to an incorrect address or a failed delivery attempt, it will be
            returned to our facility. In this case, you may choose to have the order reshipped (additional
            shipping cost may apply) or cancelled — provided you let us know before the order is
            reprocessed.
          </p>
        </div>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Cancellations</h2>
        <div className="space-y-5 text-secondary leading-relaxed">
          <p>
            Orders cannot be cancelled once they have entered printing or production. If you need to cancel,
            please email{" "}
            <a className="text-primary underline" href="mailto:elvynceofficial@gmail.com">
              elvynceofficial@gmail.com
            </a>{" "}
            immediately — cancellation is only possible before your order enters processing.
          </p>
        </div>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Returns, Exchanges &amp; Refunds</h2>
        <div className="space-y-5 text-secondary leading-relaxed">
          <p>
            As each EL VYNCE piece is custom, printed-on-demand, and made to order, we do not offer returns,
            exchanges, or refunds once an order has been placed. This policy protects the quality, hygiene,
            and personalization integrity of every garment we produce.
          </p>
        </div>
      </section>

      <section className="mb-16" data-reveal>
        <h2 className="font-headline-md text-headline-md mb-6">Damaged or Misprinted Items</h2>
        <div className="space-y-5 text-secondary leading-relaxed">
          <p>
            If your item arrives damaged or misprinted, please contact us within{" "}
            <strong className="text-primary">48 hours of delivery</strong> at{" "}
            <a className="text-primary underline" href="mailto:elvynceofficial@gmail.com">
              elvynceofficial@gmail.com
            </a>{" "}
            with photos of the issue and your order receipt.
          </p>
          <p>Once verified, we will provide a free replacement. Please note: cash refunds are never issued under any circumstance.</p>
        </div>
      </section>
    </main>
  );
}
