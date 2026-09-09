from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from services.rime_service import rime_service

class RimeSynthesizeView(APIView):
    def post(self, request):
        text = request.data.get("text", "")
        speaker = request.data.get("speaker")
        model_id = request.data.get("modelId") or request.data.get("model_id")
        audio_format = request.data.get("audio_format", "mp3")

        result = rime_service.synthesize(
            text=text,
            speaker=speaker,
            model_id=model_id,
            audio_format=audio_format
        )
        return Response(result, status=status.HTTP_200_OK if result.get("success") else status.HTTP_502_BAD_GATEWAY)

class RimeHealthView(APIView):
    def get(self, request):
        health = rime_service.check_health()
        return Response(health)
