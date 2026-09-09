import React, { useRef, useEffect } from "react";
import { Volume2, Hand, MessageSquare, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export function Timeline({ history, activeResponseId, onManualInterrupt }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-[#0D1117] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
      {/* Timeline Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100">Live Dialogue Stream</h3>
            <p className="text-[11px] text-slate-400 font-mono">Full-Duplex Interruption Architecture</p>
          </div>
        </div>

        <button
          onClick={onManualInterrupt}
          className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
          title="Simulate speech interruption of active Rime audio"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Interrupt Rime</span>
        </button>
      </div>

      {/* History Feed */}
      <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 mb-3">
              <Hand className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Conversation Awaiting First Turn</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Sign into the camera or speak into the microphone. SignBridge will translate between sign tokens and Rime speech in real time.
            </p>
          </div>
        ) : (
          history.map((turn, i) => {
            const isSigner = turn.speaker === "signer";
            const isInterrupted = turn.interrupted;

            return (
              <div
                key={turn.id || i}
                className={`p-4 rounded-xl border transition-all ${
                  isSigner
                    ? "bg-slate-900/60 border-cyan-500/30 ml-0 mr-6"
                    : "bg-indigo-950/20 border-indigo-500/30 ml-6 mr-0"
                } ${isInterrupted ? "border-rose-500/60 bg-rose-950/10" : ""}`}
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <div className="flex items-center gap-2">
                    {isSigner ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                        <Hand className="w-3 h-3" /> DEAF SIGNER
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1">
                        <Volume2 className="w-3 h-3" /> HEARING PARTNER
                      </span>
                    )}
                    <span className="text-slate-500">{turn.timestamp}</span>
                  </div>

                  {turn.latencyMs && (
                    <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      TTFA: {turn.latencyMs}ms
                    </span>
                  )}
                </div>

                {/* Content */}
                {isSigner ? (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                      <span>SIGN RECOGNIZED:</span>
                      <strong className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {turn.signToken}
                      </strong>
                      {turn.confidence && (
                        <span className="text-slate-400">
                          ({Math.round(turn.confidence * 100)}%)
                        </span>
                      )}
                    </div>
                    <p className="text-slate-100 font-medium text-sm mt-1">
                      "{turn.spokenText}"
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-100 font-medium text-sm">
                      "{turn.spokenText}"
                    </p>
                    {turn.signTokens && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[11px] font-mono text-slate-400 mr-1">
                          SIGN TOKENS:
                        </span>
                        {turn.signTokens.map((st, sidx) => (
                          <span
                            key={sidx}
                            className="px-2 py-0.5 rounded bg-indigo-900/60 border border-indigo-700 text-indigo-200 text-xs font-mono"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Interruption Notification Callout */}
                {isInterrupted && (
                  <div className="mt-3 pt-2 border-t border-rose-900/40 flex items-center justify-between text-xs font-mono text-rose-300">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>RIME PLAYBACK INTERRUPTED & FENCED</span>
                    </div>
                    <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-200">
                      STALE RESPONSE INVALIDATED
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}