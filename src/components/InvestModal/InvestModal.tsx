"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import InstructionModal from "./InstructionModal";

type Props = {
  profile: any;
  onClose: () => void;
  showToast?: (type: string, message: string) => void;
};

const ASSETS = [
  { symbol: "BTC", label: "Bitcoin", defaultNetwork: "mainnet" },
  { symbol: "ETH", label: "Ethereum", defaultNetwork: "ERC20" },
  { symbol: "USDT", label: "Tether (USDT)", defaultNetwork: "BEP20" },
];

export default function InvestModal({ profile, onClose, showToast }: Props) {
  const router = useRouter();
  const [asset, setAsset] = useState<string>("BTC");
  const [amount, setAmount] = useState<string>("");
  const [network, setNetwork] = useState<string>("");
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const addressRef = useRef<HTMLInputElement>(null);

  const [showInstructions, setShowInstructions] = useState(false);
  const [lastInvestment, setLastInvestment] = useState<{
    amount: number;
    coin: string;
    network: string;
    wallet_address?: string | null;
  } | null>(null);

  // Tooltip state & ref (points at copy button)
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const tooltipTargetRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (asset === "BTC") setNetwork("mainnet");
    else if (asset === "ETH") setNetwork("ERC20");
    else if (asset === "USDT") setNetwork("BEP20");
  }, [asset]);

  // reset copied flag whenever asset/network changes so user must copy the new address
  useEffect(() => {
    setCopied(false);
  }, [asset, network]);

  // Prevent background scroll when instructions overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (showInstructions) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev || "";
    }
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [showInstructions]);

  useEffect(() => {
    let mounted = true;
    async function loadAddress() {
      setLoadingAddress(true);
      setDepositAddress(null);
      try {
        const { data } = await supabase
          .from("wallet_addresses")
          .select("address")
          .eq("coin", asset.toLowerCase())
          .eq("network", network)
          .maybeSingle();

        if (!mounted) return;
        setDepositAddress(data?.address || null);
      } catch (err) {
        console.error("load deposit address err:", err);
        if (mounted) setDepositAddress(null);
      } finally {
        if (mounted) setLoadingAddress(false);
      }
    }
    if (network) loadAddress();
    return () => {
      mounted = false;
    };
  }, [asset, network]);

  // Show the copy tooltip automatically when depositAddress exists, user has entered an amount,
  // the address has not been copied yet, and instructions overlay is not active.
  useEffect(() => {
    const amtNum = parseFloat(amount || "0");
    if (depositAddress && !copied && amtNum > 0 && !showInstructions) {
      setShowCopyTooltip(true);
    } else {
      setShowCopyTooltip(false);
    }
  }, [depositAddress, copied, amount, showInstructions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      showToast && showToast("error", "Enter a positive USD amount");
      return;
    }
    if (!profile || !profile.id) {
      showToast && showToast("error", "User not found. Please login.");
      return;
    }
    if (!depositAddress) {
      showToast &&
        showToast("error", "No deposit address available for this asset/network");
      return;
    }

    // enforce copying the address before proceeding
    if (!copied) {
      showToast && showToast("error", "Please copy the deposit address before clicking Invest.");
      addressRef.current?.focus();
      // ensure tooltip is visible to guide the user
      setShowCopyTooltip(true);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: profile.id,
        coin: asset.toLowerCase(),
        network,
        amount: amt,
        wallet_address: depositAddress,
        status: "pending",
      };

      const { data, error } = await supabase
        .from("investments")
        .insert([payload])
        .select("*")
        .single();

      if (error) {
        console.error("create investment error:", error);
        showToast &&
          showToast("error", `Failed to create investment: ${error.message || "unknown"}`);
      } else {
        setLastInvestment({
          amount: amt,
          coin: asset,
          network,
          wallet_address: depositAddress,
        });
        setShowInstructions(true);
        showToast &&
          showToast("success", "Investment created. Follow the payment instructions.");
      }
    } catch (err) {
      console.error("handleSubmit unexpected err:", err);
      showToast && showToast("error", "Failed to create investment (unexpected).");
    } finally {
      setSubmitting(false);
    }
  }

  const handleCopy = (text?: string) => {
    const t = text || depositAddress || lastInvestment?.wallet_address;
    if (t) {
      navigator.clipboard.writeText(t);
      setCopied(true); // keep copied true until user changes asset/network or closes
      setShowCopyTooltip(false); // hide tooltip once copied
      showToast && showToast("success", "Address copied to clipboard");
      // DO NOT auto-clear copied here — user must have copied before clicking Invest
    }
  };

  const handleGoToDashboard = () => {
    // Refresh the page so the new pending investment appears, then close everything
    try {
      router.refresh?.();
    } catch (err) {
      // ignore if refresh not available
    }
    setShowInstructions(false);
    setCopied(false);
    onClose();
  };

  const handleBackToInvestment = () => {
    // Close overlay so user can edit/resubmit in the modal underneath
    setShowInstructions(false);
    // keep copied = true so they can re-submit without copying again
  };

  const amountNumber = parseFloat(amount || "0");

  return (
    <>
      <div
        className={`modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 ${
          showInstructions ? "bg-transparent pointer-events-none" : "bg-black/70 with-blur"
        }`}
      >
        {/* ✅ Responsive Scrollable Container */}
        <div className="max-h-[90vh] w-full overflow-y-auto flex justify-center items-start mt-10 mb-10">
          <div
            className={`modal relative max-w-xl w-full p-8 rounded-2xl text-white futuristic transition-transform duration-300 ${
              showInstructions ? "scale-0 opacity-30" : "scale-100 opacity-100"
            }`}
            aria-hidden={showInstructions}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-500/20 rounded-2xl blur-2xl -z-10"></div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold tracking-widest text-cyan-400 mb-2">
                ⚡ Our State
              </h2>
              <p className="text-gray-300 text-sm">
                Initiate a futuristic investment sequence
              </p>
            </div>

            {!showInstructions ? (
              <>
                <div className="tabs mb-6 flex justify-center gap-3 flex-wrap">
                  {ASSETS.map((a) => (
                    <button
                      key={a.symbol}
                      className={`tab ${asset === a.symbol ? "active" : ""}`}
                      onClick={() => setAsset(a.symbol)}
                      type="button"
                    >
                      {a.symbol}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm mb-1 text-gray-300">
                      Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400"></span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        placeholder="e.g., 100"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input w-full pl-7"
                        required
                      />
                    </div>
                  </div>

                  {asset === "USDT" && (
                    <div className="mb-4">
                      <label className="block text-sm mb-1 text-gray-300">
                        Network
                      </label>
                      <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        className="input w-full"
                      >
                        <option value="BEP20">BSC (BEP20)</option>
                        <option value="TRC20">TRON (TRC20)</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm mb-1 text-gray-300">
                      Deposit Address
                    </label>
                    {loadingAddress ? (
                      <div className="muted">Loading address…</div>
                    ) : depositAddress ? (
                      <div className="flex items-center gap-2 relative">
                        <input
                          ref={addressRef}
                          type="text"
                          value={depositAddress}
                          readOnly
                          className="input flex-1 cursor-text text-cyan-300 text-sm"
                        />
                        <div className="relative">
                          <button
                            ref={tooltipTargetRef}
                            type="button"
                            onClick={() => handleCopy(depositAddress)}
                            className="p-2 rounded-md bg-cyan-600 hover:bg-cyan-500 active:scale-95 transition transform"
                            title="Copy to clipboard"
                            aria-describedby={showCopyTooltip ? "copy-tooltip" : undefined}
                          >
                            <Copy size={18} />
                          </button>

                          {/* Tooltip pointing to the copy button */}
                          {showCopyTooltip && (
                            <div
                              id="copy-tooltip"
                              role="status"
                              className="absolute -top-12 right-0 w-max max-w-xs bg-black/90 text-white text-xs py-1.5 px-3 rounded-md shadow-lg z-30 transform translate-y-0"
                            >
                              <div className="flex items-center gap-2">
                                <svg width="10" height="6" viewBox="0 0 10 6" className="absolute left-3 -bottom-2">
                                  <path d="M0 0 L5 6 L10 0" fill="black" />
                                </svg>
                              </div>
                              <div>Copy address</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="muted">
                        No deposit address configured for {asset} / {network}
                      </div>
                    )}
                    {copied && (
                      <p className="text-xs text-green-400 mt-1 animate-pulse">
                        ✅ Address copied!
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setCopied(false);
                        onClose();
                      }}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary glow-btn"
                      disabled={
                        submitting ||
                        !depositAddress ||
                        !(amountNumber > 0) ||
                        !copied
                      }
                      title={
                        !depositAddress
                          ? "No deposit address"
                          : !(amountNumber > 0)
                          ? "Enter an amount"
                          : !copied
                          ? "Copy the deposit address first"
                          : ""
                      }
                    >
                      {submitting ? "Submitting…" : `Invest ${asset}`}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <p className="text-midnight_text">Showing payment instructions…</p>
              </div>
            )}

            <style jsx>{`
              .futuristic {
                background: rgba(10, 15, 25, 0.9);
                box-shadow: 0 0 25px rgba(0, 255, 255, 0.15),
                  inset 0 0 10px rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.2);
                backdrop-filter: blur(15px);
              }
              .tabs .tab {
                padding: 0.5rem 1.2rem;
                border-radius: 999px;
                border: 1px solid rgba(0, 255, 255, 0.3);
                background: transparent;
                color: #a3a3a3;
                transition: all 0.3s ease;
              }
              .tabs .tab:hover {
                color: #00ffff;
                box-shadow: 0 0 10px #00ffff;
              }
              .tabs .tab.active {
                background: linear-gradient(90deg, #00ffff, #7c3aed);
                color: #fff;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
              }
              .input {
                padding: 0.55rem 0.75rem;
                border-radius: 8px;
                border: 1px solid rgba(0, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.05);
                color: #fff;
                outline: none;
                transition: all 0.3s;
                width: 100%;
              }
              .input:focus {
                border-color: #00ffff;
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
              }
              .btn {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
              }
              .btn-primary {
                background: linear-gradient(90deg, #00ffff, #7c3aed);
                border: none;
                color: #fff;
              }
              .btn-outline {
                background: transparent;
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: #00ffff;
              }
              .btn-outline:hover {
                background: rgba(0, 255, 255, 0.1);
              }
              .glow-btn:hover {
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
                transform: scale(1.03);
              }
              .muted {
                color: #6b7280;
              }
              .modal-backdrop.with-blur {
                backdrop-filter: blur(5px);
              }
              .transition-transform {
                transition: transform 180ms ease, opacity 180ms ease;
              }

              /* Tooltip responsiveness: move tooltip above button on wide screens and centered on narrow screens */
              @media (max-width: 520px) {
                #copy-tooltip {
                  left: 50%;
                  transform: translateX(-50%);
                  right: auto !important;
                  top: -2.5rem !important;
                }
                #copy-tooltip svg path { fill: black; }
              }
            `}</style>
          </div>
        </div>
      </div>

      {showInstructions && lastInvestment && (
        <InstructionModal
          lastInvestment={lastInvestment}
          onBack={handleBackToInvestment}
          onGoToDashboard={handleGoToDashboard}
          onCopy={handleCopy}
        />
      )}
    </>
  );
}