"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const milestones = [
  { date: "Jan 2020", title: "River Platform Launched", description: "We officially launched the River Platform, unlocking new possibilities for community safety.", icon: "🚀" },
  { date: "Mar 2021", title: "First 20,000 Users", description: "Hit our first user milestone  after launch. Growth exceeded all projections.", icon: "🎉" },
  { date: "Jun 2022", title: "Partner Integrations", description: "Partnered with trusted security firms to expand real-time verification.", icon: "🤝" },
  { date: "Sep 2023", title: "Mobile App Release", description: "Released our iOS and Android apps with redesigned UI and live alerts.", icon: "📱" },
  { date: "Nov 2025", title: "Global Launch", description: "Paid over $908M in profits to users and traders.", icon: "🌎" },
];

export default function PlatformTimelineEnhanced() {
  const [visible, setVisible] = useState(Array(milestones.length).fill(false));
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Explicitly type refs!
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  // (optional): nodeRefs.current = []; // not needed unless you want to clear before render

  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paths, setPaths] = useState<string[]>([]);

  // Stagger reveal
  useEffect(() => {
    milestones.forEach((_, i) => {
      setTimeout(() => {
        setVisible((prev) => {
          const copy = [...prev];
          copy[i] = true;
          return copy;
        });
      }, i * 300 + 150);
    });
  }, []);

  // Compute SVG connecting lines
  const computePaths = () => {
    const nodes = nodeRefs.current.map((n) => n && n.getBoundingClientRect());
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect || nodes.some((n) => !n)) return;

    const isDesktop = window.innerWidth >= 768;
    const newPaths: string[] = [];

    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i]!;
      const b = nodes[i + 1]!;

      // Convert to container coordinates
      const ax = a.left + a.width / 2 - containerRect.left;
      const ay = a.top + a.height / 2 - containerRect.top;
      const bx = b.left + b.width / 2 - containerRect.left;
      const by = b.top + b.height / 2 - containerRect.top;

      if (isDesktop) {
        // smooth cubic curve
        const mx = (ax + bx) / 2;
        const path = `M ${ax} ${ay} C ${mx} ${ay} ${mx} ${by} ${bx} ${by}`;
        newPaths.push(path);
      } else {
        // straight vertical line for mobile
        const path = `M ${ax} ${ay} L ${bx} ${by}`;
        newPaths.push(path);
      }
    }

    setPaths(newPaths);
  };

  useEffect(() => {
    computePaths();
    const onResize = () => computePaths();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", computePaths, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", computePaths);
    };
  }, []);

  // 3D parallax on scroll for the timeline container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const diff = viewportCenter - centerY;
      const maxTilt = 12;
      const tilt = (diff / window.innerHeight) * maxTilt;

      const inner = el.querySelector(".timeline-inner") as HTMLDivElement | null;
      if (inner) {
        inner.style.transform = `perspective(900px) rotateX(${tilt}deg)`;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Particles canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
    let width = (canvas.width = canvas.clientWidth * devicePixelRatio);
    let height = (canvas.height = canvas.clientHeight * devicePixelRatio);
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const particles = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: 1 + Math.random() * 3,
      alpha: 0.2 + Math.random() * 0.6,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = canvas.clientWidth + 10;
        if (p.x > canvas.clientWidth + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.clientHeight + 10;
        if (p.y > canvas.clientHeight + 10) p.y = -10;

        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 255, 209, ${p.alpha * 0.22})`;
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 255, 209, ${p.alpha})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,255,209, ${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      animationFrame = requestAnimationFrame(draw);
    };

    const onResize = () => {
      width = canvas.width = canvas.clientWidth * devicePixelRatio;
      height = canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    window.addEventListener("resize", onResize);
    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="relative pt-20 md:pt-36 pb-28 overflow-hidden">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full z-0"
      />

      <div ref={containerRef} className="timeline-inner relative z-10 container mx-auto max-w-6xl px-4 transition-transform duration-500">
        <h2 className="text-white text-3xl sm:text-4xl font-extrabold mb-3 text-center">River Milestones</h2>
        <p className="text-muted text-lg mb-8 max-w-2xl opacity-80">A visual timeline of our journey — highlighting where we started and how far we’ve come.</p>

        <div className="relative">
          {/* Mobile vertical bar */}
          <div className="absolute left-6 top-4 bottom-4 w-1 bg-gradient-to-b from-primary/80 to-transparent md:hidden rounded-full z-0" />
          {/* Desktop horizontal bar */}
          <div className="hidden md:block absolute left-0 right-0 top-28 h-1 bg-gradient-to-r from-primary/70 to-transparent rounded-full z-0" />

          {/* SVG connecting lines */}
          <svg ref={svgRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" aria-hidden>
            {paths.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill="none"
                stroke="rgba(0,255,209,0.25)"
                strokeWidth={2}
                strokeLinecap="round"
                style={{
                  strokeDasharray: 1000,
                  strokeDashoffset: visible[idx] ? 0 : 1000,
                  transition: `stroke-dashoffset 800ms cubic-bezier(.2,.9,.2,1) ${idx * 120}ms, opacity 500ms ${idx * 120}ms`,
                  opacity: visible[idx] ? 1 : 0,
                }}
              />
            ))}
          </svg>

          <div className="grid md:grid-cols-5 gap-10 md:gap-0 relative z-10 mt-10">
            {milestones.map((m, i) => (
              <div
                key={i}
                ref={(el: HTMLDivElement | null) => {
                  nodeRefs.current[i] = el;
                }}
                className="flex md:flex-col flex-row md:items-center items-start gap-4 md:gap-0"
                aria-hidden={false}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 border-white/10 shadow-[0_10px_30px_rgba(0,255,209,0.08)] bg-gradient-to-br from-primary/70 to-primary/40 transform-gpu transition-all duration-700 ${visible[i] ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'}`}
                  style={{ transitionDelay: `${i * 220}ms` }}
                >
                  <span className="select-none">{m.icon}</span>
                </div>

                <div className={`p-5 rounded-xl bg-white/5 backdrop-blur-md border border-white/6 shadow-xl w-full transition-all duration-700 ${visible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${120 + i * 220}ms` }}>
                  <p className="text-primary font-semibold text-sm mb-1">{m.date}</p>
                  <h3 className="text-white font-bold text-lg mb-2">{m.title}</h3>
                  <p className="text-muted text-sm leading-relaxed opacity-80">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      
      </div>

      {/* Subtle background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-tealGreen/20 blur-4xl" />

      <style jsx>{`
        :root {
          --primary: #00ffd1;
        }
        .text-muted { color: rgba(211,219,230,0.9); }
        .bg-primary { background-color: var(--primary); }
        .from-primary\/70 { --tw-gradient-from: rgba(0,255,209,0.7); }
        .to-primary\/40 { --tw-gradient-to: rgba(0,255,209,0.4); }
        .shadow-[0_10px_30px_rgba(0,255,209,0.08)] { box-shadow: 0 10px 30px rgba(0,255,209,0.08); }
      `}</style>
    </section>
  );
}