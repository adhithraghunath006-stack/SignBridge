"""
Rime TTS integration service.
Handles speech synthesis, latency tracking, audio formatting, and provider telemetry.
"""
import base64
import logging
import time
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class RimeService:
    def __init__(self):
        self.api_key = getattr(settings, "RIME_API_KEY", "")
        self.model_id = getattr(settings, "RIME_MODEL", "coda")
        self.speaker = getattr(settings, "RIME_VOICE", "astra")
        self.api_url = getattr(settings, "RIME_API_URL", "https://users.rime.ai/v1/rime-tts")
        self.timeout = 15.0

    def synthesize(self, text: str, speaker: str = None, model_id: str = None, audio_format: str = "mp3") -> dict:
        """
        Synthesize text into speech via Rime TTS.
        Returns dict containing base64 audio, latency, and format metadata.
        """
        if not text or not text.strip():
            return {
                "success": False,
                "error": "Empty text provided",
                "audio_base64": None,
                "latency_ms": 0,
            }

        target_speaker = speaker or self.speaker
        target_model = model_id or self.model_id

        if not self.api_key:
            logger.warning("RIME_API_KEY not configured. Falling back to synthetic mock audio.")
            return {
                "success": False,
                "error": "RIME_API_KEY is not configured",
                "fallback": True,
                "provider": "offline_fallback",
                "audio_base64": None,
                "latency_ms": 0,
                "text": text,
            }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": f"audio/{audio_format}",
        }

        payload = {
            "text": text.strip(),
            "speaker": target_speaker,
            "modelId": target_model,
            "lang": "en",
        }

        start_time = time.perf_counter()
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=self.timeout
            )
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

            if response.status_code == 200:
                audio_bytes = response.content
                audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
                return {
                    "success": True,
                    "provider": "rime",
                    "model": target_model,
                    "speaker": target_speaker,
                    "audio_format": audio_format,
                    "audio_base64": audio_b64,
                    "audio_size_bytes": len(audio_bytes),
                    "latency_ms": elapsed_ms,
                    "text": text,
                    "fallback": False,
                }
            else:
                error_msg = f"Rime API returned status {response.status_code}: {response.text}"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": error_msg,
                    "status_code": response.status_code,
                    "latency_ms": elapsed_ms,
                    "fallback": True,
                    "text": text,
                }

        except requests.RequestException as exc:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(f"Rime API request failed: {exc}")
            return {
                "success": False,
                "error": str(exc),
                "latency_ms": elapsed_ms,
                "fallback": True,
                "text": text,
            }

    def check_health(self) -> dict:
        """Check Rime service connectivity and API key validity."""
        if not self.api_key:
            return {"status": "unconfigured", "message": "RIME_API_KEY missing"}
        test_result = self.synthesize("SignBridge online.", audio_format="mp3")
        return {
            "status": "healthy" if test_result.get("success") else "degraded",
            "model": self.model_id,
            "speaker": self.speaker,
            "endpoint": self.api_url,
            "latency_ms": test_result.get("latency_ms"),
            "error": test_result.get("error"),
        }

rime_service = RimeService()
