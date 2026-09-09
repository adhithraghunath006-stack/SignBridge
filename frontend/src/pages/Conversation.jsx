import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Send,
  Radio,
  Sparkles,
  RefreshCw,
  Volume2,
} from "lucide-react";

import { useConversation } from "../hooks/useConversation";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { SpeechRecognitionService } from "../services/speechService";
import { SignCamera } from "../components/SignCamera";
import { Timeline } from "../components/Timeline";
import { AudioWaveform } from "../components/AudioWaveform";
import { SignAvatar } from "../components/SignAvatar";
import { StatusBadge } from "../components/StatusBadge";
import { ObservabilityDrawer } from "../components/ObservabilityDrawer";
import { JudgeDemoModal } from "../components/JudgeDemoModal";

export function Conversation() {
  const {
    mode,
    setMode,
    fsmState,
    conversationHistory,
    telemetryEvents,
    interruptionCount,
    latestLatency,
    activeVoiceProvider,
    isBackendHealthy,
    handleSignInput,
    handleSpeechInput,
    triggerManualInterrupt,
    resetSession,
  } = useConversation();

  const { isPlaying, stopLatency } = useAudioPlayer();

  const [speechService, setSpeechService] = useState(null);
  const [isMicListening, setIsMicListening] = useState(false);
  const [manualSpeechText, setManualSpeechText] = useState("");
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedQuickSign, setSelectedQuickSign] = useState(null);

  /*
   * QUICK SIGN / TEST PHRASES
   * Clicking these goes through the SAME sign input pipeline
   * as the real camera detection.
   */
  const quickSigns = [
    {
      token: "HELLO",
      label: "HELLO",
      emoji: "👋",
    },
    {
      token: "YES",
      label: "YES",
      emoji: "👍",
    },
    {
      token: "NO",
      label: "NO",
      emoji: "👎",
    },
    {
      token: "HELP",
      label: "HELP",
      emoji: "✊",
    },
    {
      token: "THANK YOU",
      label: "THANK YOU",
      emoji: "🤟",
    },
    {
      token: "I LOVE YOU",
      label: "I LOVE YOU",
      emoji: "🤟",
    },
  ];

  /*
   * Initialize continuous speech recognition
   */
  useEffect(() => {
    const service = new SpeechRecognitionService({
      onInterim: (interim) => {
        handleSpeechInput(interim, true);
      },

      onFinal: (final) => {
        handleSpeechInput(final, false);
      },

      onInterruptionDetected: (snippet) => {
        if (fsmState === "SPEAKING" || isPlaying) {
          triggerManualInterrupt();
        }
      },

      onStatusChange: ({ isListening }) => {
        setIsMicListening(isListening);
      },

      onError: (err) => {
        console.warn("Speech recognition error:", err);
      },
    });

    setSpeechService(service);

    return () => {
      service.stopListening();
    };
  }, [
    handleSpeechInput,
    fsmState,
    isPlaying,
    triggerManualInterrupt,
  ]);

  const toggleMic = () => {
    if (!speechService) return;

    if (isMicListening) {
      speechService.stopListening();
    } else {
      speechService.startListening();
    }
  };

  const submitManualSpeech = (e) => {
    e.preventDefault();

    if (!manualSpeechText.trim()) return;

    handleSpeechInput(manualSpeechText.trim(), false);
    setManualSpeechText("");
  };

  /*
   * QUICK SIGN CLICK
   *
   * This intentionally uses handleSignInput()
   * so the clicked phrase follows the exact same
   * backend → Rime → audio pipeline as camera input.
   */
  const handleQuickSign = (sign) => {
    setSelectedQuickSign(sign.token);

    handleSignInput(sign.token, 1.0);

    // Small visual selection feedback
    setTimeout(() => {
      setSelectedQuickSign(null);
    }, 700);
  };

  /*
   * Get active sign tokens for avatar
   */
  const lastHearingTurn = [...conversationHistory]
    .reverse()
    .find((t) => t.speaker === "listener");

  const avatarTokens = lastHearingTurn?.signTokens || ["HELLO"];

  /*
   * Judge Demo
   */
  const handleExecuteDemoStep = (step) => {
    if (step.actionType === "SIGN_INPUT") {
      handleSignInput(step.token, step.confidence);
    } else if (step.actionType === "INTERRUPT") {
      triggerManualInterrupt();
      handleSpeechInput(step.speechText, false);
    } else if (step.actionType === "STATE_CHANGE") {
      // warm state
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#070A0F] text-slate-100 flex flex-col justify-between">

      {/* =========================================================
          TOP TELEMETRY & CONTROL BANNER
      ========================================================= */}
      <div className="border-b border-slate-800/80 bg-[#0D1117]/60 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-3">
            <StatusBadge state={fsmState} />

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{activeVoiceProvider}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {/* Mode Switcher */}
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">

              <button
                onClick={() => setMode("LIVE_AI")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === "LIVE_AI"
                    ? "bg-cyan-500 text-black font-bold shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                LIVE AI MODE
              </button>

              <button
                onClick={() => setMode("DEMO_MODE")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === "DEMO_MODE"
                    ? "bg-indigo-500 text-white font-bold shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                DEMO MODE
              </button>
            </div>

            {/* Judge Demo */}
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">
                Judge Demo Script
              </span>
            </button>

            {/* Reset */}
            <button
              onClick={resetSession}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Reset Conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN GRID
      ========================================================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">

        {/* =====================================================
            LEFT — SIGN CAMERA
        ===================================================== */}
        <div className="lg:col-span-4 h-[650px] flex flex-col">

          <SignCamera
            onSignDetected={(payload, confidence) => {
              /*
               * Supports both:
               *
               * New SignCamera:
               * { token, confidence, ... }
               *
               * Old SignCamera:
               * token, confidence
               */
              const token =
                typeof payload === "object"
                  ? payload?.token
                  : payload;

              const conf =
                typeof payload === "object"
                  ? payload?.confidence ?? 0
                  : confidence ?? 0;

              if (token) {
                handleSignInput(token, conf);
              }
            }}
          />

          {/* =================================================
              QUICK SIGN SELECTOR
          ================================================= */}
          <div className="mt-4 rounded-xl bg-[#0D1117] border border-slate-800 p-3">

            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Quick Sign
                </p>

                <p className="text-[10px] text-slate-600 mt-0.5">
                  Tap to test AI voice response
                </p>
              </div>

              <Volume2 className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {quickSigns.map((sign) => {
                const active = selectedQuickSign === sign.token;

                return (
                  <button
                    key={sign.token}
                    onClick={() => handleQuickSign(sign)}
                    className={`
                      group relative overflow-hidden
                      rounded-lg border px-2 py-2
                      transition-all duration-200
                      flex flex-col items-center justify-center
                      gap-1
                      ${
                        active
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 scale-[0.97]"
                          : "bg-[#070A0F] border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-slate-300"
                      }
                    `}
                  >
                    <span className="text-lg leading-none">
                      {sign.emoji}
                    </span>

                    <span className="text-[9px] font-mono font-semibold tracking-wide">
                      {sign.label}
                    </span>

                    {active && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[9px] text-slate-600 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Same live AI + Rime pipeline
            </div>
          </div>

        </div>

        {/* =====================================================
            CENTER — DIALOGUE TIMELINE
        ===================================================== */}
        <div className="lg:col-span-4 h-[650px] flex flex-col">

          <Timeline
            history={conversationHistory}
            activeResponseId={fsmState === "SPEAKING"}
            onManualInterrupt={triggerManualInterrupt}
          />

        </div>

        {/* =====================================================
            RIGHT — HEARING PARTNER / VOICE
        ===================================================== */}
        <div className="lg:col-span-4 h-[650px] flex flex-col space-y-4">

          {/* Audio Waveform */}
          <AudioWaveform
            state={fsmState}
            isPlaying={isPlaying}
            stopLatency={stopLatency}
            activeVoice={activeVoiceProvider}
          />

          {/* Speech Input */}
          <div className="p-4 rounded-xl bg-[#0D1117] border border-slate-800 space-y-3">

            <div className="flex items-center justify-between">

              <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Hearing Partner Speech
              </span>

              <button
                onClick={toggleMic}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                  isMicListening
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {isMicListening ? (
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <MicOff className="w-3.5 h-3.5" />
                )}

                <span>
                  {isMicListening
                    ? "Mic Active (Full-Duplex)"
                    : "Enable Mic"}
                </span>
              </button>

            </div>

            {/* Manual Speech */}
            <form
              onSubmit={submitManualSpeech}
              className="flex gap-2"
            >
              <input
                type="text"
                value={manualSpeechText}
                onChange={(e) =>
                  setManualSpeechText(e.target.value)
                }
                placeholder="Type speech input (e.g. 'Wait, where are you going?')..."
                className="flex-1 bg-[#070A0F] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />

              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

          {/* Sign Avatar */}
          <div className="flex-1 min-h-[260px]">
            <SignAvatar activeTokens={avatarTokens} />
          </div>

        </div>
      </div>

      {/* =========================================================
          OBSERVABILITY
      ========================================================= */}
      <ObservabilityDrawer events={telemetryEvents} />

      {/* =========================================================
          JUDGE DEMO
      ========================================================= */}
      <JudgeDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onExecuteStep={handleExecuteDemoStep}
      />

    </div>
  );
}

export default Conversation;