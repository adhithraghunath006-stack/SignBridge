from rest_framework.views import APIView
from rest_framework.response import Response
from services.metrics_service import metrics_service

class EvaluationRunView(APIView):
    def post(self, request):
        num_runs = int(request.data.get("num_runs", 20))
        # Cap at 50 for safety
        num_runs = max(1, min(50, num_runs))
        results = metrics_service.run_interruption_benchmark(num_runs=num_runs)
        return Response(results)

class EvaluationResultsView(APIView):
    def get(self, request):
        results = metrics_service.get_latest_results()
        return Response(results)
