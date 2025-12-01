"use client";
import React, { useEffect, useRef, useState } from "react";

type TypingLoopProps = {
  texts?: string[]; // texts to cycle through
  className?: string; // additional wrapper classes
  typingSpeed?: number; // ms per character typed
  deletingSpeed?: number; // ms per character deleted
  pauseOnFull?: number; // ms to wait when a full phrase is typed
  pauseOnEmpty?: number; // ms to wait before typing next phrase
  cursor?: string; // cursor character
  loop?: boolean;
};


export default function TypingLoop({
  texts = [
    "Welcome to River",
    "One of the world's top trading platforms",
    "Over $908M payout since inception in 2020",
  ],
  className = "",
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseOnFull = 1500,
  pauseOnEmpty = 300,
  cursor = "|",
  loop = true,
}: TypingLoopProps) {
  const [display, setDisplay] = useState("");
  const mountedRef = useRef(true);
  const timerRef = useRef<number | null>(null);

  // mutable state refs to avoid re-running effects unnecessarily
  const indexRef = useRef(0); // current phrase index
  const charRef = useRef(0); // current character index within phrase
  const deletingRef = useRef(false);

  // ensure cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // guard: nothing to do if no texts
    if (!texts || texts.length === 0) {
      setDisplay("");
      return;
    }

    const tick = async () => {
      if (!mountedRef.current) return;

      const currentIdx = indexRef.current % texts.length;
      const currentText = texts[currentIdx] ?? "";

      if (!deletingRef.current) {
        // typing
        if (charRef.current < currentText.length) {
          charRef.current += 1;
          setDisplay(currentText.slice(0, charRef.current));
          timerRef.current = window.setTimeout(tick, typingSpeed);
        } else {
          // finished typing
          if (!loop && currentIdx === texts.length - 1) {
            // stop permanently on last phrase if loop=false
            return;
          }
          timerRef.current = window.setTimeout(() => {
            if (!mountedRef.current) return;
            deletingRef.current = true;
            timerRef.current = window.setTimeout(tick, deletingSpeed);
          }, pauseOnFull);
        }
      } else {
        // deleting
        if (charRef.current > 0) {
          charRef.current -= 1;
          setDisplay(currentText.slice(0, charRef.current));
          timerRef.current = window.setTimeout(tick, deletingSpeed);
        } else {
          // finished deleting -> go to next phrase
          timerRef.current = window.setTimeout(() => {
            if (!mountedRef.current) return;
            deletingRef.current = false;
            indexRef.current = (indexRef.current + 1) % texts.length;
            // small pause before next typing
            timerRef.current = window.setTimeout(tick, typingSpeed);
          }, pauseOnEmpty);
        }
      }
    };

    // start the loop (give a small initial delay so it doesn't jump)
    timerRef.current = window.setTimeout(tick, 120);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    
  }, [texts, typingSpeed, deletingSpeed, pauseOnFull, pauseOnEmpty, loop]);

  return (
    <div
      className={`typing-loop ${className} flex items-center gap-2`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className="typing-text text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-tight text-white"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {display}
      </span>

      <span
        aria-hidden
        className="typing-cursor text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-primary"
        style={{
          display: "inline-block",
          lineHeight: 1,
          marginLeft: 2,
        }}
      >
        {cursor}
      </span>

      <style jsx>{`
        .typing-cursor {
          animation: blink 1s step-start infinite;
        }

        @keyframes blink {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}