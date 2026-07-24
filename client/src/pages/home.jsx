import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ─── COLOR PALETTE & DESIGN TOKENS ──────────────────────────────────────────
// Primary: Deep Navy #1B3A5C | Teal Accent #2A9D8F | Soft Blue #EBF4FA
// Text: Slate #334155 | Muted #64748B | White #FFFFFF
// Danger-soft: Warm Amber #F4A261 (for emergency, NOT red)
// ────────────────────────────────────────────────────────────────────────────

// ─── HOOK: Intersection Observer for fade-in animations ─────────────────────


function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ─── FADE-IN WRAPPER ─────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}



// ─── HERO SECTION ─────────────────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate();
  return (
    <section
      style={{
        background: `linear-gradient(145deg, rgba(15,39,68,0.92) 0%, rgba(27,58,92,0.85) 45%, rgba(26,74,107,0.7) 100%), url('https://www.globalgiving.org/pfil/38244/pict_large.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "60vh",
        position: "relative",
        overflow: "hidden",
      }}
      className="flex items-center"
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute", top: "-120px", right: "-80px",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(42,157,143,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: "-100px", left: "-60px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(42,157,143,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-16 items-center w-full">
        {/* Left: Text */}
        <div>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(42,157,143,0.15)", border: "1px solid rgba(42,157,143,0.3)",
              borderRadius: "100px", padding: "6px 16px", marginBottom: "28px",
              opacity: 0, animation: "fadeSlideUp 0.8s ease 0.2s forwards",
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2A9D8F" }} />
            <span style={{ color: "#7DD8D1", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
              Safe · Confidential · 24/7 Support
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.6rem, 5vw, 3.8rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.15,
              marginBottom: "24px",
              opacity: 0,
              animation: "fadeSlideUp 0.8s ease 0.4s forwards",
            }}
          >
            Report Safely.{" "}
            <span style={{ color: "#2A9D8F" }}>Get Help</span> Quickly.
          </h1>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.125rem",
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.75,
              maxWidth: "480px",
              marginBottom: "40px",
              opacity: 0,
              animation: "fadeSlideUp 0.8s ease 0.6s forwards",
            }}
          >
            You are not alone. SafeSpeak provides a secure, anonymous, and compassionate
            way to report sexual and gender-based violence — and connect with help that
            matters.
          </p>

          <div
            style={{ opacity: 0, animation: "fadeSlideUp 0.8s ease 0.8s forwards" }}
            className="flex flex-wrap gap-4"
          >
            <CTAButton
              primary
              onClick={() => navigate("/report")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "8px" }}
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Report an incident
            </CTAButton>

            <CTAButton
              onClick={() => navigate("/resources")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "8px" }}
              >
                <path
                  d="M22 16.9c0 .3-.1.6-.2.9l-1.3 2.6c-.3.5-.8.8-1.4.8C10.3 21.2 2.8 13.7 2.8 4.9c0-.6.3-1.1.8-1.4L6.2 2.2c.3-.1.6-.2.9-.2.4 0 .8.2 1 .5l2 3.5c.3.4.2.9-.1 1.3l-1.4 1.4c1.1 2.2 2.9 4 5.1 5.1l1.4-1.4c.3-.3.9-.4 1.3-.1l3.5 2c.3.2.5.6.5 1z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              Resources
            </CTAButton>
          </div>

          {/* Stats Row */}
          <div
            style={{ opacity: 0, animation: "fadeSlideUp 0.8s ease 1s forwards" }}
            className="mt-14 flex flex-wrap gap-8"
          >
            {[["500+", "Cases Handled"], ["98%", "Confidentiality Rate"], ["24/7", "Support Available"]].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#2A9D8F" }}>{num}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Illustration card */}
        <div style={{ opacity: 0, animation: "fadeSlideIn 1s ease 0.6s forwards" }} className="hidden md:block">
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "32px",
              backdropFilter: "blur(8px)",
              position: "relative",
            }}
          >
            {/* Placeholder for illustration */}
            <img
              src="https://lagosstatemoj.org/wp-content/uploads/2023/09/SGBV-Awareness.jpg"
              alt="Two people in a supportive conversation"
              style={{ width: "100%", borderRadius: "16px", objectFit: "cover", height: "340px" }}
            />
            {/* Floating badge */}
            <div
              style={{
                position: "absolute", bottom: "50px", left: "-24px",
                background: "#fff", borderRadius: "14px", padding: "14px 20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                display: "flex", alignItems: "center", gap: "12px",
              }}
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg,#2A9D8F,#1B3A5C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "14px", color: "#1B3A5C" }}>100% Secure</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#64748B" }}>End-to-end encrypted</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(32px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}

// ─── REUSABLE BUTTON ─────────────────────────────────────────────────────────
function CTAButton({ children, primary = false, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "14px 28px",
        borderRadius: "12px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: "15px",
        cursor: "pointer",
        border: primary ? "none" : "1.5px solid rgba(255,255,255,0.3)",
        background: primary
          ? hovered ? "#23857a" : "#2A9D8F"
          : hovered ? "rgba(255,255,255,0.1)" : "transparent",
        color: "#fff",
        transition: "all 0.25s ease",
        boxShadow: primary && hovered ? "0 8px 24px rgba(42,157,143,0.4)" : primary ? "0 4px 14px rgba(42,157,143,0.25)" : "none",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

// ─── TRUST & SAFETY SECTION ───────────────────────────────────────────────────
function TrustSection() {
  const pillars = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#2A9D8F" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke="#2A9D8F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Fully Secure",
      desc: "All data is encrypted end-to-end with military-grade AES-256. Your report is stored on isolated, air-gapped servers.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="#2A9D8F" strokeWidth="1.8" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#2A9D8F" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M17 3s2 1 2 5" stroke="#2A9D8F" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19 3l2-1" stroke="#2A9D8F" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
      title: "Anonymous Reporting",
      desc: "You choose how much to share. Report anonymously without revealing your identity — we never require a name.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#2A9D8F" strokeWidth="1.8" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="#2A9D8F" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
      title: "Confidential",
      desc: "Your information is never shared with unauthorized parties. Our data policy complies with GDPR and local privacy laws.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#2A9D8F" strokeWidth="1.8" />
          <path d="M12 7v5l3 3" stroke="#2A9D8F" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
      title: "24/7 Support",
      desc: "Our trained support team is available around the clock to assist you, whether day or night.",
    },
  ];

  return (
    <section style={{ background: "#F0F7FF", padding: "96px 24px" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <SectionLabel>Why Trust Us</SectionLabel>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 700, color: "#1B3A5C", marginTop: "12px" }}>
            Your Safety Is Our Priority
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#64748B", maxWidth: "520px", margin: "16px auto 0", fontSize: "1.05rem", lineHeight: 1.7 }}>
            We built SafeSpeak with survivors in mind — every feature is designed to
            protect you while you seek justice and support.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1}>
              <TrustCard {...p} />
            </FadeIn>
          ))}
        </div>

        {/* Image banner */}
        <FadeIn delay={0.3} className="mt-16">
          <div style={{ borderRadius: "20px", overflow: "hidden", position: "relative" }}>
            <img
              src="/hero-image.jpg"
              alt="Community support group"
              style={{ width: "100%", height: "260px", objectFit: "cover", objectPosition: "center 30%" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(27,58,92,0.85) 0%, rgba(27,58,92,0.3) 60%, transparent 100%)", display: "flex", alignItems: "center", padding: "40px" }}>
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "#fff", maxWidth: "400px", lineHeight: 1.4 }}>
                  "Every survivor deserves to be heard and believed."
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.7)", marginTop: "12px", fontSize: "14px" }}>— SafeSpeak Mission Statement</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function TrustCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "32px 28px",
        border: "1.5px solid",
        borderColor: hovered ? "#2A9D8F" : "#E2EEF8",
        boxShadow: hovered ? "0 12px 40px rgba(42,157,143,0.12)" : "0 2px 12px rgba(0,0,0,0.04)",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        cursor: "default",
      }}
    >
      <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#EBF7F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#1B3A5C", marginBottom: "10px" }}>{title}</h3>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", color: "#64748B", lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}



function StepCard({ num, title, desc, isLast }) {
  return (
    <div style={{ position: "relative", textAlign: "left" }}>
      {/* Number and Icon Container */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "10px",
          background: "#2A9D8F",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: "14px",
          zIndex: 2,
          boxShadow: "0 4px 12px rgba(42, 157, 143, 0.2)"
        }}>
          {num}
        </div>

        {/* Horizontal line for desktop (shows only between cards) */}
        {!isLast && (
          <div className="hidden lg:block" style={{
            flexGrow: 1,
            height: "2px",
            background: "linear-gradient(90deg, #2A9D8F, #E2E8F0)",
            marginLeft: "12px",
            marginRight: "-12px",
            opacity: 0.5
          }} />
        )}
      </div>

      {/* Content */}
      <h3 style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "18px",
        fontWeight: 600,
        color: "#1B3A5C",
        marginBottom: "10px"
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "14px",
        lineHeight: "1.6",
        color: "#64748B",
        maxWidth: "260px"
      }}>
        {desc}
      </p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { num: "01", title: "Submit Your Report", desc: "Fill out our guided, sensitive form at your own pace. Save progress and return anytime." },
    { num: "02", title: "Case Review", desc: "A trained case worker reviews your submission within 24 hours and contacts you securely." },
    { num: "03", title: "Support & Action", desc: "Get connected to legal aid, counseling, or shelter based on your specific choices." },
    { num: "04", title: "Follow Up", desc: "Track your case status in real time. We keep you informed at every step of the process." },
  ];

  return (
    <section style={{ background: "#fff", padding: "100px 24px", borderTop: "1px solid #F1F5F9" }}>
      <div className="max-w-7xl mx-auto">
        <div style={{ marginBottom: "64px" }}>
          <span style={{
            color: "#2A9D8F",
            fontWeight: 600,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            System Workflow
          </span>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "32px",
            fontWeight: 700,
            color: "#0F172A",
            marginTop: "8px"
          }}>
            How It Works
          </h2>
          <p style={{
            color: "#64748B",
            marginTop: "12px",
            fontSize: "16px",
            maxWidth: "600px"
          }}>
            A structured, secure protocol designed to ensure every incident is handled with precision and care.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((s, i) => (
            <StepCard
              key={s.num}
              {...s}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── REPORT CATEGORIES ────────────────────────────────────────────────────────
function CategoryCard({ label, desc, icon }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--color-background-secondary, #F8FAFC)" : "#fff",
        borderRadius: "12px",
        padding: "20px",
        border: hovered ? "0.5px solid #378ADD" : "0.5px solid #E2EAF0",
        transition: "all 0.2s ease",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        display: "block",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent bar on top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "#378ADD",
          borderRadius: "12px 12px 0 0",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      />

      {/* Icon wrapper */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: hovered ? "#EBF4FD" : "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
          transition: "background 0.2s",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke={hovered ? "#378ADD" : "#64748B"}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke 0.2s" }}
        >
          {icon}
        </svg>
      </div>

      {/* Label */}
      <h3
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: "18px",
          color: "#0F2A45",
          margin: "0 0 8px",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "15.5px",
          color: "#475569",
          lineHeight: 1.65,
          margin: "0 0 16px",
        }}
      >
        {desc}
      </p>

      {/* Arrow CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "13px",
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          color: "#378ADD",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-4px)",
          transition: "opacity 0.2s, transform 0.2s",
        }}
      >
        Report this
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </button>
  );
}

function ReportCategories() {
  const categories = [
    {
      label: "Sexual harassment",
      desc: "Unwanted sexual advances, comments, or conduct in any setting.",
      icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    },
    {
      label: "Sexual assault",
      desc: "Non-consensual sexual contact or acts of any nature.",
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </>
      ),
    },
    {
      label: "Domestic violence",
      desc: "Abuse within intimate partner or family relationships.",
      icon: (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </>
      ),
    },
    {
      label: "Verbal / emotional abuse",
      desc: "Coercive control, threats, intimidation, or psychological harm.",
      icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    },
    {
      label: "Online / cyber violence",
      desc: "Digital harassment, non-consensual image sharing, cyberstalking.",
      icon: (
        <>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </>
      ),
    },
    {
      label: "Other GBV incidents",
      desc: "Forced marriage, trafficking, female genital mutilation, and more.",
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </>
      ),
    },
  ];

  return (
    <section style={{ background: "#F0F7FF", padding: "96px 24px" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <SectionLabel>Report types</SectionLabel>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "#1B3A5C",
              marginTop: "12px",
            }}
          >
            What would you like to report?
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#334155",
              maxWidth: "500px",
              margin: "16px auto 0",
              fontSize: "1.1rem",
              lineHeight: 1.75,
            }}
          >
            Select the category that best describes your experience. All categories receive equal
            care and urgency.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c, i) => (
            <FadeIn key={c.label} delay={i * 0.08}>
              <CategoryCard {...c} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── EMERGENCY HELP SECTION ───────────────────────────────────────────────────
function EmergencyHelp() {
  const hotlines = [
    { name: "National GBV Hotline", number: "0800-111-999", desc: "24/7 crisis support", badge: "TOLL FREE" },
    { name: "Sexual Assault Helpline", number: "0800-222-333", desc: "Immediate counseling", badge: "24/7" },
    { name: "Police Emergency Line", number: "199", desc: "Report to law enforcement", badge: "EMERGENCY" },
    { name: "SMS Support Line", number: "SMS: SAFE to 55555", desc: "Text-based support", badge: "ANONYMOUS" },
  ];

  return (
    <section style={{ background: "linear-gradient(145deg,#0F2744,#1B3A5C)", padding: "96px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,162,97,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(244,162,97,0.15)", border: "1px solid rgba(244,162,97,0.3)", borderRadius: "100px", padding: "6px 16px", marginBottom: "20px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F4A261", animation: "pulse 2s infinite" }} />
            <span style={{ color: "#F4A261", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Immediate Help Available</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 700, color: "#fff" }}>
            Emergency Support Lines
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)", maxWidth: "480px", margin: "16px auto 0", fontSize: "1.05rem", lineHeight: 1.7 }}>
            If you are in immediate danger, please contact these services. Help is always available.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          {hotlines.map((h, i) => (
            <FadeIn key={h.name} delay={i * 0.1}>
              <HotlineCard {...h} />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="text-center">
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px 32px", display: "inline-block" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              ⚠️ If you are in immediate physical danger, call <strong style={{ color: "#F4A261" }}>199</strong> or your local emergency number immediately.
            </p>
          </div>
        </FadeIn>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </section>
  );
}

function HotlineCard({ name, number, desc, badge }) {
  const [hovered, setHovered] = useState(false);
  const badgeColors = { "TOLL FREE": "#2A9D8F", "24/7": "#2A9D8F", "EMERGENCY": "#F4A261", "ANONYMOUS": "#8B5CF6" };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
        border: "1.5px solid",
        borderColor: hovered ? "rgba(42,157,143,0.5)" : "rgba(255,255,255,0.1)",
        borderRadius: "18px",
        padding: "28px",
        transition: "all 0.3s ease",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(42,157,143,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M22 16.9c0 .3-.1.6-.2.9l-1.3 2.6c-.3.5-.8.8-1.4.8C10.3 21.2 2.8 13.7 2.8 4.9c0-.6.3-1.1.8-1.4L6.2 2.2c.3-.1.6-.2.9-.2.4 0 .8.2 1 .5l2 3.5c.3.4.2.9-.1 1.3l-1.4 1.4c1.1 2.2 2.9 4 5.1 5.1l1.4-1.4c.3-.3.9-.4 1.3-.1l3.5 2c.3.2.5.6.5 1z" stroke="#2A9D8F" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>{name}</span>
          <span style={{ background: badgeColors[badge] || "#2A9D8F", color: "#fff", fontSize: "10px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", padding: "2px 8px", borderRadius: "100px", letterSpacing: "0.06em" }}>{badge}</span>
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "#2A9D8F" }}>{number}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{desc}</div>
      </div>
    </div>
  );
}

// ─── RESOURCES SECTION ────────────────────────────────────────────────────────
function ResourcesSection() {
  const resources = [
    {
      tag: "Legal Aid",
      title: "Know Your Rights",
      desc: "Access free legal information, find pro bono lawyers, and understand the judicial process for GBV cases.",
      link: "Learn More",
      accent: "#2563EB",
      accentBg: "#EFF6FF",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      tag: "Mental Health",
      title: "Counseling Services",
      desc: "Connect with certified trauma-informed therapists available online, by phone, or in-person near you.",
      link: "Find a Counselor",
      accent: "#7C3AED",
      accentBg: "#F5F3FF",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      tag: "Shelter",
      title: "Safe Houses & Shelters",
      desc: "Find verified safe houses, emergency shelters, and transitional housing in your area.",
      link: "Find Shelter",
      accent: "#0F766E",
      accentBg: "#F0FDFA",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      tag: "NGO Network",
      title: "Partner Organizations",
      desc: "Browse our network of vetted NGOs, women's rights groups, and community organizations.",
      link: "Browse NGOs",
      accent: "#B45309",
      accentBg: "#FFFBEB",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      tag: "Education",
      title: "Safety Planning Guide",
      desc: "Step-by-step guides for creating personal safety plans, digital security, and crisis preparation.",
      link: "Access Guide",
      accent: "#0369A1",
      accentBg: "#F0F9FF",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      tag: "Medical",
      title: "Medical Support",
      desc: "Locate GBV-trained healthcare providers for forensic exams, treatment, and follow-up care.",
      link: "Find Care",
      accent: "#BE123C",
      accentBg: "#FFF1F2",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
  ];

  return (
    <section style={{ background: "#fff", padding: "96px 24px" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <SectionLabel>Resources</SectionLabel>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem,4vw,2.8rem)",
              fontWeight: 700,
              color: "#1B3A5C",
              marginTop: "12px",
            }}
          >
            Support Resources
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#334155",
              maxWidth: "500px",
              margin: "16px auto 0",
              fontSize: "1.1rem",
              lineHeight: 1.75,
            }}
          >
            Comprehensive resources to support survivors, families, and advocates throughout every step.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((r, i) => (
            <FadeIn key={r.title} delay={i * 0.08}>
              <ResourceCard {...r} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResourceCard({ tag, title, desc, link, accent, accentBg, icon }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "0.5px solid",
        borderColor: hovered ? accent : "#E2EAF0",
        borderRadius: "16px",
        padding: "24px",
        transition: "all 0.25s ease",
        boxShadow: hovered ? `0 8px 28px ${accent}18` : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: accent,
          borderRadius: "16px 16px 0 0",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.25s",
        }}
      />

      {/* Icon + Tag row */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "10px",
            background: hovered ? accentBg : "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: hovered ? accent : "#64748B",
            transition: "all 0.25s",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            background: accentBg,
            color: accent,
            fontSize: "11px",
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            padding: "4px 10px",
            borderRadius: "100px",
            letterSpacing: "0.04em",
          }}
        >
          {tag}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: "15px",
          color: "#0F2A45",
          marginBottom: "8px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13.5px",
          color: "#475569",
          lineHeight: 1.65,
          marginBottom: "20px",
        }}
      >
        {desc}
      </p>

      {/* CTA link */}
      <a
        href="#"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: "13px",
          color: accent,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          transition: "gap 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.gap = "8px")}
        onMouseLeave={(e) => (e.currentTarget.style.gap = "5px")}
      >
        {link}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </div>
  );
}
// ─── TESTIMONIALS / IMPACT ────────────────────────────────────────────────────
function ImpactSection() {
  const stats = [
    { num: "500+", label: "Cases Successfully Handled" },
    { num: "98%", label: "User Satisfaction Rate" },
    { num: "150+", label: "Partner Organizations" },
    { num: "47", label: "States & Regions Covered" },
  ];

  const testimonials = [
    { text: "SafeSpeak gave me the courage to speak up. The process was so gentle and I never felt judged. Within days I had a lawyer and a counselor.", initials: "A.M.", role: "Survivor, Abuja" },
    { text: "As a social worker, I've seen how this platform transforms lives. The anonymity feature means survivors who would never approach a police station can finally get help.", initials: "K.O.", role: "Social Worker, Lagos" },
    { text: "I didn't know there were so many resources available. SafeSpeak connected me to a safe house and mental health support in the same week.", initials: "F.B.", role: "Survivor, Kano" },
  ];

  return (
    <section style={{ background: "linear-gradient(180deg, #F0F7FF 0%, #fff 100%)", padding: "96px 24px" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <SectionLabel>Our Impact</SectionLabel>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 700, color: "#1B3A5C", marginTop: "12px" }}>
            Real Change. Real Stories.
          </h2>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1}>
              <div style={{ textAlign: "center", background: "#fff", borderRadius: "18px", padding: "32px 20px", border: "1.5px solid #E2EEF8", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: "#1B3A5C" }}>{s.num}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#64748B", marginTop: "6px", lineHeight: 1.4 }}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={t.initials} delay={i * 0.12}>
              <TestimonialCard {...t} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ text, initials, role }) {
  return (
    <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", border: "1.5px solid #E2EEF8", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", position: "relative" }}>
      <div style={{ fontSize: "3rem", lineHeight: 1, color: "#2A9D8F", opacity: 0.3, fontFamily: "serif", marginBottom: "16px" }}>"</div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.925rem", color: "#334155", lineHeight: 1.75, marginBottom: "24px" }}>{text}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#2A9D8F,#1B3A5C)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>{initials}</div>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "13px", color: "#1B3A5C" }}>Anonymous Survivor</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#94A3B8" }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#EBF7F6", borderRadius: "100px", padding: "5px 16px" }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2A9D8F" }} />
      <span style={{ color: "#1e7a72", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
        <Navbar />
        <HeroSection />
        <TrustSection />
        <HowItWorks />
        <ReportCategories />
        <EmergencyHelp />
        <ResourcesSection />
        <ImpactSection />
        <Footer />
      </div>
    </>
  );
}