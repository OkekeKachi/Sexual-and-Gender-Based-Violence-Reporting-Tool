import { useEffect, useState, useMemo, useRef } from "react";
import { getUserReports } from "../api/report.api";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FileText, Clock, Zap, CheckCircle } from 'lucide-react';

// ─── DESIGN TOKENS (matches Home page exactly) ────────────────────────────────
// Navy #1B3A5C | Teal #2A9D8F | Soft Blue #F0F7FF | Teal Bg #EBF7F6
// Slate #334155 | Muted #64748B | Border #E2EEF8 | Amber #F4A261

// ─── ANIMATION HOOK (copied from Home) ───────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

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

// ─── SECTION LABEL (identical to Home) ───────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      background: "#EBF7F6", borderRadius: "100px", padding: "5px 16px",
    }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2A9D8F" }} />
      <span style={{
        color: "#1e7a72", fontSize: "12px", fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        {children}
      </span>
    </div>
  );
}

// ─── HERO (same gradient + fixed bg + grid overlay + blob as Home/Report pages)
function HeroSection({ user }) {
  const initials = user?.displayName
    ? user.displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <section
      style={{
        background: `linear-gradient(145deg, rgba(15,39,68,0.92) 0%, rgba(27,58,92,0.85) 45%, rgba(26,74,107,0.7) 100%), url('/hero-image.jpg')`,
        backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
        minHeight: "44vh", position: "relative", overflow: "hidden",
      }}
      className="flex items-center"
    >
      <div style={{
        position: "absolute", top: "-120px", right: "-80px",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(42,157,143,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px", pointerEvents: "none",
      }} />

      <div className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div style={{ opacity: 0, animation: "fadeSlideUp 0.8s ease 0.2s forwards" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(42,157,143,0.15)", border: "1px solid rgba(42,157,143,0.3)",
            borderRadius: "100px", padding: "6px 16px", marginBottom: "24px",
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2A9D8F" }} />
            <span style={{ color: "#7DD8D1", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
              Case Management Portal
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                fontWeight: 700, color: "#fff", lineHeight: 1.15, margin: 0,
              }}>
                Your <span style={{ color: "#2A9D8F" }}>Reports</span>
              </h1>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "1rem", color: "rgba(255,255,255,0.65)",
                marginTop: "10px", lineHeight: 1.6, margin: "10px 0 0",
              }}>
                Track and manage all your submitted cases in one place.
              </p>
            </div>

            {/* Avatar — matches testimonial card avatar from Home */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "14px", color: "#fff" }}>
                  {user?.displayName || "Anonymous User"}
                </div>
                {user?.email && (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                    {user.email}
                  </div>
                )}
              </div>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "linear-gradient(135deg,#2A9D8F,#1B3A5C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "16px",
                fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.2)",
              }}>
                {initials}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>
    </section>
  );
}

// ─── STATUS / PRIORITY CONFIG ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { label: "Pending",     dot: "#CA8A04", bg: "rgba(202,138,4,0.1)",    color: "#92400E", border: "rgba(202,138,4,0.25)" },
  reviewed:    { label: "Reviewed",    dot: "#2A9D8F", bg: "#EBF7F6",                color: "#1e7a72", border: "rgba(42,157,143,0.3)" },
  assigned:    { label: "Assigned",    dot: "#2A9D8F", bg: "#EBF7F6",                color: "#1e7a72", border: "rgba(42,157,143,0.3)" },
  in_progress: { label: "In Progress", dot: "#1B3A5C", bg: "rgba(27,58,92,0.08)",    color: "#1B3A5C", border: "rgba(27,58,92,0.2)"  },
  escalated:   { label: "Escalated",   dot: "#F4A261", bg: "rgba(244,162,97,0.15)",  color: "#92400E", border: "rgba(244,162,97,0.4)", urgent: true },
  resolved:    { label: "Resolved",    dot: "#2A9D8F", bg: "#EBF7F6",                color: "#1e7a72", border: "rgba(42,157,143,0.3)" },
  closed:      { label: "Closed",      dot: "#94A3B8", bg: "#F1F5F9",                color: "#64748B", border: "#E2E8F0" },
};

const PRIORITY_CONFIG = {
  low:    { label: "Low",    color: "#64748B", bg: "#F1F5F9", icon: "↓" },
  medium: { label: "Medium", color: "#92400E", bg: "#FEF3C7", icon: "→" },
  high:   { label: "High",   color: "#991B1B", bg: "#FEE2E2", icon: "↑" },
};

const STATUS_ORDER = ["pending", "reviewed", "assigned", "in_progress", "escalated", "resolved", "closed"];

function formatDate(createdAt) {
  if (!createdAt) return "N/A";
  const ts = createdAt.seconds ? createdAt.seconds * 1000 : createdAt;
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── STATUS BADGE (pill style — same as Home's tag pills) ────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 12px", borderRadius: "100px",
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      fontSize: "11px", fontFamily: "'DM Sans', sans-serif",
      fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label.toUpperCase()}
    </span>
  );
}

// ─── PRIORITY BADGE ───────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "4px 10px", borderRadius: "100px",
      background: cfg.bg, color: cfg.color,
      fontSize: "11px", fontFamily: "'DM Sans', sans-serif",
      fontWeight: 700, letterSpacing: "0.04em",
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── STAT CARD (mirrors TrustCard from Home — icon box + hover lift + teal border)
function StatCard({ icon: Icon, label, value, delay = 0 }) {
  const [hovered, setHovered] = useState(false);

  const cardStyle = {
    background: "#fff",
    borderRadius: "12px", // Slightly tighter radius for a modern feel
    padding: "24px",
    border: "1px solid",
    borderColor: hovered ? "#2A9D8F" : "#E2E8F0",
    boxShadow: hovered ? "0 10px 25px -5px rgba(0, 0, 0, 0.05)" : "none",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    gap: "12px",
    cursor: "default",
    position: "relative",
    overflow: "hidden"
  };

  const iconContainerStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    background: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: hovered ? "#2A9D8F" : "#64748B",
    transition: "color 0.2s ease",
    alignSelf: "center"
  };

  const labelStyle = {
    fontFamily: "'Inter', 'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 500,
    color: "#64748B",
    letterSpacing: "-0.01em"
  };

  const valueStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "28px",
    fontWeight: 700,
    color: "#1E293B",
    lineHeight: 1
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={iconContainerStyle}>
        {/* Render Icon component here */}
        <Icon size={20} strokeWidth={2} />
      </div>

      <div>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{value}</div>
      </div>
    </div>
  );
}
// ─── REPORT CARD (mirrors TrustCard/ResourceCard interaction style from Home) ──
function ReportCard({ report, onViewDetails, animDelay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const lastAction = report.actions?.length > 0 ? report.actions[report.actions.length - 1] : null;
  const location   = report.location ? [report.location.city, report.location.state].filter(Boolean).join(", ") : null;

  const accentColor = report.status === "escalated" ? "#F4A261"
    : report.status === "closed" ? "#E2E8F0"
    : "#2A9D8F";

  return (
    <FadeIn delay={animDelay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff", borderRadius: "20px",
          border: "1.5px solid", borderColor: hovered ? "#2A9D8F" : "#E2EEF8",
          boxShadow: hovered ? "0 12px 40px rgba(42,157,143,0.12)" : "0 2px 12px rgba(0,0,0,0.04)",
          transition: "all 0.3s ease", transform: hovered ? "translateY(-4px)" : "none",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar — same concept as HotlineCard border accents */}
        <div style={{ height: "3px", background: `linear-gradient(90deg,${accentColor},${accentColor}88)` }} />

        <div style={{ padding: "24px 28px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Case
                </span>
                <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 800, color: "#1B3A5C", letterSpacing: "0.06em" }}>
                  #{report.caseId}
                </span>
              </div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#334155", margin: 0 }}>
                {report.type}
              </h3>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
              <StatusBadge status={report.status} />
              <PriorityBadge priority={report.priority} />
            </div>
          </div>

          {/* Metadata — small muted items like Home's resource tag line */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: lastAction ? "16px" : "20px" }}>
            {location && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#64748B" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-8-7.3-8-12a8 8 0 1 1 16 0c0 4.7-8 12-8 12z"/><circle cx="12" cy="9" r="3"/>
                </svg>
                {location}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#64748B" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {formatDate(report.createdAt)}
            </span>
            {report.actions?.length > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#64748B" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {report.actions.length} update{report.actions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Latest update — left-border panel in page's soft blue, matching Home's info blocks */}
          {lastAction && (
            <div style={{
              background: "#F0F7FF", borderRadius: "12px", padding: "12px 16px",
              borderLeft: "3px solid #2A9D8F", marginBottom: "20px",
            }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700,
                color: "#2A9D8F", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px",
              }}>
                Latest Update
              </div>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#334155",
                margin: 0, lineHeight: 1.65,
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>
                {lastAction.message}
              </p>
            </div>
          )}

          {/* CTA — matches ResourceCard "Learn More" link style from Home */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => onViewDetails(report.id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "10px 20px", borderRadius: "10px", border: "none",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "13px",
                cursor: "pointer",
                background: hovered ? "#2A9D8F" : "#EBF7F6",
                color: hovered ? "#fff" : "#1e7a72",
                boxShadow: hovered ? "0 4px 14px rgba(42,157,143,0.25)" : "none",
                transition: "all 0.25s ease",
              }}
            >
              View Details
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── FILTERS ──────────────────────────────────────────────────────────────────
function Filters({ search, setSearch, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter }) {
  const fieldStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1.5px solid #E2EEF8", fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif", color: "#334155",
    outline: "none", background: "#fff", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div style={{
      background: "#fff", borderRadius: "18px", padding: "20px 24px",
      border: "1.5px solid #E2EEF8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center",
    }}>
      {/* Search */}
      <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
        <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text" placeholder="Search by Case ID…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...fieldStyle, paddingLeft: "36px" }}
        />
      </div>

      {/* Status */}
      <select
        value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
        style={{
          ...fieldStyle, minWidth: "155px", appearance: "none", cursor: "pointer", paddingRight: "32px",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
        }}
      >
        <option value="">All Statuses</option>
        {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
      </select>

      {/* Priority */}
      <select
        value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
        style={{
          ...fieldStyle, minWidth: "148px", appearance: "none", cursor: "pointer", paddingRight: "32px",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
        }}
      >
        <option value="">All Priorities</option>
        <option value="high">↑ High</option>
        <option value="medium">→ Medium</option>
        <option value="low">↓ Low</option>
      </select>

      {/* Clear — uses amber pill like Home's EmergencyHelp section */}
      {(search || statusFilter || priorityFilter) && (
        <button
          onClick={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); }}
          style={{
            padding: "10px 16px", borderRadius: "10px",
            border: "1px solid rgba(244,162,97,0.4)",
            background: "rgba(244,162,97,0.1)", color: "#92400E",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
            fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ filtered }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "20px", padding: "72px 40px",
      border: "1.5px solid #E2EEF8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      textAlign: "center",
    }}>
      <div style={{
        width: "72px", height: "72px", borderRadius: "18px", background: "#EBF7F6",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", fontSize: "2rem",
      }}>
        {filtered ? "🔍" : "📋"}
      </div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#1B3A5C", margin: "0 0 10px" }}>
        {filtered ? "No matching reports" : "No reports yet"}
      </h3>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "#64748B", margin: "0 auto", maxWidth: "380px", lineHeight: 1.7 }}>
        {filtered
          ? "Try adjusting your search or filter criteria."
          : "Once you submit a report, it will appear here with full status tracking."}
      </p>
    </div>
  );
}

// ─── SKELETON LOADER ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #E2EEF8" }}>
      <div style={{ height: "3px", background: "#EBF7F6" }} />
      <div style={{ padding: "24px 28px" }}>
        {[["40%", "12px"], ["55%", "16px"], ["70%", "12px"], ["85%", "52px"]].map(([w, h], i) => (
          <div key={i} style={{
            height: h, width: w, borderRadius: "8px",
            background: i === 3 ? "#F0F7FF" : "#F1F5F9",
            marginBottom: i < 3 ? "12px" : "0",
            animation: "shimmer 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingReports, setFetchingReports] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const navigate = useNavigate();

  // 🔐 Auth state — unchanged
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return () => unsubscribe();
  }, []);

  // 📡 Fetch reports — unchanged
  useEffect(() => {
    if (!user) return;
    const fetchReports = async () => {
      try {
        setFetchingReports(true);
        const data = await getUserReports();
        setReports(data);
      } catch (err) {
        console.error("FETCH REPORTS ERROR:", err);
      } finally {
        setFetchingReports(false);
      }
    };
    fetchReports();
  }, [user]);

  const stats = useMemo(() => ({
    total:      reports.length,
    pending:    reports.filter(r => r.status === "pending").length,
    inProgress: reports.filter(r => ["in_progress", "assigned", "reviewed"].includes(r.status)).length,
    resolved:   reports.filter(r => ["resolved", "closed"].includes(r.status)).length,
  }), [reports]);

  const filtered = useMemo(() => reports.filter(r => {
    const matchSearch   = !search         || r.caseId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = !statusFilter   || r.status === statusFilter;
    const matchPriority = !priorityFilter || r.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  }), [reports, search, statusFilter, priorityFilter]);

  const isFiltering = !!(search || statusFilter || priorityFilter);
  const hasHighPriority = filtered.some(r => r.priority === "high" && !["resolved","closed"].includes(r.status));

  // ── Auth loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F0F7FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "3px solid #E2EEF8", borderTop: "3px solid #2A9D8F", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#64748B", fontSize: "14px" }}>Verifying session…</p>
        </div>
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ minHeight: "100vh", background: "#F0F7FF", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "56px 40px", textAlign: "center", maxWidth: "400px", width: "100%", border: "1.5px solid #E2EEF8", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#EBF7F6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "1.8rem" }}>🔒</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "#1B3A5C", margin: "0 0 10px" }}>Sign In Required</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#64748B", fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 28px" }}>Please log in to access your case reports.</p>
            <button
              onClick={() => navigate("/login")}
              style={{ padding: "13px 32px", borderRadius: "12px", background: "#2A9D8F", color: "#fff", border: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 14px rgba(42,157,143,0.25)" }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
        <Navbar />
        <HeroSection user={user} />

        {/* ── Stats ── #F0F7FF alternating section (same as TrustSection bg) */}
        <section style={{ background: "#FFFFFF", padding: "72px 24px 0" }}>
          <div className="max-w-5xl mx-auto">
            <FadeIn className="text-center" style={{ marginBottom: "40px" }}>
              <div style={{ marginBottom: "40px", textAlign: "center" }}>
                <SectionLabel>Overview</SectionLabel>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 700, color: "#1B3A5C", marginTop: "12px" }}>
                  Case Summary
                </h2>
              </div>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ paddingBottom: "72px" }}>
              <StatCard icon={FileText} label="Total Reports" value={stats.total} />
              <StatCard icon={Clock} label="Pending Review" value={stats.pending} />
              <StatCard icon={Zap} label="In Progress" value={stats.inProgress} />
              <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} />
            </div>
          </div>
        </section>

        {/* ── Reports ── white alternating section (same as HowItWorks bg) */}
        <section style={{ background: "#f5f7ff", padding: "72px 24px 96px" }}>
          <div className="max-w-5xl mx-auto">

            <FadeIn>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
                <div>
                  <SectionLabel>Your Cases</SectionLabel>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 700, color: "#1B3A5C", marginTop: "12px" }}>
                    All Reports
                  </h2>
                </div>

                {/* Amber alert pill — matches EmergencyHelp section pulse pill from Home */}
                {hasHighPriority && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "rgba(244,162,97,0.15)", border: "1px solid rgba(244,162,97,0.3)",
                    borderRadius: "100px", padding: "6px 16px", marginTop: "6px",
                  }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F4A261", animation: "pulse 2s infinite" }} />
                    <span style={{ color: "#92400E", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                      High priority case requires attention
                    </span>
                  </div>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.08}>
              <div style={{ marginBottom: "20px" }}>
                <Filters
                  search={search} setSearch={setSearch}
                  statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                  priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
                />
              </div>
            </FadeIn>

            {!fetchingReports && reports.length > 0 && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>
                {isFiltering
                  ? `Showing ${filtered.length} of ${reports.length} report${reports.length !== 1 ? "s" : ""}`
                  : `${reports.length} report${reports.length !== 1 ? "s" : ""} total`}
              </p>
            )}

            {fetchingReports ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState filtered={isFiltering} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {filtered.map((report, i) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onViewDetails={(id) => navigate(`/track/${id}`)}
                    animDelay={i * 0.05}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}