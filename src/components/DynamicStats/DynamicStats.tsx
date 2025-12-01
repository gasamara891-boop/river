'use client'

import React, { useEffect, useRef, useState } from "react";

const SLIDES = [
  {
    icon: "🛸",
    title: "1|Create an Account",
    desc: (
      <>
        Sign up instantly with your email and access your dashboard in seconds.<br />
        
      </>
    ),
  },
  {
    icon: "🪙",
    title: "2|Deposit Funds",
    desc: (
      <>
        Fund Your account securely using top-tier encryption protocols.<br />
        <span style={{ color: "#defeff" }}>
          BTC | ETH | USDT
        </span>
      </>
    ),
  },
  {
    icon: "🌿",
    title: "3|Choose a Plan",
    desc: (
      <>
        Select an intelligent AI-powered plan tailored to your goals.<br />
        <span style={{ color: "#c8e9ff" }}>
          Dynamic rewards
        </span>
      </>
    ),
  },
  {
    icon: "💹",
    title: "5|Earn Profits Daily",
    desc: (
      <>
        Watch your balance rise with automated daily yields.<br />
        
      </>
    ),
  },
  {
    icon: "💰",
    title: "Widthdraw Your Profits anytime",
    desc: (
      <>
        Minimum withdrawals $100<br />
        <span style={{ color: "#c8e9ff" }}>Maximum withdrawals UNLIMITED</span>
      </>
    ),
  },
];

export default function HowItWorks() {
  const [curr, setCurr] = useState(0);
  const timerRef = useRef<number | null>(null);
  const total = SLIDES.length;

  // Touch position
  const sciHiwRef = useRef<HTMLDivElement>(null);

  // ---- AUTO SLIDE ----
  useEffect(() => {
    resetAuto();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [curr]);

  function resetAuto() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCurr((curr) => (curr + 1) % total);
    }, 5400);
  }

  // Mouse pause/resume
  useEffect(() => {
    const node = sciHiwRef.current;
    if (!node) return;
    const mouseEnter = () => timerRef.current && clearInterval(timerRef.current);
    const mouseLeave = () => resetAuto();
    node.addEventListener("mouseenter", mouseEnter);
    node.addEventListener("mouseleave", mouseLeave);

    // Touch support (swipe left/right)
    let sx = 0;
    const touchStart = (e: TouchEvent) => {
      sx = e.changedTouches[0].clientX;
    };
    const touchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) {
        if (dx < 0) setCurr((curr) => (curr + 1) % total);
        else setCurr((curr) => (curr - 1 + total) % total);
      }
    };
    node.addEventListener("touchstart", touchStart);
    node.addEventListener("touchend", touchEnd);

    return () => {
      node.removeEventListener("mouseenter", mouseEnter);
      node.removeEventListener("mouseleave", mouseLeave);
      node.removeEventListener("touchstart", touchStart);
      node.removeEventListener("touchend", touchEnd);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== document.body) return;
      if (e.key === "ArrowRight") setCurr((curr) => (curr + 1) % total);
      if (e.key === "ArrowLeft") setCurr((curr) => (curr - 1 + total) % total);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="d">
      <div className="sci-hiw" id="sciHiw" ref={sciHiwRef}>
        <div className="sci-glow" />
        <div className="sci-title">HOW IT WORKS</div>
        <div className="sci-slide-group">
          {/* Only the active slide is rendered */}
          <div className="sci-slide active" key={curr}>
            <div className="sci-icon-circle">
              <span className="sci-icon">{SLIDES[curr].icon}</span>
            </div>
            <div className="sci-slide-title">{SLIDES[curr].title}</div>
            <div className="sci-slide-desc">{SLIDES[curr].desc}</div>
          </div>
        </div>
        {/* Desktop nav */}
        <div className="sci-floating-nav">
          <button className="sci-arrow-btn left" title="Previous Step" onClick={() => setCurr((curr - 1 + total) % total)}>
            &#8678;
          </button>
          <button className="sci-arrow-btn right" title="Next Step" onClick={() => setCurr((curr + 1) % total)}>
            &#8680;
          </button>
        </div>
        {/* Mobile nav */}
        <div className="sci-mobile-nav">
          <button className="sci-arrow-btn left" title="Previous Step" onClick={() => setCurr((curr - 1 + total) % total)}>
            &#8678;
          </button>
          <button className="sci-arrow-btn right" title="Next Step" onClick={() => setCurr((curr + 1) % total)}>
            &#8680;
          </button>
        </div>
        {/* Dots */}
        <div className="sci-progress">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`sci-dot${i === curr ? " active" : ""}`}
              onClick={() => setCurr(i)}
              tabIndex={0}
              aria-label={`Go to slide ${i + 1}`}
              role="button"
            />
          ))}
        </div>
      </div>
      <style jsx global>{`
        html { font-size: 16px;}
        .d {
          background: #072322ff;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          font-family: 'Montserrat', Arial, sans-serif;
        }
        .sci-hiw {
          width: 98vw;
          max-width: 520px;
          min-height: 580px;
          background: rgba(34,41,86,0.38);
          border-radius: 2.1rem;
          box-shadow: 0 8px 60px 8px #23295256, 0 1.04rem 5rem #33fff3aa inset, 0 0 1.15rem #4ee5ff;
          padding: 0;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px) saturate(130%);
          border: 2px solid #27fff588;
          z-index: 2;
          transition: box-shadow 0.4s cubic-bezier(.62,.12,.44,1.07);
          animation: sci-glowPulse 3.5s infinite alternate;
        }
        @keyframes sci-glowPulse {
          0% {box-shadow: 0 5px 40px #2247ff44, 0 0 3rem #4ee5ffc3;}
          100% {box-shadow: 0 10px 56px #14ffb155, 0 0 7rem #25edffcf;}
        }
        .sci-title {
          font-family: 'Orbitron', Arial, sans-serif;
          font-size: 2.4rem;
          text-align: center;
          letter-spacing: .18em;
          color: #30fff9;
          margin-top: 2.3rem;
          margin-bottom: 0.6rem;
          filter: drop-shadow(0 0 0.8rem #36ffea88);
          background: linear-gradient(90deg, #37eeff 55%, #19c3e7 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sci-glow {
          width: 100%;
          height: 1.4rem;
          background: radial-gradient(ellipse at center, #30fff5cc 0%, #43aafc09 100%);
          position: absolute;
          left: 0; top: 0;
          filter: blur(23px);
          opacity: .4;
          z-index: 1;
        }
        .sci-slide-group {
          width: 100%;
          position: relative;
          min-height: 380px;
          margin-top: 2.7rem;
          margin-bottom: 1rem;
        }
        .sci-slide {
          --scale: 1.04;
          --blur: 0;
          --opacity: 1;
          --shadow: 0 0 48px #30fff7bb, 0 2px 42px #0be4fd44 inset;
          position: absolute;
          top: 0; left: 50%;
          width: 91%;
          min-height: 355px;
          padding: 2.3rem 1.3rem 2.3rem 1.3rem;
          background: rgba(10,25,70,0.68);
          border-radius: 1.43rem;
          box-shadow: var(--shadow);
          border: 2.1px solid #31fffc1b;
          backdrop-filter: blur(var(--blur));
          opacity: var(--opacity);
          transform: translateX(-50%) scale(var(--scale));
          z-index: 11;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: auto;
          transition: all .62s cubic-bezier(.22, .68, .45, 1.25), opacity .47s;
          text-align: center;
          will-change: transform, opacity, box-shadow;
          font-family: 'Montserrat', Arial, sans-serif;
          animation: sci-in 1.15s cubic-bezier(.22, .68, .45, 1.17);
        }
        @keyframes sci-in {
          0% { opacity: 0; filter: blur(18px) brightness(1.12);
              transform: translateX(-50%) scale(.6) rotateY(27deg);}
          65% { opacity: .92; filter: blur(3px);}
          100% { opacity: 1; filter: blur(0); }
        }
        .sci-icon-circle {
          width: 95px; height: 95px;
          background: linear-gradient(135deg,#1ef8f0 10%, #233ef7 100%);
          border-radius: 50%;
          box-shadow: 0 0 38px #1affffcc, 0 0 2rem #1ebdfd40 inset;
          position: relative;
          margin: -2.2rem auto 1rem auto;
          display: flex;
          align-items: center; justify-content: center;
          filter: drop-shadow(0 0 12px #0ffaea44) blur(.2px);
          animation: icon-glow 2.4s infinite alternate;
          border: 4px solid #13fcf7cc;
          overflow: visible;
        }
        @keyframes icon-glow {
          0% { box-shadow: 0 0 35px #04f7edcc;}
          100% { box-shadow: 0 0 40px 16px #30fffe40, 0 0 48px #32fffc99;}
        }
        .sci-icon {
          font-size: 3.95rem;
          color: #fffdfa;
          filter:drop-shadow(0 0 11px #00fff799) brightness(1.05);
          user-select:none;
          text-shadow:0 8px 40px #00fff2bb;
        }
        .sci-slide-title {
          font-family: 'Orbitron', Arial, sans-serif;
          font-size: 1.30rem;
          color: #3cf8fc;
          margin-bottom: 10px;
          margin-top: -0.2rem;
          letter-spacing:.11em;
          filter:drop-shadow(0 0 0.5em #28eaff88);
          text-shadow:0 2px 11px #0ee2ffc6;
        }
        .sci-slide-desc {
          font-size: 1.13rem;
          color: #b2eff5;
          line-height: 1.64;
          margin-top: .3rem;
          margin-bottom: 0.2rem;
          text-shadow:0 2px 8px #41f2f142;
          max-width:340px;
          margin-left:auto; margin-right:auto;
        }
        .sci-progress {
          display: flex;
          gap: .7rem;
          align-items: center;
          justify-content: center;
          margin-top: 1.4rem;
          margin-bottom: 1.5rem;
          z-index:13;
          position:relative;
        }
        .sci-dot {
          width: 18px; height: 7.5px; border-radius: 8px;
          background: #14e3ee21;
          box-shadow: 0 1px 15px #25b3ed22;
          transition: background .4s, width .32s cubic-bezier(.56,.22,.48,1.3);
          border:1.9px solid #42eeffcc;
        }
        .sci-dot.active {
          background:linear-gradient(90deg,#29deff 43%, #24fff6 100%);
          width: 42px;
          box-shadow: 0 2px 16px #42f5fff9;
          border:2.1px solid #1cf7eebb;
          filter:blur(0.4px);
        }
        .sci-arrow-btn {
          width: 57px; height: 57px;
          background: rgba(17,39,89,0.61);
          border: 2.3px solid #27f7ff90;
          border-radius: 50%;
          font-size: 1.9rem;
          color: #30fff7bb;
          font-family: 'Orbitron',Arial,sans-serif;
          z-index: 20;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.19s, color 0.17s, box-shadow 0.24s, border .2s;
          box-shadow: 0 2px 18px #3cfff5bb;
          outline: none;
          user-select:none;
          will-change:filter;
          margin: 0 18px;
          position: static;
        }
        .sci-arrow-btn:hover, .sci-arrow-btn:active {
          background: #11faf7dd;
          color: #142a6a;
          border: 2.3px solid #47f7ffdd;
          box-shadow: 0 2px 21px #59fff0e1, 0 0 6px #74eef7;
          filter:brightness(1.09) drop-shadow(0 2px 10px #18e8ffee);
        }
        .sci-arrow-btn.left, .sci-arrow-btn.right {
          /* Remove absolute for mobile, they will be placed in nav */
          position: static;
          top: auto; left: auto; right: auto; transform: none;
        }
        .sci-mobile-nav {
          display: none;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin-bottom: 0.6rem;
          margin-top: -0.5rem;
        }
        @media (max-width:700px){
          .sci-hiw{min-height:480px;}
          .sci-slide-group{margin-top:1.3rem;min-height:300px;}
          .sci-title{font-size:1.35rem;margin-top:.9rem;}
          .sci-slide{padding:1.1rem .22rem 1.9rem .22rem;}
          .sci-icon-circle{width:72px; height:72px;}
          .sci-icon{font-size:2.1rem;}
          /* Place navigation buttons below slides */
          .sci-arrow-btn {
            width: 45px; height: 45px; font-size: 1.17rem;
            margin: 0 11px;
          }
          .sci-mobile-nav {
            display: flex;
          }
          /* Hide floating nav on mobile */
          .sci-arrow-btn.left, .sci-arrow-btn.right {
            display: inline-flex;
          }
          .sci-floating-nav {
            display: none;
          }
        }
        @media (min-width:701px){
          .sci-mobile-nav {
            display: none;
          }
          .sci-floating-nav {
            display: block;
          }
          .sci-arrow-btn.left {
            position: absolute; left: 6px; top: 50%; transform: translateY(-50%);
          }
          .sci-arrow-btn.right {
            position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          }
        }
        @media (max-width:470px){
          .sci-slide-group{margin-bottom:.4rem}
          .sci-title{font-size:.97rem;}
          .sci-hiw{min-height:360px;}
        }
      `}</style>
    </div>
  );
}