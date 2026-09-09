#!/usr/bin/env python
"""
SignBridge Interruption & Latency Benchmark CLI Runner.
Produces reproducible empirical evidence for hackathon evaluation.
Usage: python run_benchmark.py --runs 20
"""
import os
import sys
import argparse
import time

# Ensure backend directory in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from services.metrics_service import metrics_service

def main():
    parser = argparse.ArgumentParser(description="Run SignBridge full-duplex interruption benchmark")
    parser.add_argument("--runs", type=int, default=20, help="Number of benchmark iterations (default: 20)")
    args = parser.parse_args()

    print("=" * 65)
    print(" SIGNBRIDGE VOICE BENCHMARK: FULL-DUPLEX INTERRUPTION & RECOVERY")
    print("=" * 65)
    print(f"Target Runs: {args.runs}")
    print("Model: Rime Coda | Speaker: Astra | Transport: REST/AudioBuffer")
    print("Beginning stress test suite...\n")

    start_bench = time.perf_counter()
    results = metrics_service.run_interruption_benchmark(num_runs=args.runs)
    total_duration = round(time.perf_counter() - start_bench, 2)

    metrics = results["metrics"]
    stop_stats = metrics["audio_stop_latency_ms"]

    print("=" * 65)
    print(" BENCHMARK RESULTS")
    print("=" * 65)
    print(f"Total Iterations:             {results['num_runs']}")
    print(f"Successful Recoveries:        {results['successful_runs']}/{results['num_runs']} ({results['recovery_success_rate']}%)")
    print(f"Stale Audio Leaks:            {results['stale_responses_detected']} (Target: 0)")
    print(f"Stale Responses Fenced:       {results['stale_responses_fenced']}/{results['num_runs']}")
    print("-" * 65)
    print("AUDIO STOP / INTERRUPTION LATENCY:")
    print(f"  Mean:                       {stop_stats['mean']} ms")
    print(f"  P50 (Median):               {stop_stats['p50']} ms")
    print(f"  P95:                        {stop_stats['p95']} ms")
    print(f"  Max:                        {stop_stats['max']} ms")
    print("-" * 65)
    print(f"Rime TTFA (Mean Latency):     {metrics['rime_ttfa_ms']['mean']} ms")
    print(f"Total Benchmark Duration:     {total_duration} s")
    print("=" * 65)

    if results["stale_responses_detected"] == 0 and results["recovery_success_rate"] == 100.0:
        print("VERDICT: PASS - FULL-DUPLEX INTERRUPTION CLAIM VERIFIED.")
    else:
        print("VERDICT: DEGRADED - REVIEW LOGS.")
    print("=" * 65)

if __name__ == "__main__":
    main()
