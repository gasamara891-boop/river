"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[9999]">
      {/* Door Panels */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="door door-left" />
        <div className="door door-right" />
      </div>

      {/* Logo and Loader */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <Image
          src="/logo.png"
          alt="River Logo"
          width={180}
          height={60}
          className="object-contain animate-fade"
        />
        <div className="w-20 h-1.5 bg-white/40 rounded overflow-hidden">
          <div className="h-full w-1/2 bg-white animate-[load_1.2s_linear_infinite]" />
        </div>
      </div>

      <style jsx>{`
        .door {
          position: absolute;
          top: 0;
          width: 50vw;
          height: 100vh;
          background: #111;
          z-index: 20;
        }
        .door-left {
          left: 0;
          border-right: 1px solid #222;
          animation: openLeft 1s cubic-bezier(0.75, 0.04, 0.15, 1.01) forwards;
        }
        .door-right {
          right: 0;
          border-left: 1px solid #222;
          animation: openRight 1s cubic-bezier(0.75, 0.04, 0.15, 1.01) forwards;
        }

        @keyframes openLeft {
          0% {
            transform: translateX(0);
          }
          90% {
            box-shadow: 0 0 40px #000;
          }
          100% {
            transform: translateX(-100vw);
          }
        }
        @keyframes openRight {
          0% {
            transform: translateX(0);
          }
          90% {
            box-shadow: 0 0 40px #000;
          }
          100% {
            transform: translateX(100vw);
          }
        }
        @keyframes load {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        @keyframes fade {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }
        .animate-fade {
          animation: fade 2s ease-in-out infinite;
        }

        /* Responsive: on mobile, doors cover the screen vertically */
        @media (max-width: 768px) {
          .door {
            width: 50vw;
            height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}