import React from "react";
import { Volume2, Mic, AlertTriangle } from "lucide-react";

export function AudioWaveform({ state, isPlaying, stopLatency, activeVoice }) {
  const isSpeaking = state === "SPEAKING" || isPlaying;
  const isInterrupted = state === "INTERRUPTED";

  // Generate 24 animated frequency bars
  const bars = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isInterrupted ? (
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          ) : isSpeaking ? (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          )}

          <span className="text-xs font-mono font-medium text-slate-300">
            {isInterrupted
              ? "INTERRUPTED (AUDIO CUT OFF)"
              : isSpeaking
              ? "RIME VOICE AUDIO STREAM"
              : "MICROPHONE LISTENING (FULL-DUPLEX)"}
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          {activeVoice || "Rime Coda (astra)"}
        </div>
      </div>

      {/* Visualizer bars */}
      <div className="h-14 flex items-end justify-between gap-1 px-2 bg-[#070A0F] rounded-lg border border-slate-800/60 overflow-hidden">
        {bars.map((b) => {
          let heightClass = "h-1";
          let bgClass = "bg-slate-700";

          if (isInterrupted) {
            heightClass = "h-2";
            bgClass = "bg-rose-500";
          } else if (isSpeaking) {
            // Dynamic pulsating bars
            const heights = ["h-4", "h-8", "h-12", "h-10", "h-6", "h-11", "h-5", "h-9"];
            heightClass = heights[b % heights.length];
            bgClass = "bg-gradient-to-t from-cyan-500 to-indigo-400";
          } else {
            // Idle listening gentle ripple
            const heights = ["h-2", "h-3", "h-2", "h-4", "h-2", "h-3"];
            heightClass = heights[b % heights.length];
            bgClass = "bg-cyan-500/40";
          }

          return (
            <div
              key={b}
              className={`flex-1 rounded-full transition-all duration-150 ${heightClass} ${bgClass}`}
              style={{
                transitionDelay: `${(b % 6) * 20}ms`,
              }}
            />
          );
        })}
      </div>

      {/* Latency & Stop Telemetry */}
      <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-slate-400">
        <span>Audio Invalidation: <strong className="text-cyan-300">Active</strong></span>
        {stopLatency != null && (
          <span className="text-rose-400 font-bold">
            Stop Latency: {stopLatency} ms
          </span>
        )}
      </div>
    </div>
  );
}