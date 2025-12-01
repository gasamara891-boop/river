'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { logUserActivity } from "@/lib/userActivity";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

type View = "login" | "signup" | "confirm";
type FieldErrorType = {
  email?: string;
  password?: string;
  name?: string;
  confirm?: string;
  general?: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  initialView?: View;
}

export default function AuthModal({ open, onClose, initialView = "login" }: Props) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialView);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorType>({});
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
    setFieldErrors({});
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
    let valid = true;
    let errors: FieldErrorType = {};
    if (!name.trim()) {
      errors.name = "Please enter your name.";
      valid = false;
    }
    if (!email.trim()) {
      errors.email = "Please enter your email.";
      valid = false;
    }
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
      valid = false;
    }
    if (password !== confirm) {
      errors.confirm = "Passwords do not match.";
      valid = false;
    }
    setFieldErrors(errors);
    return valid;
  };

  const friendlyErrorMessage = (err: any): string => {
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
    if (lower.includes("invalid")) {
      if (lower.includes("email")) return "Please enter a valid email address.";
      if (lower.includes("password")) return "Password is invalid.";
      return "Invalid request. Please check your inputs.";
    }
    if (lower.includes("bad request")) {
      return "Invalid request. Please check your inputs.";
    }
    if (lower.includes("network") || lower.includes("failed to fetch")) {
      return "Network error. Please try again.";
    }
    return raw || "Failed to sign up. Please try again.";
  };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFieldErrors({});
    setResendMessage(null);
    if (!validateSignup()) return;
    setLoading(true);

    try {
     const { data, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name: name.trim() } },
});

// Email already exists (Supabase returns no identity instead of error)
if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
  setFieldErrors({
    email: "Email is already registered.",
  });
  setLoading(false);
  return;
}

if (signUpError) {
  const msg = friendlyErrorMessage(signUpError);
  if (msg.toLowerCase().includes("email"))
    setFieldErrors({ email: msg });
  else
    setFieldErrors({ general: msg });

  setLoading(false);
  return;
}


      // error handling
      if (signUpError) {
        const msg = friendlyErrorMessage(signUpError);
        if (msg.toLowerCase().includes("email")) setFieldErrors({ email: msg });
        else if (msg.toLowerCase().includes("password")) setFieldErrors({ password: msg });
        else setFieldErrors({ general: msg });
        setLoading(false);
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

        try { await logUserActivity(signedUser.id, "signup", "User signed up"); } catch (err) {}
        if (hasSession) {
          close();
          router.push("/profile");
        } else {
          setConfirmSentTo({ name: name.trim(), email: email.trim() });
          setView("confirm");
        }
        setLoading(false);
        return;
      }

      setConfirmSentTo({ name: name.trim(), email: email.trim() });
      setView("confirm");
    } catch (err: any) {
      setFieldErrors({ general: friendlyErrorMessage(err) });
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
        setResendMessage(friendlyErrorMessage(actualError));
      } else {
        setResendMessage("Confirmation email resent. Please check your inbox (and spam).");
      }
    } catch (e) {
      setResendMessage("Failed to resend confirmation. Try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFieldErrors({});
    let errors: FieldErrorType = {};
    if (!email.trim()) errors.email = "Please enter your email.";
    if (!password) errors.password = "Please enter your password.";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        const msg = friendlyErrorMessage(signInError);
        if (msg.toLowerCase().includes("email")) setFieldErrors({ email: msg });
        else if (msg.toLowerCase().includes("password")) setFieldErrors({ password: msg });
        else setFieldErrors({ general: msg });
        setLoading(false);
        return;
      }
      close();
      router.push("/profile");
    } catch (err: any) {
      setFieldErrors({ general: err?.message || "Failed to sign in" });
    } finally {
      setLoading(false);
    }
  };

  // --- UI ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#25252b] bg-opacity-85 backdrop-blur-sm" onClick={close} aria-hidden />
      <div className={`container ${view === "signup" ? "active" : ""}`}>
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>
        {/* LOGIN FORM */}
        {view !== "confirm" && (
          <>
          <div className="form-box Login">
            <h2 className="animation" style={{ ["--D" as any]: 0, ["--S" as any]: 21 }}>River</h2>
            <form id="loginForm" autoComplete="on" onSubmit={handleLogin}>
              <div className="input-box animation" style={{ ["--D" as any]: 1, ["--S" as any]: 22 }}>
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setFieldErrors(fe => ({ ...fe, email: undefined, general: undefined }));
                  }}
                  disabled={loading}
                />
                <label>Email</label>
                <span className="input-icon"><Mail size={18} /></span>
                {fieldErrors.email && <div className="error-message">{fieldErrors.email}</div>}
              </div>
              <div className="input-box animation" style={{ ["--D" as any]: 2, ["--S" as any]: 23 }}>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setFieldErrors(fe => ({ ...fe, password: undefined, general: undefined }));
                  }}
                  disabled={loading}
                />
                <label>Password</label>
                <span className="input-icon"><Lock size={18} /></span>
                <span
                  className="input-icon-eye"
                  onClick={() => setShowPassword(e => !e)}
                  role="button"
                  tabIndex={0}
                  aria-label="Show/hide password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
                {fieldErrors.password && <div className="error-message">{fieldErrors.password}</div>}
              </div>
              <div className="input-box animation" style={{ ["--D" as any]: 3, ["--S" as any]: 24 }}>
                <button className="btn" type="submit" disabled={loading}>
                  <span className="btn-text">{loading ? <span className="spinner-border"></span> : "Login"}</span>
                </button>
              </div>
              <div className="regi-link animation" style={{ ["--D" as any]: 4, ["--S" as any]: 25 }}>
                <p>
                  Don't have an account? <br />
                  <a href="#" className="SignUpLink" onClick={e => {e.preventDefault(); setView("signup"); setFieldErrors({});}}>Sign Up</a>
                </p>
              </div>
              {fieldErrors.general && <div className="error-message">{fieldErrors.general}</div>}
            </form>
          </div>
          <div className="info-content Login">
            <h2 className="animation" style={{ ["--D" as any]: 0, ["--S" as any]: 20 }}>WELCOME BACK!</h2>
            <p className="animation" style={{ ["--D" as any]: 1, ["--S" as any]: 21 }}>We are happy to have you with us again. If you need anything, we are here to help.</p>
          </div>
          <div className="form-box Register">
            <h2 className="animation" style={{ ["--li" as any]: 17, ["--S" as any]: 0 }}>Register on River</h2>
            <form id="signupForm" autoComplete="on" onSubmit={handleSignup}>
              <div className="input-box animation" style={{ ["--li" as any]: 18, ["--S" as any]: 1 }}>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    setFieldErrors(fe => ({ ...fe, name: undefined, general: undefined }));
                  }}
                  disabled={loading}
                />
                <label>Username</label>
                <span className="input-icon"><User size={18} /></span>
                {fieldErrors.name && <div className="error-message">{fieldErrors.name}</div>}
              </div>
              <div className="input-box animation" style={{ ["--li" as any]: 19, ["--S" as any]: 2 }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setFieldErrors(fe => ({ ...fe, email: undefined, general: undefined }));
                  }}
                  disabled={loading}
                />
                <label>Email</label>
                <span className="input-icon"><Mail size={18} /></span>
                {fieldErrors.email && <div className="error-message">{fieldErrors.email}</div>}
              </div>
              <div className="input-box animation" style={{ ["--li" as any]: 19, ["--S" as any]: 3 }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setFieldErrors(fe => ({ ...fe, password: undefined, general: undefined }));
                  }}
                  disabled={loading}
                />
                <label>Password</label>
                <span className="input-icon"><Lock size={18} /></span>
                <span
                  className="input-icon-eye"
                  onClick={() => setShowPassword(e => !e)}
                  role="button"
                  tabIndex={0}
                  aria-label="Show/hide password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
                {fieldErrors.password && <div className="error-message">{fieldErrors.password}</div>}
              </div>
              <div className="input-box animation" style={{ ["--li" as any]: 20, ["--S" as any]: 4 }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={e => {
                    setConfirm(e.target.value);
                    setFieldErrors(fe => ({ ...fe, confirm: undefined, general: undefined }));
                  }}
                  disabled={loading}
                />
                <label>Confirm Password</label>
                <span className="input-icon"><Lock size={18} /></span>
                <span
                  className="input-icon-eye"
                  onClick={() => setShowConfirmPassword(e => !e)}
                  role="button"
                  tabIndex={0}
                  aria-label="Show/hide password"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
                {fieldErrors.confirm && <div className="error-message">{fieldErrors.confirm}</div>}
              </div>
              <div className="input-box animation" style={{ ["--li" as any]: 21, ["--S" as any]: 5 }}>
                <button className="btn" type="submit" disabled={loading}>
                  <span className="btn-text">{loading ? <span className="spinner-border"></span> : "Register"}</span>
                </button>
              </div>
              <div className="regi-link animation" style={{ ["--li" as any]: 22, ["--S" as any]: 6 }}>
                <p>
                  Already have an account? <br />
                  <a href="#" className="SignInLink" onClick={e => {e.preventDefault(); setView("login"); setFieldErrors({});}}>Sign In</a>
                </p>
              </div>
              {fieldErrors.general && <div className="error-message">{fieldErrors.general}</div>}
            </form>
          </div>
          <div className="info-content Register">
            <h2 className="animation" style={{ ["--li" as any]: 17, ["--S" as any]: 0 }}>WELCOME!</h2>
            <p className="animation" style={{ ["--li" as any]: 18, ["--S" as any]: 1 }}>We’re delighted to have you here. If you need any assistance, feel free to reach out.</p>
          </div>
          </>
        )}
      
{/* Success overlay */}
{view === "confirm" && (
  <div className="custom-success-overlay">
    <div className="custom-success-card">
      <h2>🎉 Success!</h2>
      <div className="success-msg">
        Hello{confirmSentTo?.name ? `, ${confirmSentTo.name}` : ""} — we've sent a confirmation link to <b>{confirmSentTo?.email}</b>.<br />
        <span>Please check your email and click the link to finish signing up.</span>
      </div>
      <div className="success-bar">
        <div className="success-bar-inner" style={{ width: resendLoading ? "0" : "100%" }}></div>
      </div>
      {resendMessage && (
        <div className="mt-2 text-sm text-orange-300">{resendMessage}</div>
      )}
      {/* Responsive button grid */}
      <div className="success-actions">
        <button
          type="button"
          className="btn"
          onClick={() => { setView("signup"); setFieldErrors({}); }}
        >
          Use different email
        </button>
        <button
          type="button"
          className="btn"
          disabled={resendLoading}
          onClick={handleResendConfirmation}
        >
          {resendLoading ? <span className="spinner-border"></span> : "Resend email"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => { setView("login"); setFieldErrors({}); }}
        >
          Sign in
        </button>
      </div>
    </div>
  </div>
)}









        <style jsx>{`
          /* your previous container/modal styles */
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          .container {
            position: relative;
            max-width: 750px;
            width: 90%;
            height: 450px;
            border: 2px solid #e46033;
            box-shadow: 0 0 25px #e46033;
            overflow: hidden;
            background: none;
            font-family: 'Poppins', sans-serif;
          }
          .container .form-box {
            position: absolute;
            top: 0;
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            flex-direction: column;
          }
          .form-box.Login { left: 0; padding: 0 40px; }
          .form-box.Register { right: 0; padding: 0 60px; }
          .info-content {
            position: absolute;
            top: 0;
            height: 100%;
            width: 50%;
            display: flex;
            justify-content: center;
            flex-direction: column;
          }
          .info-content.Login {
            right: 0;
            text-align: right;
            padding: 0 40px 60px 150px;
          }
          .info-content.Register {
            left: 0;
            text-align: left;
            padding: 0 150px 60px 38px;
            pointer-events: none;
          }
          .container .curved-shape {
            position: absolute;
            right: 0;
            top: -5px;
            height: 100%;
            width: 80%;
            max-width: 850px;
            background: linear-gradient(45deg, #25252b, #e46033);
            transform: rotate(10deg) skewY(40deg);
            transform-origin: bottom right;
            transition: 1.5s ease;
            transition-delay: 1.6s;
            z-index: 0;
          }
          .container.active .curved-shape { transform: rotate(0deg) skewY(0deg); transition-delay: .5s; }
          .container .curved-shape2 {
            position: absolute;
            left: 200px; top: 100%;
            height: 100%;
            width: 80%;
            max-width: 850px;
            background: #25252b;
            border-top: 3px solid #e46033;
            transform: rotate(0deg) skewY(0deg);
            transform-origin: bottom left;
            transition: 1.5s ease;
            transition-delay: .5s;
            z-index: 0;
          }
          .container.active .curved-shape2 { transform: rotate(-11deg) skewY(-41deg); transition-delay: 1.2s; }
          .form-box h2 { font-size: 32px; text-align: center; }
          .form-box .input-box { position: relative; width: 100%; height: 50px; margin-top: 25px; }
          .input-box input {
            width: 100%; height: 100%;
            background: transparent; border: none; outline: none;
            font-size: 16px; color: #fff; font-weight: 600;
            border-bottom: 2px solid #fff;
            padding-right: 25px; transition: .5s;
          }
          .input-box input:focus,
          .input-box input:valid { border-bottom: 2px solid #e46033; }
          .input-box label {
            position: absolute; top: 50%; left: 0;
            transform: translateY(-50%); font-size: 16px; color: #fff;
            transition: .5s; pointer-events: none;
          }
          .input-box input:focus ~ label,
          .input-box input:valid ~ label { top: -5px; color: #e46033; }
          .input-icon { position: absolute; top: 50%; right: 6px; font-size: 18px; transform: translateY(-50%); color: #bbb; }
          .input-icon-eye { position: absolute; top: 50%; right: 30px; font-size: 18px; transform: translateY(-50%); color: #fff; cursor: pointer; transition: color .3s; }
          .input-icon-eye:hover { color: #e46033; }
          .btn { position: relative; width: 100%; height: 45px; background: transparent; border-radius: 40px; cursor: pointer; font-size: 16px; font-weight: 600; border: 2px solid #e46033; overflow: hidden; z-index: 1; color: #fff; }
          .btn-text { color: #fff; }
          .btn::before {
            content: "";
            position: absolute;
            height: 300%;
            width: 100%;
            background: linear-gradient(#25252b, #e46033, #25252b, #e46033);
            top: -100%;
            left: 0;
            z-index: -1;
            transition: .5s;
          }
          .btn:hover:before { top: 0; }
          .spinner-border {
            display: inline-block;
            width: 1.1em;
            height: 1.1em;
            vertical-align: sub;
            border: 0.16em solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: spinner-border .75s linear infinite;
          }
          @keyframes spinner-border { 100% { transform: rotate(360deg); } }
          .regi-link { font-size: 14px; text-align: center; margin: 20px 0 10px; }
          .regi-link a { text-decoration: none; color: #e46033; font-weight: 600; cursor: pointer; }
          .regi-link a:hover { text-decoration: underline; }
          .info-content h2 { text-transform: uppercase; font-size: 36px; line-height: 1.3; }
          .info-content p { font-size: 16px; }
          .error-message { font-size: 14px; color: #ff8787; padding: 3px 2px 0 1px; min-height: 18px; }
          .form-box.Login .animation { transform: translateX(0%); transition: .7s; opacity: 1; transition-delay: calc(.1s * var(--S)); }
          .container.active .form-box.Login .animation { transform: translateX(-120%); opacity: 0; transition-delay: calc(.1s * var(--D)); }
          .info-content.Login .animation { transform: translateX(0); transition: .7s ease; transition-delay: calc(.1s * var(--S)); opacity: 1; filter: blur(0px); }
          .container.active .info-content.Login .animation { transform: translateX(120%); opacity: 0; filter: blur(10px); transition-delay: calc(.1s * var(--D)); }
          .form-box.Register .animation { transform: translateX(120%); transition: .7s ease; opacity: 0; filter: blur(10px); transition-delay: calc(.1s * var(--S)); }
          .container.active .form-box.Register .animation { transform: translateX(0%); opacity: 1; filter: blur(0px); transition-delay: calc(.1s * var(--li)); }
          .info-content.Register .animation { transform: translateX(-120%); transition: .7s ease; opacity: 0; filter: blur(10PX); transition-delay: calc(.1s * var(--S)); }
          .container.active .info-content.Register .animation { transform: translateX(0%); opacity: 1; filter: blur(0); transition-delay: calc(.1s * var(--li)); }
          
          .custom-success-overlay { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: rgba(37,37,43,0.92); display: flex; align-items: center; justify-content: center; flex-direction: column; z-index: 100; transition: opacity 0.5s; }
          .custom-success-card { padding: 30px 36px 22px 36px; background: #18181c; border-radius: 12px; box-shadow: 0 8px 28px 0 #e46033ad; text-align: center; color: #fff; border: 2px solid #e46033; min-width: 260px; }
         
          
          .custom-success-card h2 { margin-bottom: 0.2em; font-size: 2em; letter-spacing: 0.01em; color: #e46033; font-weight: 700; animation: pop 0.5s cubic-bezier(.45,1.6,.8,1) both; }
         
         
          @keyframes pop { 0% { transform: scale(0.7); opacity: 0;} 100% { transform: scale(1); opacity: 1;} }
          .success-bar { width: 100%; margin: 18px 0 4px 0; background: #393939; height: 8px; border-radius: 4px; overflow: hidden; }
          .success-bar-inner { height: 100%; background: linear-gradient(90deg,#e46033 40%,#ffa07a 100%); width: 100%; transition: width 1s linear; }
          .success-msg { font-size: 1.1em; }
          @media (max-width: 768px) {
            .container { height: 550px; width: 95%; margin: 20px; }
            .container .form-box,
            .info-content { width: 100%; height: 100%; padding: 0 20px; position: absolute; top: 0;}
            .form-box.Login { left: 0; padding-top: 50px;}
            .form-box.Register { right: -100%; left: unset; padding-top: 50px;}
            .container.active .form-box.Register { right: 0; }
            .container.active .form-box.Login { transform: translateX(-100%);}
            .container.active .form-box.Register { transform: translateX(0); }
            .info-content { display: none; pointer-events: none;}
            .info-content.Login, .info-content.Register { text-align: center; padding: 0 20px;}
            .container .curved-shape { width: 150%; height: 150%; top: -50px; right: -50px; transform: rotate(15deg) skewY(20deg);}
            .container .curved-shape2 { width: 150%; height: 150%; left: -50px; top: 50%; transform: rotate(0deg) skewY(0deg);}
            .container.active .curved-shape { transform: rotate(0deg) skewY(0deg); transition-delay: .5s;}
            .container.active .curved-shape2 { transform: rotate(-15deg) skewY(-20deg); transition-delay: 1.2s;}
          }
        `}</style>
      </div>
    </div>
  );
}