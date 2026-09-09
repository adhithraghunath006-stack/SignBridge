from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import time

@api_view(["GET"])
def health_check(request):
    """System health and configuration preflight status."""
    rime_configured = bool(getattr(settings, "RIME_API_KEY", None))
    return Response({
        "status": "healthy",
        "service": "SignBridge Real-Time Voice Engine",
        "version": "1.0.0-hackathon",
        "timestamp": time.time(),
        "rime": {
            "configured": rime_configured,
            "model": getattr(settings, "RIME_MODEL", "coda"),
            "speaker": getattr(settings, "RIME_VOICE", "astra"),
            "endpoint": getattr(settings, "RIME_API_URL", ""),
        },
        "supported_languages": ["en"],
        "modes": ["LIVE_AI", "DEMO_MODE"],
    })

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health", health_check, name="api_health"),
    path("api/conversation/", include("apps.conversation.urls")),
    path("api/rime/", include("apps.rime.urls")),
    path("api/sign/", include("apps.sign.urls")),
    path("api/speech/", include("apps.speech.urls")),
    path("api/evaluation/", include("apps.evaluation.urls")),
]
