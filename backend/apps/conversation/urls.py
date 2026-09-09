from django.urls import path
from apps.conversation.views import (
    ConversationStateView,
    ConversationStartView,
    ConversationInputView,
    ConversationInterruptView,
    ConversationCompleteView,
    ConversationTelemetryView,
)

urlpatterns = [
    path("state", ConversationStateView.as_view(), name="conversation_state"),
    path("start", ConversationStartView.as_view(), name="conversation_start"),
    path("input", ConversationInputView.as_view(), name="conversation_input"),
    path("interrupt", ConversationInterruptView.as_view(), name="conversation_interrupt"),
    path("complete", ConversationCompleteView.as_view(), name="conversation_complete"),
    path("telemetry", ConversationTelemetryView.as_view(), name="conversation_telemetry"),
]
