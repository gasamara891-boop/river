"use client";

import React from "react";
import AdminDashboard from "@/components/AdminDashboard/AdminDashboard";

/**
 * Admin page route for the App Router.
 * Renders the client-side AdminDashboard component at /admin.
 *
 * Drop this file at: app/admin/page.tsx
 */
export default function AdminPage() {
  return <AdminDashboard />;
}