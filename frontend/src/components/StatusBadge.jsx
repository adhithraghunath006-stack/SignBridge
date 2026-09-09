import React from "react";
import { Activity, Mic, Volume2, AlertTriangle } from "lucide-react";

export function StatusBadge({ state }) {
  const configs = {
    IDLE: {
      label: "System Ready",
      color: "bg-slate-800/80 text-slate-300 border-slate-700",
      dot: "bg-slate-400",
      icon: Activity,
    },
    LISTENING: {
      label: "Full-Duplex Listening",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      dot: "bg-cyan-400 animate-pulse",
      icon: Mic,
    },
    PROCESSING: {
      label: "Translating...",
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      dot: "bg-indigo-400 animate-ping",
      icon: Activity,
    },
    SPEAKING: {
      label: "Rime Speaking (Interruptible)",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      dot: "bg-emerald-400 animate-pulse",
      icon: Volume2,
    },
    INTERRUPTED: {
      label: "Interruption Handled (<50ms)",
      color: "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse",
      dot: "bg-rose-400",
      icon: AlertTriangle,
    },
  };

  const current = configs[state] || configs.IDLE;
  const Icon = current.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono tracking-wide transition-all duration-300 ${current.color}`}>
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </div>
  );
}