import { useState } from "react";
import Navbar from "../components/Navbar";

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const Icons = {
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  mapPin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  scale: "M12 3v4M8 7h8M4 21h16M6 10l-2 11M18 10l2 11M6 10h12",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7",
  chevronDown: "M6 9l6 6 6-6",
  chevronUp: "M18 15l-6-6-6 6",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  web: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  check: "M20 6L9 17l-5-5",
};

// ── Data ─────────────────────────────────────────────────────────────────────
const categories = [
  { key: "counseling", label: "Counseling & Mental Health", desc: "Connect with trauma-informed therapists and support groups for emotional recovery.", icon: "heart", accent: "#7C3AED", bg: "#F5F3FF" },
  { key: "legal", label: "Legal Assistance", desc: "Free legal advice, pro bono lawyers, and guidance through the justice system.", icon: "scale", accent: "#1D4ED8", bg: "#EFF6FF" },
  { key: "medical", label: "Medical Support", desc: "Access GBV-trained health providers for treatment, forensic exams, and care.", icon: "activity", accent: "#BE123C", bg: "#FFF1F2" },
  { key: "shelter", label: "Shelter & Protection", desc: "Verified safe houses, emergency shelters, and transitional housing near you.", icon: "home", accent: "#0F766E", bg: "#F0FDFA" },
  { key: "reporting", label: "Reporting Authorities", desc: "Report to law enforcement, the NAPTIP, or other official channels safely.", icon: "flag", accent: "#B45309", bg: "#FFFBEB" },
];

const organizations = [
  {
    name: "WARIF — Women at Risk International Foundation",
    desc: "Provides holistic support to survivors of sexual violence including counseling, legal aid, and shelter in Lagos.",
    phone: "0800-WARIF-HLP (08009274435)",
    email: "info@warifng.org",
    location: "Lagos, Nigeria",
    website: "#",
  },
  {
    name: "Project Alert on Violence Against Women",
    desc: "Offers shelter, legal representation, counseling, and advocacy for women survivors of violence.",
    phone: "+234 803 307 5816",
    email: "projectalertng@yahoo.com",
    location: "Lagos, Nigeria",
    website: "#",
  },
  {
    name: "NAPTIP — National Agency for Prohibition of Trafficking in Persons",
    desc: "Government agency handling trafficking and related GBV cases nationwide, with offices across Nigeria.",
    phone: "0800-NAPTIP-NG",
    email: "info@naptip.gov.ng",
    location: "Abuja (HQ) + Nationwide",
    website: "#",
  },
  {
    name: "Gender Mobile Initiative",
    desc: "Uses mobile technology to report, document, and respond to GBV cases across Nigerian universities and communities.",
    phone: "+234 806 000 0000",
    email: "hello@gendermobile.org",
    location: "Nationwide, Nigeria",
    website: "#",
  },
  {
    name: "Mirabel Centre",
    desc: "Provides free, confidential, and compassionate medical and psychosocial support to survivors of sexual assault.",
    phone: "+234 818 660 8000",
    email: "mirabelnigeria@gmail.com",
    location: "Lagos, Nigeria",
    website: "#",
  },
  {
    name: "FIDA Nigeria — Int'l Federation of Women Lawyers",
    desc: "Offers free legal aid, court representation, and advocacy for women and children facing violence and discrimination.",
    phone: "+234 1 493 2836",
    email: "fidanigeria@fidanigeria.org",
    location: "Lagos + multiple states",
    website: "#",
  },
];

const accordionItems = [
  {
    q: "What should I do immediately after an assault?",
    steps: [
      "Get to a safe location as soon as possible.",
      "Try not to shower, change clothes, or clean up — this helps preserve evidence.",
      "Seek medical care within 72 hours for emergency contraception and STI prevention.",
      "Call the WARIF hotline (08009274435) or go to the nearest Mirabel Centre.",
      "You do not have to report to police immediately — seek support first.",
    ],
  },
  {
    q: "How do I seek help safely if my abuser is at home?",
    steps: [
      "Contact a trusted friend, neighbor, or family member discreetly.",
      "Use a shared or public device if your phone or computer is monitored.",
      "Memorize one emergency number or keep it written somewhere private.",
      "Have a bag ready with essentials: ID, money, medications, important documents.",
      "Identify a safe word with someone close who can call for help on your behalf.",
    ],
  },
  {
    q: "How do I preserve evidence after GBV?",
    steps: [
      "Do not wash, bathe, or change your clothes before a medical examination.",
      "Keep any physical objects (torn clothing, notes, weapons) in a sealed bag.",
      "Screenshot threatening messages, emails, or social media posts immediately.",
      "Write down a detailed account of what happened while memory is fresh.",
      "Seek a forensic medical exam at a GBV-trained facility within 72 hours.",
    ],
  },
];

const safetyTips = [
  { icon: "shield", title: "Personal Safety", tips: ["Trust your instincts — if something feels wrong, leave.", "Share your location with a trusted contact when going out.", "Avoid isolated places, especially at night.", "Have an emergency contact on speed dial."] },
  { icon: "lock", title: "Protecting Your Identity", tips: ["Avoid sharing home address or daily routine on social media.", "Use a PO box or trusted address for sensitive mail.", "Vary your routes and daily schedule if you feel watched.", "Change passwords on all accounts regularly."] },
  { icon: "eye", title: "Digital Safety", tips: ["Use a browser in private/incognito mode when researching help.", "Clear your browser history after visiting this site.", "Turn off location sharing on your phone when needed.", "Use encrypted apps like Signal for private communication."] },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function EmergencySection() {
  return (
    <section style={{
      background: `linear-gradient(145deg, rgba(15,39,68,0.92) 0%, rgba(27,58,92,0.85) 45%, rgba(26,74,107,0.7) 100%), url('https://www.globalgiving.org/pfil/38244/pict_large.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      minHeight: "60vh",
      position: "relative",
      overflow: "hidden", }}>

      <br />
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "24px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ADE80", animation: "pulse 2s infinite" }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Help is available 24/7</span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 700, color: "#fff", margin: "0 0 16px", lineHeight: 1.2 }}>
          Need Immediate Help?
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: "40px", maxWidth: "520px", margin: "0 auto 40px" }}>
          You are not alone. Reach out now — everything is confidential and free.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          {[
            { icon: "phone", label: "Call Hotline", sub: "08009274435 (WARIF)", bg: "#2A9D8F", hover: "#238a7e" },
            { icon: "shield", label: "Emergency Support", sub: "Immediate safe shelter", bg: "#1D4ED8", hover: "#1a44c2" },
            { icon: "mapPin", label: "Find Nearby Help", sub: "Locate services near you", bg: "#7C3AED", hover: "#6d31d4" },
          ].map((btn) => (
            <EmergencyButton key={btn.label} {...btn} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </section>
  );
}

function EmergencyButton({ icon, label, sub, bg }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
        border: `1.5px solid ${hov ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}`,
        borderRadius: "14px",
        padding: "20px 16px",
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hov ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <Icon d={Icons[icon]} size={22} />
      </div>
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "14px", color: "#fff", margin: "0 0 3px" }}>{label}</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: 0 }}>{sub}</p>
      </div>
    </button>
  );
}

function CategoriesSection() {
  return (
    <section style={{ background: "#F8FAFC", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader label="Browse by need" title="Resource Categories" sub="Find the right type of support for your situation." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          {categories.map((c) => <CategoryCard key={c.key} {...c} />)}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ label, desc, icon, accent, bg }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        border: `0.5px solid ${hov ? accent : "#E2EAF0"}`,
        borderRadius: "14px",
        padding: "22px 18px",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? `0 8px 24px ${accent}20` : "0 1px 3px rgba(0,0,0,0.04)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: accent, opacity: hov ? 1 : 0, transition: "opacity 0.2s" }} />
      <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: hov ? bg : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: hov ? accent : "#64748B", marginBottom: "14px", transition: "all 0.2s" }}>
        <Icon d={Icons[icon]} size={20} />
      </div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "14px", color: "#0F2A45", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: "#64748B", lineHeight: 1.6, margin: "0 0 16px" }}>{desc}</p>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: accent, display: "flex", alignItems: "center", gap: "4px" }}>
        View Resources <Icon d={Icons.arrowRight} size={12} />
      </span>
    </button>
  );
}

function OrgsSection() {
  return (
    <section style={{ background: "#fff", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader label="Verified partners" title="Support Organizations" sub="Trusted Nigeria-based organizations ready to help." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {organizations.map((o) => <OrgCard key={o.name} {...o} />)}
        </div>
      </div>
    </section>
  );
}

function OrgCard({ name, desc, phone, email, location, website }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        border: `0.5px solid ${hov ? "#2A9D8F" : "#E2EAF0"}`,
        borderRadius: "14px",
        padding: "22px",
        transition: "all 0.2s",
        boxShadow: hov ? "0 8px 24px rgba(42,157,143,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#F0FDFA", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F766E", flexShrink: 0 }}>
          <Icon d={Icons.shield} size={18} />
        </div>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "14px", color: "#0F2A45", margin: "0 0 2px", lineHeight: 1.3 }}>{name}</p>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#0F766E", fontWeight: 600, background: "#F0FDFA", padding: "2px 8px", borderRadius: "100px" }}>{location}</span>
        </div>
      </div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569", lineHeight: 1.65, margin: "0 0 16px" }}>{desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
        {[{ icon: "phone", val: phone }, { icon: "mail", val: email }].map(({ icon, val }) => (
          <div key={val} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon d={Icons[icon]} size={13} style={{ color: "#94A3B8", flexShrink: 0 }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: "#64748B" }}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <a href={`tel:${phone}`} style={{ flex: 1, background: "#0F2A45", color: "#fff", borderRadius: "8px", padding: "9px 0", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
          <Icon d={Icons.phone} size={13} /> Call
        </a>
        <a href={website} style={{ flex: 1, background: "#F0FDFA", color: "#0F766E", borderRadius: "8px", padding: "9px 0", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
          <Icon d={Icons.web} size={13} /> Website
        </a>
      </div>
    </div>
  );
}

function WhatToDoSection() {
  const [open, setOpen] = useState(null);
  return (
    <section style={{ background: "#F8FAFC", padding: "80px 24px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <SectionHeader label="Guidance" title="What To Do If…" sub="Clear, simple steps for common situations. You don't have to figure this out alone." />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {accordionItems.map((item, i) => (
            <div key={i} style={{ background: "#fff", border: `0.5px solid ${open === i ? "#2A9D8F" : "#E2EAF0"}`, borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", background: "none", border: "none", cursor: "pointer", gap: "12px" }}
              >
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "14.5px", color: "#0F2A45", textAlign: "left" }}>{item.q}</span>
                <Icon d={open === i ? Icons.chevronUp : Icons.chevronDown} size={16} style={{ color: "#64748B", flexShrink: 0 }} />
              </button>
              {open === i && (
                <div style={{ padding: "0 20px 20px", borderTop: "0.5px solid #E2EAF0" }}>
                  <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {item.steps.map((step, j) => (
                      <li key={j} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#F0FDFA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, color: "#0F766E" }}>{j + 1}</span>
                        </div>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", color: "#334155", lineHeight: 1.65 }}>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SafetySection() {
  return (
    <section style={{ background: "#fff", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader label="Stay safe" title="Safety Tips" sub="Practical steps to protect yourself physically, personally, and digitally." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {safetyTips.map((s) => (
            <div key={s.title} style={{ background: "#F8FAFC", border: "0.5px solid #E2EAF0", borderRadius: "14px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: "#0F2A45", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Icon d={Icons[s.icon]} size={17} />
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "14px", color: "#0F2A45", margin: 0 }}>{s.title}</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "9px" }}>
                {s.tips.map((tip) => (
                  <li key={tip} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <div style={{ marginTop: "4px", flexShrink: 0 }}>
                      <Icon d={Icons.check} size={13} style={{ color: "#2A9D8F" }} />
                    </div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "#0F2A45", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "14px 18px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Icon d={Icons.shield} size={15} style={{ color: "#FCD34D", flexShrink: 0 }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Disclaimer:</strong> This platform does not replace emergency services. If you are in immediate danger, call 112 or your local emergency number.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            © 2025 SafeReach Nigeria. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy Policy", "Contact", "Help"].map((l) => (
              <a key={l} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.5)")}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SectionHeader({ label, title, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "48px" }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2A9D8F", display: "block", marginBottom: "10px" }}>{label}</span>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)", fontWeight: 700, color: "#0F2A45", margin: "0 0 12px", lineHeight: 1.2 }}>{title}</h2>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1rem", color: "#475569", lineHeight: 1.75, maxWidth: "480px", margin: "0 auto" }}>{sub}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar/><br /><br /><br />
      <EmergencySection />
      <CategoriesSection />
      <OrgsSection />
      <WhatToDoSection />
      <SafetySection />
      <Footer />
    </div>
  );
}