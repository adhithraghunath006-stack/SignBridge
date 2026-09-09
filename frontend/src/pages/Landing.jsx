import React from "react";
import {
  ArrowRight,
  Volume2,
  Mic,
  Camera,
  Shield,
  Zap,
  Sparkles,
  Activity,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { HeroBridgeCanvas } from "../components/HeroBridgeCanvas";

export function Landing({ onNavigate }) {
  return (
    <div className="relative min-h-screen bg-[#070A0F] text-slate-100 overflow-hidden">

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <HeroBridgeCanvas />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">

          {/* Super-title / Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-xs font-mono tracking-widest uppercase backdrop-blur-md shadow-lg shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Full-Duplex Sign ↔ Rime Voice Engine</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05]">
            Communication <br />
            <span className="text-gradient-cyan">without a barrier.</span>
          </h1>

          {/* Hero Description */}
          <p className="text-lg sm:text-2xl text-slate-300 font-normal max-w-3xl mx-auto leading-relaxed tracking-tight">
            SignBridge connects sign language and spoken language in real time
            — with an AI conversation layer designed to{" "}
            <strong className="text-white">listen</strong>,{" "}
            <strong className="text-cyan-300">speak</strong>,{" "}
            <strong className="text-rose-300">interrupt</strong> and{" "}
            <strong className="text-indigo-300">recover</strong> naturally.
          </p>

          <p className="text-xs sm:text-sm font-mono text-slate-400 tracking-wider uppercase">
            One conversation. Two languages. Zero interpreters.
          </p>

          {/* Hero CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate("conversation")}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 hover:brightness-110 shadow-xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-3 group"
            >
              <span>Start a Conversation</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-base text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Hero Bridge Status Bar */}
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-[11px] font-mono text-cyan-400 block mb-1">
                DEAF SIGNER
              </span>
              <p className="text-xs text-slate-300 font-medium">
                MediaPipe 21 Hand Landmarks & Gesture Vector Engine
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-[11px] font-mono text-indigo-400 block mb-1">
                SIGNBRIDGE NEXUS
              </span>
              <p className="text-xs text-slate-300 font-medium">
                Interruptible Full-Duplex FSM with Response Fencing
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-[11px] font-mono text-emerald-400 block mb-1">
                HEARING PARTNER
              </span>
              <p className="text-xs text-slate-300 font-medium">
                Rime Coda TTS Natural Spoken Audio Stream
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 01 — THE PROBLEM */}
      {/* ========================================================================= */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-[#0A0E15]">
        <div className="max-w-5xl mx-auto space-y-12">

          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              The Problem
            </span>

            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Conversation should not <br />
              <span className="text-slate-400">
                require a third person.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300 text-base leading-relaxed">
            <p>
              Over 70 million deaf individuals globally communicate primarily
              through sign language. Yet in everyday interactions — at a coffee
              shop, in an emergency clinic, or during a spontaneous office
              discussion — communication breaks down when the other person does
              not understand signing.
            </p>

            <p>
              Existing technology is fundamentally broken: speech-to-text apps
              are one-directional, text transcripts force hearing users to look
              at phones instead of faces, and scheduling professional human
              interpreters is impossible for spontaneous human life.
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-slate-900 to-[#070A0F] border border-slate-800 text-center space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              The Core Imperative
            </p>

            <p className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              "Understanding should be immediate."
            </p>

            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Natural conversation requires two eyes, two ears, and zero
              artificial turns. When sign language meets voice synthesis,
              human connection is restored.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02 — THE SOLUTION (TWO-WAY ARCHITECTURE) */}
      {/* ========================================================================= */}
      <section
        id="how-it-works"
        className="py-28 px-4 sm:px-6 lg:px-8 border-t border-slate-900"
      >
        <div className="max-w-6xl mx-auto space-y-16">

          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Two-Way Translation
            </span>

            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
              Two languages. <br />
              <span className="text-gradient-cyan">
                One conversation.
              </span>
            </h2>

            <p className="text-base text-slate-400 max-w-2xl mx-auto">
              SignBridge is a symmetrical bi-directional communication bridge.
              Each participant communicates in their native modality.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* PATH A */}
            <div className="p-8 rounded-2xl bg-[#0D1117] border border-cyan-500/30 space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                  PATH A
                </span>

                <span className="text-xs font-mono text-slate-400">
                  SIGN → RIME SPEECH
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                Sign Language to Spoken Voice
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                The Deaf participant signs toward the camera. 21 skeletal hand
                landmarks are captured in real-time and translated into natural
                vocal expression via Rime TTS.
              </p>

              {/* Flow Steps */}
              <div className="space-y-2 font-mono text-xs text-slate-300">
                {[
                  "1. LIVE CAMERA CAPTURE",
                  "2. MEDIAPIPE 21 3D HAND LANDMARKS",
                  "3. GEOMETRIC VECTOR CLASSIFIER (94% CONF)",
                  "4. CONVERSATION STATE MACHINE",
                  "5. RIME TTS SYNTHESIS (MODEL: CODA)",
                  "6. SPOKEN NATURAL AUDIO PLAYBACK",
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-slate-900/80 border border-slate-800/80 flex items-center gap-2"
                  >
                    <span className="text-cyan-400">›</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PATH B */}
            <div className="p-8 rounded-2xl bg-[#0D1117] border border-indigo-500/30 space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">
                  PATH B
                </span>

                <span className="text-xs font-mono text-slate-400">
                  SPEECH → SIGN AVATAR
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                Spoken Language to Sign Representation
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                The hearing person speaks into the microphone. Audio is
                transcribed, tokenized into ASL grammatical tokens, and
                displayed as an animated visual sign avatar.
              </p>

              {/* Flow Steps */}
              <div className="space-y-2 font-mono text-xs text-slate-300">
                {[
                  "1. CONTINUOUS MICROPHONE LISTENING (FULL-DUPLEX)",
                  "2. SPEECH-TO-TEXT STREAMING SERVICE",
                  "3. GRAMMAR REDUCTION & TOKENIZATION",
                  "4. ASL TOKEN SEQUENCE GENERATION",
                  "5. ANIMATED SIGN AVATAR RENDERING",
                  "6. VISUAL FEEDBACK ON SCREEN",
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-slate-900/80 border border-slate-800/80 flex items-center gap-2"
                  >
                    <span className="text-indigo-400">›</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 03 — THE HARD VOICE PROBLEM (INTERRUPTION ENGINE) */}
      {/* ========================================================================= */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-[#090D14]">
        <div className="max-w-5xl mx-auto space-y-12">

          <div className="text-center space-y-4">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider border border-rose-500/30">
              The Hard Voice Engineering Problem
            </span>

            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
              "Voice that knows <br />
              <span className="text-rose-400">when to listen."</span>
            </h2>

            <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Standard TTS systems talk over humans. If Rime is speaking and
              the hearing partner starts talking, SignBridge cuts audio in
              under 50ms, fences the obsolete turn, and listens to the newest
              speaker.
            </p>
          </div>

          {/* Interruption State Sequence */}
          <div className="p-8 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-6">

            <h4 className="text-sm font-mono uppercase tracking-wider text-slate-400">
              Deterministic Interruption & Recovery Lifecycle
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  stage: "1. RIME SPEAKING",
                  desc: "Rime Coda generates audio; mic remains active & listening.",
                },
                {
                  stage: "2. USER INTERRUPTS",
                  desc: "Partner interjects: 'Wait — where are you going?'",
                },
                {
                  stage: "3. AUDIO CUTOFF (<50ms)",
                  desc: "Local audio buffer pauses and flushes instantly.",
                },
                {
                  stage: "4. STALE FENCED",
                  desc: "In-flight responseId marked stale; delayed audio discarded.",
                },
                {
                  stage: "5. NEW TURN COMMITTED",
                  desc: "State machine transitions to LISTENING and accepts new turn.",
                },
                {
                  stage: "6. RECOVERY",
                  desc: "Sign avatar renders new tokens; conversation flows onward.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5"
                >
                  <div className="text-xs font-mono font-bold text-cyan-400">
                    {item.stage}
                  </div>

                  <p className="text-xs text-slate-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => onNavigate("evaluation")}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition-all inline-flex items-center gap-2"
              >
                <span>
                  View Live Interruption Benchmark (P50/P95 Latencies)
                </span>

                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 04 — RIME VOICE SHOWCASE */}
      {/* ========================================================================= */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="max-w-5xl mx-auto space-y-12">

          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Spoken Layer
            </span>

            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Powered by Rime. <br />
              <span className="text-slate-400">
                Conversational latency at scale.
              </span>
            </h2>

            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              Rime provides the primary spoken voice for SignBridge. The
              flagship <strong>Coda</strong> model delivers expressive,
              low-latency speech, helping the Deaf user's vocal presence sound
              natural rather than robotic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="p-6 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-2">
              <div className="text-2xl font-black text-white font-mono">
                CODA
              </div>

              <p className="text-xs font-mono text-cyan-400">
                Flagship Conversational Model
              </p>

              <p className="text-xs text-slate-400 leading-relaxed">
                Optimized specifically for full-duplex interactive conversation
                and rapid audio packet delivery.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-2">
              <div className="text-2xl font-black text-white font-mono">
                &lt; 50ms
              </div>

              <p className="text-xs font-mono text-rose-400">
                Measured Audio Abort Latency
              </p>

              <p className="text-xs text-slate-400 leading-relaxed">
                Local audio buffers terminate instantly when speech overlap is
                detected, preventing chatter confusion.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-2">
              <div className="text-2xl font-black text-white font-mono">
                0 Stale
              </div>

              <p className="text-xs font-mono text-emerald-400">
                Response Fencing Guarantee
              </p>

              <p className="text-xs text-slate-400 leading-relaxed">
                Monotonic session IDs prevent delayed audio chunks from
                re-entering the dialogue stream out of sequence.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 05 — CTA */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-gradient-to-b from-[#070A0F] to-[#0A0E15] text-center space-y-6">

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Experience conversation without a barrier.
        </h2>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Try the live full-duplex studio with real-time MediaPipe hand
          tracking and Rime Coda speech synthesis.
        </p>

        <div className="pt-2">
          <button
            onClick={() => onNavigate("conversation")}
            className="px-8 py-4 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-400 hover:brightness-110 shadow-xl shadow-cyan-500/25 transition-all"
          >
            Launch Conversation Studio
          </button>
        </div>

      </section>

    </div>
  );
}