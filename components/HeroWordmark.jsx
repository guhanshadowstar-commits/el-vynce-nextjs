/* Letter-staggered "EL VYNCE" hero wordmark — ported from js/main.js's
   DOMContentLoaded letter-split logic into plain JSX. Each character is its
   own span with a staggered animationDelay (0.5s base + 0.05s per letter),
   driven by the `.hero-wordmark-light .letter` / `ev-letter-in` keyframes
   already defined in globals.css. No client-side DOM manipulation needed —
   React renders the spans directly. */
export default function HeroWordmark({ text = "EL VYNCE" }) {
  return (
    <h1 className="hero-wordmark-light text-center text-[18vw] md:text-[14vw] [@media(max-height:500px)]:text-[12vw] tracking-tight select-none">
      {text.split("").map((ch, i) => (
        <span key={i} className="letter" style={{ animationDelay: `${0.5 + i * 0.05}s` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </h1>
  );
}
