import { useNavigate } from "react-router-dom";
import { Bell, Plus } from "lucide-react";

export default function Topbar({ title = "Dashboard", notificationCount = 0 }) {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5 shadow-sm/5">
      {/* Left side: Breadcrumb/Title */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <span className="hidden text-sm font-medium text-slate-400 md:block">
          {today}
        </span>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700 active:scale-95"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Primary Action Button */}
        <button
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95"
          onClick={() => navigate("/report")}
        >
          <Plus size={16} strokeWidth={3} />
          <span className="hidden sm:inline">Report Incident</span>
          <span className="sm:hidden">Report</span>
        </button>
      </div>
    </header>
  );
}