import Link from "next/link";

export const metadata = { title: "Order Confirmed — EL VYNCE" };

export default function OrderConfirmedPage() {
  return (
    <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
      <p className="label-sm text-secondary mb-6" data-reveal>
        Payment received
      </p>
      <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-8 tracking-tight" data-reveal>
        Your piece begins now.
      </h1>
      <p className="font-body-lg text-body-lg text-secondary max-w-xl mx-auto mb-6" data-reveal>
        Every EL VYNCE garment is made to order — production of yours starts with this confirmation. We&apos;ll reach
        out on WhatsApp and email with your order details and tracking once it ships.
      </p>
      <p className="label-sm text-secondary/70 mb-14" data-reveal>
        Questions? elvynceofficial@gmail.com
      </p>
      <Link href="/shop" data-magnetic className="bg-primary text-on-primary px-8 py-4 label-sm inline-block" data-reveal>
        Continue Browsing
      </Link>
    </main>
  );
}
