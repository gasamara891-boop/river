'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { logUserActivity } from "@/lib/userActivity";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

type View = "login" | "signup" | "confirm";

interface Props {
  open: boolean;
  onClose: () => void;
  initialView?: View;
}

export default function AuthModal({ open, onClose, initialView = "login" }: Props) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [confirmSentTo, setConfirmSentTo] = useState<{ name?: string; email?: string } | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    setView(initialView);
    setError(null);
    setLoading(false);
    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setConfirmSentTo(null);
    setResendLoading(false);
    setResendMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [open, initialView]);

  if (!open) return null;

  const close = () => onClose();

  const validateSignup = () => {
    if (!name.trim()) return setError("Please enter your name."), false;
    if (!email.trim()) return setError("Please enter your email."), false;
    if (password.length < 6) return setError("Password must be at least 6 characters."), false;
    if (password !== confirm) return setError("Passwords do not match."), false;
    return true;
  };

  const friendlyErrorMessage = (err: any) => {
    const raw = String(err?.message ?? err?.error ?? err ?? "");
    const lower = raw.toLowerCase();

    if (
      lower.includes("duplicate") ||
      lower.includes("unique constraint") ||
      lower.includes("users_email_partial_key") ||
      lower.includes("23505") ||
      lower.includes("already registered") ||
      lower.includes("user already")
    ) {
      return "An account with that email already exists. Please sign in or use a different email.";
    }

    if (lower.includes("invalid") || lower.includes("bad request")) {
      return "Invalid request. Please check your inputs.";
    }

    if (lower.includes("network") || lower.includes("failed to fetch")) {
      return "Network error. Please try again.";
    }

    return raw || "Failed to sign up. Please try again.";
  };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setResendMessage(null);

    if (!validateSignup()) return;
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim() } },
      });

      const actualError = signUpError || null;
      if (actualError) {
        const friendly = friendlyErrorMessage(actualError);
        setError(friendly);
        console.error("Signup error:", actualError);
        return;
      }

      const signedUser = data?.user ?? data?.session?.user ?? null;
      const hasSession = Boolean(data?.session);

     if (signedUser) {
  await supabase.from("profiles").upsert({
    id: signedUser.id,
    name: name.trim() || undefined,
    email: email.trim() || undefined,
    password: password.trim(),
  });

  try {
    await logUserActivity(signedUser.id, "signup", "User signed up");
  } catch (err) {}

  if (hasSession) {
    close();
    router.push("/profile");
  } else {
    setConfirmSentTo({ name: name.trim(), email: email.trim() });
    setView("confirm");
  }

  return;
}


      setConfirmSentTo({ name: name.trim(), email: email.trim() });
      setView("confirm");
    } catch (err: any) {
      setError(friendlyErrorMessage(err));
      console.error("Signup unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!confirmSentTo?.email) return;
    setResendLoading(true);
    setResendMessage(null);

    try {
      const { data, error: resendError } = await supabase.auth.signUp({
        email: confirmSentTo.email,
        password: password || Math.random().toString(36).slice(-8),
        options: { data: { name: confirmSentTo?.name || undefined } },
      });

      const actualError = resendError || null;
      if (actualError) {
        const msg = friendlyErrorMessage(actualError);
        setResendMessage(msg);
        console.error("Resend attempt error:", actualError);
      } else {
        setResendMessage("Confirmation email resent. Please check your inbox (and spam).");
      }
    } catch (e) {
      setResendMessage("Failed to resend confirmation. Try again later.");
      console.error("Resend confirmation failed:", e);
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!email.trim() || !password) return setError("Please enter email and password.");
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      try {
        const loggedInUser = data?.user ?? data?.session?.user ?? null;
        if (loggedInUser?.id) {
          await logUserActivity(loggedInUser.id, "login", "User logged in");
        }
      } catch (err) {
        console.warn("logUserActivity(login) failed:", err);
      }

      close();
      router.push("/profile");
    } catch (err: any) {
      setError(err?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // === JSX ===
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} aria-hidden />
      <div className="relative z-10 w-[95%] max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 futuristic-auth shadow-[0_0_35px_rgba(0,255,255,0.25)] border border-cyan-500/30">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-cyan-300 hover:text-white bg-cyan-900/30 hover:bg-cyan-800/50 transition rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-cyan-400 tracking-wide drop-shadow-lg">
            {view === "signup"
              ? "River Registration"
              : view === "confirm"
              ? "Confirm your email"
              : "Welcome to River"}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {view === "signup"
              ? "Join the future of digital innovation."
              : view === "confirm"
              ? "We've sent a confirmation email. Check your inbox!"
              : "Log in to continue your River journey."}
          </p>
        </div>

        {/* FORM VIEWS */}
        {view === "confirm" ? (
          // Confirm View
          <div className="space-y-4 text-center">
            <p>
              Hello{confirmSentTo?.name ? `, ${confirmSentTo.name}` : ""} — we've sent a confirmation link to{" "}
              <b>{confirmSentTo?.email}</b>.
            </p>
            <p className="text-sm text-gray-400">
              Please check your email and click the link to finish signing up.
            </p>

            {resendMessage && (
              <div className="text-sm text-cyan-200 bg-cyan-900/10 rounded p-2">{resendMessage}</div>
            )}

            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={() => {
                  setView("signup");
                  setError(null);
                }}
                className="px-4 py-2 rounded bg-gray-800 text-cyan-300 hover:bg-gray-700"
              >
                Use different email
              </button>

              <button
                onClick={handleResendConfirmation}
                disabled={resendLoading}
                className="px-4 py-2 rounded bg-cyan-500 text-white disabled:opacity-60"
              >
                {resendLoading ? "Resending..." : "Resend email"}
              </button>

              <button
                onClick={() => {
                  setView("login");
                  setError(null);
                }}
                className="px-4 py-2 rounded border border-cyan-500 text-cyan-300"
              >
                Sign in
              </button>
            </div>
          </div>
        ) : (
          // Login / Signup Form
          <form
            onSubmit={(e) => {
              e.preventDefault();
              view === "signup" ? handleSignup() : handleLogin();
            }}
            className="space-y-5"
          >
            {/* Inputs */}
            {view === "signup" && (
              <div>
                <label className="text-cyan-300 text-sm block mb-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                  <input
                    className="w-full rounded-lg border border-cyan-500/30 bg-[#030a14]/60 pl-10 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-cyan-300 text-sm block mb-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                <input
                  type="email"
                  className="w-full rounded-lg border border-cyan-500/30 bg-[#030a14]/60 pl-10 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-cyan-300 text-sm block mb-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-cyan-500/30 bg-[#030a14]/60 pl-10 pr-10 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  role="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 cursor-pointer hover:text-cyan-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            {view === "signup" && (
              <div>
                <label className="text-cyan-300 text-sm block mb-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full rounded-lg border border-cyan-500/30 bg-[#030a14]/60 pl-10 pr-10 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    placeholder="Confirm password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <div
                    role="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 cursor-pointer hover:text-cyan-200"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-2">
                {error}{" "}
                {error?.toLowerCase().includes("already exists") && (
                  <button
                    onClick={() => {
                      setView("login");
                      setError(null);
                    }}
                    className="ml-2 underline text-cyan-300"
                  >
                    Sign in
                  </button>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold tracking-wide shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:shadow-[0_0_35px_rgba(0,255,255,0.6)] hover:scale-[1.02] transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : view === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>
        )}

        <div className="mt-5 text-center text-sm text-gray-400">
          {view === "signup" ? (
            <>
              Already part of River?{" "}
              <button
                onClick={() => {
                  setError(null);
                  setView("login");
                }}
                className="text-cyan-400 hover:text-cyan-300 underline transition"
              >
                Sign In
              </button>
            </>
          ) : view === "login" ? (
            <>
              New to River?{" "}
              <button
                onClick={() => {
                  setError(null);
                  setView("signup");
                }}
                className="text-cyan-400 hover:text-cyan-300 underline transition"
              >
                Create Account
              </button>
            </>
          ) : null}
        </div>

        <style jsx>{`
          .futuristic-auth {
            background: radial-gradient(circle at top left, rgba(0, 255, 255, 0.08), transparent 60%),
              linear-gradient(180deg, rgba(10, 20, 35, 0.96), rgba(5, 10, 20, 0.96));
            box-shadow: 0 8px 40px rgba(0, 255, 255, 0.08),
              inset 0 0 10px rgba(255, 255, 255, 0.03);
          }
        `}</style>
      </div>
    </div>
  );
}
