import React, { useState } from "react";
import { Cpu, Layers, GitFork, ShieldCheck, Activity, Terminal, Check } from "lucide-react";

export function Technology() {
  const [activeFsmStep, setActiveFsmStep] = useState("SPEAKING");

  const fsmSteps = {
    IDLE: {
      title: "1. IDLE / READY",
      desc: "System initialized. Audio buffers clean, camera streaming 30fps landmark frames.",
      next: "LISTENING",
      badge: "bg-slate-800 text-slate-300",
    },
    LISTENING: {
      title: "2. LISTENING (FULL-DUPLEX)",
      desc: "Microphone actively captures ambient speech; camera tracks hands. Full-duplex listener is HOT.",
      next: "PROCESSING",
      badge: "bg-cyan-500/20 text-cyan-300",
    },
    PROCESSING: {
      title: "3. PROCESSING & SYNTHESIZING",
      desc: "MediaPipe landmark vectors categorized; prompt dispatched to Rime Coda TTS API.",
      next: "SPEAKING",
      badge: "bg-indigo-500/20 text-indigo-300",
    },
    SPEAKING: {
      title: "4. RIME SPEAKING (INTERRUPTIBLE)",
      desc: "Audio streams to speaker. Microphone is NOT muted; energy threshold remains vigilant.",
      next: "INTERRUPTED",
      badge: "bg-emerald-500/20 text-emerald-300",
    },
    INTERRUPTED: {
      title: "5. INTERRUPTED (<50ms)",
      desc: "Speech overlap detected. HTMLAudioElement pauses immediately; responseId revoked.",
      next: "CANCELLED",
      badge: "bg-rose-500/20 text-rose-300",
    },
    CANCELLED: {
      title: "6. CANCELLED / FENCED",
      desc: "In-flight Rime packets matching revoked responseId are fenced and purged.",
      next: "LISTENING",
      badge: "bg-amber-500/20 text-amber-300",
    },
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#070A0F] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono border border-cyan-500/20">
            <Cpu className="w-3.5 h-3.5" />
            <span>Under the Hood</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Architecture & <br />
            <span className="text-gradient-cyan">Interruption FSM</span>
          </h1>

          <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
            The core challenge in real-time vocal accessibility is orchestration: preventing speech overlap, eliminating stale audio latency, and synchronizing 21-point geometric landmark tracking with generative voice synthesis.
          </p>
        </div>

        {/* Interactive FSM Simulator */}
        <div className="p-8 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">ConversationStateMachine Explorer</h3>
              <p className="text-xs text-slate-400 font-mono">
                Click a state node to inspect transition invariants and audio fencing rules.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
              {Object.keys(fsmSteps).map((stepKey) => (
                <button
                  key={stepKey}
                  onClick={() => setActiveFsmStep(stepKey)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    activeFsmStep === stepKey
                      ? "bg-cyan-500 text-black font-bold border-cyan-400 shadow-md"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {stepKey}
                </button>
              ))}
            </div>
          </div>

          {/* Active State Card */}
          <div className="p-6 rounded-xl bg-[#070A0F] border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${fsmSteps[activeFsmStep].badge}`}>
                CURRENT STATE
              </span>
              <h4 className="text-base font-bold text-white">
                {fsmSteps[activeFsmStep].title}
              </h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {fsmSteps[activeFsmStep].desc}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>NEXT PERMITTED TRANSITION:</span>
              <strong className="underline underline-offset-4">{fsmSteps[activeFsmStep].next}</strong>
            </div>
          </div>
        </div>

        {/* 3 Pillars of Technology */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Computer Vision (MediaPipe)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tracks 21 3D hand coordinates (wrist, thumb, index, middle, ring, pinky) to classify gestures against our 18-sign conversational lexicon with confidence scoring.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Token Fencing & Invalidation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every turn is stamped with a monotonic UUID session epoch. In-flight synthesis results arriving after an interruption are fenced and dropped before ever reaching the speaker.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Rime Coda Audio Layer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes expressive conversational vocal identity using Rime's flagship Coda model, giving Deaf users an audible voice with sub-second time-to-first-audio.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}