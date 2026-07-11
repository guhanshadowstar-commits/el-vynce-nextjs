/* Spinning brand stamp — fixed, glides site-wide, homepage-only.
   Ported 1:1 from index.html. Stays hidden over the hero (body.ev-has-hero)
   and fades in once HeroScene's scroll handler toggles body.ev-stamp-in
   (see lib/heroScene.js updateScrollProgress()). */
export default function BrandStamp() {
  return (
    <div className="ev-brand-stamp" aria-hidden="true">
      <svg className="ev-stamp-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id="ev-ring-path" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
        </defs>
        <g>
          <text fontFamily="Inter,sans-serif" fontSize="9.2" fontWeight="600" fill="#000000" letterSpacing="1.8">
            <textPath href="#ev-ring-path">
              EL VYNCE • MADE TO ORDER • THE ONLY MINIMALIST BRAND YOU NEED • MADE FOR STILLNESS • EL VYNCE • MADE TO
              ORDER • THE ONLY MINIMALIST BRAND YOU NEED • MADE FOR STILLNESS •
            </textPath>
          </text>
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="22s" repeatCount="indefinite" />
        </g>
        <circle cx="100" cy="100" r="72" fill="none" stroke="#000000" strokeWidth="0.5" opacity="0.18" />
        <text x="100" y="100" textAnchor="middle" dominantBaseline="central" fontFamily="Bodoni Moda, serif" fontSize="44" fontWeight="400" fill="#000000" letterSpacing="-2">
          EL
        </text>
      </svg>
    </div>
  );
}
