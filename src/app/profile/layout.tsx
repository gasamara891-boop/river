// src/app/profile/layout.tsx
import React from "react";

export const metadata = {
  title: "User Dashboard | River Investment",
  description: "Manage your investments and track profits on River Portal.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-darkmode text-white min-h-screen">
      {children}
    </div>
  );
}
