"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { headerData } from "../Header/Navigation/menuData";
import Logo from "./Logo";
import HeaderLink from "../Header/Navigation/HeaderLink";
import MobileHeaderLink from "../Header/Navigation/MobileHeaderLink";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react/dist/iconify.js";

import AuthModal from "@/components/Auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";

const Header: React.FC = () => {
  const pathUrl = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const { user, loading: authLoading } = useAuth();

  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);

  // modal state
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  // profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const navbarRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    setSticky(window.scrollY >= 80);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false);
    }
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navbarOpen, menuRef.current]);

  useEffect(() => {
    if (navbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [navbarOpen]);

  // navigate to profile
  const goToDashboard = () => {
    setMenuOpen(false);
    router.push("/profile");
  };

  const signOut = async () => {
    setMenuOpen(false);
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
    // fallback to supabase client signOut if you prefer
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    router.push("/");
  };

  const avatarLetter = user?.email?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <>
      <header
        className={`fixed top-0 z-40 w-full pb-5 transition-all duration-300 ${
          sticky ? "shadow-lg bg-darkmode pt-5" : "shadow-none md:pt-14 pt-5"
        }`}
      >
        <div className="lg:py-0 py-2">
          <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md flex items-center justify-between px-4">
            <Logo />

            {/* Desktop navigation */}
            <nav className="hidden lg:flex flex-grow items-center gap-8 justify-center">
              {headerData.map((item, index) => (
                <HeaderLink key={index} item={item} />
              ))}
            </nav>

            {/* Buttons + Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              {!authLoading && user ? (
                // Profile avatar + dropdown
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((s) => !s)}
                    className="hidden lg:flex items-center gap-3 bg-transparent border border-transparent px-3 py-1 rounded-md hover:bg-slate-800"
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-darkmode font-semibold">
                      {avatarLetter}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">
                        {user.user_metadata?.full_name ?? "User"}
                      </div>
                      <div className="text-xs text-midnight_text">{user.email}</div>
                    </div>
                    <span className="ml-2 text-midnight_text">▾</span>
                  </button>

                  {/* Dropdown menu */}
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-darkmode border border-midnight_text rounded-lg shadow-lg overflow-hidden z-50">
                      <div className="p-4 border-b border-midnight_text">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-darkmode font-semibold">
                            {avatarLetter}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-white">
                              {user.user_metadata?.full_name ?? "User"}
                            </div>
                            <div className="text-xs text-midnight_text">{user.email}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={goToDashboard}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800"
                        >
                          Dashboard
                        </button>
                        <Link href="/profile" className="block px-3 py-2 rounded-md hover:bg-slate-800">
                          View Profile
                        </Link>
                        <button
                          onClick={signOut}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 text-red-400"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Not logged-in: show Sign In / Sign Up
                <>
                  <button
                    onClick={() => {
                      setAuthView("login");
                      setAuthOpen(true);
                    }}
                    className="hidden lg:block bg-transparent text-primary border hover:bg-primary border-primary hover:text-darkmode px-4 py-2 rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthView("signup");
                      setAuthOpen(true);
                    }}
                    className="hidden lg:block bg-primary text-darkmode hover:bg-transparent hover:text-primary border border-primary px-4 py-2 rounded-lg"
                  >
                    Sign Up
                  </button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setNavbarOpen(!navbarOpen)}
                className="block lg:hidden p-2 rounded-lg"
                aria-label="Toggle mobile menu"
              >
                <span className="block w-6 h-0.5 bg-white"></span>
                <span className="block w-6 h-0.5 bg-white mt-1.5"></span>
                <span className="block w-6 h-0.5 bg-white mt-1.5"></span>
              </button>
            </div>
          </div>

          {/* Overlay */}
          {navbarOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40" />
          )}

          {/* Mobile Menu */}
          <div
            ref={mobileMenuRef}
            className={`lg:hidden fixed top-0 right-0 h-full w-full bg-darkmode shadow-lg transform transition-transform duration-300 max-w-xs ${
              navbarOpen ? "translate-x-0" : "translate-x-full"
            } z-50`}
          >
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-bold text-midnight_text dark:text-midnight_text">
                <Logo />
              </h2>
              <button
                onClick={() => setNavbarOpen(false)}
                className="bg-[url('/images/closed.svg')] bg-no-repeat bg-contain w-5 h-5 absolute top-0 right-0 mr-8 mt-8 "
                aria-label="Close menu Modal"
              ></button>
            </div>

            <nav className="flex flex-col items-start p-4">
              {headerData.map((item, index) => (
                <MobileHeaderLink key={index} item={item} />
              ))}
              <div className="mt-4 flex flex-col space-y-4 w-full">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setNavbarOpen(false);
                        router.push("/profile");
                      }}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const { supabase } = await import("@/lib/supabaseClient");
                          await supabase.auth.signOut();
                        } catch {}
                        router.push("/");
                      }}
                      className="bg-transparent border border-primary text-primary px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setAuthView("login");
                        setAuthOpen(true);
                        setNavbarOpen(false);
                      }}
                      className="bg-transparent border border-primary text-primary px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setAuthView("signup");
                        setAuthOpen(true);
                        setNavbarOpen(false);
                      }}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Modal placed here so it can be opened from header */}
      <AuthModal open={authOpen} initialView={authView} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;