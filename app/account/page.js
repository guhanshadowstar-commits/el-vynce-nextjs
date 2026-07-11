import AccountForm from "./AccountForm";

export const metadata = {
  title: "Account — EL VYNCE",
  description: "Sign in to your EL VYNCE account.",
};

export default function AccountPage() {
  return (
    <main className="pt-32 pb-section-gap max-w-md mx-auto px-margin-mobile md:px-margin-desktop min-h-[70vh] flex flex-col justify-center">
      <header className="mb-12 text-center" data-reveal>
        <h1 className="font-headline-lg text-headline-lg-mobile mb-3">Sign In</h1>
        <p className="text-secondary">Access your EL VYNCE account.</p>
      </header>

      <AccountForm />
    </main>
  );
}
