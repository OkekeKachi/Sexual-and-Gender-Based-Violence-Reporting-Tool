// components/Sidebar.jsx
import { icon } from "leaflet";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const NAV = [
  {
    section: "Overview",
    items: [
      { label: "Home", path: "/", icon: IconHome },
      { label: "Dashboard", path: "/dashboard", icon: IconGrid },
      
      { label: "Report Incident", path: "/report", icon: IconFlag, badge: "New" },
    ],
  },
  {
    section: "Case Management",
    items: [
      { label: "All Cases", path: "/cases", icon: IconBriefcase },
      { label: "Survivors", path: "/survivors", icon: IconUser },
      { label: "Responders", path: "/responders", icon: IconUsers },
    ],
  },
  {
    section: "Analysis",
    items: [
      { label: "Analytics", path: "/analytics", icon: IconChart },
      { label: "Incident Map", path: "/map", icon: IconPin },
      { label: "Reports", path: "/reports-export", icon: IconDoc },
    ],
  },
  {
    section: "System Management",
    items: [
      { label: "Worker", path: "/create-worker", icon: IconUser },
      { label: "Department", path: "/create-department", icon: IconGrid},
      
    ],
  }
];

export default function Sidebar({ user }) {
  
  const { profile, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
      : "AU";
  return (
    <aside className="w-[230px] min-w-[230px] bg-[var(--surface-sidebar)] flex flex-col h-screen sticky top-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-[18px] border-b border-white/10">
        <div className="w-[34px] h-[34px] bg-gradient-to-br from-[#2A9D8F] to-[#1B3A5C] rounded-[9px] flex items-center justify-center shrink-0">
          <IconShield />
        </div>
        <div>
          <div className="text-[17px] font-semibold text-white tracking-tight">SafeSpeak</div>
          <div className="text-[13px] text-white/40 mt-px">SGBV Management</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.section} className="mb-1.5">
            <div className="px-5 pt-2.5 pb-1 text-[12px] font-semibold tracking-widest uppercase text-white/30">
              {group.section}
            </div>
            {group.items.map(({ label, path, icon: Icon, badge }) => {
              const active = pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-2.5 w-full px-5 py-2.5 text-left text-[15px] border-l-[3px] transition-all duration-150 cursor-pointer
                    ${active
                      ? "bg-white/10 text-white font-medium border-blue-300"
                      : "bg-transparent text-white/60 border-transparent hover:bg-white/[0.07] hover:text-white/90"
                    }`}
                >
                  <Icon className={`w-[15px] h-[15px] shrink-0 ${active ? "opacity-100" : "opacity-75"}`} />
                  <span>{label}</span>
                  {badge && (
                    <span className="ml-auto bg-red-500 text-white text-[12px] font-semibold px-1.5 py-0.5 rounded-full tracking-wide">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-white/10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[14px] font-semibold text-white shrink-0"> 
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium text-white truncate">
            {profile?.firstName && profile?.lastName
              ? `${profile.firstName} ${profile.lastName}`
              : "Admin User"}
          </div>
          <div className="text-[13px] text-white/40">{profile?.role
            ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
            : "Administrator"}</div>
        </div>
      </div>
    </aside>
  );
}

/* ─── Icons (unchanged) ──────────────────────────────────────────────────── */
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  );
}
function IconGrid({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>;
}
function IconFlag({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z" /></svg>;
}
function IconHome({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>;
}
function IconBriefcase({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4C8.9 3 8 3.9 8 5v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm10 15H4V9h16v11z" /></svg>;
}
function IconUser({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
}
function IconUsers({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>;
}
function IconChart({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>;
}
function IconPin({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>;
}
function IconDoc({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>;
}