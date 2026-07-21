import { useNavigate } from "react-router-dom";
import { Inbox, MoreHorizontal } from "lucide-react";

export default function ReportsTable({ reports, loading, onStatusChange, onEdit, onDelete }) {
  const navigate = useNavigate();

  if (!loading && !reports.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <Inbox className="mb-3 h-12 w-12 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">No reports match your current filters.</p>
      </div>
    );
  }

  const TableSkeletonRow = () => (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="px-6 py-4">
        <div className="h-4 w-24 rounded bg-slate-200" />
      </td>

      <td className="px-6 py-4">
        <div className="h-4 w-20 rounded bg-slate-100" />
      </td>

      <td className="px-6 py-4">
        <div className="h-6 w-20 rounded-full bg-slate-100" />
      </td>

      <td className="px-6 py-4">
        <div className="h-5 w-16 rounded bg-slate-100" />
      </td>

      <td className="px-6 py-4">
        <div className="h-4 w-24 rounded bg-slate-100" />
      </td>

      <td className="px-6 py-4">
        <div className="h-4 w-28 rounded bg-slate-100" />
      </td>

      <td className="px-6 py-4">
        <div className="ml-auto h-8 w-32 rounded bg-slate-100" />
      </td>
    </tr>
  );


  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-3.5 font-semibold uppercase tracking-wider text-slate-500">Case ID</th>
              <th className="px-6 py-3.5 font-semibold uppercase tracking-wider text-slate-500">Type</th>
              <th className="px-6 py-3.5 font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3.5 font-semibold uppercase tracking-wider text-slate-500">Priority</th>
              <th className="px-6 py-3.5 font-semibold uppercase tracking-wider text-slate-500">City</th>
              <th className="px-6 py-3.5 font-semibold uppercase tracking-wider text-slate-500">Date</th>
              <th className="px-6 py-3.5 font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">

            {/* Loading State */}
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableSkeletonRow key={i} />
              ))}

            {/* Actual Reports */}
            {!loading &&
              reports.map((r) => {
                const isEscalated = r.status === "escalated";

                return (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/reports/${r.id}`)}
                    className={`group cursor-pointer transition-colors hover:bg-blue-50/40 ${isEscalated
                        ? "border-l-4 border-l-red-500"
                        : "border-l-4 border-l-transparent"
                      }`}
                  >
                    <td className="px-6 py-4 font-mono font-medium text-blue-900">
                      {r.caseId}
                    </td>

                    <td className="px-6 py-4 capitalize text-slate-500">
                      {r.type || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="px-6 py-4">
                      <PriorityBadge priority={r.priority} />
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {r.location?.city || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {r.createdAt?.seconds
                        ? new Date(
                          r.createdAt.seconds * 1000
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "—"}
                    </td>

                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {(r.status === "pending" ||
                          r.status === "escalated") && (
                            <>
                              <button
                                onClick={() =>
                                  onStatusChange(r.id, "reviewed")
                                }
                                className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                              >
                                Review
                              </button>

                              <button
                                onClick={() =>
                                  onStatusChange(r.id, "resolved")
                                }
                                className="rounded-md bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
                              >
                                Resolve
                              </button>
                            </>
                          )}

                        <button
                          onClick={() => onEdit(r)}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => onDelete(r.id)}
                          className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Status Badge ─────────────────────────────────────────────────────────── */
export function StatusBadge({ status }) {
  const configs = {
    pending: { label: "Pending", styles: "bg-amber-50 text-amber-700 ring-amber-600/20" },
    reviewed: { label: "Reviewed", styles: "bg-blue-50 text-blue-700 ring-blue-600/20" },
    resolved: { label: "Resolved", styles: "bg-green-50 text-green-700 ring-green-600/20" },
    escalated: { label: "Escalated", styles: "bg-red-50 text-red-700 ring-red-600/20" },
  };

  const config = configs[status] || { label: status || "Unknown", styles: "bg-slate-50 text-slate-600 ring-slate-600/20" };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${config.styles}`}>
      {config.label}
    </span>
  );
}

/* ── Priority Badge ───────────────────────────────────────────────────────── */
export function PriorityBadge({ priority }) {
  const configs = {
    low: { label: "Low", styles: "bg-green-50 text-green-700" },
    medium: { label: "Medium", styles: "bg-amber-50 text-amber-700" },
    high: { label: "High", styles: "bg-red-50 text-red-700 font-bold" },
  };

  const config = configs[priority] || { label: priority || "—", styles: "bg-slate-50 text-slate-600" };

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${config.styles}`}>
      {config.label}
    </span>
  );
}