import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, FastForward, Sparkles, Hand } from "lucide-react";
import { SIGN_VOCABULARY } from "../data/signs";

export function SignAvatar({ activeTokens = [], lastSpokenPhrase = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  // Normalize active tokens or default to idle state
  const tokens = activeTokens.length > 0 ? activeTokens : ["HELLO"];
  const isFallback = tokens.includes("UNTRANSLATABLE_PHRASE");

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [activeTokens]);

  useEffect(() => {
    if (!isPlaying || isFallback || tokens.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tokens.length);
    }, 1200 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, tokens, speed, isFallback]);

  const currentToken = tokens[currentIndex] || "IDLE";
  const vocabMeta = SIGN_VOCABULARY.find((v) => v.token === currentToken);

  return (
    <div className="flex flex-col h-full bg-[#0D1117] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Hand className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100">Sign Representation Avatar</h3>
            <p className="text-[11px] text-slate-400 font-mono">Speech-to-Sign Token Engine</p>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5">
          {[0.75, 1, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                speed === s
                  ? "bg-violet-500/30 text-violet-200 border border-violet-500/40"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Avatar Visual Display */}
      <div className="relative flex-1 bg-gradient-to-b from-[#090D14] to-[#0D1117] flex flex-col items-center justify-center p-6 min-h-[220px]">
        {isFallback ? (
          <div className="text-center space-y-2 max-w-xs">
            <p className="text-sm font-semibold text-amber-400">Sign representation unavailable</p>
            <p className="text-xs text-slate-400">
              The spoken phrase contains words outside the current ASL token dictionary. Full-text transcript is preserved.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Stylized Animated Hand Vector */}
            <div className="relative w-36 h-36 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center shadow-inner">
              <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-ping opacity-30" />

              {/* Dynamic SVG Hand Illustration */}
              <svg className="w-20 h-20 text-violet-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 transform scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>

              {/* Token Badge */}
              <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-violet-600/90 text-white font-mono text-xs font-bold tracking-wider shadow-lg border border-violet-400/40">
                {currentToken}
              </div>
            </div>

            {/* Gesture description */}
            {vocabMeta && (
              <div className="text-center max-w-xs mt-2">
                <p className="text-xs text-slate-300 font-medium">{vocabMeta.description}</p>
                <p className="text-[11px] font-mono text-slate-500 mt-1">{vocabMeta.handShape}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Token Sequence Timeline Strip */}
      <div className="p-4 bg-[#0A0E14] border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[200px] sm:max-w-xs">
          {tokens.map((t, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                idx === currentIndex
                  ? "bg-violet-500 text-white font-bold scale-105"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Play / Pause / Replay Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
            title={isPlaying ? "Pause sequence" : "Play sequence"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsPlaying(true);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
            title="Replay sequence from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}