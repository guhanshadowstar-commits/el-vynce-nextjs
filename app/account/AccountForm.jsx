"use client";

// NOTE: no auth backend yet — fields are disabled and the form is inert,
// matching the original static placeholder. Wire up real authentication later.
export default function AccountForm() {
  return (
    <form
      className="glass p-8 md:p-10 space-y-8"
      onSubmit={(e) => e.preventDefault()}
      data-reveal
      data-reveal-delay="80"
    >
      <div className="relative">
        <label className="block label-sm text-secondary mb-2">Email Address</label>
        <input className="w-full input-underline py-2" type="email" placeholder="you@example.com" disabled />
      </div>
      <div className="relative">
        <label className="block label-sm text-secondary mb-2">Password</label>
        <input className="w-full input-underline py-2" type="password" placeholder="••••••••" disabled />
      </div>
      <button
        className="w-full bg-primary text-on-primary py-5 font-headline-md text-body-lg opacity-40 cursor-not-allowed"
        type="submit"
        disabled
      >
        Sign In
      </button>
      <p className="label-sm text-secondary text-center">Account system coming soon</p>
    </form>
  );
}
