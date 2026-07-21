import { Search } from "lucide-react";

export default function ReportsFilter({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      {/* Status Filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold tracking-wide text-slate-500">Status</label>
        <select
          className="h-10 min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          value={filters.status}
          onChange={set("status")}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* City Filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold tracking-wide text-slate-500">City</label>
        <input
          className="h-10 min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
          placeholder="Filter by city..."
          value={filters.city}
          onChange={set("city")}
        />
      </div>

      {/* Search Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold tracking-wide text-slate-500">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 min-w-[220px] rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
            placeholder="Search case ID..."
            value={filters.search}
            onChange={set("search")}
          />
        </div>
      </div>

      {/* Clear Button */}
      <button
        className="ml-auto h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 active:bg-slate-100"
        onClick={() => onChange({ status: "all", city: "", search: "" })}
      >
        Clear filters
      </button>
    </div>
  );
}