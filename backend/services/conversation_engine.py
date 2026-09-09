"""
Conversation Engine & State Machine.
Coordinates full-duplex turns, interruption fencing, response invalidation, and session telemetry.
"""
import time
import uuid
import logging
from typing import Dict, Any, List, Optional
from services.rime_service import rime_service

logger = logging.getLogger(__name__)

class ConversationState:
    IDLE = "IDLE"
    LISTENING = "LISTENING"
    PROCESSING = "PROCESSING"
    SPEAKING = "SPEAKING"
    INTERRUPTED = "INTERRUPTED"
    CANCELLED = "CANCELLED"
    ERROR = "ERROR"

class ConversationEngine:
    def __init__(self):
        self.state = ConversationState.IDLE
        self.session_id = str(uuid.uuid4())
        self.active_response_id: Optional[str] = None
        self.active_turn_index: int = 0
        self.conversation_history: List[Dict[str, Any]] = []
        self.telemetry_events: List[Dict[str, Any]] = []
        self.interrupted_count: int = 0
        self.stale_rejected_count: int = 0
        self.total_turns: int = 0

    def get_state(self) -> Dict[str, Any]:
        return {
            "session_id": self.session_id,
            "state": self.state,
            "active_response_id": self.active_response_id,
            "active_turn_index": self.active_turn_index,
            "interrupted_count": self.interrupted_count,
            "stale_rejected_count": self.stale_rejected_count,
            "total_turns": self.total_turns,
        }

    def reset_session(self) -> Dict[str, Any]:
        self.session_id = str(uuid.uuid4())
        self.state = ConversationState.IDLE
        self.active_response_id = None
        self.active_turn_index = 0
        self.conversation_history = []
        self.telemetry_events = []
        self.interrupted_count = 0
        self.stale_rejected_count = 0
        self.total_turns = 0
        self._log_telemetry("SESSION_RESET", {"session_id": self.session_id})
        return self.get_state()

    def _log_telemetry(self, event_type: str, details: Dict[str, Any]):
        entry = {
            "id": str(uuid.uuid4()),
            "timestamp": round(time.time(), 3),
            "iso_time": time.strftime("%H:%M:%S", time.localtime()),
            "event_type": event_type,
            "state": self.state,
            "active_response_id": self.active_response_id,
            **details,
        }
        self.telemetry_events.append(entry)
        if len(self.telemetry_events) > 200:
            self.telemetry_events.pop(0)

    def process_sign_input(self, sign_token: str, confidence: float = 1.0, raw_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Process recognized sign language input from the camera.
        Translates to natural spoken English and dispatches Rime speech synthesis.
        """
        self.total_turns += 1
        self.active_turn_index += 1
        response_id = str(uuid.uuid4())
        self.active_response_id = response_id

        # Transition to PROCESSING
        self.state = ConversationState.PROCESSING
        self._log_telemetry("SIGN_RECOGNIZED", {
            "sign": sign_token,
            "confidence": confidence,
            "response_id": response_id
        })

        # Map sign token to natural spoken response
        spoken_text = self._map_sign_to_natural_speech(sign_token, raw_text)

        # Call Rime synthesis
        synth_start = time.perf_counter()
        synth_result = rime_service.synthesize(spoken_text)
        synth_duration_ms = round((time.perf_counter() - synth_start) * 1000, 2)

        # Critical Fencing Check: If interrupted while Rime was synthesizing, invalidate!
        if self.active_response_id != response_id or self.state == ConversationState.INTERRUPTED:
            self.stale_rejected_count += 1
            self._log_telemetry("STALE_RESPONSE_FENCED", {
                "stale_response_id": response_id,
                "current_active_id": self.active_response_id,
                "text": spoken_text,
            })
            return {
                "success": False,
                "stale": True,
                "error": "Response was invalidated by subsequent user turn or interruption",
                "response_id": response_id,
                "state": self.state,
            }

        # Transition to SPEAKING
        self.state = ConversationState.SPEAKING
        self._log_telemetry("RIME_SPEAKING", {
            "response_id": response_id,
            "text": spoken_text,
            "synth_duration_ms": synth_duration_ms,
            "model": synth_result.get("model", "coda"),
            "speaker": synth_result.get("speaker", "astra"),
        })

        turn_record = {
            "turn_id": response_id,
            "speaker": "signer",
            "sign_token": sign_token,
            "spoken_text": spoken_text,
            "confidence": confidence,
            "timestamp": time.time(),
            "interrupted": False,
        }
        self.conversation_history.append(turn_record)

        return {
            "success": True,
            "response_id": response_id,
            "spoken_text": spoken_text,
            "sign_token": sign_token,
            "confidence": confidence,
            "audio_base64": synth_result.get("audio_base64"),
            "audio_format": synth_result.get("audio_format", "mp3"),
            "latency_ms": synth_result.get("latency_ms", synth_duration_ms),
            "state": self.state,
            "fallback": synth_result.get("fallback", False),
        }

    def process_speech_input(self, speech_text: str, is_interim: bool = False) -> Dict[str, Any]:
        """
        Process spoken audio input from the hearing user.
        If Rime is currently speaking, triggers full-duplex interruption immediately.
        """
        if not speech_text or not speech_text.strip():
            return {"success": False, "error": "Empty speech input"}

        # FULL-DUPLEX CHECK: If Rime is currently speaking, user speech triggers interruption!
        was_speaking = (self.state in (ConversationState.SPEAKING, ConversationState.INTERRUPTED))
        interruption_latency_ms = None

        if was_speaking:
            interrupt_result = self.interrupt(reason="speech_overlap")
            interruption_latency_ms = interrupt_result.get("stop_latency_ms")

        if is_interim:
            self._log_telemetry("SPEECH_INTERIM", {"text": speech_text})
            return {
                "success": True,
                "is_interim": True,
                "text": speech_text,
                "interrupted_prior": was_speaking,
                "state": self.state,
            }

        self.total_turns += 1
        self.active_turn_index += 1
        speech_turn_id = str(uuid.uuid4())

        self.state = ConversationState.PROCESSING
        self._log_telemetry("SPEECH_COMMITTED", {
            "turn_id": speech_turn_id,
            "text": speech_text,
            "interrupted_prior": was_speaking,
            "interruption_latency_ms": interruption_latency_ms,
        })

        # Tokenize spoken phrase into sign representation tokens
        sign_tokens = self._tokenize_speech_to_signs(speech_text)

        turn_record = {
            "turn_id": speech_turn_id,
            "speaker": "listener",
            "spoken_text": speech_text,
            "sign_tokens": sign_tokens,
            "timestamp": time.time(),
            "interrupted_prior": was_speaking,
        }
        self.conversation_history.append(turn_record)

        self.state = ConversationState.LISTENING

        return {
            "success": True,
            "turn_id": speech_turn_id,
            "speaker": "listener",
            "spoken_text": speech_text,
            "sign_tokens": sign_tokens,
            "interrupted_prior": was_speaking,
            "interruption_latency_ms": interruption_latency_ms,
            "state": self.state,
        }

    def interrupt(self, reason: str = "manual") -> Dict[str, Any]:
        """
        Instant interruption of active Rime speech.
        Fences and invalidates active response ID, stops audio stream, updates state.
        """
        start_time = time.perf_counter()
        previous_response_id = self.active_response_id
        previous_state = self.state

        self.interrupted_count += 1
        self.state = ConversationState.INTERRUPTED
        self.active_response_id = None  # Fencing: obsolete responses will be rejected

        # Mark last conversation turn as interrupted if applicable
        if self.conversation_history and self.conversation_history[-1].get("turn_id") == previous_response_id:
            self.conversation_history[-1]["interrupted"] = True

        stop_latency_ms = round((time.perf_counter() - start_time) * 1000, 3)

        self._log_telemetry("INTERRUPTION_TRIGGERED", {
            "previous_response_id": previous_response_id,
            "reason": reason,
            "stop_latency_ms": stop_latency_ms,
            "previous_state": previous_state,
        })

        return {
            "success": True,
            "invalidated_response_id": previous_response_id,
            "stop_latency_ms": stop_latency_ms,
            "state": self.state,
            "message": "Playback cancelled, response invalidated",
        }

    def complete_speaking(self, response_id: str) -> Dict[str, Any]:
        """Called when audio playback finishes naturally without interruption."""
        if self.active_response_id == response_id:
            self.state = ConversationState.LISTENING
            self._log_telemetry("PLAYBACK_COMPLETED", {"response_id": response_id})
            return {"success": True, "state": self.state}
        else:
            # Response was already invalidated
            self.stale_rejected_count += 1
            return {"success": False, "reason": "Response was already superseded or cancelled"}

    def _map_sign_to_natural_speech(self, sign_token: str, raw_text: Optional[str] = None) -> str:
        token = sign_token.upper().strip()
        mapping = {
            "HELLO": "Hello, it is great to see you.",
            "THANK YOU": "Thank you very much.",
            "YES": "Yes, absolutely.",
            "NO": "No, that is not correct.",
            "HELP": "Could you please help me with something?",
            "STOP": "Please stop for a moment.",
            "WHERE": "Where is that located?",
            "YOU": "You are right.",
            "ME": "I am here.",
            "GOOD": "That sounds very good.",
            "BAD": "That is unfortunate.",
            "NAME": "What is your name?",
            "GO": "Let us go ahead.",
            "COME": "Please come over here.",
            "WATER": "Could I please get some water?",
            "FOOD": "I would like some food, please.",
            "PLEASE": "Please and thank you.",
            "SORRY": "I am really sorry about that.",
            "HOW ARE YOU": "How are you doing today?",
        }
        return mapping.get(token, raw_text or f"I am signing {token.lower()}.")

    def _tokenize_speech_to_signs(self, text: str) -> List[str]:
        words = text.upper().replace("?", "").replace(".", "").replace("!", "").replace(",", "").split()
        known_signs = {
            "HELLO", "THANK", "YOU", "YES", "NO", "HELP", "STOP",
            "WHERE", "GOOD", "BAD", "NAME", "GO", "COME",
            "WATER", "FOOD", "PLEASE", "SORRY", "HOW", "ARE"
        }
        tokens = []
        for w in words:
            if w in known_signs:
                tokens.append(w)
            elif w == "THANKS":
                tokens.append("THANK")
                tokens.append("YOU")
            elif w in ("HI", "HEY"):
                tokens.append("HELLO")
            elif w == "YEAH":
                tokens.append("YES")
            elif w == "NOPE":
                tokens.append("NO")
        return tokens if tokens else ["UNTRANSLATABLE_PHRASE"]

conversation_engine = ConversationEngine()
