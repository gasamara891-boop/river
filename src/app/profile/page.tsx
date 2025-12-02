"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import InvestModal from "@/components/InvestModal/InvestModal";
import WithdrawModal from "@/components/WithdrawModal";
import InvestmentGrowthChart from "@/components/InvestmentGrowthChart";

type Plan = {
  id: string;
  title: string;
  rateLabel: string;
  ratePercent: string;
  rangeLabel: string;
  minDeposit: number;
  maxDeposit?: number | null;
  durationLabel: string;
  features: string[];
  ctaLabel?: string;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    title: "Starter Plan",
    rateLabel: "5.0% daily",
    ratePercent: "5%",
    rangeLabel: "$500 - $9,999",
    minDeposit: 100,
    maxDeposit: 9999,
    durationLabel: "30 days",
    features: ["5% daily returns", "30-day investment period", "Basic support", "Mobile app access"],
    ctaLabel: "Invest Now",
  },
  {
    id: "growth",
    title: "Growth Plan",
    rateLabel: "8.0% daily",
    ratePercent: "8%",
    rangeLabel: "$10,000 - $99,999",
    minDeposit: 10000,
    maxDeposit: 99999,
    durationLabel: "45 days",
    features: [
      "8% daily returns",
      "45-day investment period",
      "Priority support",
      "Advanced analytics",
      "Withdrawal flexibility",
    ],
    ctaLabel: "Invest Now",
  },
  {
    id: "premium",
    title: "Premium Plan",
    rateLabel: "12.0% daily",
    ratePercent: "12%",
    rangeLabel: "$100,000 - Unlimited",
    minDeposit: 100000,
    maxDeposit: 999999999,
    durationLabel: "60 days",
    features: [
      "12% daily returns",
      "60-day investment period",
      "VIP support",
      "Personal account manager",
      "Custom investment strategies",
      "Early withdrawal options",
    ],
    ctaLabel: "Invest Now",
  },
];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [totalInvested, setTotalInvested] = useState<number | null>(null);
  const [totalProfit, setTotalProfit] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [recentInvestments, setRecentInvestments] = useState<any[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);

  // Withdrawals & balances
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [balances, setBalances] = useState<Record<string, number>>({ btc: 0, eth: 0, usdt: 0 });
  const [withdrawMsg, setWithdrawMsg] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // --- Fetch manual_interest from user's profile
        const { data: profileRow, error: profileErr } = await supabase
          .from("profiles")
          .select("manual_interest")
          .eq("id", user.id)
          .maybeSingle();

        if (profileErr) {
          console.error("manual_interest fetch error:", profileErr);
        }

        const { data: investedData, error: investedErr } = await supabase
          .from("investments")
          .select("amount, status")
          .eq("user_id", user.id)
          .eq("status", "success");

        if (investedErr) {
          console.error("investedErr", investedErr);
        } else if (mounted && investedData) {
          const investedNumbers = investedData.map((r: any) => Number(r.amount) || 0);
          const investedSum = investedNumbers.reduce((s: number, v: number) => s + v, 0);

          // set total invested (confirmed/success only)
          setTotalInvested(investedSum);

          // --- USE manual_interest override if present ---
          let profitToShow;
          if (
            profileRow &&
            profileRow.manual_interest !== null &&
            profileRow.manual_interest !== undefined
          ) {
            profitToShow = Number(profileRow.manual_interest); // admin set
          } else {
            // default calculation
            profitToShow = Math.round(investedSum * 0.05 * 100) / 100;
          }
          setTotalProfit(profitToShow);
        } else {
          setTotalInvested(0);
          setTotalProfit(0);
        }
      } catch (err) {
        console.error(err);
        setTotalInvested(0);
        setTotalProfit(0);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    };

    fetchStats();
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchRecentInvestments();
    fetchWithdrawals();
    fetchBalances();
    // eslint-disable-next-line
  }, [user]);

  const fetchRecentInvestments = async () => {
    setLoadingInvestments(true);
    try {
      const { data } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setRecentInvestments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInvestments(false);
    }
  };

  // Fetch user withdrawals
  async function fetchWithdrawals() {
    if (!user) return;
    const userId = user.id;
    try {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) setWithdrawals(data);
    } catch (err) {
      console.error("fetchWithdrawals err:", err);
    }
  }

  // If no such table exists, fallback to zeros (you can customize this).
  async function fetchBalances() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("balances")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setBalances({
          btc: Number(data.btc || 0),
          eth: Number(data.eth || 0),
          usdt: Number(data.usdt || 0),
        });
        return;
      }
    } catch (err) {
      // ignore - fallback to other strategies
    }

    // fallback: compute from approved/successful investments only
    try {
      const { data } = await supabase
        .from("investments")
        .select("coin, amount, status")
        .eq("user_id", user.id)
        .eq("status", "success");
      const b: Record<string, number> = { btc: 0, eth: 0, usdt: 0 };
      if (Array.isArray(data)) {
        data.forEach((r: any) => {
          const coin = String(r.coin || "").toLowerCase();
          if (b[coin] === undefined) b[coin] = 0;
          b[coin] += Number(r.amount) || 0;
        });
      }
      setBalances(b);
    } catch (err) {
      console.warn("fetchBalances fallback error:", err);
      setBalances({ btc: 0, eth: 0, usdt: 0 });
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkmode">
        <p className="text-midnight_text">Loading...</p>
      </div>
    );
  }

  const formatCurrency = (val: number | null) =>
    val == null
      ? "—"
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        }).format(val);

  const handlePlanCTA = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    setShowInvestModal(true);
  };

  function handleWithdrawClick() {
    const coinsWithFunds = Object.entries(balances).filter(([c, amt]) => amt > 0);
    if (coinsWithFunds.length === 0) {
      setWithdrawMsg("Nothing to withdraw yet. Invest now to start earning!");
      setWithdrawModalOpen(true);
    } else {
      setWithdrawMsg("");
      setWithdrawModalOpen(true);
    }
  }

  const profileForModal = {
    id: user.id,
    name:
      (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) ||
      user.email ||
      "User",
    email: user.email,
  };

  return (
    <main className="min-h-screen bg-darkmode text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 sm:gap-3 bg-darkmode border border-midnight_text px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-midnight_text text-sm sm:text-base"
            >
              <span className="text-lg">←</span>
              <span>Back to Home</span>
            </button>

            <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-darkmode font-semibold text-base sm:text-lg">
                  {user.email?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm sm:text-base">
                  {user.user_metadata?.full_name ?? "User"}
                </div>
                <div className="text-midnight_text text-xs sm:text-sm break-all">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                // Refresh profits button: recompute using only approved/successful investments
                setLoadingStats(true);
                try {
                  const { data: profileRow } = await supabase
                    .from("profiles")
                    .select("manual_interest")
                    .eq("id", user.id)
                    .maybeSingle();

                  const { data: investedData } = await supabase
                    .from("investments")
                    .select("amount, status")
                    .eq("user_id", user.id)
                    .eq("status", "success");

                  const investedNumbers = (investedData || []).map(
                    (r: any) => Number(r.amount) || 0
                  );
                  const investedSum = investedNumbers.reduce((s: number, v: number) => s + v, 0);
                  setTotalInvested(investedSum);

                  let profitToShow;
                  if (
                    profileRow &&
                    profileRow.manual_interest !== null &&
                    profileRow.manual_interest !== undefined
                  ) {
                    profitToShow = Number(profileRow.manual_interest); // admin set
                  } else {
                    // default calculation
                    profitToShow = Math.round(investedSum * 0.05 * 100) / 100;
                  }
                  setTotalProfit(profitToShow);
                } catch (err) {
                  console.error(err);
                } finally {
                  setLoadingStats(false);
                }
              }}
              className="bg-yellow-600 text-darkmode px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base"
            >
              Refresh Profits
            </button>

            <button
              onClick={handleWithdrawClick}
              className="bg-emerald-500 text-black px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base"
            >
              Withdraw
            </button>
            <button
              onClick={() => setShowInvestModal(true)}
              className="bg-slate-700 text-midnight_text px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* Dashboard Title */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Investment Dashboard</h2>
        <p className="text-midnight_text mb-6 sm:mb-8 text-sm sm:text-base">
          Your Deposits | Your Withdrawals | Your Vault
        </p>

        {/* Stat Cards - only Total Invested and Total Profit per request */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="bg-darkmode border border-midnight_text rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-amber-800 flex items-center justify-center">
                <span className="text-2xl text-midnight_text">$</span>
              </div>
              <div>
                <div className="text-midnight_text text-xs sm:text-sm">Total Invested</div>
                <div className="text-white text-lg sm:text-xl font-bold">
                  {formatCurrency(totalInvested)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-darkmode border border-midnight_text rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-emerald-800 flex items-center justify-center">
                <span className="text-2xl text-midnight_text">▲</span>
              </div>
              <div>
                <div className="text-midnight_text text-xs sm:text-sm">
                  Total Profit (5% daily)
                </div>
                <div className="text-white text-lg sm:text-xl font-bold">
                  {formatCurrency(totalProfit)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Daily estimated profit at 5% of total invested
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Plans */}
        <section className="mb-10">
          <div className="text-white font-semibold text-lg sm:text-xl mb-4">
            Investment Plans
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {PLANS.map((plan) => {
              const userHasEnough = (totalInvested ?? 0) >= plan.minDeposit; // use totalInvested
              const disabled = !userHasEnough;
              return (
                <div
                  key={plan.id}
                  className="bg-slate-800 rounded-lg p-5 sm:p-6 border border-midnight_text"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="bg-yellow-400 text-darkmode px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      {plan.title}
                    </span>
                    <span className="text-xs sm:text-sm text-emerald-400">
                      {plan.rateLabel}
                    </span>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <div className="text-midnight_text text-xs sm:text-sm">
                        Investment Range
                      </div>
                      <div className="text-white font-semibold mb-2 sm:mb-3">
                        {plan.rangeLabel}
                      </div>
                    </div>

                    <div>
                      <div className="text-midnight_text text-xs sm:text-sm">
                        Duration
                      </div>
                      <div className="text-white font-semibold mb-2 sm:mb-3">
                        {plan.durationLabel}
                      </div>
                    </div>

                    <div>
                      <div className="text-midnight_text text-xs sm:text-sm">
                        Description
                      </div>
                      <div className="text-midnight_text text-xs sm:text-sm mb-3">
                        {plan.title === "Starter Plan"
                          ? "Perfect for beginners starting their journey."
                          : plan.title === "Growth Plan"
                          ? "Ideal for investors seeking higher returns."
                          : "Maximum returns for serious investors."}
                      </div>
                    </div>

                    <div>
                      <div className="text-midnight_text text-xs sm:text-sm mb-1">
                        Features
                      </div>
                      <ul className="text-midnight_text text-xs sm:text-sm list-inside ml-3 mb-4 space-y-1">
                        {plan.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mt-1" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlanCTA(plan)}
                    disabled={false}
                    className={`w-full text-center px-4 py-2 sm:py-3 rounded-md font-medium text-sm sm:text-base ${
                      disabled
                        ? "bg-primary text-darkmode"
                        : "bg-primary text-darkmode"
                    }`}
                  >
                    {plan.ctaLabel ?? "Deposit Now"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Investment Growth Chart */}
        <div className="mb-6">
          <InvestmentGrowthChart
            investments={recentInvestments.filter(
              (inv) => String(inv.status).toLowerCase() === "success"
            )}
          />
        </div>

        {/* Recent Deposits & Withdrawals (split) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Deposits */}
          <div className="bg-darkmode border border-midnight_text rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg sm:text-xl">
                Recent Deposits
              </h3>
              <button
                onClick={fetchRecentInvestments}
                className="text-midnight_text text-xs sm:text-sm"
              >
                Refresh
              </button>
            </div>

            {loadingInvestments ? (
              <div className="text-midnight_text text-sm">Loading deposits...</div>
            ) : recentInvestments.length === 0 ? (
              <div className="text-midnight_text text-sm">
                No deposits yet — make your first investment.
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvestments.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-slate-800 p-3 sm:p-4 rounded border border-midnight_text flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base text-white font-medium truncate">
                        {inv.plan_id ?? inv.coin}
                      </div>
                      <div className="text-midnight_text text-xs sm:text-sm break-words">
                        {new Date(inv.created_at).toLocaleString()} • {inv.coin}{" "}
                        {inv.amount}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm ${
                          String(inv.status).toLowerCase() === "pending"
                            ? "bg-yellow-600 text-black"
                            : String(inv.status).toLowerCase() === "success"
                            ? "bg-emerald-500 text-black"
                            : "bg-slate-700 text-midnight_text"
                        }`}
                      >
                        {inv.status}
                      </div>
                      <button
                        onClick={() =>
                          navigator.clipboard?.writeText(inv.wallet_address ?? "")
                        }
                        className="text-midnight_text text-xs sm:text-sm whitespace-nowrap"
                      >
                        Copy Wallet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawals */}
          <div className="bg-darkmode border border-midnight_text rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg sm:text-xl">
                Recent Withdrawals
              </h3>
              <button
                onClick={fetchWithdrawals}
                className="text-midnight_text text-xs sm:text-sm"
              >
                Refresh
              </button>
            </div>

            {withdrawals.length === 0 ? (
              <div className="text-midnight_text text-sm">No withdrawals yet.</div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((wd) => (
                  <div
                    key={wd.id}
                    className="bg-slate-800 p-3 sm:p-4 rounded border border-midnight_text flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base text-white font-medium truncate">
                        {(wd.coin || wd.plan_id || "").toUpperCase()}
                      </div>
                      <div className="text-midnight_text text-xs sm:text-sm break-words">
                        {new Date(wd.created_at).toLocaleString()} • {wd.amount} •{" "}
                        <span className="break-words">{wd.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm ${
                          String(wd.status).toLowerCase() === "pending"
                            ? "bg-yellow-600 text-black"
                            : "bg-emerald-500 text-black"
                        }`}
                      >
                        {wd.status}
                      </div>
                      <button
                        onClick={() =>
                          navigator.clipboard?.writeText(wd.address ?? "")
                        }
                        className="text-midnight_text text-xs sm:text-sm whitespace-nowrap"
                      >
                        Copy Address
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invest Modal */}
      {showInvestModal && (
        <InvestModal
          profile={profileForModal}
          onClose={() => {
            setShowInvestModal(false);
            setSelectedPlanId(null);
          }}
        />
      )}

      {/* Withdraw modal */}
      <WithdrawModal
        user={user}
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        balances={balances}
        setWithdrawals={(rows: any[]) => {
          setWithdrawals(rows);
        }}
        hasDeposits={recentInvestments.length > 0}
        showToast={(type: string, message: string) => {
          // lightweight toast fallback - replace with your toast system if present
          try {
            console.log(type, message);
          } catch (err) {
            /* no-op */
          }
        }}
      />
    </main>
  );
}