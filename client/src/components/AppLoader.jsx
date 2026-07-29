import { Shield } from "lucide-react";

export default function AppLoader({
  title = "Loading...",
  subtitle = "please, hold on."
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center text-center">

        {/* Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-blue-200 animate-ping opacity-20" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-900/20">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          SafeSpeak
        </h2>

        <p className="mt-2 text-sm font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>

        {/* Progress */}
        <div className="mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-[loader_1.2s_ease-in-out_infinite] rounded-full bg-blue-600" />
        </div>
      </div>

      <style>{`
        @keyframes loader {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}