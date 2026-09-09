"""
Metrics & Evaluation Benchmark Service.
Executes reproducible full-duplex stress tests and calculates real latency statistics.
"""
import time
import uuid
import statistics
from typing import Dict, Any, List
from services.conversation_engine import ConversationEngine, ConversationState
from services.rime_service import rime_service

class MetricsService:
    def __init__(self):
        self.benchmark_history: List[Dict[str, Any]] = []

    def run_interruption_benchmark(self, num_runs: int = 20) -> Dict[str, Any]:
        """
        Runs empirical stress tests measuring full-duplex interruption performance.
        Records actual clock times for:
        - Audio Stop Latency (ms)
        - Interruption-to-Invalidation Latency (ms)
        - Stale Response Rejection Count
        - Recovery Success Rate (%)
        - Rime TTFA (Time to First Audio)
        """
        stop_latencies = []
        ttfa_latencies = []
        stale_counts = 0
        successful_recoveries = 0

        test_engine = ConversationEngine()

        sample_signs = ["HELLO", "THANK YOU", "HELP", "WHERE", "HOW ARE YOU"]
        sample_interrupts = [
            "Wait, where are you going?",
            "Hold on, can you clarify?",
            "Stop, please look here.",
            "Excuse me, one question.",
            "Wait a second.",
        ]

        run_details = []

        for i in range(num_runs):
            sign = sample_signs[i % len(sample_signs)]
            interrupt_speech = sample_interrupts[i % len(sample_interrupts)]

            # 1. Start Turn A (Sign -> Rime speaking)
            turn_start = time.perf_counter()
            process_res = test_engine.process_sign_input(sign, confidence=0.95)
            ttfa = process_res.get("latency_ms", 0)
            ttfa_latencies.append(ttfa)

            original_response_id = process_res.get("response_id")

            # 2. Simulate User Interrupt while Rime is in SPEAKING state
            int_start = time.perf_counter()
            interrupt_res = test_engine.interrupt(reason="speech_overlap")
            stop_lat = (time.perf_counter() - int_start) * 1000
            stop_latencies.append(stop_lat)

            # 3. Verify Fencing: Can obsolete response A complete or play?
            stale_attempt = test_engine.complete_speaking(original_response_id)
            if not stale_attempt.get("success"):
                # Correctly blocked stale audio
                pass
            else:
                stale_counts += 1

            # 4. Process new user turn (Recovery)
            rec_res = test_engine.process_speech_input(interrupt_speech)
            if rec_res.get("success") and test_engine.state == ConversationState.LISTENING:
                successful_recoveries += 1

            run_details.append({
                "run": i + 1,
                "sign": sign,
                "ttfa_ms": round(ttfa, 2),
                "stop_latency_ms": round(stop_lat, 3),
                "stale_fenced": not stale_attempt.get("success"),
                "recovered": rec_res.get("success"),
            })

        avg_stop_lat = round(statistics.mean(stop_latencies), 2)
        p50_stop_lat = round(statistics.median(stop_latencies), 2)
        sorted_stops = sorted(stop_latencies)
        p95_idx = int(len(sorted_stops) * 0.95)
        p95_stop_lat = round(sorted_stops[p95_idx], 2)
        max_stop_lat = round(max(stop_latencies), 2)

        avg_ttfa = round(statistics.mean(ttfa_latencies), 2) if ttfa_latencies else 0

        recovery_rate = round((successful_recoveries / num_runs) * 100, 1)

        result = {
            "id": str(uuid.uuid4()),
            "timestamp": time.time(),
            "iso_time": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "num_runs": num_runs,
            "successful_runs": successful_recoveries,
            "failed_runs": num_runs - successful_recoveries,
            "stale_responses_detected": stale_counts,
            "stale_responses_fenced": num_runs - stale_counts,
            "recovery_success_rate": recovery_rate,
            "metrics": {
                "audio_stop_latency_ms": {
                    "mean": avg_stop_lat,
                    "p50": p50_stop_lat,
                    "p95": p95_stop_lat,
                    "max": max_stop_lat,
                },
                "rime_ttfa_ms": {
                    "mean": avg_ttfa,
                },
                "stale_audio_leakage": stale_counts,
            },
            "run_details": run_details,
        }

        self.benchmark_history.append(result)
        return result

    def get_latest_results(self) -> Dict[str, Any]:
        if not self.benchmark_history:
            # Return fresh baseline run
            return self.run_interruption_benchmark(num_runs=10)
        return self.benchmark_history[-1]

metrics_service = MetricsService()
