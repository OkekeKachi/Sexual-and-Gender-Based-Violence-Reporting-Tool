import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  resendVerificationEmail,
  checkEmailVerified,
} from "../services/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Fingerprint,
  Heart,
  Clock,
  Sparkles,
  UserPlus,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Trust card (below form)
───────────────────────────────────────────── */
function TrustCard({ icon, title, desc }) {
  return (
    <div className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-300/60 hover:shadow-lg hover:shadow-teal-100/50">
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300 group-hover:scale-105"
        style={{
          background:
            "linear-gradient(135deg, rgba(42,157,143,0.12) 0%, rgba(27,58,92,0.08) 100%)",
        }}
      >
        <span className="text-teal-600">{icon}</span>
      </div>
      <h3 className="mb-1.5 text-[15px] font-bold tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Login Component
───────────────────────────────────────────── */

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { profile } = useAuth();

  // Only true right after THIS page successfully calls loginUser(). The
  // redirect effect below requires this to be true, so an existing
  // `profile` from a previous session (e.g. AdminRoute bouncing an
  // unauthorized user back to /login while they're still authenticated
  // elsewhere) can never trigger a redirect on its own.
  const [loginSucceeded, setLoginSucceeded] = useState(false);

  // ── Email verification notice state ──
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  // ── Verification polling state ──
  // The email this verificationRequired episode is for. Captured once, at
  // the moment loginUser() rejects for being unverified, rather than read
  // live from `form.email` on every poll — the login form below stays on
  // screen while this notice is up, so this keeps polling anchored to the
  // account that actually failed even if the input changes.
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  // True once GET /users/verification-status has reported emailVerified:
  // true for pendingVerificationEmail. Switches the notice from
  // "not verified yet" to "verified, continue" and stops polling.
  const [emailVerifiedDetected, setEmailVerifiedDetected] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Resend cooldown ticker. Only depends on resendCooldown itself — counts
  // down to 0 and then stops scheduling further ticks, so this can't loop.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Poll the backend for the real Firebase emailVerified value while the
  // "not verified" notice is up. Does NOT touch auth.currentUser — that's
  // null here because loginUser() already signed the user out.
  //
  // Starts only when verificationRequired is true and verification hasn't
  // already been detected; stops (via the cleanup below) the moment either
  // flag changes, so leaving this state, a fresh submit, or verification
  // being detected all tear the interval down instead of layering another
  // one on top. A single interval + a single timeout per active episode —
  // never more.
  useEffect(() => {
    if (!verificationRequired || emailVerifiedDetected) return;

    let cancelled = false;
    const POLL_MS = 4000;
    const MAX_DURATION_MS = 60000;

    const intervalId = setInterval(async () => {
      try {
        const verified = await checkEmailVerified(pendingVerificationEmail);
        if (cancelled) return;
        if (verified) {
          setEmailVerifiedDetected(true);
        }
      } catch (err) {
        // A transient network/backend hiccup shouldn't kill the whole
        // waiting experience — just skip this tick and try again on the
        // next one. Nothing is written to `error`/`verificationRequired`.
        console.error("checkEmailVerified poll failed:", err);
      }
    }, POLL_MS);

    // Safety cap: stop polling after 60s even if verification never lands,
    // so a user who walks away doesn't leave an interval running forever.
    const maxDurationId = setTimeout(() => {
      cancelled = true;
      clearInterval(intervalId);
    }, MAX_DURATION_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      clearTimeout(maxDurationId);
    };
  }, [verificationRequired, emailVerifiedDetected, pendingVerificationEmail]);

  // Redirect only after a successful, verified login on THIS page — not
  // merely because AuthContext already has a `profile` (see loginSucceeded
  // above). This is what stops the AdminRoute navigation loop.
  useEffect(() => {
    if (!loginSucceeded || !profile) return;

    const redirectPath =
      profile.role === "admin" || profile.role === "superadmin"
        ? "/dashboard"
        : profile.role === "caseworker"
          ? "/worker-dashboard"
          : "/my-reports";

    navigate(redirectPath, { replace: true });
  }, [loginSucceeded, profile, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setVerificationRequired(false);
    setEmailVerifiedDetected(false);
    setPendingVerificationEmail("");
    setLoginSucceeded(false);
    setLoading(true);

    try {
      await loginUser(form);
      // loginUser() already: authenticates with Firebase, reloads the
      // user, and throws before this line if emailVerified is false (and
      // signs them out). Reaching here means login genuinely succeeded —
      // only now do we allow the redirect effect to act on `profile`.
      setLoginSucceeded(true);
    } catch (err) {
      const message = err.response?.data?.message || err.message;

      if (message === "Please verify your email before logging in.") {
        // Dedicated verification UI, not the generic error banner. Anchor
        // polling to the email that just failed verification.
        setVerificationRequired(true);
        setPendingVerificationEmail(form.email);
      } else {
        setError(
          message ||
          "We couldn't sign you in. Please double-check your details and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendLoading || resendCooldown > 0) return;

    setResendError("");
    setResendMessage("");
    setResendLoading(true);
    try {
      await resendVerificationEmail(form.email);
      setResendMessage("Verification email sent! Check your inbox or spam folder.");
      setResendCooldown(60);
    } catch (err) {
      setResendError(
        err.response?.data?.message ||
        err.message ||
        "We couldn't resend the verification email. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Just dismisses the verification notice back to the normal login form.
  // Does NOT authenticate anyone — the user still has to press Login,
  // which runs the real loginUser() check.
  const handleContinueToLogin = () => {
    setVerificationRequired(false);
    setEmailVerifiedDetected(false);
    setPendingVerificationEmail("");
  };

  return (
    <>
      {/* ── inject keyframes + fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display&display=swap');
        .safespeak-root { font-family: 'DM Sans', sans-serif; }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-20px) scale(1.03); }
        }
        @keyframes float-med {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(14px) scale(0.97); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0px rgba(42,157,143,0.35); }
          50%      { box-shadow: 0 0 0 10px rgba(42,157,143,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .blob-a { animation: float-slow 9s ease-in-out infinite; }
        .blob-b { animation: float-med  11s ease-in-out infinite 1s; }
        .form-appear { animation: fadeSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .panel-appear { animation: fadeIn 0.7s ease both; }

        .btn-main {
          background: linear-gradient(135deg, #2A9D8F 0%, #1B3A5C 100%);
          transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .btn-main:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 10px 28px rgba(42,157,143,0.35);
          transform: translateY(-1px);
        }
        .btn-main:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .btn-main:disabled { opacity: 0.65; cursor: not-allowed; }

        .logo-pulse { animation: pulse-ring 2.8s ease-in-out infinite; }

        .input-row-appear:nth-child(1) { animation-delay: 0.12s; }
        .input-row-appear:nth-child(2) { animation-delay: 0.2s; }
        .input-row-appear:nth-child(3) { animation-delay: 0.28s; }
        .input-row-appear:nth-child(4) { animation-delay: 0.36s; }

        /* focus-visible ring for keyboard users */
        .safespeak-root :focus-visible {
          outline: 2px solid #2A9D8F;
          outline-offset: 2px;
          border-radius: 8px;
        }
      `}</style>

      <div className="safespeak-root flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50 antialiased">
        <Navbar />

        {/* ══════════════════════════════════════════
           MAIN SECTION
        ══════════════════════════════════════════ */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* ── LEFT: SUPPORTIVE HERO ── */}
            <div className="relative hidden lg:block panel-appear">
              {/* decorative blobs */}
              <div
                className="blob-a pointer-events-none absolute -top-10 -left-10 h-72 w-72 rounded-full opacity-60"
                style={{
                  background:
                    "radial-gradient(circle, rgba(42,157,143,0.22) 0%, transparent 70%)",
                }}
              />
              <div
                className="blob-b pointer-events-none absolute -bottom-8 -right-6 h-60 w-60 rounded-full opacity-60"
                style={{
                  background:
                    "radial-gradient(circle, rgba(27,58,92,0.18) 0%, transparent 70%)",
                }}
              />

              <div className="relative z-10">
                {/* small tag */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-50 px-3.5 py-1.5">
                  <Sparkles size={13} className="text-teal-600" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">
                    A safe space for your voice
                  </span>
                </div>

                <h1
                  className="text-[2.8rem] font-bold leading-[1.1] tracking-tight"
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    color: "#1B3A5C",
                  }}
                >
                  You're not alone.
                  <br />
                  <span style={{ color: "#2A9D8F" }}>We're here</span> with you.
                </h1>

                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
                  SafeSpeak is a confidential space where survivors can share
                  their stories, access support, and connect with caring
                  professionals — at their own pace, on their own terms.
                </p>

                {/* feature bullets */}
                <ul className="mt-8 space-y-4">
                  {[
                    {
                      icon: <Heart size={16} />,
                      title: "Compassionate support",
                      desc: "Speak freely in a judgment-free environment.",
                    },
                    {
                      icon: <ShieldCheck size={16} />,
                      title: "Private & encrypted",
                      desc: "Your information is protected, always.",
                    },
                    {
                      icon: <Clock size={16} />,
                      title: "Available anytime",
                      desc: "Help is here whenever you need it.",
                    },
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3.5">
                      <div
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(42,157,143,0.15) 0%, rgba(27,58,92,0.08) 100%)",
                        }}
                      >
                        <span className="text-teal-600">{f.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {f.title}
                        </p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">
                          {f.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── RIGHT: LOGIN CARD ── */}
            <div className="flex justify-center lg:justify-end mt-10">
              <div
                className={`w-full max-w-[440px] rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-xl shadow-slate-200/60 backdrop-blur-sm sm:p-9 ${mounted ? "form-appear" : "opacity-0"
                  }`}
              >
                {/* Mobile logo */}
                <div className="mb-6 flex items-center gap-3 lg:hidden">
                  <div
                    className="logo-pulse flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #2A9D8F 0%, #1B3A5C 100%)",
                    }}
                  >
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <span
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      color: "#1B3A5C",
                    }}
                  >
                    SafeSpeak
                  </span>
                </div>

                {/* Heading */}
                <div className="mb-7">
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: "#1B3A5C" }}
                  >
                    Welcome back
                  </h2>
                  <p className="mt-1.5 text-[14px] text-slate-500">
                    Sign in to continue your journey with SafeSpeak.
                  </p>
                </div>

                {/* Email verification notice */}
                {verificationRequired && !emailVerifiedDetected && (
                  <div
                    className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4"
                    role="alert"
                    aria-live="assertive"
                    style={{ animation: "fadeSlideUp 0.3s ease both" }}
                  >
                    <div className="flex items-start gap-3">
                      <Mail
                        size={17}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-amber-800">
                          Email not verified
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-amber-700">
                          Your email address hasn't been verified yet. Check
                          your inbox for the verification link.
                        </p>

                        <div className="mt-2.5 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5">
                          <Mail size={13} className="shrink-0 text-amber-600" />
                          <span className="truncate text-[12px] font-semibold text-amber-800">
                            {form.email}
                          </span>
                        </div>

                        {resendError && (
                          <div
                            className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-700"
                            role="alert"
                            aria-live="assertive"
                          >
                            <AlertCircle
                              size={14}
                              className="mt-0.5 shrink-0 text-red-500"
                            />
                            <span>{resendError}</span>
                          </div>
                        )}

                        {resendMessage && !resendError && (
                          <div
                            className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] font-medium text-emerald-700"
                            role="status"
                            aria-live="polite"
                          >
                            <ShieldCheck
                              size={14}
                              className="mt-0.5 shrink-0 text-emerald-500"
                            />
                            <span>{resendMessage}</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={resendLoading || resendCooldown > 0}
                          aria-live="polite"
                          className="btn-main mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[13px] font-semibold text-white disabled:cursor-not-allowed sm:w-auto sm:px-5"
                        >
                          {resendLoading ? (
                            <span>Sending...</span>
                          ) : resendCooldown > 0 ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={13} />
                              Resend available in {resendCooldown}s
                            </span>
                          ) : (
                            <span>Resend verification email</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email verified — polling detected it */}
                {verificationRequired && emailVerifiedDetected && (
                  <div
                    className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                    role="status"
                    aria-live="polite"
                    style={{ animation: "fadeSlideUp 0.3s ease both" }}
                  >
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={17}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-emerald-800">
                          Email verified successfully
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-emerald-700">
                          You can now sign in.
                        </p>

                        <button
                          type="button"
                          onClick={handleContinueToLogin}
                          className="btn-main mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[13px] font-semibold text-white sm:w-auto sm:px-5"
                        >
                          Continue to Login
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error banner */}
                {!verificationRequired && error && (
                  <div
                    className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                    role="alert"
                    aria-live="assertive"
                    style={{ animation: "fadeSlideUp 0.3s ease both" }}
                  >
                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0 text-red-500"
                    />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Email */}
                  <div className="form-appear input-row-appear space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-[13px] font-semibold tracking-wide text-slate-700"
                    >
                      Email address
                    </label>
                    <div className="group relative flex items-center rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                      <Mail
                        size={17}
                        className="absolute left-4 text-slate-400 transition-colors duration-200 group-focus-within:text-teal-600"
                        aria-hidden="true"
                      />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        aria-required="true"
                        className="h-12 w-full rounded-xl bg-transparent pl-11 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="form-appear input-row-appear space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-[13px] font-semibold tracking-wide text-slate-700"
                      >
                        Password
                      </label>
                      <a
                        href="/forgot-password"
                        className="text-[13px] font-semibold transition-colors hover:underline"
                        style={{ color: "#2A9D8F" }}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="group relative flex items-center rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                      <Lock
                        size={17}
                        className="absolute left-4 text-slate-400 transition-colors duration-200 group-focus-within:text-teal-600"
                        aria-hidden="true"
                      />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••••"
                        aria-required="true"
                        className="h-12 w-full rounded-xl bg-transparent pl-11 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="form-appear input-row-appear pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-main relative flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white"
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          <span className="ml-1 text-sm">Signing you in…</span>
                        </>
                      ) : (
                        <>
                          Login
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    New here?
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                {/* Sign up link */}
                <a
                  href="/signup"
                  className="group flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-semibold text-slate-700 transition-all duration-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                >
                  <UserPlus size={16} />
                  Create your SafeSpeak account
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </a>

                {/* Security note */}
                <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <ShieldCheck size={14} className="shrink-0 text-teal-600" />
                  <p className="text-center text-[12px] leading-relaxed text-slate-500">
                    Your session is encrypted end-to-end.{" "}
                    <span className="font-semibold text-slate-700">
                      Your privacy always comes first.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
             TRUST CARDS
          ══════════════════════════════════════════ */}
          <div className="mt-16 grid w-full max-w-4xl gap-5 sm:grid-cols-3">
            <TrustCard
              icon={<Fingerprint size={20} />}
              title="Secure Authentication"
              desc="Your identity is protected with encrypted, private sign-in — only you can access your account."
            />
            <TrustCard
              icon={<ShieldCheck size={20} />}
              title="Confidentiality"
              desc="Everything you share stays between you and your support team. We never disclose your information."
            />
            <TrustCard
              icon={<Clock size={20} />}
              title="24/7 Access"
              desc="Reach out anytime, day or night. SafeSpeak is here for you whenever you need support."
            />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default Login;