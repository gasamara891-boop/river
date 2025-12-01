"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

type Props = {
  children: React.ReactNode;
  
  hideRoutes?: string[];
};

const DEFAULT_HIDE_ROUTES = ["/profile", "/admin"];


function matchesPattern(pathname: string, pattern: string) {
  if (!pattern) return false;

  // normalize: remove trailing slash except for root "/"
  const normalizedPattern = pattern === "/" ? "/" : pattern.replace(/\/+$/, "");
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  // wildcard style: "/foo/*"
  if (normalizedPattern.endsWith("/*")) {
    const prefix = normalizedPattern.slice(0, -2);
    return normalizedPath === prefix || normalizedPath.startsWith(prefix + "/");
  }

  // prefix style: treat "/foo" as prefix to hide "/foo" and "/foo/..."
  if (normalizedPath === normalizedPattern) return true;
  return normalizedPath.startsWith(normalizedPattern + "/");
}

export default function ConditionalLayout({ children, hideRoutes }: Props) {
  const pathname = usePathname() ?? "/";
  const patterns = hideRoutes && hideRoutes.length > 0 ? hideRoutes : DEFAULT_HIDE_ROUTES;

  const shouldHide = patterns.some((p) => matchesPattern(pathname, p));

  return (
    <>
      {!shouldHide && <Header />}
      <div>{children}</div>
      {!shouldHide && <Footer />}
    </>
  );
}