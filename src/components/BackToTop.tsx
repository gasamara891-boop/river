"use client";

import { useEffect, useState, useCallback } from "react";

export default function BackToTop({
  threshold = 280, // px before showing
  bottom = 95, // distance from bottom in px
  left = 28, // position from left in px
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const update = useCallback(() => {
    const scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
    const winHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const scrollable = Math.max(1, docHeight - winHeight);
    const pct = Math.min(1, Math.max(0, scrollTop / scrollable));
    setProgress(pct);
    setVisible(scrollTop > threshold);
  }, [threshold]);

  useEffect(() => {
    update();
    const onScroll = () => requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  function scrollToTop() {
    if (prefersReduced) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const R = 18;
  const C = 2 * Math.PI * R;
  const dash = C * (1 - progress);

  return (
    <>
      <button
        type="button"
        aria-label="Back to top"
        className={`back-to-top ${visible ? "visible" : ""}`}
        onClick={scrollToTop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            scrollToTop();
          }
        }}
      >
        <svg
          className="btt-icon"
          width="44"
          height="44"
          viewBox="0 0 44 44"
          aria-hidden
        >
          <circle
            className="btt-ring-bg"
            cx="22"
            cy="22"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
          />
          <circle
            className="btt-ring"
            cx="22"
            cy="22"
            r={R}
            fill="none"
            stroke="url(#bttGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={dash}
            transform="rotate(-90 22 22)"
          />
          <defs>
            <linearGradient id="bttGradient" x1="0" x2="1">
              <stop offset="0" stopColor="#6EF2F1" />
              <stop offset="1" stopColor="#6B60FF" />
            </linearGradient>
          </defs>

          <g transform="translate(12,12)">
            <path
              className="btt-arrow"
              d="M10 14 L0 4 L2.2 1.8 L10 9.6 L17.8 1.8 L20 4 Z"
              fill="#ffffff"
              opacity="0.95"
              transform="scale(1)"
            />
          </g>
        </svg>
      </button>

      <style jsx>{`
        .back-to-top {
          position: fixed;
          left: ${left}px;
          bottom: ${bottom}px;
          width: 56px;
          height: 56px;
          border-radius: 999px;
          padding: 6px;
          border: none;
          background: linear-gradient(
            180deg,
            rgba(25, 30, 60, 0.95),
            rgba(10, 12, 28, 0.9)
          );
          box-shadow: 0 10px 25px rgba(6, 11, 26, 0.7),
            0 3px 6px rgba(110, 242, 241, 0.15);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transform: translateY(12px) scale(0.96);
          transition: opacity 260ms cubic-bezier(0.2, 0.9, 0.25, 1),
            transform 260ms cubic-bezier(0.2, 0.9, 0.25, 1),
            box-shadow 220ms ease;
          z-index: 999999;
          backdrop-filter: blur(6px) saturate(120%);
          -webkit-backdrop-filter: blur(6px) saturate(120%);
        }

        .back-to-top.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .back-to-top:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 20px 50px rgba(6, 11, 26, 0.7),
            0 6px 14px rgba(110, 242, 241, 0.1);
        }

        .btt-icon {
          display: block;
        }

        .btt-ring {
          transition: stroke-dashoffset 260ms linear;
        }

        .btt-arrow {
          transition: transform 220ms cubic-bezier(0.2, 0.9, 0.25, 1),
            opacity 160ms ease;
          transform-origin: center;
        }

        .back-to-top:hover .btt-arrow {
          transform: translateY(-2px) scale(1.05);
        }

        @media (max-width: 520px) {
          .back-to-top {
            left: 16px;
            bottom: 70px;
            width: 48px;
            height: 48px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .back-to-top,
          .btt-ring,
          .btt-arrow {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
