"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SUGGESTIONS = [
  "Ask EL VYNCE to find your next piece…",
  "Try “resilient”",
  "Try “Warrior Drop”",
  "Try “Rebel Soul”",
  "Try “tee”",
];

export default function HeroSearchBar() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState(SUGGESTIONS[0]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (document.activeElement === inputRef.current || value) return;
      i = (i + 1) % SUGGESTIONS.length;
      setPlaceholder(SUGGESTIONS[i]);
    }, 3200);
    return () => clearInterval(id);
  }, [value]);

  const navigate = () => {
    const q = value.trim();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
          focused ? "bg-black/10" : "bg-black/0"
        }`}
      />
      <div
        className={`absolute top-24 left-1/2 -translate-x-1/2 w-[86%] md:w-[420px] opacity-90 hover:opacity-100 focus-within:opacity-100 transition-all duration-500 ${
          focused ? "scale-105" : ""
        }`}
      >
        <div className="glass-strong flex items-center gap-3 px-5 py-3">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && navigate()}
            placeholder={placeholder}
            className="bg-transparent border-none outline-none flex-1 font-body-md text-primary placeholder:text-secondary"
          />
          <span
            className="material-symbols-outlined text-secondary cursor-pointer"
            onClick={navigate}
          >
            search
          </span>
        </div>
      </div>
    </>
  );
}
