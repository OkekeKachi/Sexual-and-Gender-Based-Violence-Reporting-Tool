import { X } from "lucide-react";

export default function EditReportModal({ report, form, onChange, onSave, onClose }) {
  if (!report) return null;

  const set = (key) => (e) => onChange({ ...form, [key]: e.target.value });

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 pb-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900">
              Edit Report
            </h3>
            <p className="mt-0.5 font-mono text-sm text-slate-500">
              {report.caseId}
            </p>
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-500">Status</label>
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              value={form.status}
              onChange={set("status")}
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-500">Priority</label>
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              value={form.priority}
              onChange={set("priority")}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 bg-slate-50/50 p-5 pt-4">
          <button
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 active:scale-[0.98]"
            onClick={onSave}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}