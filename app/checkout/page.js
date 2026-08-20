"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/format";
import PlaceholderSwatch from "@/components/PlaceholderSwatch";
import { trackBeginCheckout, getClientId } from "@/lib/ga4";

/* Checkout — collects the customer's details, then runs the Razorpay flow:
   1. POST /api/create-order (server recomputes the price and creates the
      Razorpay order using the secret key — never exposed here).
   2. Open Razorpay's own checkout modal. Card/UPI details go straight from
      the customer to Razorpay — they never pass through our code.
   3. Razorpay hands back a signature; POST /api/verify-payment checks it
      server-side and records the order in the CRM.
   4. Clear the cart, show the confirmation page. */

// Every field is mandatory (required). Name/email/phone/address are the CRM
// essentials; email is format-checked by the browser (type="email"), and
// phone/PIN carry pattern + inputMode so mobiles show the number pad and a
// junk value is rejected before payment — not just an empty one.
const FIELDS = [
  { key: "name", label: "Full Name", type: "text", autoComplete: "name", required: true },
  { key: "email", label: "Email", type: "email", autoComplete: "email", required: true },
  {
    key: "phone", label: "Phone (WhatsApp preferred)", type: "tel", autoComplete: "tel",
    required: true, inputMode: "tel", pattern: "[0-9+\\-\\s]{10,15}",
    title: "Enter a valid phone number (at least 10 digits)",
  },
  { key: "address", label: "Delivery Address", type: "text", autoComplete: "street-address", required: true },
  { key: "city", label: "City", type: "text", autoComplete: "address-level2", required: true },
  { key: "state", label: "State", type: "text", autoComplete: "address-level1", required: true },
  {
    key: "pincode", label: "PIN Code", type: "text", autoComplete: "postal-code",
    required: true, inputMode: "numeric", pattern: "\\d{6}", maxLength: 6,
    title: "Enter your 6-digit PIN code",
  },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map((f) => [f.key, ""])));
  const [status, setStatus] = useState("idle"); // idle | paying | verifying | error | not_configured
  const [errorMsg, setErrorMsg] = useState("");

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length || status === "paying" || status === "verifying") return;
    setStatus("paying");
    setErrorMsg("");

    const customer = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: `${form.address.trim()}, ${form.city.trim()}, ${form.state.trim()} — ${form.pincode.trim()}`,
    };
    const items = cart.map((c) => ({ id: c.id, size: c.size, color: c.color, qty: c.qty }));
    const clientId = getClientId();

    // Track GA4 begin_checkout event
    trackBeginCheckout(items, subtotal);

    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer, clientId }),
      });

      if (orderRes.status === 503) {
        setStatus("not_configured");
        return;
      }
      if (!orderRes.ok) throw new Error("Could not create the order. Please try again.");
      const order = await orderRes.json();

      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) throw new Error("Could not load the payment window. Check your connection and try again.");

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "EL VYNCE",
        description: "Made-to-order — production begins after your order.",
        order_id: order.orderId,
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        notes: { address: customer.address },
        theme: { color: "#000000" },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
        handler: async (response) => {
          setStatus("verifying");
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, customer, items }),
            });
            if (!verifyRes.ok) throw new Error("verify_failed");
            clearCart();
            router.push("/order-confirmed");
          } catch {
            setStatus("error");
            setErrorMsg(
              "Your payment went through, but confirmation hit a snag. Don't pay again — email elvynceofficial@gmail.com with your payment reference and we'll confirm your order."
            );
          }
        },
      });
      rzp.on("payment.failed", () => {
        setStatus("error");
        setErrorMsg("Payment didn't go through. No money was taken — you can try again.");
      });
      rzp.open();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  if (!cart.length && status !== "verifying") {
    return (
      <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-6 tracking-tight">Checkout</h1>
        <p className="font-body-lg text-body-lg text-secondary mb-10">Your cart is empty.</p>
        <Link href="/shop" data-magnetic className="bg-primary text-on-primary px-8 py-4 label-sm inline-block">
          Browse Our Drops
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 tracking-tight" data-reveal>
        Checkout
      </h1>
      <p className="label-sm text-secondary mb-16">Made to order. Production begins after you place your order.</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-16">
        {/* Delivery details */}
        <form onSubmit={handleSubmit} className="order-2 lg:order-1 lg:col-span-7 flex flex-col gap-10">
          <h2 className="label-sm border-b border-outline-variant/40 pb-4">Delivery Details</h2>
          {FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-2">
              <span className="label-sm text-secondary">{f.label}</span>
              <input
                type={f.type}
                required={f.required}
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                pattern={f.pattern}
                title={f.title}
                maxLength={f.maxLength}
                value={form[f.key]}
                onChange={setField(f.key)}
                className="input-underline py-3 font-body-md text-primary"
              />
            </label>
          ))}

          {status === "not_configured" && (
            <p className="label-sm text-secondary border border-outline-variant p-6">
              Online payment isn&apos;t live yet — we&apos;re putting the final pieces in place. Meanwhile, DM us on
              Instagram or email elvynceofficial@gmail.com to place this order directly.
            </p>
          )}
          {status === "error" && <p className="label-sm text-[#ba1a1a]">{errorMsg}</p>}

          <button
            type="submit"
            data-magnetic
            disabled={status === "paying" || status === "verifying"}
            className="w-full bg-primary text-on-primary py-6 label-sm uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {status === "paying" ? "Opening secure payment…" : status === "verifying" ? "Confirming payment…" : `Pay ${formatPrice(subtotal)}`}
          </button>
          <p className="label-sm text-secondary/70 text-center -mt-4">
            Payments are handled by Razorpay&apos;s secure checkout. Your card / UPI details never touch our servers.
          </p>
        </form>

        {/* Order summary */}
        <aside className="order-1 lg:order-2 lg:col-span-5">
          <div className="glass p-8 sticky top-24">
            <h2 className="label-sm border-b border-outline-variant/40 pb-4 mb-8">Your Order</h2>
            <div className="space-y-8">
              {cart.map((item) => (
                <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-5 items-start">
                  <div className="w-16 h-20 bg-surface-container flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <PlaceholderSwatch product={item} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between gap-3">
                      <h3 className="font-body-md text-primary">{item.name}</h3>
                      <span className="label-sm">{formatPrice(item.price * item.qty)}</span>
                    </div>
                    <p className="label-sm text-on-surface-variant mt-1">
                      Qty {item.qty} · {item.color || "-"} / {item.size || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-outline-variant/40 mt-8 pt-6">
              <span className="label-sm text-secondary">Total</span>
              <span className="font-body-lg text-body-lg font-bold">{formatPrice(subtotal)}</span>
            </div>
            <p className="label-sm text-secondary/70 mt-4">Shipping included. No hidden charges at delivery.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
