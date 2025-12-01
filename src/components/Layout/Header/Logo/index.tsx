"use client";

import { getImagePrefix } from "@/utils/utils";
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      style={{
        display: "inline-block",
        
        transition: "transform 0.4s ease, scale 0.4s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "rotate(0deg) scale(1.05)";
        e.currentTarget.style.filter = "drop-shadow(0 0 6px #00d4ff)";
      }}
      onMouseLeave={(e) => {
        
        e.currentTarget.style.filter = "none";
      }}
    >
      <Image
        src={`${getImagePrefix()}images/logo/logo-88256519050c5e84fcbd2120a81b209724ad.svg`}
        alt="river  Logo"
        width={167}
        height={60}
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "140px",
        }}
        priority
      />
      <style jsx>{`
        @media (max-width: 768px) {
          img {
            max-width: 100px;
          }
        }
        @media (max-width: 480px) {
          img {
            max-width: 80px;
          }
        }
      `}</style>
    </Link>
  );
}
