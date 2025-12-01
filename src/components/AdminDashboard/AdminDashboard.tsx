"use client";

import React, { useCallback, useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const TABLE_FETCH_LIMIT = 1000;

// Start of original file (now with manual interest feature)

export default function AdminDashboard({ showToast }: { showToast?: (type: string, message: string) => void }) {
  const router = useRouter();

  // Auth/profile for admin gating
  const [currentProfile, setCurrentProfile] = useState<any | null | undefined>(undefined);

  // Data slices
  const [users, setUsers] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  // UI
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [editMode, setEditMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [editAddresses, setEditAddresses] = useState({
    btc: "",
    eth: "",
    usdt_bep20: "",
    usdt_trc20: ""
  });

  const [loadingCore, setLoadingCore] = useState(false);

  // MANUAL INTEREST FEATURE STATE
  const [editingUserInterestId, setEditingUserInterestId] = useState<string | null>(null);
  const [interestEditValue, setInterestEditValue] = useState<string>("");

  // --- Profile loading ---
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) console.warn("AdminDashboard: getSession warning:", sessionErr);
        const user = sessionData?.session?.user ?? null;
        if (!user) {
          if (!mounted) return;
          setCurrentProfile(null);
          router.replace("/");
          return;
        }
        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (profileErr) console.error("fetch profile error:", profileErr);
        if (!mounted) return;
        if (!profileData || !profileData.is_admin) {
          setCurrentProfile(profileData || null);
          router.replace("/");
          return;
        }
        setCurrentProfile(profileData);
      } catch (err) {
        console.error("loadProfile err:", err);
        if (!mounted) return;
        setCurrentProfile(null);
        router.replace("/");
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, []);

  // --- Core data fetch ---
  const fetchKnownData = useCallback(async () => {
    if (currentProfile === undefined || currentProfile === null) return;
    setLoadingCore(true);
    try {
      const [
        usersRes,
        invRes,
        wdRes,
        addrRes,
        logsRes
      ] = await Promise.all([
        supabase.from("profiles").select("*").limit(TABLE_FETCH_LIMIT),
        supabase.from("investments").select("*").limit(TABLE_FETCH_LIMIT),
        supabase.from("withdrawals").select("*").limit(TABLE_FETCH_LIMIT),
        supabase.from("wallet_addresses").select("*").limit(TABLE_FETCH_LIMIT),
        supabase.from("user_activity").select("id, user_id, event, description, ip, city, region, country, created_at").order("created_at", { ascending: false }).limit(200)
      ]);
      setUsers(usersRes.data || []);
      setInvestments(invRes.data || []);
      setWithdrawals(wdRes.data || []);
      setActivityLogs(logsRes.data || []);
      if (Array.isArray(addrRes.data)) {
        setAddresses(addrRes.data);
        setEditAddresses({
          btc: addrRes.data.find((a: any) => a.coin === "btc" && a.network === "mainnet")?.address || "",
          eth: addrRes.data.find((a: any) => a.coin === "eth" && a.network === "ERC20")?.address || "",
          usdt_bep20: addrRes.data.find((a: any) => a.coin === "usdt" && a.network === "BEP20")?.address || "",
          usdt_trc20: addrRes.data.find((a: any) => a.coin === "usdt" && a.network === "TRC20")?.address || ""
        });
      } else setAddresses([]);
    } catch (err) {
      console.error("fetchKnownData error:", err);
      showToast && showToast("error", "Failed to fetch core admin data.");
    } finally {
      setLoadingCore(false);
    }
  }, [currentProfile, showToast]);

  useEffect(() => { fetchKnownData(); }, [currentProfile, fetchKnownData]);

  // --- Realtime subscriptions ---
  useEffect(() => {
    if (currentProfile === undefined || currentProfile === null) return;
    // INVESTMENTS
    const invChannel = supabase
      .channel("realtime_investments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "investments" },
        (payload) => { setInvestments((prev) => [payload.new, ...prev]); }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "investments" },
        (payload) => {
          setInvestments((prev) => prev.map((i) => (i.id === payload.new.id ? payload.new : i)));
        }
      )
      .subscribe();
    // WITHDRAWALS
    const wdChannel = supabase
      .channel("realtime_withdrawals")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "withdrawals" },
        (payload) => { setWithdrawals((prev) => [payload.new, ...prev]); }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "withdrawals" },
        (payload) => {
          setWithdrawals((prev) => prev.map((w) => (w.id === payload.new.id ? payload.new : w)));
        }
      )
      .subscribe();
    // USER ACTIVITY
    const logChannel = supabase
      .channel("realtime_user_activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_activity" },
        (payload) => { setActivityLogs((prev) => [payload.new, ...prev]); }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(invChannel);
        supabase.removeChannel(wdChannel);
        supabase.removeChannel(logChannel);
      } catch (err) { console.warn("error removing channels:", err); }
    };
  }, [currentProfile]);

  function getUserById(id: string) {
    return users.find((u) => u.id === id) || {};
  }

  async function saveAddresses(e: FormEvent) {
    e.preventDefault();
    try {
      const rows = [
        { coin: "btc", network: "mainnet", address: (editAddresses.btc || "").trim(), updated_by: currentProfile?.id || null },
        { coin: "eth", network: "ERC20", address: (editAddresses.eth || "").trim(), updated_by: currentProfile?.id || null },
        { coin: "usdt", network: "BEP20", address: (editAddresses.usdt_bep20 || "").trim(), updated_by: currentProfile?.id || null },
        { coin: "usdt", network: "TRC20", address: (editAddresses.usdt_trc20 || "").trim(), updated_by: currentProfile?.id || null }
      ].filter((r) => r.address && r.address.length > 0);
      if (rows.length === 0) {
        showToast && showToast("error", "No addresses provided.");
        return;
      }
      const { error } = await supabase
        .from("wallet_addresses")
        .upsert(rows, { onConflict: "coin,network" });

      if (error) {
        console.error("upsert addresses error:", error);
        showToast && showToast("error", `Failed to update addresses: ${error.message || "Unknown error"}`);
        return;
      }
      const { data: refreshed } = await supabase.from("wallet_addresses").select("*");
      setAddresses(refreshed || []);
      setEditMode(false);
      showToast && showToast("success", "Addresses updated successfully!");
    } catch (err) {
      console.error("saveAddresses err:", err);
      showToast && showToast("error", "Failed to update addresses.");
    }
  }

  async function approveInvestment(investmentId: string) {
    try {
      const { error } = await supabase.from("investments").update({ status: "success" }).eq("id", investmentId);
      if (!error) {
        showToast && showToast("success", "Investment approved!");
        const { data } = await supabase.from("investments").select("*").eq("id", investmentId).maybeSingle();
        if (data) setInvestments((prev) => prev.map((i) => (i.id === investmentId ? data : i)));
      } else showToast && showToast("error", "Failed to approve investment.");
    } catch (err) {
      console.error("approveInvestment err:", err);
      showToast && showToast("error", "Failed to approve investment.");
    }
  }

  async function approveWithdrawal(withdrawalId: string) {
    try {
      const { error } = await supabase.from("withdrawals").update({ status: "success" }).eq("id", withdrawalId);
      if (!error) {
        showToast && showToast("success", "Withdrawal approved!");
        const { data } = await supabase.from("withdrawals").select("*").eq("id", withdrawalId).maybeSingle();
        if (data) setWithdrawals((prev) => prev.map((w) => (w.id === withdrawalId ? data : w)));
      } else showToast && showToast("error", "Failed to approve withdrawal.");
    } catch (err) {
      console.error("approveWithdrawal err:", err);
      showToast && showToast("error", "Failed to approve withdrawal.");
    }
  }

  async function handleDeleteUser(userId: string) {
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (!error) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showToast && showToast("success", "User deleted!");
      } else showToast && showToast("error", "Failed to delete user.");
    } catch (err) {
      console.error("handleDeleteUser err:", err);
      showToast && showToast("error", "Failed to delete user.");
    }
  }

  
// ----------- MANUAL INTEREST HANDLING -----------
  async function handleSaveInterest(userId: string) {
    try {
      // Accept string or number, translate empty string to null, otherwise parse number safely
      let input = interestEditValue.trim();
      // TS: make sure the type matches your DB (should be number or null)
      let parsedManualInterest: number | null = null;
      if (input !== "") {
        const parsed = parseFloat(input);
        parsedManualInterest = isNaN(parsed) ? null : parsed;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ manual_interest: parsedManualInterest })
        .eq("id", userId);

      if (!error) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, manual_interest: parsedManualInterest }
              : u
          )
        );
        showToast && showToast("success", "Interest updated!");
      } else {
        showToast && showToast("error", "Failed to update interest.");
      }
    } catch (err) {
      console.error("handleSaveInterest err:", err);
      showToast && showToast("error", "Failed to update interest.");
    } finally {
      setEditingUserInterestId(null);
      setInterestEditValue("");
    }
  }
// ----------- END MANUAL INTEREST HANDLING -----------


  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const pendingInv = investments.filter((i) => String(i.status).toLowerCase() === "pending").length;
    const pendingWd = withdrawals.filter((w) => String(w.status).toLowerCase() === "pending").length;
    const totalInvestmentsSum = investments.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
    return { totalUsers, pendingInv, pendingWd, totalInvestmentsSum };
  }, [users, investments, withdrawals]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "investments", label: "Investments", icon: "💰" },
    { id: "withdrawals", label: "Withdrawals", icon: "🔄" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "addresses", label: "Addresses", icon: "📬" },
    { id: "activity", label: "Activity", icon: "📊" }
  ];

  // --- Responsive sidebar ---
  const renderSidebar = () => (
    <aside className="fixed top-0 left-0 h-full w-64 bg-neutral-900 border-r shadow-lg z-30 lg:static lg:shadow-none lg:border-none flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <span className="text-xl font-bold text-white">Admin</span>
        <button className="lg:hidden text-2xl text-white" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">×</button>
      </div>
      <nav className="flex-1 py-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setSelectedTab(tab.id); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-6 py-3 text-base rounded-lg transition font-medium ${
              selectedTab === tab.id
                ? "bg-blue-600 text-white shadow"
                : "text-white hover:bg-neutral-800"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-neutral-800">
        <button
          onClick={async () => {
            try {
              await supabase.auth.signOut();
              showToast && showToast("success", "Logged out");
              router.replace("/");
            } catch (err) {
              showToast && showToast("error", "Logout failed");
            }
          }}
          className="w-full px-4 py-3 bg-rose-700 text-white rounded-lg font-semibold hover:bg-rose-600 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );

  // --- Mobile header ---
  const renderMobileHeader = () => (
    <header className="lg:hidden sticky top-0 z-40 bg-neutral-900/95 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
      <span className="font-bold text-lg text-white">Admin</span>
      <button
        className="text-2xl text-white"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>
    </header>
  );

  // --- Mobile tab selector ---
  const renderMobileTabSelector = () => (
    <div className="block lg:hidden mb-4">
      <select
        value={selectedTab}
        onChange={(e) => setSelectedTab(e.target.value)}
        className="w-full p-2 rounded-md border border-neutral-700 bg-neutral-800 text-neutral-100"
        aria-label="Select admin section"
      >
        {tabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
      </select>
    </div>
  );

  // --- Loading/auth states ---
  if (currentProfile === undefined)
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-neutral-200">
        <div className="text-center">
          <div className="inline-block animate-pulse bg-gradient-to-r from-blue-800 via-neutral-700 to-rose-700 rounded-full h-4 w-44 mb-4" />
          <div className="tracking-widest text-xl">Authenticating Admin...</div>
        </div>
      </div>
    );
  if (currentProfile === null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-rose-400 text-3xl">
        <span>Access Denied 🚫</span>
      </div>
    );

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {renderMobileHeader()}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute inset-y-0 left-0 w-64 bg-neutral-900 shadow-lg" onClick={e => e.stopPropagation()}>
            {renderSidebar()}
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto">
        {/* Sidebar desktop */}
        <div className="hidden lg:block lg:w-64">{renderSidebar()}</div>
        {/* Main content */}
        <main className="flex-1 px-2 sm:px-4 md:px-8 pt-16 lg:pt-6 pb-8">
          {renderMobileTabSelector()}
          {/* --- Overview --- */}
          {selectedTab === "overview" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <div className="rounded-xl p-4 flex flex-col items-start gap-2 shadow-sm bg-blue-900 text-blue-100">
                  <span className="text-2xl">👥</span>
                  <span className="text-base font-semibold">Total Users</span>
                  <span className="text-2xl font-bold">{metrics.totalUsers}</span>
                </div>
                <div className="rounded-xl p-4 flex flex-col items-start gap-2 shadow-sm bg-green-900 text-green-100">
                  <span className="text-2xl">💰</span>
                  <span className="text-base font-semibold">Investments</span>
                  <span className="text-2xl font-bold">{investments.length}</span>
                </div>
                <div className="rounded-xl p-4 flex flex-col items-start gap-2 shadow-sm bg-yellow-800 text-yellow-100">
                  <span className="text-2xl">🔄</span>
                  <span className="text-base font-semibold">Pending Withdrawals</span>
                  <span className="text-2xl font-bold">{metrics.pendingWd}</span>
                </div>
                <div className="rounded-xl p-4 flex flex-col items-start gap-2 shadow-sm bg-purple-900 text-purple-100">
                  <span className="text-2xl">📈</span>
                  <span className="text-base font-semibold">Total Invested</span>
                  <span className="text-2xl font-bold">${metrics.totalInvestmentsSum.toLocaleString()}</span>
                </div>
              </div>
              <section className="rounded-xl bg-neutral-900 p-4 sm:p-6 shadow border border-neutral-800">
                <h3 className="text-lg font-bold mb-4 text-white">Recent Activity</h3>
                <ul className="space-y-3 max-h-60 overflow-auto">
                  {activityLogs.length === 0
                    ? <li className="text-neutral-400">No recent activity.</li>
                    : activityLogs.slice(0, 8).map(log => (
                      <li key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-neutral-800 overflow-x-auto">
                        <span className="font-semibold text-blue-300 truncate max-w-[8rem]">{getUserById(log.user_id).name || "Unknown"}</span>
                        <span className="text-neutral-200 truncate max-w-[12rem]">{log.description}</span>
                        <span className="ml-auto text-xs text-neutral-400 truncate max-w-[8rem]">{log.created_at && new Date(log.created_at).toLocaleString()}</span>
                      </li>
                    ))}
                </ul>
              </section>
            </>
          )}
          {/* --- Investments Table --- */}
          {selectedTab === "investments" && (
            <section className="rounded-xl bg-neutral-900 p-4 sm:p-6 shadow border border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h3 className="text-lg font-bold text-green-100">All Investments</h3>
                <span className="text-sm text-neutral-400">{investments.length} rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[480px] w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-800">
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">User</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Coin</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Amount</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Status</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Time</th>
                      <th className="py-2 px-3 text-right font-semibold text-neutral-300 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.length === 0
                      ? <tr><td colSpan={6} className="py-6 text-center text-neutral-400">No investments found.</td></tr>
                      : investments.map(inv => {
                        const invUser = getUserById(inv.user_id);
                        return (
                          <tr key={inv.id} className="hover:bg-neutral-850">
                            <td className="py-2 px-3 truncate max-w-[10rem]">{invUser?.name || invUser?.email || "Unknown"}</td>
                            <td className="py-2 px-3 truncate max-w-[7rem]">{inv.coin?.toUpperCase()}</td>
                            <td className="py-2 px-3 truncate max-w-[7rem]">{inv.amount}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${String(inv.status).toLowerCase() === "pending" ? "bg-yellow-700 text-yellow-100" : "bg-green-700 text-green-100"}`}>
                                {inv.status?.charAt(0).toUpperCase() + (inv.status?.slice(1) || "")}
                              </span>
                            </td>
                            <td className="py-2 px-3 truncate max-w-[10rem]">{inv.created_at && new Date(inv.created_at).toLocaleString()}</td>
                            <td className="py-2 px-3 text-right">
                              {String(inv.status).toLowerCase() === "pending"
                                ? <button onClick={() => approveInvestment(inv.id)} className="px-3 py-2 rounded bg-green-700 text-white font-bold hover:bg-green-800 text-xs">Approve</button>
                                : <span className="text-xs text-green-200 font-bold">Approved</span>}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {/* --- Withdrawals Table --- */}
          {selectedTab === "withdrawals" && (
            <section className="rounded-xl bg-neutral-900 p-4 sm:p-6 shadow border border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h3 className="text-lg font-bold text-yellow-100">All Withdrawals</h3>
                <span className="text-sm text-neutral-400">{withdrawals.length} rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[480px] w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-800">
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">User</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Coin</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Amount</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Status</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Time</th>
                      <th className="py-2 px-3 text-right font-semibold text-neutral-300 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.length === 0
                      ? <tr><td colSpan={6} className="py-6 text-center text-neutral-400">No withdrawals found.</td></tr>
                      : withdrawals.map(wd => {
                        const wdUser = getUserById(wd.user_id);
                        return (
                          <tr key={wd.id} className="hover:bg-neutral-850">
                            <td className="py-2 px-3 truncate max-w-[10rem]">{wdUser?.name || wdUser?.email || "Unknown"}</td>
                            <td className="py-2 px-3 truncate max-w-[7rem]">{wd.coin?.toUpperCase()}</td>
                            <td className="py-2 px-3 truncate max-w-[7rem]">{wd.amount}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${String(wd.status).toLowerCase() === "pending" ? "bg-yellow-700 text-yellow-100" : "bg-green-700 text-green-100"}`}>
                                {wd.status?.charAt(0).toUpperCase() + (wd.status?.slice(1) || "")}
                              </span>
                            </td>
                            <td className="py-2 px-3 truncate max-w-[10rem]">{wd.created_at && new Date(wd.created_at).toLocaleString()}</td>
                            <td className="py-2 px-3 text-right">
                              {String(wd.status).toLowerCase() === "pending"
                                ? <button onClick={() => approveWithdrawal(wd.id)} className="px-3 py-2 rounded bg-green-700 text-white font-bold hover:bg-green-800 text-xs">Approve</button>
                                : <span className="text-xs text-green-200 font-bold">Approved</span>}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {/* --- Users Table --- */}
          {selectedTab === "users" && (
            <section className="rounded-xl bg-neutral-900 p-4 sm:p-6 shadow border border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h3 className="text-lg font-bold text-blue-100">Registered Users</h3>
                <span className="text-sm text-neutral-400">{users.length} rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[520px] w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-800">
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Name</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Email</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Password</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Admin?</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Created At</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Investments</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Manual Profit</th>
                      <th className="py-2 px-3 text-right font-semibold text-neutral-300 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0
                      ? <tr><td colSpan={8} className="py-6 text-center text-neutral-400">No users found.</td></tr>
                      : users.map(u => (
                        <tr key={u.id} className="hover:bg-neutral-850">
                          <td className="py-2 px-3 truncate max-w-[10rem]">{u.name}</td>
                          <td className="py-2 px-3 truncate max-w-[12rem]">{u.email}</td>
                          <td className="py-2 px-3 truncate max-w-[10rem] text-rose-300 font-mono">{u.password || "—"}</td>
                          <td className="py-2 px-3">{u.is_admin ? "Yes" : "No"}</td>
                          <td className="py-2 px-3 truncate max-w-[10rem]">
                            {u.created_at && new Date(u.created_at).toLocaleString()}
                          </td>
                          <td className="py-2 px-3">
                            {investments.filter(i => i.user_id === u.id).length}
                          </td>
                          {/* MANUAL INTEREST FEATURE */}
                          <td className="py-2 px-3">
                            {editingUserInterestId === u.id ? (
                              <form
                                onSubmit={e => {
                                  e.preventDefault();
                                  handleSaveInterest(u.id);
                                }}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Profit"
                                  value={interestEditValue}
                                  onChange={e => setInterestEditValue(e.target.value)}
                                  className="w-20 p-1 rounded bg-neutral-800 border border-neutral-600 text-white"
                                />
                                <button
                                  type="submit"
                                  className="px-2 py-1 rounded bg-green-700 text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUserInterestId(null);
                                    setInterestEditValue("");
                                  }}
                                  className="px-2 py-1 rounded bg-neutral-600 text-xs"
                                >
                                  Cancel
                                </button>
                              </form>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>
                                  {u.manual_interest !== null && u.manual_interest !== undefined
                                    ? Number(u.manual_interest).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                    : <span className="text-neutral-400">Auto (5%)</span>
                                  }
                                </span>
                                <button
                                  className="px-2 py-1 rounded bg-blue-700 text-white text-xs"
                                  onClick={() => {
                                    setEditingUserInterestId(u.id);
                                    setInterestEditValue(
                                      u.manual_interest !== null && u.manual_interest !== undefined
                                        ? String(u.manual_interest)
                                        : ""
                                    );
                                  }}
                                >
                                  Edit
                                </button>
                                {u.manual_interest !== null && u.manual_interest !== undefined && (
                                  <button
                                    className="px-2 py-1 rounded bg-rose-700 text-white text-xs"
                                    title="Reset to Auto-calculated"
                                    onClick={() => {
                                      setInterestEditValue("");
                                      setEditingUserInterestId(u.id);
                                      handleSaveInterest(u.id);
                                    }}
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          {/* END MANUAL INTEREST FEATURE */}
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="px-3 py-2 rounded bg-rose-700 text-white font-bold hover:bg-rose-800 text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {/* --- Deposit Addresses --- */}
          {selectedTab === "addresses" && (
            <section className="rounded-xl bg-neutral-900 p-4 sm:p-6 shadow border border-neutral-800">
              <h3 className="text-lg font-bold mb-4 text-blue-100">Deposit Addresses</h3>
              {!editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-neutral-800 border border-neutral-700">
                    <div className="text-md font-bold text-blue-200">BTC</div>
                    <div className="mt-2 text-md break-all text-neutral-100">{editAddresses.btc || "—"}</div>
                  </div>
                  <div className="p-4 rounded-md bg-neutral-800 border border-neutral-700">
                    <div className="text-md font-bold text-blue-200">ETH (ERC20)</div>
                    <div className="mt-2 text-md break-all text-neutral-100">{editAddresses.eth || "—"}</div>
                  </div>
                  <div className="p-4 rounded-md bg-neutral-800 border border-neutral-700">
                    <div className="text-md font-bold text-yellow-200">USDT (BEP20)</div>
                    <div className="mt-2 text-md break-all text-neutral-100">{editAddresses.usdt_bep20 || "—"}</div>
                  </div>
                  <div className="p-4 rounded-md bg-neutral-800 border border-neutral-700">
                    <div className="text-md font-bold text-yellow-200">USDT (TRC20)</div>
                    <div className="mt-2 text-md break-all text-neutral-100">{editAddresses.usdt_trc20 || "—"}</div>
                  </div>
                  <div className="col-span-full flex gap-2 mt-4">
                    <button onClick={() => setEditMode(true)} className="px-6 py-3 rounded-md bg-blue-700 text-white font-bold hover:bg-blue-800">Edit</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={saveAddresses} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" className="p-3 rounded-md bg-neutral-800 text-neutral-100 border border-neutral-700 focus:outline-none focus:ring focus:ring-blue-700" placeholder="BTC address" value={editAddresses.btc} onChange={(e) => setEditAddresses((p) => ({ ...p, btc: e.target.value }))} />
                    <input type="text" className="p-3 rounded-md bg-neutral-800 text-neutral-100 border border-neutral-700 focus:outline-none focus:ring focus:ring-blue-700" placeholder="ETH (ERC20)" value={editAddresses.eth} onChange={(e) => setEditAddresses((p) => ({ ...p, eth: e.target.value }))} />
                    <input type="text" className="p-3 rounded-md bg-neutral-800 text-neutral-100 border border-neutral-700 focus:outline-none focus:ring focus:ring-yellow-700" placeholder="USDT (BEP20)" value={editAddresses.usdt_bep20} onChange={(e) => setEditAddresses((p) => ({ ...p, usdt_bep20: e.target.value }))} />
                    <input type="text" className="p-3 rounded-md bg-neutral-800 text-neutral-100 border border-neutral-700 focus:outline-none focus:ring focus:ring-yellow-700" placeholder="USDT (TRC20)" value={editAddresses.usdt_trc20} onChange={(e) => setEditAddresses((p) => ({ ...p, usdt_trc20: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-3 rounded-md bg-green-700 text-white font-bold hover:bg-green-800">Save</button>
                    <button type="button" onClick={() => setEditMode(false)} className="px-6 py-3 rounded-md bg-neutral-700 text-white font-bold hover:bg-neutral-800">Cancel</button>
                  </div>
                </form>
              )}
            </section>
          )}
          {/* --- Activity Table --- */}
          {selectedTab === "activity" && (
            <section className="rounded-xl bg-neutral-900 p-4 sm:p-6 shadow border border-neutral-800">
              <h3 className="text-lg font-bold mb-4 text-purple-100">User Activity Logs</h3>
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-800">
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">User</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Activity</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">IP</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Country</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Region</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">City</th>
                      <th className="py-2 px-3 text-left font-semibold text-neutral-300 whitespace-nowrap">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.length === 0
                      ? <tr><td colSpan={7} className="py-6 text-center text-neutral-400">No recent activity found.</td></tr>
                      : activityLogs.map(log => {
                        const logUser = getUserById(log.user_id);
                        return (
                          <tr key={log.id} className="hover:bg-neutral-850">
                            <td className="py-2 px-3 font-bold truncate max-w-[10rem]">{logUser?.name || "Unknown"}</td>
                            <td className="py-2 px-3 truncate max-w-[12rem]">{log.description}</td>
                            <td className="py-2 px-3 truncate max-w-[8rem]">{log.ip}</td>
                            <td className="py-2 px-3 truncate max-w-[8rem]">{log.country}</td>
                            <td className="py-2 px-3 truncate max-w-[8rem]">{log.region}</td>
                            <td className="py-2 px-3 truncate max-w-[8rem]">{log.city}</td>
                            <td className="py-2 px-3 truncate max-w-[12rem]">{log.created_at && new Date(log.created_at).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}