import Link from "next/link";
import HeroScene from "@/components/HeroScene";
import HeroWordmark from "@/components/HeroWordmark";
import HeroSearchBar from "@/components/HeroSearchBar";
import HeroInteractionHint from "@/components/HeroInteractionHint";
import BrandStamp from "@/components/BrandStamp";
import NewArrivals from "@/components/NewArrivals";
import DropSections from "@/components/DropSections";

export default function Home() {
  return (
    <>
      <header className="relative w-full h-[78vh] min-h-[460px] max-h-[720px] md:h-[640px] overflow-hidden bg-white">
        <HeroScene />
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <HeroWordmark />
        </div>

        <HeroInteractionHint />

        <div className="absolute bottom-0 left-0 w-full px-margin-mobile md:px-margin-desktop pb-8 md:pb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 max-w-container-max mx-auto">
          <p className="font-body-lg text-body-lg text-primary max-w-md">
            Made-to-order Indian clothing, cut for stillness. Every piece begins after you place your order.
          </p>
          <Link
            href="/shop"
            data-magnetic
            className="bg-primary text-on-primary px-8 py-4 label-sm w-fit hover:opacity-90 transition-opacity"
          >
            Shop the Collection
          </Link>
        </div>

        <HeroSearchBar />
      </header>

      <main>
        <NewArrivals />
        <DropSections />
      </main>

      <BrandStamp />
    </>
  );
}
