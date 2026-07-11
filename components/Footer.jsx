import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-outline-variant/30 w-full py-section-gap">
      <div
        className="flex flex-col items-center text-center px-margin-desktop w-full max-w-container-max mx-auto"
        data-reveal
      >
        <span className="font-headline-md text-headline-md text-primary mb-8 block">EL VYNCE</span>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-16">
          <Link className="label-sm text-on-surface-variant hover:text-primary transition-colors" href="/shipping-returns">
            Shipping &amp; Returns
          </Link>
          <Link className="label-sm text-on-surface-variant hover:text-primary transition-colors" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="label-sm text-on-surface-variant hover:text-primary transition-colors" href="/terms-of-service">
            Terms of Service
          </Link>
          <Link className="label-sm text-on-surface-variant hover:text-primary transition-colors" href="/contact">
            Contact
          </Link>
        </div>
        <p className="label-sm text-[10px] text-secondary">© 2026 EL VYNCE. Made in Chennai, India.</p>
      </div>
    </footer>
  );
}
