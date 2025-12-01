"use client";

import React, { useEffect } from "react";
import { Copy } from "lucide-react";

type LastInvestment = {
  amount: number;
  coin: string;
  network: string;
  wallet_address?: string | null;
};

type Props = {
  lastInvestment: LastInvestment;
  onBack: () => void;
  onGoToDashboard: () => void;
  onCopy: (text?: string) => void;
};

/**
 * InstructionModal
 * - Dark black background
 * - Prevents page scroll while open
 */
export default function InstructionModal({
  lastInvestment,
  onBack,
  onGoToDashboard,
  onCopy,
}: Props) {
  // Disable background scroll when modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pi-title"
    >
      {/* card */}
      <div className="relative w-full max-w-lg rounded-2xl p-6 text-white futuristic-card">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/10 to-purple-600/20 blur-3xl -z-10"></div>

        <h3
          id="pi-title"
          className="text-2xl font-extrabold tracking-wider mb-6 text-cyan-400 text-center"
        >
          ⚡ Pay Attention!
        </h3>

        <div className="bg-[#0a0f1a]/80 rounded-xl p-5 mb-6 border border-cyan-400/30 shadow-[0_0_25px_rgba(0,255,255,0.1)]">
          <p className="mb-2 text-base text-gray-200">
            PAY{" "}
            <span className="font-bold text-cyan-400">
              {lastInvestment.amount}
            </span>{" "}
            {lastInvestment.coin} ({lastInvestment.network})
          </p>

          <p className="mb-2 text-gray-300">INTO YOUR WALLET ADDRESS:</p>

          <div className="flex items-center gap-2 mb-3 max-sm:flex-col">
            <pre className="flex-1 bg-black/80 border border-cyan-400/40 text-cyan-100 p-3 rounded-lg text-sm font-mono break-words w-full max-sm:text-xs overflow-auto max-h-[40vh]">
              {lastInvestment.wallet_address}
            </pre>
            <button
              onClick={() => onCopy(lastInvestment.wallet_address || undefined)}
              className="p-2 rounded-md bg-cyan-600 hover:bg-cyan-500 active:scale-95 transition transform shadow-[0_0_15px_rgba(0,255,255,0.3)] max-sm:w-full max-sm:mt-2"
              title="Copy to clipboard"
            >
              <Copy size={18} />
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-400 leading-relaxed">
            Once payment is made, the system will automatically confirm your
            investment. Your earnings will begin counting immediately after
            confirmation.
          </p>
        </div>

        <div className="flex justify-end gap-3 max-sm:flex-col">
          <button
            onClick={onBack}
            className="btn-outline-futuristic max-sm:w-full"
          >
            Go Back
          </button>

          <button
            onClick={onGoToDashboard}
            className="btn-primary-futuristic max-sm:w-full"
          >
            Go To Dashboard
          </button>
        </div>

        <style jsx>{`
          .futuristic-card {
            background: linear-gradient(
              180deg,
              rgba(6, 10, 18, 0.96),
              rgba(10, 15, 25, 0.98)
            );
            box-shadow: 0 8px 40px rgba(2, 6, 23, 0.6),
              0 0 25px rgba(0, 255, 255, 0.12),
              inset 0 0 10px rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(0, 255, 255, 0.26);
            max-height: 85vh;
            overflow-y: auto;
            animation: piFadeIn 240ms cubic-bezier(0.2, 0.9, 0.2, 1);
          }

          .btn-outline-futuristic {
            background: transparent;
            border: 1px solid rgba(0, 255, 255, 0.4);
            color: #00ffff;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          .btn-outline-futuristic:hover {
            background: rgba(0, 255, 255, 0.1);
            box-shadow: 0 0 12px rgba(0, 255, 255, 0.3);
          }

          .btn-primary-futuristic {
            background: linear-gradient(90deg, #00ffff, #7c3aed);
            color: #fff;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          .btn-primary-futuristic:hover {
            transform: scale(1.03);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
          }

          @keyframes piFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          pre {
            white-space: pre-wrap;
            word-break: break-all;
            overflow-wrap: anywhere;
          }

          @media (max-width: 640px) {
            .futuristic-card {
              padding: 1rem;
            }
            pre {
              font-size: 0.75rem;
              padding: 0.6rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
