"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Investment = {
  id?: string;
  amount: number;
  created_at?: string;
  status?: string;
  plan_id?: string | null;
  coin?: string | null;
  [k: string]: any;
};

type Props = {
  investments?: Investment[];
};

const chartColors = ["#00f5ff", "#ff4dd2", "#00ff95", "#ffd700", "#b366ff", "#ff6347"];

function formatTime(date: Date) {
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InvestmentGrowthChart({ investments = [] }: Props) {
  const successInvs = (investments || []).filter(
    (i) => String(i.status || "").toLowerCase() === "success"
  );

  const intervalRate = 0.05; // +5% daily (simulated)
  const INTERVAL_MS = 2000; // demo update every 2s

  const invKeys = successInvs.map((inv, idx) => ({
    key: `inv${idx + 1}`,
    name: inv.plan_id ? `${inv.plan_id}` : `Investment ${idx + 1}`,
    color: chartColors[idx % chartColors.length],
    initial: Number(inv.amount) || 0,
  }));

  const initialRow = (now: Date) => {
    const row: any = { time: formatTime(now) };
    invKeys.forEach((ik) => (row[ik.key] = ik.initial));
    return row;
  };

  const [chartData, setChartData] = useState<any[]>(() => [initialRow(new Date())]);
  const [currentValues, setCurrentValues] = useState<number[]>(() =>
    invKeys.map((ik) => ik.initial)
  );

  useEffect(() => {
    if (!invKeys.length) {
      setChartData([]);
      setCurrentValues([]);
      return;
    }

    const id = setInterval(() => {
      setCurrentValues((prev) =>
        prev.map((val) => Math.round(val * (1 + intervalRate) * 100) / 100)
      );

      setChartData((prev) => {
        const lastValues = prev.length ? prev[prev.length - 1] : initialRow(new Date());
        const newRow: any = { time: formatTime(new Date()) };

        invKeys.forEach((ik) => {
          const prevVal = Number(lastValues[ik.key] ?? ik.initial);
          newRow[ik.key] = Math.round(prevVal * (1 + intervalRate) * 100) / 100;
        });

        const maxPoints = 40;
        const next = [...prev, newRow];
        return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
      });
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [investments.length]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-md bg-slate-900/80 border border-cyan-500/60 text-cyan-100 p-2 rounded-lg shadow-lg">
          <div className="font-semibold text-sm">{label}</div>
          {payload.map((p: any, i: number) => (
            <div key={i} className="text-xs">
              <span style={{ color: p.stroke || p.color }}>{p.name}: </span>${p.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!invKeys.length) {
    return (
      <div className="p-6 text-center text-gray-400 bg-slate-800/50 rounded-xl border border-cyan-400/20">
        No successful investments yet to show growth.
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-black border border-cyan-500/20 rounded-2xl p-5 sm:p-8 shadow-[0_0_30px_rgba(0,255,255,0.15)] overflow-hidden">
      {/* Animated glow backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,255,0.1),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(255,0,128,0.1),transparent_60%)] animate-pulse-slow"></div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h4 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-md">
            Live Investment Growth
          </h4>
          <p className="text-sm text-gray-400">
            Interest: <span className="text-emerald-400 font-semibold">+5%</span> daily
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full h-[320px] sm:h-[360px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            {invKeys.map((inv) => (
              <Line
                key={inv.key}
                dataKey={inv.key}
                name={inv.name}
                stroke={inv.color}
                strokeWidth={2.5}
                dot={{ r: 2 }}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {invKeys.map((inv, idx) => (
          <div
            key={inv.key}
            className="flex items-center justify-between bg-slate-900/70 border border-slate-800 rounded-lg p-3 hover:border-cyan-400 transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ color: inv.color, background: inv.color }}
              />
              <span className="text-gray-300 truncate">{inv.name}</span>
            </div>
            <span className="font-semibold text-cyan-300">
              ${(currentValues[idx] ?? inv.initial).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
