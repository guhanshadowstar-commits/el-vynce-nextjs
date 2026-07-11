"use client";

import { useEffect, useRef } from "react";
import { initHeroScene } from "@/lib/heroScene";

/* Mounts the "Rush Hour, 8:59 AM" three.js scene into a div. useEffect runs
   once on mount and returns heroScene's own cleanup — cancels the render
   loop, disposes the renderer/geometries/materials, and removes every
   window/document listener it added, so navigating to another route never
   leaks a WebGL context or leaves a second scene running underneath. */
export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const cleanup = initHeroScene(mountRef.current);
    return () => cleanup && cleanup();
  }, []);

  return <div id="hero-silhouette" ref={mountRef} className="absolute inset-0 w-full h-full" />;
}
