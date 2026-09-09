import React, { useState } from "react";
import { Terminal, ChevronDown, ChevronUp, Copy, Check, Filter } from "lucide-react";

export function ObservabilityDrawer({ events = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const copyLogs = () => {
    const text = events
      .map((e) => `[${e.time}] ${e.type} | ${JSON.stringify(e)}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredEvents = events.filter((e) => {
    if (filter === "ALL") return true;
    if (filter === "INTERRUPT") return e.type.includes("INTERRUPT") || e.type.includes("STALE");
    if (filter === "RIME") return e.type.includes("RIME") || e.type.includes("AUDIO");
    if (filter === "SIGN") return e.type.includes("SIGN");
    return true;
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#070A0F]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl transition-all duration-300">
      {/* Drawer Toggle Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-slate-300 hover:text-white select-none"
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">Observability & Telemetry Bus</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
            {events.length} events
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <>
              {/* Filters */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono">
                {["ALL", "INTERRUPT", "RIME", "SIGN"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      filter === f
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={copyLogs}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-colors"
                title="Copy telemetry log"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Export"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Log Feed */}
      {isOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <div className="h-56 bg-black/80 rounded-xl border border-slate-800/80 p-3 overflow-y-auto font-mono text-xs space-y-1.5 shadow-inner">
            {filteredEvents.length === 0 ? (
              <p className="text-slate-600 italic">No events captured yet.</p>
            ) : (
              filteredEvents.map((evt) => {
                let badgeColor = "text-slate-400";
                if (evt.type.includes("INTERRUPT") || evt.type.includes("STALE")) {
                  badgeColor = "text-rose-400 font-bold";
                } else if (evt.type.includes("RIME")) {
                  badgeColor = "text-emerald-400 font-bold";
                } else if (evt.type.includes("SIGN")) {
                  badgeColor = "text-cyan-400 font-bold";
                }

                return (
                  <div key={evt.id} className="flex items-start gap-3 hover:bg-slate-900/40 px-2 py-0.5 rounded">
                    <span className="text-slate-500 text-[11px] shrink-0">{evt.time}</span>
                    <span className={`shrink-0 ${badgeColor}`}>{evt.type}</span>
                    <span className="text-slate-300 truncate">
                      {evt.token || evt.text || evt.spokenText || evt.speechSnippet || evt.reason || JSON.stringify(evt)}
                    </span>
                    {evt.stopLatencyMs != null && (
                      <span className="ml-auto text-rose-400 text-[10px] shrink-0">
                        stop: {evt.stopLatencyMs}ms
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}