// WorkerDashboard.jsx
import { useState } from "react";
import CaseList from "../components/CaseList";
import CaseDetails from "../components/CaseDetails";
import ActivityPanel from "../components/ActivityPanel";

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const QueueIcon = () => (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M4 6h16M4 10h16M4 14h10" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const navItems = [
  { id: "queue", label: "Unit Queue", icon: QueueIcon },
  { id: "mine", label: "My Cases", icon: UserIcon },
];

export default function WorkerDashboard() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [view, setView] = useState("queue");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      <div className="flex h-screen bg-slate-100 overflow-hidden">

        {/* ─── Sidebar ─── */}
        <aside className="w-56 bg-slate-950 text-white flex flex-col shrink-0 shadow-xl">

          {/* Logo */}
          <div className="px-4 py-4 border-b border-slate-800/70 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
              <ShieldIcon />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide leading-none">SafeSpeak</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 tracking-wide uppercase">Case Management</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <p className="px-2 mb-2.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
              Navigation
            </p>
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = view === id;
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                    }`}
                >
                  <span className={`transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>
                    <Icon />
                  </span>
                  <span className="flex-1 text-left">{label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="px-4 py-3.5 border-t border-slate-800/70">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                CW
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-300 leading-none">Caseworker</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Active session</p>
              </div>
              <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
            </div>
          </div>
        </aside>

        {/* ─── Main Area ─── */}
        <div className="flex flex-1 min-w-0 overflow-hidden">

          {/* LEFT: Case List */}
          <div className="w-[280px] shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden shadow-sm">
            <CaseList
              view={view}
              onSelect={setSelectedCase}
              selectedId={selectedCase?.id}
            />
          </div>

          {/* CENTER: Case Details */}
          <div className="flex-1 min-w-0 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
            <CaseDetails caseData={selectedCase} />
          </div>

          {/* RIGHT: Activity Panel */}
          <div className="w-[300px] shrink-0 bg-white flex flex-col overflow-hidden shadow-sm">
            <ActivityPanel caseData={selectedCase} />
          </div>

        </div>
      </div>
    </>
  );
}