from rest_framework.views import APIView
from rest_framework.response import Response
from services.speech_service import speech_service

class SpeechTranscribeView(APIView):
    def post(self, request):
        raw_text = request.data.get("text", "")
        normalized = speech_service.normalize_transcript(raw_text)
        is_interruption = speech_service.detect_interruption_intent(normalized)
        return Response({
            "normalized_text": normalized,
            "is_interruption": is_interruption,
            "provider": speech_service.provider,
        })
