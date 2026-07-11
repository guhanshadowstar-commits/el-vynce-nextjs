"use client";

import { useState } from "react";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "How long does production take?",
    a: "Every EL VYNCE piece is made to order. Production begins once your order has been placed, and orders are processed within 3–5 business days after payment confirmation.",
    delay: 0,
  },
  {
    q: "How long does delivery take?",
    a: "Estimated delivery is 5–7 working days within India. Delivery timelines may vary depending on your location and the courier partner handling your shipment. Once your order ships, you will receive tracking information via email.",
    delay: 40,
  },
  {
    q: "Can I cancel my order?",
    a: (
      <>
        Orders cannot be cancelled once they have entered printing or production. If you need to cancel,
        please email{" "}
        <a className="text-primary underline" href="mailto:elvynceofficial@gmail.com">
          elvynceofficial@gmail.com
        </a>{" "}
        immediately — cancellation is only possible before your order enters processing.
      </>
    ),
    delay: 80,
  },
  {
    q: "My item arrived damaged or misprinted — what do I do?",
    a: (
      <>
        Please contact us within 48 hours of delivery at{" "}
        <a className="text-primary underline" href="mailto:elvynceofficial@gmail.com">
          elvynceofficial@gmail.com
        </a>{" "}
        with photos of the issue and your order receipt. Once verified, we will provide a free replacement.
        Cash refunds are never issued under any circumstance.
      </>
    ),
    delay: 120,
  },
  {
    q: "Can I return or exchange an item?",
    a: (
      <>
        As each EL VYNCE piece is custom, printed-on-demand, and made to order, we do not offer returns,
        exchanges, or refunds once an order has been placed. This policy protects the quality, hygiene, and
        personalization integrity of every garment we produce. See our{" "}
        <Link className="text-primary underline" href="/shipping-returns">
          Shipping &amp; Returns
        </Link>{" "}
        page for full details.
      </>
    ),
    delay: 160,
  },
  {
    q: "How do I find my size?",
    a: 'Each Drop has its own size chart with Drop-specific measurements. You can view the full chart from any product page by selecting "Size Chart" next to the size selector.',
    delay: 200,
  },
  {
    q: "Is my payment information secure?",
    a: "Payments are processed through secure third-party gateways (such as Razorpay). Your card or UPI details are never stored on EL VYNCE servers.",
    delay: 240,
  },
];

export default function FaqPageClient() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <main className="pt-32 pb-section-gap max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
      <header className="mb-16 text-center md:text-left" data-reveal>
        <p className="label-sm text-secondary mb-3">Help Center</p>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4">
          Frequently Asked Questions
        </h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-xl">
          Everything you need to know about ordering, production, and care of your made-to-order EL VYNCE
          piece.
        </p>
      </header>

      <section className="space-y-2" id="faq-accordion">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          const isLast = index === FAQ_ITEMS.length - 1;
          return (
            <div
              key={item.q}
              className={`accordion ${isLast ? "" : "border-b border-outline-variant/40"} ${
                isOpen ? "accordion-active" : ""
              }`}
              data-reveal
              data-reveal-delay={item.delay}
            >
              <button
                className="w-full flex justify-between items-center py-6 text-left group"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="font-body-lg text-body-lg group-hover:text-primary transition-colors">
                  {item.q}
                </span>
                <span className="material-symbols-outlined accordion-icon text-secondary">add</span>
              </button>
              <div className="accordion-content">
                <p className="text-secondary">{item.a}</p>
              </div>
            </div>
          );
        })}
      </section>

      <div className="mt-16 glass p-8 text-center" data-reveal>
        <p className="label-sm text-secondary mb-4">Still have questions?</p>
        <Link href="/contact" data-magnetic className="bg-primary text-on-primary px-8 py-4 label-sm inline-block">
          Contact Us
        </Link>
      </div>
    </main>
  );
}
