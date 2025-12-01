"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileHeader() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3 bg-darkmode border border-midnight_text px-4 py-2 rounded-lg text-midnight_text"
        >
          <span className="text-lg">←</span>
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center overflow-hidden">
            <span className="text-darkmode font-semibold">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          <div>
            <div className="text-white font-semibold">{user?.user_metadata?.full_name ?? "User"}</div>
            <div className="text-midnight_text text-sm">{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}