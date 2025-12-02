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
        <span style={{ color: "#defeff" }}>BTC | ETH | USDT</span>
      </>
    ),
  },
  {
    icon: "🌿",
    title: "3|Choose a Plan",
    desc: (
      <>
        Select an intelligent AI-powered plan tailored to your goals.<br />
        <span style={{ color: "#c8e9ff" }}>Dynamic rewards</span>
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
    title: "Withdraw Your Profits anytime",
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
  const total = SLIDES.length;
  const timerRef = useRef<number>(0);
  const frameRef = useRef<number>();
  const sciHiwRef = useRef<HTMLDivElement>(null);

  // ---- AUTO SLIDE ----
  useEffect(() => {
    let lastTime = performance.now();
    function tick(now: number) {
      if (now - lastTime > 5200) {
        setCurr((prev) => (prev + 1) % total);
        lastTime = now;
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [curr, total]);

  // Mouse enter/pause auto slide
  useEffect(() => {
    const node = sciHiwRef.current;
    if (!node) return;
    const pause = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    const resume = () => {
      frameRef.current = requestAnimationFrame(function tick(now: number) {
        setCurr((prev) => (prev + 1) % total);
        frameRef.current = requestAnimationFrame(tick);
      });
    };
    node.addEventListener("mouseenter", pause, { passive: true });
    node.addEventListener("mouseleave", resume, { passive: true });
    return () => {
      node.removeEventListener("mouseenter", pause);
      node.removeEventListener("mouseleave", resume);
    };
  }, [total]);

  // Touch (swipe left/right)
  useEffect(() => {
    const node = sciHiwRef.current;
    if (!node) return;
    let sx = 0;
    const touchStart = (e: TouchEvent) => { sx = e.changedTouches[0].clientX; };
    const touchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) {
        if (dx < 0) setCurr((curr) => (curr + 1) % total);
        else setCurr((curr) => (curr - 1 + total) % total);
      }
    };
    node.addEventListener("touchstart", touchStart, { passive: true });
    node.addEventListener("touchend", touchEnd, { passive: true });
    return () => {
      node.removeEventListener("touchstart", touchStart);
      node.removeEventListener("touchend", touchEnd);
    };
  }, [total]);

  // Keyboard nav: Only when body has focus
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== document.body) return;
      if (e.key === "ArrowRight") setCurr((curr) => (curr + 1) % total);
      if (e.key === "ArrowLeft") setCurr((curr) => (curr - 1 + total) % total);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [total]);

  // --- Lighter/slimmer CSS ---
  return (
    <div className="howitworks-root">
      <div className="sci-hiw" id="sciHiw" ref={sciHiwRef}>
        <div className="sci-title">HOW IT WORKS</div>
        <div className="sci-slide-group">
          {/* Only 1 active slide */}
          <div className="sci-slide active" key={curr}>
            <div className="sci-icon-circle">
              <span className="sci-icon">{SLIDES[curr].icon}</span>
            </div>
            <div className="sci-slide-title">{SLIDES[curr].title}</div>
            <div className="sci-slide-desc">{SLIDES[curr].desc}</div>
          </div>
        </div>
        {/* Navigation */}
        <div className="sci-nav">
          <button className="sci-arrow-btn left"
            title="Previous Step"
            aria-label="Previous Step"
            onClick={() => setCurr((curr - 1 + total) % total)}
          >
            &#8678;
          </button>
          <button className="sci-arrow-btn right"
            title="Next Step"
            aria-label="Next Step"
            onClick={() => setCurr((curr + 1) % total)}
          >
            &#8680;
          </button>
        </div>
        {/* Dots */}
        <div className="sci-progress" aria-label="Slide progress">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`sci-dot${i === curr ? " active" : ""}`}
              onClick={() => setCurr(i)}
              tabIndex={0}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <style jsx>{`
        .howitworks-root {
          background: #072322ff;
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          font-family: 'Montserrat', Arial, sans-serif;
        }
        .sci-hiw {
          width: 97vw; max-width: 470px; min-height: 380px;
          background: rgba(34,41,86,0.27);
          border-radius: 1.4rem;
          box-shadow: 0 8px 28px 5px #21395236;
          padding: 0 0 15px 0; position: relative; overflow: hidden;
          border: 2px solid #1cf7e3bb;
          z-index: 2;
        }
        .sci-title {
          font-family: 'Orbitron', Arial, sans-serif;
          font-size: 1.55rem; text-align: center; letter-spacing: .15em;
          color: #27f2fc; margin: 2.1rem 0 0.5rem 0;
        }
        .sci-slide-group {
          width: 100%; position: relative; min-height: 260px; margin: 1.6rem 0 0.6rem 0;
        }
        .sci-slide {
          position: relative;
          width: 95%; min-height: 240px;
          margin: 0 auto;
          padding: 1.2rem 0.7rem 1.4rem 0.7rem;
          background: rgba(10,25,70,0.52);
          border-radius: 1.05rem; box-shadow: 0 2px 18px #11cedcca;
          border: 1.2px solid #31dffc2b;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .sci-icon-circle {
          width: 64px; height: 64px;
          background: linear-gradient(135deg,#1ef8f0 18%, #233ef7 100%);
          border-radius: 50%; box-shadow: 0 0 16px #18fdfa99;
          margin: -1.1rem auto 0.8rem auto; display: flex; align-items: center; justify-content: center;
          border: 2px solid #13fcf772;
        }
        .sci-icon {
          font-size: 2.15rem; color: #f7fdfa; user-select:none;
        }
        .sci-slide-title {
          font-family: 'Orbitron', Arial, sans-serif;
          font-size: 1.0rem; color: #24d8fc; margin-bottom: 7px;
          margin-top: -.12rem; letter-spacing:.09em;
        }
        .sci-slide-desc {
          font-size: 1rem; color: #afe4f7; line-height: 1.53;
          margin-top: .17rem; margin-bottom: 0.18rem;
          max-width: 300px; margin-left:auto; margin-right:auto;
        }
        .sci-nav {
          display: flex; justify-content: center; align-items: center; width:100%; margin: 0.8rem 0 0 0;
        }
        .sci-arrow-btn {
          width: 40px; height: 40px;
          background: rgba(17,39,89,0.32);
          border: 2px solid #27f7ff80;
          border-radius: 50%;
          font-size: 1.25rem; color: #28bee5ca;
          font-family: 'Orbitron',Arial,sans-serif; margin: 0 8px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          outline: none; user-select:none;
        }
        .sci-arrow-btn:active, .sci-arrow-btn:focus {
          background: #19eaf7cc; color: #174266;
        }
        .sci-progress { display: flex; gap: .5rem; align-items: center; justify-content: center; margin: 1rem 0 0 0;}
        .sci-dot {
          width: 14px; height: 7px; border-radius: 6px;
          background: #14bee621;
          border:1.3px solid #42eeffcc;
          cursor:pointer; margin:0 2px;
          transition: background .23s, width .22s;
        }
        .sci-dot.active { background:#27f2fc; width: 36px; }
        @media (max-width:600px){
          .sci-hiw{min-height:285px;}
          .sci-title{font-size:1.06rem;}
          .sci-slide{padding:.71rem .13rem 1rem .13rem;}
          .sci-icon-circle{width:48px; height:48px;}
          .sci-icon{font-size:1.35rem;}
          .sci-arrow-btn{width:30px;height:30px;font-size:0.91rem;}
        }
      `}</style>
    </div>
  );
}