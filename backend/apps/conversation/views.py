from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from services.conversation_engine import conversation_engine

class ConversationStateView(APIView):
    def get(self, request):
        return Response(conversation_engine.get_state())

class ConversationStartView(APIView):
    def post(self, request):
        state = conversation_engine.reset_session()
        return Response({
            "message": "Session started",
            **state
        })

class ConversationInputView(APIView):
    def post(self, request):
        speaker = request.data.get("speaker", "signer")
        input_type = request.data.get("input_type", "sign")

        if input_type == "sign" or speaker == "signer":
            sign_token = request.data.get("sign_token", "")
            confidence = float(request.data.get("confidence", 1.0))
            raw_text = request.data.get("raw_text")
            result = conversation_engine.process_sign_input(
                sign_token=sign_token,
                confidence=confidence,
                raw_text=raw_text
            )
            return Response(result, status=status.HTTP_200_OK if result.get("success") else status.HTTP_400_BAD_REQUEST)

        elif input_type == "speech" or speaker == "listener":
            speech_text = request.data.get("speech_text", "")
            is_interim = bool(request.data.get("is_interim", False))
            result = conversation_engine.process_speech_input(
                speech_text=speech_text,
                is_interim=is_interim
            )
            return Response(result, status=status.HTTP_200_OK if result.get("success") else status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Invalid input_type or speaker"}, status=status.HTTP_400_BAD_REQUEST)

class ConversationInterruptView(APIView):
    def post(self, request):
        reason = request.data.get("reason", "manual")
        result = conversation_engine.interrupt(reason=reason)
        return Response(result)

class ConversationCompleteView(APIView):
    def post(self, request):
        response_id = request.data.get("response_id")
        if not response_id:
            return Response({"error": "response_id required"}, status=status.HTTP_400_BAD_REQUEST)
        result = conversation_engine.complete_speaking(response_id)
        return Response(result)

class ConversationTelemetryView(APIView):
    def get(self, request):
        return Response({
            "session_id": conversation_engine.session_id,
            "events": conversation_engine.telemetry_events,
            "history": conversation_engine.conversation_history,
        })
