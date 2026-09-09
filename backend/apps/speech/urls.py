from django.urls import path
from apps.speech.views import SpeechTranscribeView

urlpatterns = [
    path("transcribe", SpeechTranscribeView.as_view(), name="speech_transcribe"),
]
