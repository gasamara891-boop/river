"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FAQ = {
  id: string;
  q: string;
  a: string;
};

const FAQS: FAQ[] = [
  {
    id: "what-is-River",
    q: "What is River?",
    a:
      "River is a trusted investment platform that allows users to invest securely in cryptocurrencies such as Bitcoin, Ethereum, and USDT. We focus on making digital investing simple, transparent, and accessible while applying disciplined risk-management and data-driven strategies.",
  },
  {
    id: "industries",
    q: "What industries do you specialize in?",
    a:
      "We specialize in cryptocurrency and digital assets. Our primary markets include Bitcoin (BTC), Ethereum (ETH), USDT (BEP20 / TRC20), and related DeFi opportunities. We combine automated strategies with human oversight to capture market opportunities responsibly.",
  },
  {
    id: "guarantee-growth",
    q: "Can you guarantee growth?",
    a:
      "No legitimate investment can promise guaranteed returns. River commits to transparency and professional risk management — we aim to maximize returns while minimizing avoidable risk through analytics and adaptive strategies. Past performance is not a guarantee of future results.",
  },
  {
    id: "plans-special",
    q: "What makes your investment plans special?",
    a:
      "Our plans balance clear durations, transparent yields, and automated execution. We tailor plans for different investor goals (short-term, growth, capital preservation) and continuously monitor performance to optimize outcomes.",
  },
  {
    id: "deposits-withdrawals",
    q: "How do deposits and withdrawals work?",
    a:
      "Wallets are generated and visible only to Authenticated Users. Deposits are recorded as pending until the system confirms. Withdrawals are requested from your dashboard and require admin approval for processing to ensure security.",
  },
  {
    id: "user-security",
    q: "How is user security handled?",
    a:
      "We enforce secure authentication, (RLS) in the database, encrypted communications, and operational controls for admin actions. Never share your service keys and use strong passwords / 2FA when available.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 220ms ease",
      }}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FAQSection(): JSX.Element {
  // store openId (stable) rather than index so filtering doesn't break state
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const listener = () => setPrefersReduced(Boolean(mq?.matches));
    listener();
    mq?.addEventListener ? mq.addEventListener("change", listener) : mq?.addListener?.(listener);
    return () =>
      mq?.removeEventListener ? mq.removeEventListener("change", listener) : mq?.removeListener?.(listener);
  }, []);

  // Filtered FAQs
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  // If current openId is not in filtered results, close it (or open the first filtered)
  useEffect(() => {
    if (!openId) return;
    const found = filtered.find((f) => f.id === openId);
    if (!found) {
      setOpenId(filtered[0]?.id ?? null);
    }
  }, [filtered, openId]);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  // keyboard: open next/prev with arrow keys when focus is inside list
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (typeof document === "undefined") return;
      const active = document.activeElement as HTMLElement | null;
      const focusInside = active && active.closest && active.closest(".faq-grid");
      if (!focusInside) return;
      const ids = filtered.map((f) => f.id);
      const idx = ids.indexOf(openId ?? "");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = ids[(idx + 1) % ids.length];
        setOpenId(next);
        document.getElementById(`${next}-button`)?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = ids[(idx - 1 + ids.length) % ids.length];
        setOpenId(prev);
        document.getElementById(`${prev}-button`)?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, openId]);

  return (
    <motion.section
      className="faq-section"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      aria-labelledby="faq-heading"
    >
      <div className="faq-inner container">
        <header className="faq-head">
          <div className="faq-head-left">
            <p className="eyebrow">FAQs</p>
            <h2 id="faq-heading" className="faq-title">
              Get the answers to common questions
            </h2>
            <p className="lead">Quickly find help or read the most common questions about River.</p>
          </div>

          <div className="faq-controls">
            <label className="search-label" htmlFor="faq-search">
              Search FAQs
            </label>
            <div className="search-wrap">
              <input
                id="faq-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by keyword (deposits, withdraw, plans...)"
                aria-label="Search frequently asked questions"
                className="search-input"
              />
              <button
                className="clear-btn"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                title="Clear"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="actions">
              <button
                className="action-btn"
                onClick={() => setOpenId(null)}
                type="button"
                aria-pressed={openId === null}
              >
                Collapse all
              </button>
              <button
                className="action-btn primary"
                onClick={() => setOpenId(filtered[0]?.id ?? null)}
                type="button"
              >
                Expand first
              </button>
            </div>
          </div>
        </header>

        <div className="faq-grid" role="list">
          {filtered.length === 0 ? (
            <div className="no-results">No results found. Try a different keyword.</div>
          ) : (
            filtered.map((item, idx) => {
              const id = item.id;
              const isOpen = openId === id;
              return (
                <motion.article
                  key={id}
                  className={`faq-card ${isOpen ? "open" : ""}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReduced ? 0 : 0.35, delay: idx * 0.03 }}
                  role="listitem"
                >
                  <header className="card-head">
                    <button
                      className="q-btn"
                      onClick={() => toggle(id)}
                      aria-expanded={isOpen}
                      aria-controls={`${id}-panel`}
                      id={`${id}-button`}
                      type="button"
                    >
                      <span className="q-left">
                        <span className="q-icon" aria-hidden>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 2a7 7 0 00-7 7v1"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M21 21l-6-6"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="q-text">{item.q}</span>
                      </span>
                      <span className="q-right">
                        <ChevronIcon open={isOpen} />
                      </span>
                    </button>
                  </header>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`${id}-panel`}
                        role="region"
                        aria-labelledby={`${id}-button`}
                        className="answer-wrap"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: prefersReduced ? 0 : 0.32, ease: "easeInOut" }}
                      >
                        <div className="answer-body">
                          {item.a.split("\n").map((p, i) => (
                            <p key={i}>{p.trim()}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })
          )}
        </div>
      </div>

      <style jsx>{`
        :root {
          --container-max: 1100px;
          --gap: 14px;
          --accent: #fff;
          --muted: #e8eff8ff;
          --card-radius: 12px;
        }

        .faq-section {
          background: linear-gradient(180deg, #0f172a05 0%, #ffffff 60%);
          padding: 32px 16px 0 20px;
        }

        .faq-inner.container {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 20px 20px;
        }

        /* Header / controls */
        .faq-head {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: var(--gap);
          align-items: start;
          margin-bottom: 14px;
        }

        /* Stack controls on smaller screens for better usability */
        @media (max-width: 880px) {
          .faq-head {
            grid-template-columns: 1fr;
          }
          .faq-controls {
            margin-top: 12px;
            width: 100%;
          }
        }

        .faq-head-left {
          min-width: 0;
        }

        .eyebrow {
          color: var(--accent);
          font-weight: 800;
          letter-spacing: 0.4px;
          margin: 0 0 6px;
          font-size: 0.85rem; /* reduced */
        }
        .faq-title {
          margin: 0;
          font-size: 1.4rem; /* reduced */
          color: #d9dee9ff;
          line-height: 1.12;
        }
        .lead {
          margin: 6px 0 0;
          color: var(--muted);
          font-size: 0.95rem;
        }

        /* Controls box */
        .faq-controls {
          width: 320px;
          min-width: 160px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .search-label {
          display: block;
          font-size: 0.82rem;
          color: #63748a;
          margin-bottom: 4px;
          font-weight: 700;
        }

        /* Make the search-wrap fully responsive */
        .search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.06);
          padding: 6px;
          border-radius: 10px;
          box-shadow: 0 8px 20px rgba(2, 6, 23, 0.03);
          width: 100%; /* IMPORTANT: let it fill the available width */
        }

        .search-input {
          border: 0;
          outline: none;
          padding: 8px 6px;
          font-size: 0.95rem;
          flex: 1;
          min-width: 0; /* IMPORTANT: allows the input to shrink on small screens */
          background: transparent;
          color: #d6dce9ff;
        }

        .clear-btn {
          border: 0;
          background: #f1f5f9;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          color: #dce5f1ff;
          font-weight: 700;
          flex: 0 0 auto;
        }

        .actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .action-btn {
          background: transparent;
          border: 1px solid rgba(15, 23, 42, 0.06);
          padding: 8px 10px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          color: #ecf0f8ff;
          font-size: 0.88rem;
        }
        .action-btn.primary {
          background: linear-gradient(90deg, var(--accent), #1d4ed8);
          color: #fff;
          border: none;
          box-shadow: 0 10px 28px rgba(37, 99, 235, 0.12);
        }

        /* FAQ grid: single column mobile -> two columns desktop */
        .faq-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 10px;
        }
        @media (min-width: 900px) {
          .faq-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }

        .faq-card {
          background: linear-gradient(180deg, #fff, #fbfdff);
          border-radius: var(--card-radius);
          padding: 8px;
          border: 1px solid rgba(15, 23, 42, 0.04);
          box-shadow: 0 8px 30px rgba(2, 6, 23, 0.03);
          overflow: hidden;
          transition: transform 220ms ease, box-shadow 240ms ease, border-color 240ms ease;
        }

        .faq-card.open {
          transform: translateY(-6px);
          box-shadow: 0 22px 60px rgba(2, 6, 23, 0.10);
          border-color: rgba(37, 99, 235, 0.06);
        }

        .card-head {
          display: flex;
          align-items: center;
        }

        .q-btn {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border: 0;
          background: transparent;
          padding: 12px 14px;
          cursor: pointer;
          text-align: left;
          border-radius: 10px;
        }
        .q-btn:focus {
          outline: 3px solid rgba(37, 99, 235, 0.12);
          outline-offset: 4px;
        }

        .q-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .q-icon {
          display: inline-flex;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: linear-gradient(180deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.03));
          color: var(--accent);
          flex-shrink: 0;
        }

        .q-text {
          font-weight: 800;
          color: #e4e8f0ff;
          font-size: 0.98rem;
          white-space: normal;
        }

        .q-right {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
        }

        .answer-wrap {
          overflow: hidden;
        }

        .answer-body {
          padding: 12px 16px 18px 16px;
          color: #e9eef5ff;
          font-size: 0.95rem;
          line-height: 1.55;
        }

        .no-results {
          padding: 24px;
          background: rgba(15, 23, 42, 0.02);
          border-radius: 10px;
          color: #475569;
          font-weight: 700;
          text-align: center;
          grid-column: 1 / -1;
        }

        /* Small tweaks for very small screens */
        @media (max-width: 420px) {
          .faq-head {
            gap: 8px;
          }

          .faq-controls {
            width: 100%;
          }

          .search-wrap {
            flex-wrap: wrap; /* allows elements to stack if too tight */
            padding: 4px 6px;
          }

          .search-input {
            font-size: 0.7rem;
            flex: 1 1 100%; /* make input take full width */
            width: 100%;
          }

          .clear-btn {
            width: 32px;
            height: 32px;
            font-size: 0.9rem;
          }

          .actions {
            flex-direction: column;
            width: 100%;
          }

          .action-btn {
            width: 100%;
            text-align: center;
            font-size: 0.85rem;
            padding: 8px;
          }

          .q-icon {
            width: 38px;
            height: 38px;
          }

          .q-text {
            font-size: 0.94rem;
          }

          .faq-section {
            padding: 18px 0;
          }
        }

        /* Duplicate smaller adjustments kept intentionally */
        @media (max-width: 420px) {
          .q-icon {
            width: 40px;
            height: 40px;
          }
          .q-text {
            font-size: 0.96rem;
          }
          .search-input {
            font-size: 0.95rem;
          }
          .faq-section {
            padding: 20px 0;
          }
          .faq-head {
            gap: 10px;
          }
        }
      `}</style>
    </motion.section>
  );
}