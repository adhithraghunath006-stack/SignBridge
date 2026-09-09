from rest_framework.views import APIView
from rest_framework.response import Response
from services.sign_service import sign_service

class SignVocabularyView(APIView):
    def get(self, request):
        return Response({
            "vocabulary": sign_service.get_vocabulary(),
            "confidence_threshold": sign_service.CONFIDENCE_THRESHOLD,
            "count": len(sign_service.VOCABULARY),
        })

class SignPredictView(APIView):
    def post(self, request):
        token = request.data.get("token", "")
        confidence = float(request.data.get("confidence", 1.0))
        result = sign_service.evaluate_sign(token, confidence)
        return Response(result)
