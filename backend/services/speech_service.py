"""
Speech recognition and transcription service interface.
Provider-agnostic design with full-duplex turn detection.
"""
import re
from typing import Dict, Any, List

class SpeechService:
    def __init__(self):
        self.provider = "web_speech_api_hybrid"

    def normalize_transcript(self, raw_transcript: str) -> str:
        """Sanitize and clean spoken transcripts."""
        if not raw_transcript:
            return ""
        # Remove repeated filler words, trim whitespace
        text = raw_transcript.strip()
        text = re.sub(r"\s+", " ", text)
        return text

    def detect_interruption_intent(self, transcript: str) -> bool:
        """
        Check if spoken words represent an urgent interruption.
        In full-duplex mode, any voice energy/words during TTS are treated as interruption.
        """
        interruption_cues = ["wait", "stop", "hold on", "excuse me", "no", "what", "hey"]
        lower = transcript.lower()
        return any(cue in lower for cue in interruption_cues)

speech_service = SpeechService()
