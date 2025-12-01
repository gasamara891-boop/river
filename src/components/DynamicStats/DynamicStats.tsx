"use client";
import React, { useEffect, useRef, useState } from "react";

type Stat = {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  format?: "compact" | "full";
  decimals?: number;
};

const DEFAULT_STATS: Stat[] = [
  { id: "total_invested", label: "Total Invested", value: 1507003000, prefix: "$", format: "compact", decimals: 1 },
  { id: "active_investors", label: "Active Investors", value: 48000, suffix: "+", format: "compact", decimals: 0 },
  { id: "total_profit", label: "Total Profit", value: 900008000, prefix: "$", format: "compact", decimals: 1 },
  { id: "total_plans", label: "Active Plans", value: 19, format: "full", decimals: 0 },
];

// Compact formatting (8.5M, 23k, etc.)
function formatCompact(value: number, decimals = 1) {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(decimals) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(decimals) + "M";
  if (value >= 1000) return (value / 1000).toFixed(decimals) + "k";
  return value.toString();
}

// Full format with commas
function formatFull(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

// Count-up animation hook with cleanup
function useCountUp(target: number, duration = 1600, delay = 0) {
  const [current, setCurrent] = useState(0);
  const raf = useRef<number | null>(null);

  const animate = () => {
    const startTime = performance.now() + delay;
    const startValue = 0;
    const diff = target - startValue;

    const tick = (time: number) => {
      if (time < startTime) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = time - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setCurrent(startValue + diff * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return { current, animate };
}

export default function DynamicStats({
  stats = DEFAULT_STATS,
  className = "",
}: {
  stats?: Stat[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const controllers = stats.map((s, i) => useCountUp(s.value, 1800, i * 200));

  // Observe visibility
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setVisible(true)),
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Start animation on visibility
  useEffect(() => {
    if (visible) controllers.forEach((c) => c.animate());
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      ref={ref}
      className={`py-20 px-6 bg-gradient-to-b from-[#030014] via-[#06061a] to-[#000000] ${className}`}
      aria-label="Our Stats"
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide relative inline-block">
          <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse">
            Our Stats
          </span>
          <span className="absolute left-1/2 -bottom-2 w-32 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 -translate-x-1/2"></span>
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => {
          const ctrl = controllers[i];
          const value =
            s.format === "compact"
              ? formatCompact(ctrl.current, s.decimals ?? 1)
              : formatFull(ctrl.current);

          return (
            <div
              key={s.id}
              className="relative group p-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 
                         hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all duration-500"
            >
              <div className="bg-[#0a0a1a] rounded-2xl p-8 h-full flex flex-col items-center justify-center
                              text-center group-hover:bg-[#11112a] transition-all duration-300">
                <div className="text-sm text-gray-400 mb-3 uppercase tracking-wide">
                  {s.label}
                </div>
                <div className="text-3xl md:text-4xl font-extrabold flex items-baseline text-white space-x-1
                                group-hover:text-cyan-400 transition-colors duration-500">
                  {s.prefix && (
                    <span className="text-cyan-400 text-2xl md:text-3xl">{s.prefix}</span>
                  )}
                  <span>{value}</span>
                  {s.suffix && (
                    <span className="text-purple-400 text-xl md:text-2xl">{s.suffix}</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40
                                bg-gradient-to-r from-cyan-500/40 to-purple-500/40 blur-2xl transition-all"></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
