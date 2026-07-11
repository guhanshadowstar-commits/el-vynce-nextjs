export default function PlaceholderSwatch({ product, sizeClass = "w-full h-full" }) {
  if (!product || !product.placeholderSwatch) {
    return (
      <div className={`${sizeClass} bg-surface-container flex items-center justify-center`}>
        <span className="label-sm text-secondary">Image coming soon</span>
      </div>
    );
  }
  const swatch = product.placeholderSwatch;
  const front = swatch.front || {};
  return (
    <div
      className={`${sizeClass} flex items-center justify-center text-center p-6`}
      style={{ background: swatch.bg }}
    >
      <div className="flex flex-col items-center gap-3">
        <span
          className="material-symbols-outlined"
          style={{ color: front.color || "#000000", opacity: 0.7, fontSize: "28px" }}
        >
          checkroom
        </span>
        <p className="label-sm font-medium leading-snug" style={{ color: front.color || "#000000" }}>
          {front.text || product.name}
        </p>
        <span className="label-sm text-[9px] opacity-60" style={{ color: front.color || "#000000" }}>
          Placeholder visual — pending product photography
        </span>
      </div>
    </div>
  );
}
