"use client";

import { useEffect, useRef } from "react";

const DESKTOP_RADIUS = 235;
const MOBILE_RADIUS = 150;

const POSITION_EASE = 0.14;
const RADIUS_EASE = 0.12;

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Experiments", href: "#experiments" },
];

const HEADING_LINES = ["Think", "Test", "Transform"];
const TAGLINE_LINES = ["Automate", "Validate", "Deliver"];

const CTA_HREF = "https://www.linkedin.com/in/navin-kumar-338a608a/";
const WORK_HREF = "https://sdetnavin.netlify.app/";

export default function GlassHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);

  // Pointer state lives entirely in refs — no React state, no re-renders.
  const rawRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const radiusRef = useRef(0);
  const targetRadiusRef = useRef(0);
  const trackingRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const reveal = revealRef.current;
    if (!hero || !reveal) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const posEase = reduceMotion ? 1 : POSITION_EASE;
    const radEase = reduceMotion ? 1 : RADIUS_EASE;

    const isMouse = (event: PointerEvent) => event.pointerType === "mouse";

    const localPoint = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const touchRadius = () =>
      window.matchMedia("(max-width: 767px) and (orientation: portrait)")
        .matches
        ? MOBILE_RADIUS
        : DESKTOP_RADIUS;

    const snapTo = (x: number, y: number) => {
      rawRef.current.x = x;
      rawRef.current.y = y;
      smoothRef.current.x = x;
      smoothRef.current.y = y;
    };

    // ---- single rAF loop -------------------------------------------------
    const tick = () => {
      const raw = rawRef.current;
      const smooth = smoothRef.current;

      smooth.x += (raw.x - smooth.x) * posEase;
      smooth.y += (raw.y - smooth.y) * posEase;
      radiusRef.current +=
        (targetRadiusRef.current - radiusRef.current) * radEase;

      if (Math.abs(targetRadiusRef.current - radiusRef.current) < 0.05) {
        radiusRef.current = targetRadiusRef.current;
      }

      reveal.style.setProperty("--reveal-x", `${smooth.x.toFixed(2)}px`);
      reveal.style.setProperty("--reveal-y", `${smooth.y.toFixed(2)}px`);
      reveal.style.setProperty(
        "--reveal-radius",
        `${radiusRef.current.toFixed(2)}px`,
      );

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    // ---- desktop: hover-driven, no click required ------------------------
    const onPointerEnter = (event: PointerEvent) => {
      if (!isMouse(event)) return;
      const { x, y } = localPoint(event);
      snapTo(x, y);
      targetRadiusRef.current = DESKTOP_RADIUS;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (isMouse(event)) {
        const { x, y } = localPoint(event);
        // Cursor already inside on load: pointerenter never fires.
        if (smoothRef.current.x < -900) {
          snapTo(x, y);
        } else {
          rawRef.current.x = x;
          rawRef.current.y = y;
        }
        if (targetRadiusRef.current === 0) {
          targetRadiusRef.current = DESKTOP_RADIUS;
        }
        return;
      }

      if (!trackingRef.current) return;
      const { x, y } = localPoint(event);
      rawRef.current.x = x;
      rawRef.current.y = y;
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (!isMouse(event)) return;
      targetRadiusRef.current = 0;
    };

    // ---- touch / pen: press, drag, release ------------------------------
    const onPointerDown = (event: PointerEvent) => {
      if (isMouse(event)) return;
      trackingRef.current = true;

      if (typeof hero.setPointerCapture === "function") {
        try {
          hero.setPointerCapture(event.pointerId);
        } catch {
          /* capture is best-effort */
        }
      }

      const { x, y } = localPoint(event);
      snapTo(x, y);
      targetRadiusRef.current = touchRadius();
    };

    const endTouch = (event: PointerEvent) => {
      if (isMouse(event)) return;
      trackingRef.current = false;
      targetRadiusRef.current = 0;
    };

    hero.addEventListener("pointerenter", onPointerEnter);
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);
    hero.addEventListener("pointerdown", onPointerDown, { passive: true });
    hero.addEventListener("pointerup", endTouch);
    hero.addEventListener("pointercancel", endTouch);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      hero.removeEventListener("pointerenter", onPointerEnter);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      hero.removeEventListener("pointerdown", onPointerDown);
      hero.removeEventListener("pointerup", endTouch);
      hero.removeEventListener("pointercancel", endTouch);
    };
  }, []);

  return (
    <section ref={heroRef} className="hero" aria-label="Navin Kumar — intro">
      {/* 1 — base editorial portrait */}
      <div className="hero__plate hero__base" aria-hidden="true" />

      {/* 2 — aligned liquid-glass anatomical reveal */}
      <div
        ref={revealRef}
        className="hero__plate hero__reveal"
        aria-hidden="true"
      />

      {/* 3 — technical grid + fine-line circle */}
      <div className="hero__tech" aria-hidden="true">
        <div className="hero__grid" />
        <div className="hero__circle" />
      </div>

      {/* 5 — navigation */}
      <header className="hero__header">
        <nav className="hero__nav" aria-label="Primary">
          <a className="hero__brand" href="#top">
            <Monogram />
            <span>Navin Kumar</span>
          </a>

          <ul className="hero__links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          <a
            className="pill"
            href={CTA_HREF}
            target="_blank"
            rel="noreferrer"
          >
            Let&rsquo;s talk
            <Arrow />
          </a>
        </nav>
      </header>

      {/* 4 — headline and copy */}
      <div className="hero__content">
        <h1 className="hero__heading">
          {HEADING_LINES.map((line) => (
            <span className="line" key={line}>
              {line}
            </span>
          ))}
        </h1>

        <div className="hero__intro">
          <p>
            I build intelligent automation for web, APIs, and end-to-end
            workflows using Java, Python, Playwright, Selenium, and AI.
          </p>
          <a className="pill" href={WORK_HREF} target="_blank" rel="noreferrer">
            Explore my work
            <Arrow />
          </a>
        </div>

        <p className="hero__tagline">
          {TAGLINE_LINES.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      </div>
    </section>
  );
}

/** Original monogram: an "N" cut from a squared aperture. */
function Monogram() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="0.6"
        y="0.6"
        width="24.8"
        height="24.8"
        rx="7.2"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.2"
      />
      <path
        d="M8 18.4V7.6L18 18.4V7.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      <circle cx="18" cy="7.6" r="1.5" fill="currentColor" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      className="pill__arrow"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.6 7h8.4M7.6 3.2 11.4 7l-3.8 3.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
