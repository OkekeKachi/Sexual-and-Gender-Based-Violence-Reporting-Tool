import { Briefcase, Clock, Eye, Check } from "lucide-react";

const VARIANTS = {
  total: {
    icon: Briefcase,
    colorClasses: "bg-blue-50 text-blue-700",
    barClass: "bg-blue-500",
  },
  pending: {
    icon: Clock,
    colorClasses: "bg-amber-50 text-amber-500",
    barClass: "bg-amber-500",
  },
  reviewed: {
    icon: Eye,
    colorClasses: "bg-blue-50 text-blue-500",
    barClass: "bg-blue-300",
  },
  resolved: {
    icon: Check,
    colorClasses: "bg-green-50 text-green-500",
    barClass: "bg-green-500",
  },
};

export default function StatCard({ title, value, total, variant = "total" }) {
  const cfg = VARIANTS[variant] || VARIANTS.total;
  const Icon = cfg.icon;
  const pct = total && total > 0 ? Math.round((value / total) * 100) : 0;

  // Decide the width of the progress bar
  const barWidth = variant === "total" ? "100%" : `${pct}%`;

  return (
    <div className="group flex flex-1 flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:border-slate-300">

      {/* Top Section: Icon & Percentage Badge */}
      <div className="flex items-center justify-between mb-1">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.colorClasses}`}>
          <Icon size={18} />
        </div>
        {total && variant !== "total" && (
          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-500 border border-slate-100">
            {pct}%
          </span>
        )}
      </div>

      {/* Main Stats */}
      <div className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
        {value?.toLocaleString() ?? "—"}
      </div>
      <div className="text-sm font-medium text-slate-500">
        {title}
      </div>

      {/* Progress Track */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full transition-all duration-700 ease-out ${cfg.barClass}`}
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
}