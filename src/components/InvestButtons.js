
import React from "react";
import { useUser } from "@supabase/auth-helpers-react"; // ✅ checks user auth state

export default function InvestButtons({
  setShowInvestModal,
  setAuthOpen,
  setAuthView,
  // optional: if you want to track which pair the user clicked
  setSelectedPair,
}) {
  const { user } = useUser();

  const handleInvestClick = (pair) => {
    if (user) {
      if (typeof setSelectedPair === "function") setSelectedPair(pair);
      setShowInvestModal(true);
    } else {
      setAuthView("login");
      setAuthOpen(true);
    }
  };

  return (
    <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6">
      <button
        className="bg-primary border border-primary rounded-lg text-lg sm:text-xl font-medium hover:bg-transparent hover:text-primary text-darkmode py-3 px-8 w-full sm:w-auto text-center"
        onClick={() => handleInvestClick("USDT/BTC")}
        aria-label="Invest USDT/BTC"
      >
        USDT/BTC
      </button>

      <button
        className="bg-transparent border border-primary rounded-lg text-lg sm:text-xl font-medium hover:bg-primary hover:text-darkmode text-primary py-3 px-8 w-full sm:w-auto text-center"
        onClick={() => handleInvestClick("USDT/ETH")}
        aria-label="Invest USDT/ETH"
      >
        USDT/ETH
      </button>
    </div>
  );
}