import { useState, useEffect } from "react";
import { loginUser } from "../services/auth";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Fingerprint,
  ShieldAlert,
  Heart,
  Sparkles,
} from "lucide-react";
import AppLoader from "../components/AppLoader";

/* ─────────────────────────────────────────────
   Animated floating blob (pure CSS, no libs)
───────────────────────────────────────────── */
function Blob({ className, style }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={style}
    />
  );
}

/* ─────────────────────────────────────────────
   Trust badge chip
───────────────────────────────────────────── */
function TrustChip({ icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
      <span className="text-teal-400">{icon}</span>
      <span className="text-xs font-semibold tracking-wide text-slate-300">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Left-panel feature row
───────────────────────────────────────────── */
function FeatureRow({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 group">
      <div
        className="
          mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center
          rounded-xl border border-white/10 bg-white/5
          text-teal-400 transition-all duration-300
          group-hover:border-teal-500/40 group-hover:bg-teal-500/10
        "
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Styled text input with leading icon
───────────────────────────────────────────── */
function InputField({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  leadIcon,
  trailSlot,
  error,
}) {
  const [focused, setFocused] = useState(false);
  const hasVal = value.length > 0;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold tracking-wide text-slate-700"
      >
        {label}
      </label>

      <div
        className={`
          relative flex items-center rounded-xl border bg-white transition-all duration-200
          ${error
            ? "border-red-400 ring-4 ring-red-100"
            : focused
              ? "border-teal-500 ring-4 ring-teal-100"
              : hasVal
                ? "border-slate-300"
                : "border-slate-200"
          }
        `}
      >
        {/* lead icon */}
        <span
          className={`
            absolute left-4 transition-colors duration-200
            ${error ? "text-red-400" : focused ? "text-teal-500" : "text-slate-400"}
          `}
        >
          {leadIcon}
        </span>

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="
            h-12 w-full rounded-xl bg-transparent pl-11 pr-12
            text-[15px] text-slate-900 placeholder:text-slate-400
            focus:outline-none
          "
        />

        {/* trailing slot (e.g. show/hide toggle) */}
        {trailSlot && (
          <span className="absolute right-3 flex items-center">{trailSlot}</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Login Component
───────────────────────────────────────────── */
function StaffLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // staggered mount animation
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("FORM SUBMITTED");
    setError("");
    setLoading(true);

    try {
      const user = await loginUser(form);

      if (user.role === "admin") {
        navigate("/dashboard");
      } else if (user.role === "caseworker") {
        navigate("/worker-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        err.response?.data?.message || err.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── inject keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display&display=swap');

        .safespeak-root { font-family: 'DM Sans', sans-serif; }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-24px) scale(1.04); }
        }
        @keyframes float-med {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(18px) scale(0.97); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
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
          0%, 100% { box-shadow: 0 0 0 0px rgba(20,184,166,0.35); }
          50%       { box-shadow: 0 0 0 8px rgba(20,184,166,0); }
        }

        .blob-a { animation: float-slow 9s ease-in-out infinite; }
        .blob-b { animation: float-med  11s ease-in-out infinite 1s; }
        .blob-c { animation: float-fast 7s ease-in-out infinite 0.5s; }

        .form-appear { animation: fadeSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .panel-appear { animation: fadeIn 0.6s ease both; }

        .btn-main {
          background: linear-gradient(135deg, #0f766e 0%, #0e7490 100%);
          transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .btn-main:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 8px 24px rgba(20,184,166,0.35);
          transform: translateY(-1px);
        }
        .btn-main:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .btn-main:disabled { opacity: 0.65; cursor: not-allowed; }

        .logo-pulse { animation: pulse-ring 2.8s ease-in-out infinite; }

        .trust-bar::-webkit-scrollbar { display: none; }
        .trust-bar { scrollbar-width: none; }

        .input-row-appear:nth-child(1) { animation-delay: 0.12s; }
        .input-row-appear:nth-child(2) { animation-delay: 0.2s; }
        .input-row-appear:nth-child(3) { animation-delay: 0.28s; }
        .input-row-appear:nth-child(4) { animation-delay: 0.36s; }
      `}</style>

      <div className="safespeak-root flex min-h-screen bg-slate-50 antialiased">

        {/* ══════════════════════════════════════════
            LEFT HERO PANEL
        ══════════════════════════════════════════ */}
        <aside
          className="relative hidden lg:flex w-[46%] flex-col justify-between overflow-hidden"
          style={{
            background: `linear-gradient(145deg, rgba(15,39,68,0.92) 0%, rgba(27,58,92,0.85) 45%, rgba(26,74,107,0.7) 100%), url('https://www.globalgiving.org/pfil/38244/pict_large.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            minHeight: "60vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          
          {/* decorative blobs */}
          <Blob
            className="blob-a"
            style={{
              width: 420, height: 420,
              top: -120, left: -80,
              background: "radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)",
            }}
          />
          <Blob
            className="blob-b"
            style={{
              width: 360, height: 360,
              bottom: 60, right: -100,
              background: "radial-gradient(circle, rgba(14,116,144,0.22) 0%, transparent 70%)",
            }}
          />
          <Blob
            className="blob-c"
            style={{
              width: 200, height: 200,
              top: "45%", left: "55%",
              background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            }}
          />

          {/* subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* ── Content ── */}
          <div className="relative z-10 flex flex-col h-full p-12 panel-appear">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-auto">
              <div
                className="logo-pulse flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)",
                }}
              >
                <ShieldCheck size={26} className="text-white" />
              </div>
              <span
                className="text-2xl font-bold tracking-tight text-white"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                SafeSpeak
              </span>
            </div>

            {/* Hero copy */}
            <div className="mt-16 mb-12">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1">
                <Sparkles size={12} className="text-teal-400" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-300">
                  Secure Access Portal
                </span>
              </div>

              <h1
                className="text-[2.6rem] font-bold leading-tight text-white"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Every voice
                <br />
                <span className="text-teal-400">deserves</span> to
                <br />
                be heard.
              </h1>

              <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-slate-400">
                A confidential, end-to-end encrypted platform for SGBV case management and survivor support.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-5 mb-12">
              <FeatureRow
                icon={<Fingerprint size={17} />}
                title="Privacy by Default"
                desc="All data encrypted at rest and in transit. Zero-knowledge storage principles."
              />
              <FeatureRow
                icon={<ShieldAlert size={17} />}
                title="Rapid Response Alerts"
                desc="Priority triage and real-time notifications for urgent case escalation."
              />
              <FeatureRow
                icon={<Heart size={17} />}
                title="Survivor-Centered"
                desc="Anonymous reporting with full confidentiality controls for survivors."
              />
            </div>

            {/* Trust chips */}
            <div className="trust-bar flex flex-wrap gap-2">
              <TrustChip icon={<ShieldCheck size={12} />} label="ISO 27001" />
              <TrustChip icon={<Lock size={12} />} label="256-bit AES" />
              <TrustChip icon={<ShieldCheck size={12} />} label="HIPAA Aligned" />
            </div>

            {/* Footer note */}
            <p className="mt-8 text-[11px] font-medium tracking-[0.12em] uppercase text-slate-600">
              Authorized Personnel Only · Encrypted Session
            </p>
          </div>
        </aside>

        {/* ══════════════════════════════════════════
            RIGHT FORM PANEL
        ══════════════════════════════════════════ */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #14b8a6, #0ea5e9)" }}
            >
              <ShieldCheck size={22} className="text-white" />
            </div>
            <span
              className="text-xl font-bold text-slate-900"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              SafeSpeak
            </span>
          </div>

          {/* Card */}
          <div
            className={`w-full max-w-[440px] rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-200/60 backdrop-blur-sm sm:p-10 ${mounted ? "form-appear" : "opacity-0"}`}
          >
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h2>
              <p className="mt-1.5 text-[14px] text-slate-500">
                Enter your credentials to access the secure portal.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                role="alert"
                aria-live="assertive"
                style={{ animation: "fadeSlideUp 0.3s ease both" }}
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div className="form-appear input-row-appear">
                <InputField
                  label="Work Email"
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@organisation.org"
                  leadIcon={<Mail size={17} />}
                />
              </div>

              {/* Password */}
              <div className="form-appear input-row-appear">
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-[13px] font-semibold tracking-wide text-slate-700"
                  >
                    Password
                  </label>
                  <a
                    href="/forgot"
                    className="text-[13px] font-semibold text-teal-600 transition-colors hover:text-teal-700"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* manual password field to attach toggle */}
                <div
                  className={`
                    relative flex items-center rounded-xl border bg-white transition-all duration-200
                    focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100
                    border-slate-200 hover:border-slate-300
                  `}
                >
                  <Lock
                    size={17}
                    className="absolute left-4 text-slate-400 transition-colors duration-200 peer-focus:text-teal-500"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••••"
                    className="
                      h-12 w-full rounded-xl bg-transparent pl-11 pr-12
                      text-[15px] text-slate-900 placeholder:text-slate-400
                      focus:outline-none
                    "
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
                    <AppLoader
                      title="Signing you in"
                      subtitle="Verifying your credentials..."
                    />
                  ) : (
                    <>
                      Sign into Portal
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Secure
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <ShieldCheck size={15} className="shrink-0 text-teal-500" />
              <p className="text-center text-[12px] leading-relaxed text-slate-500">
                Your session is encrypted end-to-end.{" "}
                <span className="font-semibold text-slate-700">No data is stored locally.</span>
              </p>
            </div>

            {/* Footer */}
            <p className="mt-7 text-center text-[13px] text-slate-400">
              Need system access?{" "}
              <span className="font-semibold text-slate-900">
                Contact IT Administration
              </span>
            </p>
          </div>

          {/* Below-card note */}
          <p className="mt-6 text-center text-[12px] text-slate-400">
            © {new Date().getFullYear()} SafeSpeak · All rights reserved
          </p>
        </main>
      </div>
    </>
  );
}

export default StaffLogin;