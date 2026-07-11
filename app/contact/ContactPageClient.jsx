"use client";

import { useState } from "react";
import Link from "next/link";

const ACCORDION_ITEMS = [
  {
    q: "Where's my order?",
    a: "Orders are made to order and processed within 3–5 business days after payment confirmation. You'll receive tracking by email once your piece ships.",
  },
  {
    q: "Can I return or exchange an item?",
    a: (
      <>
        As each piece is custom made-to-order, we do not offer returns, exchanges, or refunds once an order
        is placed. See our{" "}
        <Link className="underline" href="/shipping-returns">
          Shipping &amp; Returns
        </Link>{" "}
        page for damaged/misprinted item policy.
      </>
    ),
  },
  {
    q: "How do made-to-order timelines work?",
    a: "Production begins after your order is placed. Estimated delivery is 5–7 working days within India, though this may vary by location and courier.",
  },
];

const INITIAL_FORM = { name: "", email: "", phone: "", order: "", message: "" };

function ContactAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-2">
      {ACCORDION_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.q}
            className={`accordion ${index < ACCORDION_ITEMS.length - 1 ? "border-b border-outline-variant/40" : ""} ${
              isOpen ? "accordion-active" : ""
            }`}
          >
            <button
              className="w-full flex justify-between items-center py-4 text-left group"
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="group-hover:text-primary transition-colors">{item.q}</span>
              <span className="material-symbols-outlined accordion-icon text-secondary">add</span>
            </button>
            <div className="accordion-content">
              <p className="text-secondary">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ContactPageClient() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    const nextErrors = {
      name: !form.name.trim(),
      email: !form.email.trim() || !emailValid,
      phone: !form.phone.trim(),
      message: !form.message.trim(),
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    // NOTE: no backend yet — this is a placeholder. Wire up a real submission
    // endpoint (e.g. an API route that emails/stores the message) later.
    setStatus("sending");
    console.log("Contact form submitted (placeholder, no backend):", form);
    setTimeout(() => {
      setStatus("sent");
      setForm(INITIAL_FORM);
    }, 900);
  };

  return (
    <main className="pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <header className="mb-16 md:mb-24 text-center md:text-left" data-reveal>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4">Contact Us</h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-xl">
          We&apos;re here to help with orders, sizing, and made-to-order timelines.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">
        {/* Form */}
        <section className="md:col-span-7" data-reveal>
          <div className="glass p-8 md:p-12">
            <form className="space-y-10" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative">
                  <label className="block label-sm text-secondary mb-2">Full Name*</label>
                  <input
                    className={`w-full input-underline py-2 ${errors.name ? "error" : ""}`}
                    id="field-name"
                    name="name"
                    placeholder="Your full name"
                    required
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="label-sm text-[#ba1a1a] mt-2">Please enter your full name.</p>}
                </div>
                <div className="relative">
                  <label className="block label-sm text-secondary mb-2">Email Address*</label>
                  <input
                    className={`w-full input-underline py-2 ${errors.email ? "error" : ""}`}
                    id="field-email"
                    name="email"
                    placeholder="example@domain.com"
                    required
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="label-sm text-[#ba1a1a] mt-2">Please enter a valid email address.</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative">
                  <label className="block label-sm text-secondary mb-2">Phone Number*</label>
                  <input
                    className={`w-full input-underline py-2 ${errors.phone ? "error" : ""}`}
                    id="field-phone"
                    name="phone"
                    placeholder="+91 00000 00000"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <p className="label-sm text-[#ba1a1a] mt-2">Please enter your phone number.</p>}
                </div>
                <div className="relative">
                  <label className="block label-sm text-secondary mb-2">Order Number</label>
                  <input
                    className="w-full input-underline py-2"
                    id="field-order"
                    name="order"
                    placeholder="#EV-0000"
                    type="text"
                    value={form.order}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block label-sm text-secondary mb-2">Message*</label>
                <textarea
                  className={`w-full input-underline py-2 resize-none ${errors.message ? "error" : ""}`}
                  id="field-message"
                  name="message"
                  placeholder="How can we help you?"
                  required
                  rows="4"
                  value={form.message}
                  onChange={handleChange}
                />
                {errors.message && <p className="label-sm text-[#ba1a1a] mt-2">Please enter a message.</p>}
              </div>
              {status !== "sent" && (
                <button
                  className="w-full bg-primary text-on-primary py-5 font-headline-md text-body-lg hover:opacity-90 transition-opacity flex justify-center items-center gap-3"
                  type="submit"
                  data-magnetic
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Sending…" : "Send Message"}
                  {status !== "sending" && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                </button>
              )}
              {status === "sent" && (
                <div className="glass p-6 text-center">
                  <p className="label-sm">
                    Thank you. Your message has been received — we typically respond within 24 hours.
                  </p>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Info & FAQ */}
        <aside className="md:col-span-5 space-y-gutter" data-reveal data-reveal-delay="80">
          <div className="glass p-8">
            <h3 className="font-headline-md text-headline-md mb-6">Direct Lines</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">mail</span>
                <div>
                  <p className="label-sm text-secondary mb-1">Email Support</p>
                  <a className="text-primary hover:underline" href="mailto:elvynceofficial@gmail.com">
                    elvynceofficial@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">share</span>
                <div>
                  <p className="label-sm text-secondary mb-1">Instagram</p>
                  <a
                    className="text-primary hover:underline"
                    href="https://instagram.com/el.vynce"
                    target="_blank"
                    rel="noopener"
                  >
                    @el.vynce
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">schedule</span>
                <div>
                  <p className="label-sm text-secondary mb-1">Support Hours</p>
                  <p className="text-primary">Mon–Fri, 10:00 AM – 6:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8">
            <h3 className="font-headline-md text-headline-md mb-6">Common Questions</h3>
            <ContactAccordion />
          </div>
        </aside>
      </div>
    </main>
  );
}
