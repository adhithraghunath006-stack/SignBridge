from django.urls import path
from apps.evaluation.views import EvaluationRunView, EvaluationResultsView

urlpatterns = [
    path("run", EvaluationRunView.as_view(), name="evaluation_run"),
    path("results", EvaluationResultsView.as_view(), name="evaluation_results"),
]
