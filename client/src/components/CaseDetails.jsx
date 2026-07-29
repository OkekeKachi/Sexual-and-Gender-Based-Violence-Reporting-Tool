// CaseDetails.jsx
import { useState } from "react";
import { claimCase, resolveReport } from "../api/report.api";

// ── Sub-components ──────────────────────────────────────────────────────────

const statusConfig = {
  pending: { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending" },
  "in-progress": { cls: "bg-blue-50 text-blue-700 border-blue-200", label: "In Progress" },
  "in_progress": { cls: "bg-blue-50 text-blue-700 border-blue-200", label: "In Progress" },
  resolved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Resolved" },
};

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase().replace(" ", "-");
  const cfg = statusConfig[key] || { cls: "bg-slate-50 text-slate-500 border-slate-200", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${cfg.cls}`}>
      {cfg.label || status || "Unknown"}
    </span>
  );
};

const MetaRow = ({ label, value, mono = false }) => (
  <div className="flex items-start gap-4 py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-24 shrink-0 pt-0.5">
      {label}
    </span>
    <span className={`text-sm text-slate-700 font-medium ${mono ? "font-mono" : ""}`}>
      {value || <span className="text-slate-300 font-normal">—</span>}
    </span>
  </div>
);

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-10">
    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
      <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <p className="text-sm font-semibold text-slate-400">No Case Selected</p>
    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-[180px]">
      Select a case from the list to view its details
    </p>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────

export default function CaseDetails({ caseData }) {
  const [claiming, setClaiming] = useState(false);
  const [resolving, setResolving] = useState(false);

  if (!caseData) return <EmptyState />;

  const isResolved = caseData.status === "resolved";
  const isAssigned = !!caseData.assignment?.individualId;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claimCase(caseData.id);
      
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await resolveReport(caseData.id);
      alert("Case resolved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to resolve case");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Sticky Header ─────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-4 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
              Case Details
            </p>
            <h2 className="text-base font-bold text-slate-900 leading-tight truncate">
              {caseData.type || "Unknown Type"}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">#{caseData.caseId}</p>
          </div>
          <div className="shrink-0">
            <StatusBadge status={caseData.status} />
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* Meta Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
              Information
            </h3>
          </div>
          <div className="px-4 pb-3">
            <MetaRow label="Case ID" value={caseData.caseId} mono />
            <MetaRow label="Type" value={caseData.type} />
            <MetaRow label="Location" value={caseData.location?.city} />
            <MetaRow label="Priority" value={caseData.priority} />
            <MetaRow label="Assigned" value={caseData.assignment?.individualId || "Unassigned"} />
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {caseData.description || (
              <span className="italic text-slate-300">No description provided.</span>
            )}
          </p>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3.5">
            Actions
          </h3>

          {isResolved ? (
            /* ── Resolved state ─────────────────────────────── */
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-emerald-700">Case Closed</span>
            </div>

          ) : (
            /* ── Active state ───────────────────────────────── */
            <div className="flex flex-wrap gap-2">

              {/* Claim – only when unassigned */}
              {!isAssigned && (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                    disabled:opacity-60 disabled:cursor-not-allowed text-white
                    px-4 py-2 rounded-lg text-sm font-semibold
                    transition-colors duration-150 shadow-sm"
                >
                  {claiming ? <><Spinner /> Claiming…</> : "Claim Case"}
                </button>
              )}

              {/* In Progress pill (non-interactive) + Resolve */}
              {isAssigned && (
                <>
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200
                    text-amber-700 rounded-lg text-sm font-semibold select-none">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                    In Progress
                  </div>

                  <button
                    onClick={handleResolve}
                    disabled={resolving}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                      disabled:opacity-60 disabled:cursor-not-allowed text-white
                      px-4 py-2 rounded-lg text-sm font-semibold
                      transition-colors duration-150 shadow-sm"
                  >
                    {resolving ? <><Spinner /> Resolving…</> : "Resolve Case"}
                  </button>
                </>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}