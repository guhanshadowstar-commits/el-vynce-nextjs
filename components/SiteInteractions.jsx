"use client";

import { useEffect } from "react";

/* "Prowling Panther" cursor — ported from the static site's js/interactions.js.
   dot snaps to the pointer instantly; panther (the EL VYNCE panther-head
   logo, images/cursor/panther-cursor.png) is rAF-lerped a step behind with a
   head-tilt toward travel direction, a speed-tied bob, and a click "pounce".
   mix-blend-mode:difference (CSS) makes it self-invert over any background. */
function initCustomCursor() {
  const isCoarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const noHover = window.matchMedia && window.matchMedia("(hover: none)").matches;
  const isTouch = "ontouchstart" in window;
  if (isCoarse || noHover || isTouch) return () => {};
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dot = document.createElement("div");
  dot.className = "ev-cursor-dot";
  const panther = document.createElement("div");
  panther.className = "ev-cursor-panther";
  document.body.appendChild(dot);
  document.body.appendChild(panther);
  document.documentElement.classList.add("ev-cursor-active");

  let mx = -100, my = -100;
  let px = -100, py = -100;
  let tilt = 0;
  let bob = 0;
  let shown = false;
  let pounceAt = -1;
  let lastFrame = performance.now();
  let rafId = null;

  function frame(now) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    const k = 1 - Math.exp(-9 * dt);
    px += (mx - px) * k;
    py += (my - py) * k;

    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;

    const vx = mx - px;
    const speed = Math.hypot(vx, my - py);
    if (!reduceMotion) {
      const targetTilt = Math.max(-14, Math.min(14, vx * 0.35));
      tilt += (targetTilt - tilt) * Math.min(1, 6 * dt);
      bob += dt * Math.min(10, speed * 0.15);
    } else {
      tilt = 0;
    }

    let pounceScale = 1, pounceLurch = 0;
    if (pounceAt >= 0) {
      const p = (now - pounceAt) / 400;
      if (p >= 1) pounceAt = -1;
      else {
        pounceScale = 1 + Math.sin(p * Math.PI) * 0.22 * (1 - p * 0.3);
        pounceLurch = Math.sin(p * Math.PI) * 3 * (1 - p);
      }
    }
    const bobY = reduceMotion ? 0 : Math.sin(bob) * 1.4;

    panther.style.transform =
      `translate(${px}px, ${py + bobY}px) translate(-50%, -50%) ` +
      `translate(0, ${-pounceLurch}px) rotate(${tilt}deg) scale(${pounceScale})`;

    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  const onMove = (e) => {
    mx = e.clientX; my = e.clientY;
    if (!shown) {
      px = mx; py = my;
      shown = true;
      dot.classList.add("is-shown");
      panther.classList.add("is-shown");
    }
    const overHero = e.target && e.target.tagName === "CANVAS" && e.target.style.cursor === "pointer";
    dot.classList.toggle("is-hero-hover", overHero);
    panther.classList.toggle("is-hero-hover", overHero);
  };
  const onLeaveWindow = () => {
    dot.classList.remove("is-shown");
    panther.classList.remove("is-shown");
    shown = false;
  };

  const viewSelector = ".product-image, [data-cursor-view]";
  const textSelector = "input:not([type=button]):not([type=submit]), textarea, [contenteditable]";
  const hoverSelector = "a, button, [data-cursor-grow], select, label, [data-magnetic]";
  function setState(el) {
    const view = !!(el && el.closest && el.closest(viewSelector));
    const text = !view && !!(el && el.closest && el.closest(textSelector));
    const hover = !view && !text && !!(el && el.closest && el.closest(hoverSelector));
    [dot, panther].forEach((n) => {
      n.classList.toggle("is-view", view);
      n.classList.toggle("is-text", text);
      n.classList.toggle("is-hovering", hover);
    });
  }
  const onOver = (e) => setState(e.target);
  const onOut = () => setState(null);
  const onDown = () => {
    dot.classList.add("is-clicking");
    panther.classList.add("is-clicking");
    if (!reduceMotion) pounceAt = performance.now();
  };
  const onUp = () => {
    dot.classList.remove("is-clicking");
    panther.classList.remove("is-clicking");
  };

  window.addEventListener("mousemove", onMove);
  document.addEventListener("mouseleave", onLeaveWindow);
  document.addEventListener("mouseover", onOver);
  document.addEventListener("mouseout", onOut);
  document.addEventListener("mousedown", onDown);
  document.addEventListener("mouseup", onUp);

  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseleave", onLeaveWindow);
    document.removeEventListener("mouseover", onOver);
    document.removeEventListener("mouseout", onOut);
    document.removeEventListener("mousedown", onDown);
    document.removeEventListener("mouseup", onUp);
    document.documentElement.classList.remove("ev-cursor-active");
    dot.remove();
    panther.remove();
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
