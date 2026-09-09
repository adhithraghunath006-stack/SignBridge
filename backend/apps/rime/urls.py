from django.urls import path
from apps.rime.views import RimeSynthesizeView, RimeHealthView

urlpatterns = [
    path("synthesize", RimeSynthesizeView.as_view(), name="rime_synthesize"),
    path("health", RimeHealthView.as_view(), name="rime_health"),
]
