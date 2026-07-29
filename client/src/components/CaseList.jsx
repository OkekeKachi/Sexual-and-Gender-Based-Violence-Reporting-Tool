// CaseList.jsx
import { useEffect, useState } from "react";
import { getQueueReports, getMyCases } from "../api/report.api";
import AppLoader from "./AppLoader";

// ── Sub-components ──────────────────────────────────────────────────────────

const statusConfig = {
  pending: { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending" },
  "in-progress": { cls: "bg-blue-50 text-blue-700 border-blue-200", label: "In Progress" },
  "in_progress": { cls: "bg-blue-50 text-blue-700 border-blue-200", label: "In Progress" },
  resolved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Resolved" },
};

const priorityConfig = {
  high: { dot: "bg-red-500", text: "text-red-600" },
  medium: { dot: "bg-amber-400", text: "text-amber-600" },
  low: { dot: "bg-emerald-400", text: "text-emerald-600" },
};

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase().replace(" ", "-");
  const cfg = statusConfig[key] || { cls: "bg-slate-50 text-slate-500 border-slate-200", label: status };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${cfg.cls}`}>
      {cfg.label || status || "—"}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const key = priority?.toLowerCase();
  const cfg = priorityConfig[key] || { dot: "bg-slate-300", text: "text-slate-500" };
  return (
    <div className="flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <span className={`text-[10px] font-semibold capitalize tracking-wide ${cfg.text}`}>
        {priority || "—"}
      </span>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="px-4 py-3.5 border-b border-slate-100 animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="h-3.5 bg-slate-200 rounded-md w-20" />
      <div className="h-3 bg-slate-100 rounded-full w-14" />
    </div>
    <div className="h-3 bg-slate-100 rounded-md w-36 mb-2.5" />
    <div className="h-4 bg-slate-100 rounded-full w-16" />
  </div>
);

const EmptyState = ({ view }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </div>
    <p className="text-sm font-semibold text-slate-400">No cases found</p>
    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
      {view === "queue"
        ? "The queue is currently empty"
        : "You have no assigned cases"}
    </p>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────

export default function CaseList({ view, onSelect, selectedId }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        let res;
        if (view === "queue") {
          res = await getQueueReports();
        } else {
          res = await getMyCases();
        }
        const reports = res?.data?.reports || res?.reports || [];
        console.log("FETCHED:", reports);
        setCases(reports);
      } catch (err) {
        console.error("FAILED TO FETCH CASES:", err);
        setCases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [view]);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3.5 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
            {view === "queue" ? "Unit Queue" : "My Cases"}
          </h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-all
            ${loading
              ? "bg-slate-100 text-slate-300 animate-pulse"
              : "bg-slate-100 text-slate-500"
            }`}>
            {loading ? "—" : cases.length}
          </span>
        </div>
      </div>

      {/* Scrollable List */}
      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto relative">

        {/* Center Loading State */}
        {loading && (
          <AppLoader
            title="Loading case"
            subtitle="Retrieving case information securely..."
          />
        )}

        {/* Skeletons */}
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Empty State */}
        {!loading && cases.length === 0 && (
          <EmptyState view={view} />
        )}

        {/* Case Cards */}
        {!loading &&
          cases.map((c) => {
            const isSelected = c.id === selectedId;

            return (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                className={`px-4 py-3.5 border-b border-slate-100 cursor-pointer
            transition-all duration-150 select-none
            border-l-2
            ${isSelected
                    ? "bg-blue-50 border-l-blue-600"
                    : "hover:bg-slate-50 border-l-transparent hover:border-l-slate-200"
                  }`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-sm font-bold tracking-tight ${isSelected ? "text-blue-700" : "text-slate-800"
                      }`}
                  >
                    #{c.caseId}
                  </span>

                  <PriorityBadge priority={c.priority} />
                </div>

                {/* Type */}
                <p className="text-xs text-slate-500 mb-2.5 truncate leading-relaxed">
                  {c.type || "Unknown type"}
                </p>

                {/* Status */}
                <StatusBadge status={c.status} />
              </div>
            );
          })}
      </div>
    </div>
  );
}