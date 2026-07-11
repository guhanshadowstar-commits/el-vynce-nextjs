import Link from "next/link";

export const metadata = {
  title: "Page Not Found — EL VYNCE",
  description: "The page you're looking for could not be found.",
};

export default function NotFound() {
  return (
    <main className="min-h-screen pt-16 flex flex-col items-center justify-center text-center px-6">
      <div data-reveal>
        <h1 className="font-headline-lg text-display-404 mb-4">404</h1>
        <h2 className="font-headline-lg text-2xl md:text-3xl mb-6">Page not found</h2>
        <p className="text-secondary max-w-sm mb-12">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to
          stillness.
        </p>
        <Link href="/" data-magnetic className="bg-primary text-on-primary px-8 py-4 label-sm hover:opacity-90 transition-opacity">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
