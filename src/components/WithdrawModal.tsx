"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  email?: string;
  user_metadata?: any;
  [key: string]: any;
};

type Props = {
  user: User | null;
  open: boolean;
  onClose: () => void;
  balances: Record<string, number>; // e.g. { btc: 0.5, eth: 1.2, usdt: 1000 }
  setWithdrawals?: (rows: any[]) => void; // optional callback to refresh parent state
  showToast?: (type: string, message: string, timeoutMs?: number) => void;
  // new prop to indicate whether user has any deposits (investments)
  hasDeposits?: boolean;
};

export default function WithdrawModal({
  user,
  open,
  onClose,
  balances,
  setWithdrawals,
  showToast,
  hasDeposits = true,
}: Props) {
  const [withdrawCoin, setWithdrawCoin] = useState<string>("btc");
  const [withdrawNetwork, setWithdrawNetwork] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [withdrawErr, setWithdrawErr] = useState<string>("");
  const [withdrawMsg, setWithdrawMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    const coinsWithFunds = Object.entries(balances || {})
      .filter(([c, amt]) => Number(amt) > 0)
      .map(([c]) => c.toLowerCase());
    const defaultCoin = coinsWithFunds.length ? coinsWithFunds[0] : "btc";
    setWithdrawCoin(defaultCoin);
    setWithdrawAmount("");
    setWithdrawAddress("");
    setWithdrawErr("");
    setWithdrawMsg("");
    setWithdrawNetwork("");
  }, [open, balances]);

  if (!open) return null;

  const close = () => {
    setWithdrawErr("");
    setWithdrawMsg("");
    setWithdrawAmount("");
    setWithdrawAddress("");
    setWithdrawNetwork("");
    onClose();
  };

  async function submitWithdraw(e?: React.FormEvent) {
    e?.preventDefault();

    if (!hasDeposits) {
      // Guard - if no deposits, don't let them submit
      setWithdrawErr("Nothing to withdraw yet. Make your first investment.");
      return;
    }

    if (!user || !user.id) {
      setWithdrawErr("User not found. Please login.");
      return;
    }

    const coinKey = (withdrawCoin || "btc").toLowerCase();
    const bal = Number(balances?.[coinKey] ?? 0);
    const amtNum = Number(withdrawAmount);

    if (!amtNum || amtNum <= 0) {
      setWithdrawErr("Enter a valid amount!");
      return;
    }
    if (amtNum > bal) {
      setWithdrawErr("Cannot withdraw more than your balance!");
      return;
    }
    if (!withdrawAddress.trim()) {
      setWithdrawErr("Wallet address required!");
      return;
    }
    setWithdrawErr("");
    setSubmitting(true);

    try {
      const userId = user.id;
      const newWithdrawal: any = {
        user_id: userId,
        coin: coinKey,
        amount: amtNum,
        address: withdrawAddress.trim(),
        status: "pending",
      };
      if (coinKey === "usdt" && withdrawNetwork) newWithdrawal.network = withdrawNetwork;

      const { error } = await supabase.from("withdrawals").insert([newWithdrawal]);

      if (error) {
        console.error("withdraw insert error:", error);
        setWithdrawErr("Failed to record withdrawal!");
        showToast && showToast("error", `Withdrawal failed: ${error.message || "unknown"}`);
        return;
      }

      showToast &&
        showToast(
          "info",
          `Withdrawal request for ${amtNum} ${coinKey.toUpperCase()} submitted. Waiting admin approval.`,
          4000
        );

      // fetch updated withdrawals for the user and call parent setter if provided
      try {
        const { data, error: fetchError } = await supabase
          .from("withdrawals")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.warn("fetch withdrawals after insert error:", fetchError);
        } else if (data && setWithdrawals) {
          setWithdrawals(data);
        }
      } catch (err) {
        console.warn("post-insert fetch error:", err);
      }

      // reset & close
      setWithdrawAmount("");
      setWithdrawCoin("btc");
      setWithdrawAddress("");
      setWithdrawNetwork("");
      setWithdrawErr("");
      setWithdrawMsg("");
      close();
    } finally {
      setSubmitting(false);
    }
  }

  const coinOptions = [
    { value: "btc", label: "BTC" },
    { value: "eth", label: "ETH" },
    { value: "usdt", label: "USDT" },
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl p-6 text-white futuristic-card">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-600/6 -z-10"></div>

        <button
          onClick={close}
          className="absolute top-4 right-4 text-cyan-300 hover:text-white bg-transparent rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className="text-2xl font-extrabold tracking-wider mb-4 text-cyan-400 text-center">Request Withdrawal</h3>

        {!hasDeposits ? (
          <div className="text-center space-y-4">
            <p className="text-slate-300">Nothing to withdraw yet — make your first investment.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  // Close modal so user can go invest
                  onClose();
                }}
                className="px-4 py-2 rounded-md bg-primary text-darkmode font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submitWithdraw} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 block mb-1">Coin</label>
              <select
                value={withdrawCoin}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase();
                  setWithdrawCoin(v);
                  if (v !== "usdt") setWithdrawNetwork("");
                }}
                className="w-full p-3 rounded-md bg-[#07121a] border border-slate-700 text-white"
              >
                {coinOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} — Balance: {Number(balances?.[c.value] ?? 0)}
                  </option>
                ))}
              </select>
            </div>

            {withdrawCoin === "usdt" && (
              <div>
                <label className="text-sm text-slate-300 block mb-1">Network</label>
                <select
                  value={withdrawNetwork}
                  onChange={(e) => setWithdrawNetwork(e.target.value)}
                  className="w-full p-3 rounded-md bg-[#07121a] border border-slate-700 text-white"
                >
                  <option value="BEP20">BSC (BEP20)</option>
                  <option value="TRC20">TRON (TRC20)</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-sm text-slate-300 block mb-1">Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="e.g. 0.1"
                className="w-full p-3 rounded-md bg-[#07121a] border border-slate-700 text-white"
              />
              <div className="text-xs text-slate-400 mt-1">
                Available: {Number(balances?.[withdrawCoin?.toLowerCase()] ?? 0)}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300 block mb-1">Destination Wallet Address</label>
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="Paste your wallet address"
                className="w-full p-3 rounded-md bg-[#07121a] border border-slate-700 text-white break-words"
              />
            </div>

            {withdrawErr && <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{withdrawErr}</div>}
            {withdrawMsg && <div className="text-sm text-slate-300 bg-slate-900/30 p-2 rounded">{withdrawMsg}</div>}

            <div className="flex items-center justify-end gap-3 mt-3">
              <button
                type="button"
                onClick={() => {
                  setWithdrawErr("");
                  setWithdrawMsg("");
                  onClose();
                }}
                className="px-4 py-2 rounded-md bg-slate-700/40 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-emerald-500 text-black font-semibold disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Request Withdrawal"}
              </button>
            </div>
          </form>
        )}

        <style jsx>{`
          .futuristic-card {
            background: linear-gradient(180deg, rgba(6, 10, 18, 0.96), rgba(10, 15, 25, 0.98));
            box-shadow: 0 8px 40px rgba(2, 6, 23, 0.6), 0 0 25px rgba(0, 255, 255, 0.06), inset 0 0 8px rgba(255,255,255,0.02);
            border: 1px solid rgba(0,255,255,0.06);
            width: 100%;
          }
          @media (max-width: 640px) {
            .futuristic-card {
              padding: 1rem;
              border-radius: 1rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
}