"use client";

import { useEffect } from "react";

function initCustomCursor() {
  const isCoarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const noHover = window.matchMedia && window.matchMedia("(hover: none)").matches;
  const isTouch = "ontouchstart" in window;
  if (isCoarse || noHover || isTouch) return () => {};

  const dot = document.createElement("div");
  dot.className = "ev-cursor-dot";
  const ring = document.createElement("div");
  ring.className = "ev-cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.documentElement.classList.add("ev-cursor-active");

  const onMove = (e) => {
    const x = e.clientX,
      y = e.clientY;
    dot.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
    ring.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
  };
  const hoverSelector = "a, button, [data-cursor-grow], input, textarea, select, .product-image, label";
  const onOver = (e) => {
    if (e.target.closest && e.target.closest(hoverSelector)) {
      dot.classList.add("is-hovering");
      ring.classList.add("is-hovering");
    }
  };
  const onOut = (e) => {
    if (e.target.closest && e.target.closest(hoverSelector)) {
      dot.classList.remove("is-hovering");
      ring.classList.remove("is-hovering");
    }
  };
  const onDown = () => {
    dot.classList.add("is-clicking");
    ring.classList.add("is-clicking");
  };
  const onUp = () => {
    dot.classList.remove("is-clicking");
    ring.classList.remove("is-clicking");
  };

  window.addEventListener("mousemove", onMove);
  document.addEventListener("mouseover", onOver);
  document.addEventListener("mouseout", onOut);
  document.addEventListener("mousedown", onDown);
  document.addEventListener("mouseup", onUp);

  return () => {
    window.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseover", onOver);
    document.removeEventListener("mouseout", onOut);
    document.removeEventListener("mousedown", onDown);
    document.removeEventListener("mouseup", onUp);
    document.documentElement.classList.remove("ev-cursor-active");
    dot.remove();
    ring.remove();
  };
}

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute("data-reveal-delay") || 0;
          entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  const observeAll = () => {
    document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => observer.observe(el));
  };
  observeAll();

  const mo = new MutationObserver(observeAll);
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    mo.disconnect();
  };
}

function initMagneticButtons() {
  const RADIUS = 90;
  const MAX_PULL = 8;
  const bound = new WeakSet();
  const cleanups = [];

  function attach(el) {
    if (bound.has(el)) return;
    bound.add(el);

    let targetX = 0,
      targetY = 0,
      curX = 0,
      curY = 0,
      animating = false;

    function tick() {
      curX += (targetX - curX) * 0.2;
      curY += (targetY - curY) * 0.2;
      el.style.transform = `translate(${curX}px, ${curY}px)`;
      if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
        requestAnimationFrame(tick);
      } else {
        animating = false;
      }
    }
    function startTick() {
      if (!animating) {
        animating = true;
        requestAnimationFrame(tick);
      }
    }
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < RADIUS) {
        const pull = 1 - dist / RADIUS;
        targetX = (dx / RADIUS) * MAX_PULL * pull;
        targetY = (dy / RADIUS) * MAX_PULL * pull;
      } else {
        targetX = 0;
        targetY = 0;
      }
      startTick();
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      startTick();
    };
    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    });
  }

  const attachAll = () => {
    document.querySelectorAll("[data-magnetic]").forEach(attach);
  };
  attachAll();

  const mo = new MutationObserver(attachAll);
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    mo.disconnect();
    cleanups.forEach((fn) => fn());
  };
}

function initScrollProgress() {
  const bar = document.createElement("div");
  bar.className = "ev-scroll-progress";
  document.body.appendChild(bar);

  const update = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0;
    bar.style.width = pct + "%";
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  return () => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
    bar.remove();
  };
}

/* Site-wide luxury interaction layer — custom cursor, scroll-reveal,
   magnetic buttons, scroll progress. Mounted once in the root layout.
   Does not touch the hero's three.js scene. */
export default function SiteInteractions() {
  useEffect(() => {
    const cleanups = [initCustomCursor(), initScrollReveal(), initMagneticButtons(), initScrollProgress()];
    return () => cleanups.forEach((fn) => fn && fn());
  }, []);

  return null;
}
