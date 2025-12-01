"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating?: number;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "River redefined my portfolio experience. Real-time insights, instant withdrawals, and that sleek dashboard — it’s like investing in the future.",
    name: "Sophia E.",
    role: "Verified Investor",
    avatar: "/images/avatars/avatar-1.jpg",
    rating: 5,
  },
  {
    id: "t2",
    quote: "Feels like managing assets inside a spaceship. Secure, fast, and visually insane!",
    name: "Michael R.",
    role: "Crypto Enthusiast",
    avatar: "/images/avatars/avatar-2.jpg",
    rating: 5,
  },
  {
    id: "t3",
    quote:
      "That futuristic theme, combined with flawless performance, makes River my daily go-to platform.",
    name: "Grace N.",
    role: "Verified Investor",
    avatar: "/images/avatars/avatar-3.jpg",
    rating: 4,
  },
  {
    id: "t4",
    quote: "The holographic UI is unmatched. Every interaction feels alive — like trading in 2080.",
    name: "David K.",
    role: "Tech Entrepreneur",
    avatar: "/images/avatars/avatar-4.jpg",
    rating: 5,
  },
];

export default function TestimonialCarousel(): JSX.Element {
  const [current, setCurrent] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // react-slick settings (typed as any for convenience)
  const settings: any = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 1500,
    autoplay: true,
    autoplaySpeed: 6000,
    slidesToShow: 3,
    slidesToScroll: 1,
    pauseOnHover: true,
    adaptiveHeight: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
    beforeChange: (_: number, next: number) => setCurrent(next),
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-[#01010a] overflow-hidden cursor-none"
    >
      {/* Glowing cursor light */}
      <div
        className="pointer-events-none absolute w-[250px] sm:w-[300px] h-[250px] sm:h-[300px] rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-600/20 blur-[100px] transition-transform duration-300"
        style={{
          left: mousePos.x - 150,
          top: mousePos.y - 150,
          transform: `translate3d(0,0,0)`,
        }}
      />

      {/* Floating background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#00f2,transparent_60%)] opacity-20 animate-orb-float" />
      <div className="absolute inset-0 bg-[url('/images/stars.svg')] bg-cover opacity-10 animate-bg-shift" />

      {/* Orbs */}
      <div className="absolute top-[-100px] left-[-150px] w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full bg-cyan-400/20 blur-[200px] animate-orb1" />
      <div className="absolute bottom-[-100px] right-[-150px] w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] rounded-full bg-purple-600/20 blur-[200px] animate-orb2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          className="text-center mb-12 sm:mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-text-shimmer drop-shadow-[0_0_25px_rgba(56,189,248,0.5)]">
            Voices From The Future
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg px-2 sm:px-0">
            Investors sharing their River experience — where finance meets the cosmos.
          </p>
        </motion.div>

        <Slider {...settings}>
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              className="px-3 sm:px-5"
              whileHover={{ scale: 1.05, rotateY: 2 }}
              transition={{ type: "spring", stiffness: 150 }}
            >
              <article
                className={`relative overflow-hidden rounded-3xl p-[2px] transform transition-transform duration-700 ${
                  idx === current ? "scale-[1.03]" : "scale-100"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 animate-border-flow rounded-3xl" />

                <div className="relative bg-[#0c0f1f]/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-700 hover:shadow-[0_0_45px_rgba(56,189,248,0.5)] group perspective-1000">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      width={64}
                      height={64}
                      className="rounded-full border-2 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.4)] mx-auto sm:mx-0"
                    />
                    <div>
                      <h4 className="text-white font-semibold text-lg group-hover:text-cyan-300 transition-all">
                        {t.name}
                      </h4>
                      <p className="text-cyan-400 text-sm">{t.role}</p>
                    </div>
                  </div>

                  <blockquote className="mt-6 text-slate-300 leading-relaxed italic group-hover:text-white transition-all text-sm sm:text-base">
                    “{t.quote}”
                  </blockquote>

                  <div className="mt-5 flex justify-center sm:justify-start gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < (t.rating ?? 5)
                            ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                            : "text-slate-700"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <div className="absolute inset-0 rounded-3xl bg-cyan-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse-glow" />
                </div>
              </article>
            </motion.div>
          ))}
        </Slider>
      </div>
    </section>
  );
}