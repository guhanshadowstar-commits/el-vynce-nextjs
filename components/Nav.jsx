"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/CartContext";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export default function Nav() {
  const pathname = usePathname();
  const { count, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      data-main-nav
      className={`fixed top-0 w-full z-50 glass border-b border-outline-variant/30 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        <Link href="/" className="font-headline-md text-headline-md text-primary tracking-tighter">
          EL VYNCE
        </Link>
        <div className="hidden md:flex gap-10">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`label-sm transition-colors ${
                  isActive
                    ? "text-primary border-b border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-6">
          <button
            className="relative min-w-11 min-h-11 flex items-center justify-center -mr-2"
            onClick={toggleCart}
            aria-label="Open cart"
          >
            <span className="material-symbols-outlined text-primary">shopping_bag</span>
            {count > 0 && (
              <span className="dot absolute top-1 right-1 bg-primary text-on-primary text-[10px] w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button
            className="md:hidden min-w-11 min-h-11 flex items-center justify-center -mr-2 material-symbols-outlined text-primary"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            menu
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden glass border-t border-outline-variant/30 px-margin-mobile py-4 flex flex-col gap-4">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="label-sm text-on-surface-variant">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
