import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
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

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Redirect once AuthContext has loaded the user's profile
  useEffect(() => {
    if (!profile) return;

    if (profile.role === "admin") {
      navigate("/dashboard", { replace: true });
    } else if (profile.role === "caseworker") {
      navigate("/worker-dashboard", { replace: true });
    } else {
      navigate("/my-reports", { replace: true });
    }
  }, [profile, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginUser(form);
      // No navigation here.
      // AuthContext will update `profile`,
      // and the useEffect above will redirect.
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "We couldn't sign you in. Please double-check your details and try again."
      );
    } finally {
      setLoading(false);
    }
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

                {/* Error banner */}
                {error && (
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