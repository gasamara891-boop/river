"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SIM_COUNTRIES = [
  "Japan", "Canada", "Europe", "USA", "Brazil", "Germany", "India",
  "South Africa", "Italy", "France", "Russia", "Australia", "Mexico", "Turkey", "China", "UK"
];

const SIM_COINS = ["BTC", "ETH", "USDT"];

function getRandomSimAlert() {
  const country = SIM_COUNTRIES[Math.floor(Math.random() * SIM_COUNTRIES.length)];
  const coin = SIM_COINS[Math.floor(Math.random() * SIM_COINS.length)];
  const type = Math.random() > 0.5 ? "deposit" : "withdrawal";

  let amount;
  if (coin === "BTC") amount = (Math.random() * 2 + 0.1).toFixed(3);
  else if (coin === "ETH") amount = (Math.random() * 10 + 0.5).toFixed(2);
  else amount = (Math.random() * 5000 + 100).toFixed(0); // USDT

  const message =
    type === "deposit"
      ? `💰 Someone from ${country} just deposited ${amount} ${coin}`
      : `🔻 Someone from ${country} just withdrew ${amount} ${coin}`;

  return { message, type };
}

export default function SimulatedAlertBubble() {
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = getRandomSimAlert();
      setAlert(newAlert);

      // Auto-hide after 5 seconds
      const timeout = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timeout);
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert.message}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.4)] border border-cyan-400/40 text-sm flex items-center gap-2 max-w-xs backdrop-blur-md ${
            alert.type === "deposit"
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20"
              : "bg-gradient-to-r from-purple-500/20 to-pink-600/20"
          } text-cyan-200`}
        >
          <span className="text-lg">
            {alert.type === "deposit" ? "💰" : "🔻"}
          </span>
          <p>{alert.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
