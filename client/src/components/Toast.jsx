import { useEffect } from "react";
import { AlertCircle, Trash2, CheckCircle2, X } from "lucide-react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const isAlert = message.toLowerCase().includes("new report");
  const isDelete = message.toLowerCase().includes("deleted");

  // Determine configuration based on message content
  const config = isAlert
    ? { icon: AlertCircle, bg: "bg-red-600", border: "border-red-500" }
    : isDelete
      ? { icon: Trash2, bg: "bg-slate-800", border: "border-slate-700" }
      : { icon: CheckCircle2, bg: "bg-green-600", border: "border-green-500" };

  const Icon = config.icon;

  return (
    <div className="fixed right-5 top-5 z-[9999] flex w-full max-w-[340px] animate-in fade-in slide-in-from-right-6 duration-300">
      <div className={`flex w-full items-center gap-3 rounded-xl border p-4 shadow-2xl ${config.bg} ${config.border} text-white`}>

        {/* Icon Container */}
        <div className="flex shrink-0 items-center justify-center">
          <Icon size={20} className="text-white/90" />
        </div>

        {/* Message */}
        <p className="flex-1 text-[15px] font-medium leading-tight">
          {message.replace(/^[^\s]+\s/, "")}
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}