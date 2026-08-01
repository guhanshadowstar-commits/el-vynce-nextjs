"use client";

import { useEffect, useState } from "react";

const TOUR_STEPS = [
  { icon: "touch_app", text: "Tap the car — it'll honk" },
  { icon: "touch_app", text: "Tap a person — see their outfit" },
];

const SEEN_KEY = "ev-hero-tour-seen";

/* Two layers of curiosity-bait for the interactive hero scene:
   1. A persistent small "Interactive Scene" pill, bottom-center, fades in late.
   2. A one-time, two-step tooltip tour for first-time visitors that walks
      them through tapping the car then a pedestrian. Shown once per browser
      (localStorage), auto-advances, dismissible by tap. */
export default function HeroInteractionHint() {
  const [showPill, setShowPill] = useState(false);
  const [tourStep, setTourStep] = useState(-1);

  useEffect(() => {
    const pillTimer = setTimeout(() => setShowPill(true), 2200);

    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }

    let tourTimers = [];
    if (!seen) {
      tourTimers.push(setTimeout(() => setTourStep(0), 1200));
      tourTimers.push(setTimeout(() => setTourStep(1), 4200));
      tourTimers.push(
        setTimeout(() => {
          setTourStep(-1);
          try {
            localStorage.setItem(SEEN_KEY, "1");
          } catch {}
        }, 7200)
      );
    }

    return () => {
      clearTimeout(pillTimer);
      tourTimers.forEach(clearTimeout);
    };
  }, []);

  const dismissTour = () => {
    setTourStep(-1);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
  };

  return (
    <>
      {tourStep >= 0 && (
        <button
          onClick={dismissTour}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20 glass-strong px-5 py-3 flex items-center gap-3 fade-in"
        >
          <span className="material-symbols-outlined text-primary text-xl animate-bounce">
            {TOUR_STEPS[tourStep].icon}
          </span>
          <span className="label-sm text-primary whitespace-nowrap">{TOUR_STEPS[tourStep].text}</span>
        </button>
      )}

      {showPill && (
        <div className="absolute top-6 right-4 md:right-6 z-10 fade-in pointer-events-none">
          <div className="glass px-4 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">touch_app</span>
            <span className="label-sm text-primary">Interactive Scene</span>
          </div>
        </div>
      )}
    </>
  );
}
