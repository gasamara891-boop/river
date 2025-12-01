"use client";

import React from "react";
import AdminRedirect from "@/components/AdminRedirect/AdminRedirect";

/**
 * ClientProviders
 * Wraps all client-only helpers.
 * - AdminRedirect: ensures admins are redirected properly
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminRedirect />
      {children}
    </>
  );
}
