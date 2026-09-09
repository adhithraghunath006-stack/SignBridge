import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../services/api";
import { audioController } from "../services/audioController";

export function useConversation() {
  const [mode, setMode] = useState("LIVE_AI"); // 'LIVE_AI' | 'DEMO_MODE'
  const [fsmState, setFsmState] = useState("IDLE"); // IDLE, LISTENING, PROCESSING, SPEAKING, INTERRUPTED
  const [conversationHistory, setConversationHistory] = useState([]);
  const [telemetryEvents, setTelemetryEvents] = useState([]);
  const [activeResponseId, setActiveResponseId] = useState(null);
  const [interruptionCount, setInterruptionCount] = useState(0);
  const [latestLatency, setLatestLatency] = useState(null);
  const [activeVoiceProvider, setActiveVoiceProvider] = useState("Rime Coda (astra)");
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);

  const activeResponseIdRef = useRef(null);
  activeResponseIdRef.current = activeResponseId;

  // Sync state and log telemetry
  const logEvent = useCallback((type, details = {}) => {
    const entry = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(),
      type,
      ...details,
    };
    setTelemetryEvents((prev) => [entry, ...prev.slice(0, 49)]);
  }, []);

  // Check health on mount
  useEffect(() => {
    api.getHealth()
      .then((data) => {
        setIsBackendHealthy(data.status === "healthy");
        if (data.rime && data.rime.model && data.rime.speaker) {
          setActiveVoiceProvider("Rime " + data.rime.model.toUpperCase() + " (" + data.rime.speaker + ")");
        }
      })
      .catch(() => {
        setIsBackendHealthy(false);
        setActiveVoiceProvider("Local Fallback Synthesizer");
      });
  }, []);

  // Listen to audioController playback finish
  useEffect(() => {
    const unsub = audioController.subscribe(({ isPlaying, currentResponseId }) => {
      if (!isPlaying && fsmState === "SPEAKING") {
        setFsmState("LISTENING");
        logEvent("PLAYBACK_FINISHED", { responseId: currentResponseId });
      }
    });
    return unsub;
  }, [fsmState, logEvent]);

  // Handle incoming Sign gesture from Camera
  const handleSignInput = useCallback(async (token, confidence = 0.95) => {
    const responseId = "resp_" + Date.now();
    setActiveResponseId(responseId);
    setFsmState("PROCESSING");
    logEvent("SIGN_RECOGNIZED", { token, confidence, responseId });

    try {
      let spokenText = "I am signing " + token + ".";
      let audioBase64 = null;
      let latencyMs = 800;

      if (mode === "LIVE_AI" && isBackendHealthy) {
        const res = await api.sendInput({
          speaker: "signer",
          input_type: "sign",
          sign_token: token,
          confidence,
        });

        spokenText = res.spoken_text;
        audioBase64 = res.audio_base64;
        latencyMs = res.latency_ms;
      } else {
        // Deterministic demo mode response
        const mockPhrases = {
          "HELLO": "Hello, it is great to see you.",
          "THANK YOU": "Thank you very much.",
          "YES": "Yes, absolutely.",
          "NO": "No, that is not correct.",
          "HELP": "Could you please help me with something?",
          "STOP": "Please stop for a moment.",
          "WHERE": "Where is that located?",
          "YOU": "You are right.",
          "ME": "I am here.",
          "WATER": "Could I please get some water?",
          "HOW ARE YOU": "How are you doing today?"
        };
        spokenText = mockPhrases[token] || ("Recognized sign: " + token + ".");
        latencyMs = 320;
      }

      setLatestLatency(latencyMs);

      // Fencing check: if user interrupted during synthesis, drop immediately!
      if (activeResponseIdRef.current !== responseId) {
        logEvent("STALE_RESPONSE_DROPPED", { responseId, reason: "Turn superseded" });
        return;
      }

      const turn = {
        id: responseId,
        timestamp: new Date().toLocaleTimeString(),
        speaker: "signer",
        signToken: token,
        spokenText,
        confidence,
        interrupted: false,
        latencyMs,
      };

      setConversationHistory((prev) => [...prev, turn]);
      setFsmState("SPEAKING");
      logEvent("RIME_SPEAKING", { responseId, spokenText, latencyMs });

      // Trigger audio playback
      if (audioBase64) {
        audioController.play(audioBase64, responseId, () => {
          if (activeResponseIdRef.current === responseId) {
            setFsmState("LISTENING");
            api.completeSpeaking(responseId).catch(() => {});
          }
        });
      } else {
        // Simulated playback duration for visual feedback
        const duration = Math.min(4000, Math.max(1500, spokenText.length * 70));
        setTimeout(() => {
          if (activeResponseIdRef.current === responseId) {
            setFsmState("LISTENING");
            logEvent("PLAYBACK_COMPLETED", { responseId });
          }
        }, duration);
      }
    } catch (err) {
      console.error("[useConversation] Sign handling error:", err);
      setFsmState("LISTENING");
      logEvent("SIGN_ERROR", { error: err.message });
    }
  }, [mode, isBackendHealthy, logEvent]);

  // Handle incoming speech from Hearing User
  const handleSpeechInput = useCallback(async (speechText, isInterim = false) => {
    if (!speechText.trim()) return;

    // FULL-DUPLEX CHECK: If Rime is speaking or just finished, this is an interruption!
    const wasSpeaking = (fsmState === "SPEAKING" || audioController.isPlaying);

    if (wasSpeaking) {
      // Execute instantaneous interruption
      const stopMs = audioController.interrupt();
      setActiveResponseId(null);
      setFsmState("INTERRUPTED");
      setInterruptionCount((c) => c + 1);

      // Mark the prior turn in history as interrupted
      setConversationHistory((prev) =>
        prev.map((t, idx) =>
          idx === prev.length - 1 ? { ...t, interrupted: true } : t
        )
      );

      logEvent("INTERRUPT_DETECTED", {
        trigger: "Speech overlap",
        speechSnippet: speechText.slice(0, 30),
        stopLatencyMs: stopMs,
      });

      if (isBackendHealthy) {
        api.interrupt("speech_overlap").catch(() => {});
      }
    }

    if (isInterim) {
      logEvent("SPEECH_INTERIM", { text: speechText });
      return;
    }

    // Final speech turn committed
    setFsmState("PROCESSING");
    logEvent("SPEECH_COMMITTED", { text: speechText });

    const turnId = "turn_" + Date.now();

    // Map spoken text to sign tokens for Deaf user avatar
    const words = speechText.toUpperCase().replace(/[?!.,]/g, "").split(" ");
    const signTokens = words.filter((w) =>
      ["HELLO", "THANK", "YOU", "YES", "NO", "HELP", "STOP", "WHERE", "GO", "WATER", "PLEASE", "HOW", "ARE"].includes(w)
    );

    const turn = {
      id: turnId,
      timestamp: new Date().toLocaleTimeString(),
      speaker: "listener",
      spokenText: speechText,
      signTokens: signTokens.length ? signTokens : ["UNTRANSLATABLE_PHRASE"],
      interruptedPrior: wasSpeaking,
    };

    setConversationHistory((prev) => [...prev, turn]);
    setFsmState("LISTENING");
    logEvent("SIGN_REPRESENTATION_RENDERED", { tokens: turn.signTokens });
  }, [fsmState, isBackendHealthy, logEvent]);

  // Explicit interrupt action (e.g. manual button or hotkey)
  const triggerManualInterrupt = useCallback(() => {
    const stopMs = audioController.interrupt();
    setActiveResponseId(null);
    setFsmState("INTERRUPTED");
    setInterruptionCount((c) => c + 1);

    setConversationHistory((prev) =>
      prev.map((t, idx) =>
        idx === prev.length - 1 ? { ...t, interrupted: true } : t
      )
    );

    logEvent("MANUAL_INTERRUPT", { stopLatencyMs: stopMs });

    if (isBackendHealthy) {
      api.interrupt("manual_button").catch(() => {});
    }

    setTimeout(() => {
      setFsmState("LISTENING");
    }, 400);
  }, [isBackendHealthy, logEvent]);

  // Reset conversation session
  const resetSession = useCallback(async () => {
    audioController.stop();
    setActiveResponseId(null);
    setConversationHistory([]);
    setInterruptionCount(0);
    setFsmState("IDLE");
    logEvent("SESSION_RESET");
    if (isBackendHealthy) {
      await api.startSession().catch(() => {});
    }
  }, [isBackendHealthy, logEvent]);

  return {
    mode,
    setMode,
    fsmState,
    setFsmState,
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
  };
}