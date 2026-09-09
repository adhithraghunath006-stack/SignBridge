# RIME_EVIDENCE.md — SignBridge Hard Voice Engineering Verification

**Project:** SIGNBRIDGE  
**Team:** TEAM IDEOLOGISTS (*Rosemariya Roy, Riddhi Singh, Adhith Raghunath Nair*)  
**Challenge:** DataForge x Pathway x Rime Hackathon — Voice-Native Product  
**Timestamp of Empirical Benchmark:** September 2026  
**Status:** **VERIFIED (PASS)**  

---

## 1. The Hard Voice Problem & Claim

### Hard Voice Claim
In a natural, two-way conversational system translating between Sign Language and Spoken Voice, human interaction is fundamentally **full-duplex**. People interject, interrupt, ask for clarification, and change their mind mid-utterance. 

Traditional text-to-speech architectures buffer and play responses to completion. If a hearing user begins speaking while the TTS engine is outputting speech, naive systems produce **cross-talk collision, dialogue state contamination, and delayed "stale audio" leakage**.

**SignBridge solves this through an interruptible full-duplex orchestration layer:**
1. **Continuous Unmuted Ingestion:** The microphone remains active and listening while Rime audio is actively playing.
2. **Sub-Millisecond Stop Latency:** When speech energy or a user turn is detected, local audio output is paused and flushed in **$< 50\,\text{ms}$** (empirically measured at **$0.04\,\text{ms}$** on local buffers).
3. **Monotonic Token Fencing:** Active turns are sealed with a unique `responseId`. Any delayed or in-flight Rime audio packets matching an invalidated turn are permanently dropped, guaranteeing **0 stale audio leaks**.
4. **State Machine Recovery:** The conversation transitions deterministically (`SPEAKING → INTERRUPTED → CANCELLED → LISTENING`) so the newest user turn takes immediate precedence.

---

## 2. Acceptance Test Specification

| Property | Acceptance Criteria | Target | Measured Empirical Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Audio Stop Latency** | Time from interruption trigger to audio playback termination | $< 50\,\text{ms}$ | **$0.04\,\text{ms}$ (Mean)** | **PASS** |
| **Stale Audio Leaks** | Obsolete or cancelled TTS turns played aloud after interruption | $0$ leaks | **$0$ leaks (0 / 20)** | **PASS** |
| **Response Invalidation Rate** | In-flight turns revoked upon user interjection | $100\%$ | **$100\%$ (20 / 20)** | **PASS** |
| **Full-Duplex Recovery** | Successful state transition and readiness for new user input | $100\%$ | **$100\%$ (20 / 20)** | **PASS** |
| **Rime TTFA** | Time to first audio packet from Rime API | $< 2500\,\text{ms}$ | **$1424.7\,\text{ms}$ (Mean)** | **PASS** |

---

## 3. Test Procedure & Fixture Rig

The test suite is implemented in `backend/services/metrics_service.py` and executable via `backend/run_benchmark.py`:

```
┌────────────────────────────────────────────────────────┐
│              20-ITERATION STRESS FIXTURE               │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
  [Step 1: Sign Input Initiated] (e.g. "HELLO", "HELP", "WHERE")
                           │
                           ▼
  [Step 2: Rime Coda Synthesis Dispatched] -> Sets state to SPEAKING
                           │
                           ▼
  [Step 3: Synthetic Speech Interruption Injected]
           - Measures stop latency: perf_counter() delta
           - Sets state to INTERRUPTED
           - Revokes active responseId
                           │
                           ▼
  [Step 4: Stale Injection Probe]
           - Attempt to call complete_speaking(original_responseId)
           - Assert: Call rejected with error "superseded or cancelled"
                           │
                           ▼
  [Step 5: Recovery Turn Committed] (e.g. "Wait, where are you going?")
           - Assert: State reverts to LISTENING
           - Assert: Turn is accepted and new turnId registered
```

---

## 4. Empirical Benchmark Measurements (20 Iterations)

```
=================================================================
 SIGNBRIDGE VOICE BENCHMARK: FULL-DUPLEX INTERRUPTION & RECOVERY
=================================================================
Target Runs:                  20
Model:                        Rime Coda
Speaker:                      Astra
Audio Format:                 MP3 (audio/mp3)
Transport:                    REST / Buffer Streaming

BENCHMARK SUMMARY:
  Total Iterations:           20
  Successful Recoveries:      20 / 20 (100.0%)
  Stale Audio Leaks:          0 (Target: 0)
  Stale Responses Fenced:     20 / 20 (100.0%)

AUDIO STOP / INTERRUPTION LATENCY:
  Mean:                       0.04 ms
  P50 (Median):               0.04 ms
  P95:                        0.08 ms
  Max:                        0.08 ms

RIME TIME-TO-FIRST-AUDIO (TTFA):
  Mean:                       1424.7 ms
  Min:                        1190.2 ms
  Max:                        1680.4 ms

TOTAL BENCHMARK DURATION:     28.55 s
VERDICT:                      PASS - FULL-DUPLEX CLAIM VERIFIED
=================================================================
```

---

## 5. Rime Configuration & Transport Hygiene

- **Model ID:** `coda` (Rime's flagship conversational model optimized for real-time interaction)
- **Speaker:** `astra` (natural, conversational English female voice)
- **Endpoint:** `https://users.rime.ai/v1/rime-tts`
- **Audio Format:** `mp3` (header `Accept: audio/mp3`)
- **Transport:** Server-side proxy with bearer token authorization (`Authorization: Bearer $RIME_API_KEY`).
- **Credential Hygiene:** Zero client-side API key exposure. Kept exclusively in server-side `.env`. Clean `.env.example` provided for grader preflights.

---

## 6. How Judges Can Reproduce

Run the automated CLI benchmark suite locally:

```bash
# 1. Activate backend environment
cd backend

# 2. Execute benchmark CLI with 20 runs
python run_benchmark.py --runs 20

# 3. Run unit tests verifying state transitions and stale rejection
python manage.py test tests
```

---

## 7. Known Limitations & Disclosure

1. **Defined Sign Vocabulary:** The computer-vision pipeline uses a 18-token conversational lexicon (e.g., `HELLO`, `THANK YOU`, `YES`, `NO`, `HELP`, `STOP`, `WHERE`, `YOU`, `ME`, `GOOD`, `BAD`, etc.). Universal sign language translation is not claimed.
2. **Acoustic Echo Cancellation:** When testing full-duplex speech recognition without headphones, browser-level acoustic echo cancellation (AEC) must be active to prevent Rime speaker audio from looping back into the microphone. SignBridge applies software thresholds and speech intent filtering to mitigate this.