import { useState, useEffect, useRef } from "react";
import { trackCase, sendMessage } from "../api/report.api";
import { useParams } from "react-router-dom";
import {
  collection, query, where, orderBy,
  onSnapshot, getDocs
} from "firebase/firestore";
import { db } from "./firebase";
import { playNotificationSound } from "../utils/playSound";
import { getSingleReport } from "../api/report.api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


// ─── HELPERS ──────────────────────────────────────────────────────────────────

const parseDate = (value) => {
  if (!value) return null;

  // Firestore Timestamp
  if (value?.toDate) {
    return value.toDate();
  }

  // Already a Date object
  if (value instanceof Date) {
    return value;
  }

  // Firestore serialized object
  if (value?.seconds) {
    return new Date(value.seconds * 1000);
  }

  // String
  if (typeof value === "string") {
    // Firestore exports "UTC+1" which JS Date can't parse.
    const cleaned = value.replace("UTC+1", "+01:00");
    return new Date(cleaned);
  }

  return new Date(value);
};

export const formatDate = (value) => {
  const date = parseDate(value);

  if (!date || isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatTime = (value) => {
  const date = parseDate(value);

  if (!date || isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS = {
  pending:     { label: "Pending",     dot: "#F59E0B", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "in-progress":{ label: "In Progress", dot: "#3B82F6", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  resolved:    { label: "Resolved",    dot: "#10B981", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  closed:      { label: "Closed",      dot: "#6B7280", bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },
};

const PRIORITY = {
  high:   { label: "High",   bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
  medium: { label: "Medium", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  low:    { label: "Low",    bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
};

function StatusBadge({ status }) {
  const s = STATUS[status?.toLowerCase()] || STATUS.pending;
  return (
    <span style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}`, display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const p = PRIORITY[priority?.toLowerCase()] || PRIORITY.medium;
  return (
    <span style={{ background: p.bg, color: p.text, border: `1px solid ${p.border}`, padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {p.label}
    </span>
  );
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, color = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const ICONS = {
  send:       "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
  case:       "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2",
  location:   "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  calendar:   "M3 4h18v18H3z M16 2v4M8 2v4M3 10h18",
  user:       "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  shield:     "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  lock:       "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  eye:        "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  back:       "M19 12H5M12 19l-7-7 7-7",
  chat:       "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  check:      "M20 6L9 17l-5-5",
};

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ caseId, setCaseId, pin, setPin, loading, error, onTrack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Wordmark */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "40px", background: "#0F2A45", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ico d={ICONS.shield} size={20} color="#2A9D8F" />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#0F2A45" }}>SafeSpeak</span>
          </div>
          <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0 }}>Secure Case Tracking Portal</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: "20px", padding: "36px", border: "0.5px solid #E2EAF0", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#0F2A45", margin: "0 0 6px" }}>Track Your Case</h2>
          <p style={{ fontSize: "13.5px", color: "#64748B", margin: "0 0 28px", lineHeight: 1.6 }}>Enter your Case ID and PIN to access your report and communicate with your caseworker.</p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "0.5px solid #FECACA", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px", fontSize: "13px", color: "#991B1B", display: "flex", alignItems: "center", gap: "8px" }}>
              <Ico d={ICONS.shield} size={14} color="#991B1B" /> {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#475569", marginBottom: "6px" }}>Case ID</label>
              <input
                placeholder="e.g. SS-2024-00123"
                style={{ width: "100%", height: "46px", padding: "0 14px", border: "0.5px solid #CBD5E1", borderRadius: "10px", fontSize: "14px", color: "#0F2A45", background: "#F8FAFC", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                onFocus={e => e.target.style.borderColor = "#2A9D8F"}
                onBlur={e => e.target.style.borderColor = "#CBD5E1"}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#475569", marginBottom: "6px" }}>PIN</label>
              <input
                placeholder="Enter your PIN"
                type="password"
                style={{ width: "100%", height: "46px", padding: "0 14px", border: "0.5px solid #CBD5E1", borderRadius: "10px", fontSize: "14px", color: "#0F2A45", background: "#F8FAFC", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onTrack()}
                onFocus={e => e.target.style.borderColor = "#2A9D8F"}
                onBlur={e => e.target.style.borderColor = "#CBD5E1"}
              />
            </div>
            <button
              onClick={onTrack}
              disabled={loading}
              style={{ width: "100%", height: "48px", background: loading ? "#94A3B8" : "#0F2A45", color: "#fff", border: "none", borderRadius: "10px", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.2s" }}
              onMouseOver={e => !loading && (e.target.style.background = "#1B3A5C")}
              onMouseOut={e => !loading && (e.target.style.background = "#0F2A45")}
            >
              {loading ? "Verifying…" : <><Ico d={ICONS.eye} size={16} color="#fff" /> Access Case</>}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
          <Ico d={ICONS.lock} size={12} color="#94A3B8" /> All communication is end-to-end encrypted
        </p>
      </div>
    </div>
  );
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "40px", height: "40px", border: "3px solid #E2EAF0", borderTop: "3px solid #2A9D8F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#64748B" }}>Loading case…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── CASE DETAIL PANEL ────────────────────────────────────────────────────────
function CasePanel({ report, onReset, isLinked }) {
  const metaItems = [
    report.incidentDate && { icon: ICONS.calendar, label: "Date of Incident", value: formatDate(report.incidentDate) },
    report.location?.address && { icon: ICONS.location, label: "Location", value: report.location.address },
    report.type && { icon: ICONS.case, label: "Incident Type", value: report.type },
    report.perpetratorRelationship && { icon: ICONS.user, label: "Relationship", value: report.perpetratorRelationship },
  ].filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" , borderRight: "0.5px solid #E2EAF0", boxShadow: "inset 0 0 0.8px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ padding: "24px 24px 20px", borderBottom: "0.5px solid #F1F5F9", background: "#1B3A5C", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div className="bg-gradient-to-br from-[#2A9D8F] to-[#1B3A5C]" style={{ width: "36px", height: "36px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico d={ICONS.shield} size={17} color="white" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "white" }}>SafeSpeak</span>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 6px" }}>Case Reference</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "20px", fontWeight: 700, color: "white", margin: "0 0 12px", letterSpacing: "-0.02em" }}>{report.caseId}</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <StatusBadge status={report.status} />
          {report.priority && <PriorityBadge priority={report.priority} />}
        </div>
      </div>

      {/* Meta */}
      <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 14px" }}>Case Details</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {metaItems.map(({ icon, label, value }) => (
            <div key={label} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "32px", height: "32px", background: "#F8FAFC", border: "0.5px solid #E2EAF0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ico d={icon} size={14} color="#64748B" />
              </div>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#94A3B8", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", color: "#0F2A45", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        {report.description && (
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 10px" }}>Description</p>
            <div style={{ background: "#F8FAFC", border: "0.5px solid #E2EAF0", borderRadius: "10px", padding: "14px" }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#334155", lineHeight: 1.7, margin: 0 }}>{report.description}</p>
            </div>
          </div>
        )}

        {/* Submitted */}
        {report.createdAt && (
          <div style={{ marginTop: "16px", padding: "10px 14px", background: "#F0FDFA", border: "0.5px solid #A7F3D0", borderRadius: "10px" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#065F46", margin: 0 }}>
              <strong>Submitted:</strong> {formatDate(report.createdAt)} at {formatTime(report.createdAt)}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "0.5px solid #F1F5F9" }}>
        <button
          onClick={onReset}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "0.5px solid #E2EAF0", borderRadius: "8px", padding: "9px 14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", fontWeight: 600, color: "#64748B", transition: "all 0.2s", width: "100%" }}
          onMouseOver={e => e.currentTarget.style.borderColor = "#94A3B8"}
          onMouseOut={e => e.currentTarget.style.borderColor = "#E2EAF0"}
        >
          <Ico d={ICONS.back} size={14} color="#64748B" />
          {isLinked ? "Go Back" : "Track Another Case"}
        </button>
      </div>
    </div>
  );
}

// ─── CHAT PANEL ───────────────────────────────────────────────────────────────
function ChatPanel({ messages, messagesLoading, message, setMessage, onSend, report }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  // Group messages by date
  const grouped = messages.reduce((acc, m) => {
    const d = m.createdAt ? formatDate(m.createdAt) : "Today";
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {});

  return (
    
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F4F4F4" }}>
       
      {/* Chat header */}
      <div style={{ padding: "18px 24px", background: "#fff", borderBottom: "0.5px solid #E2EAF0", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "38px", height: "38px", background: "#EBF7F6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ico d={ICONS.user} size={17} color="#2A9D8F" />
        </div>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 700, color: "#0F2A45", margin: 0 }}>Caseworker</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#64748B", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block" }} /> Assigned to your case
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
          <Ico d={ICONS.lock} size={13} color="#94A3B8" />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#94A3B8" }}>Encrypted</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {messagesLoading ? (

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px"
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                border: "3px solid #E2EAF0",
                borderTop: "3px solid #2A9D8F",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
              }}
            />

            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#475569",
                  margin: "0 0 4px"
                }}
              >
                Loading messages...
              </p>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  color: "#94A3B8",
                  margin: 0
                }}
              >
                Connecting to secure chat
              </p>
            </div>
          </div>

        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", opacity: 0.5 }}>
            <div style={{ width: "48px", height: "48px", background: "#E2EAF0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ico d={ICONS.chat} size={22} color="#94A3B8" />
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#94A3B8", margin: 0, textAlign: "center" }}>
              No messages yet.<br />Your caseworker will respond here.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              {/* Date divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
                <div style={{ flex: 1, height: "0.5px", background: "#E2EAF0" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#94A3B8", fontWeight: 600, whiteSpace: "nowrap" }}>{date}</span>
                <div style={{ flex: 1, height: "0.5px", background: "#E2EAF0" }} />
              </div>
              {msgs.map((m, i) => {
                const isSurvivor = m.senderRole === "survivor";
                return (
                  <div key={m.id || i} style={{ display: "flex", justifyContent: isSurvivor ? "flex-end" : "flex-start", marginBottom: "8px" }}>
                    {!isSurvivor && (
                      <div style={{ width: "28px", height: "28px", background: "#EBF7F6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: "8px", alignSelf: "flex-end" }}>
                        <Ico d={ICONS.user} size={13} color="#2A9D8F" />
                      </div>
                    )}
                    <div style={{ maxWidth: "72%" }}>
                      <div style={{
                        background: isSurvivor ? "#0F2A45" : "#fff",
                        color: isSurvivor ? "#fff" : "#0F2A45",
                        border: isSurvivor ? "none" : "0.5px solid #E2EAF0",
                        borderRadius: isSurvivor ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        padding: "10px 14px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", lineHeight: 1.55, margin: 0 }}>{m.message}</p>
                      </div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10.5px", color: "#94A3B8", margin: "4px 0 0", textAlign: isSurvivor ? "right" : "left", display: "flex", alignItems: "center", gap: "3px", justifyContent: isSurvivor ? "flex-end" : "flex-start" }}>
                        {formatTime(m.createdAt)}
                        {isSurvivor && <Ico d={ICONS.check} size={10} color="#2A9D8F" />}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "14px 20px", background: "#fff", borderTop: "0.5px solid #E2EAF0" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            style={{
              flex: 1, border: "0.5px solid #E2EAF0", borderRadius: "12px", padding: "12px 14px",
              fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", color: "#0F2A45",
              background: "#F8FAFC", outline: "none", resize: "none", lineHeight: 1.5,
              maxHeight: "100px", overflow: "auto", transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#2A9D8F"}
            onBlur={e => e.target.style.borderColor = "#E2EAF0"}
          />
          <button
            onClick={onSend}
            disabled={!message.trim()}
            style={{
              width: "44px", height: "44px", background: message.trim() ? "#2A9D8F" : "#E2EAF0",
              border: "none", borderRadius: "12px", cursor: message.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: "all 0.2s", transform: "none",
            }}
            onMouseOver={e => message.trim() && (e.currentTarget.style.background = "#238a7e")}
            onMouseOut={e => message.trim() && (e.currentTarget.style.background = "#2A9D8F")}
          >
            <Ico d={ICONS.send} size={16} color={message.trim() ? "#fff" : "#94A3B8"} />
          </button>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10.5px", color: "#94A3B8", margin: "8px 0 0", textAlign: "center" }}>
          Messages are encrypted and visible only to you and your assigned caseworker.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TrackReport() {
  const { id } = useParams();
  const [caseId, setCaseId] = useState("");
  const [pin, setPin] = useState("");
  const [sessionPin, setSessionPin] = useState("");
  const [report, setReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await getSingleReport(id);
        setReport(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleTrack = async () => {
    if (!caseId || !pin) return setError("Case ID and PIN required");
    try {
      setLoading(true);
      setError("");
      const res = await trackCase({ caseId, pin });
      setReport(res.report);
      setSessionPin(pin);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to track case");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!report) return;

    let unsubscribeMessages;
    let previousLength = 0;

    const setupRealtime = async () => {
      setMessagesLoading(true);

      try {
        const q = query(
          collection(db, "report"),
          where("caseId", "==", report.caseId)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          setMessages([]);
          setMessagesLoading(false);
          return;
        }

        const reportDoc = snap.docs[0];

        const msgQuery = query(
          collection(db, "report", reportDoc.id, "messages"),
          orderBy("createdAt", "asc")
        );

        unsubscribeMessages = onSnapshot(msgQuery, (msgSnap) => {
          const realtimeMessages = msgSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          const isNewMessage =
            realtimeMessages.length > previousLength;

          const lastMessage =
            realtimeMessages[realtimeMessages.length - 1];

          if (
            previousLength !== 0 &&
            isNewMessage &&
            lastMessage
          ) {
            playNotificationSound();
          }

          previousLength = realtimeMessages.length;

          setMessages(realtimeMessages);

          // stop loading after first snapshot
          setMessagesLoading(false);
        });

      } catch (err) {
        console.error(err);
        setMessagesLoading(false);
      }
    };

    setupRealtime();

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [report]);

  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      await sendMessage(
        { caseId: report.caseId, message },
        id ? null : sessionPin
      );
      setMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  };

  const handleReset = () => {
    if (id) {
      window.history.back();
    } else {
      setReport(null);
      setMessages([]);
      setSessionPin("");
      setCaseId("");
      setPin("");
    }
  };

  if (loading) return <LoadingScreen />;

  if (!report && !id) {
    return (
      <LoginScreen
        caseId={caseId} setCaseId={setCaseId}
        pin={pin} setPin={setPin}
        loading={loading} error={error}
        onTrack={handleTrack}
      />
    );
  }

  if (!report && id) return <LoadingScreen />;

  // ── Split-screen dashboard ──────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; }
        .dashboard { display: flex; height: 100vh; overflow: hidden; font-family: 'DM Sans', sans-serif; }
        .case-panel { width: 380px; min-width: 320px; flex-shrink: 0; overflow: hidden; display: flex; flex-direction: column; }
        .chat-panel { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
        @media (max-width: 768px) {
          .dashboard { flex-direction: column; height: auto; overflow: auto; }
          .case-panel { width: 100%; min-width: unset; height: auto; border-right: none !important; border-bottom: 0.5px solid #E2EAF0; }
          .chat-panel { height: 75vh; }
        }
      `}</style>

      <Navbar />
      <div className="dashboard">
        <div className="case-panel">
          <CasePanel report={report} onReset={handleReset} isLinked={!!id} />
        </div>
        <div className="chat-panel">
          <ChatPanel
            messages={messages}
            messagesLoading={messagesLoading}
            message={message}
            setMessage={setMessage}
            onSend={handleSend}
            report={report}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}