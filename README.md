# SignBridge

> **One conversation. Two languages. Zero interpreters.**  


SignBridge is an AI-powered real-time, two-way communication system engineered to enable seamless conversation between a Deaf or hard-of-hearing sign language user and a hearing interlocutor who does not understand sign language.

- **SIGN LANGUAGE → TEXT → RIME SPEECH**
- **SPOKEN LANGUAGE → TEXT → SIGN REPRESENTATION**

---

## The Problem

Over 70 million individuals rely on sign language globally. In spontaneous daily life — clinics, transit hubs, workplaces, and commerce — communication breaks down when the other person does not understand signing. 

Traditional assistive tools are fundamentally deficient:
- **One-directional:** Speech-to-text apps allow hearing people to speak, but give the Deaf user no vocal presence in the room.
- **Screen-Tethered:** Hearing participants are forced to stare down at a smartphone transcript rather than maintaining natural eye contact.
- **Interpreters:** Professional human interpreters require advance scheduling, high expense, and eliminate privacy.


## The Solution & Necessity of Voice

SignBridge restores conversational reciprocity through real-time bidirectional translation.

### Why Voice is Essential
In an active physical environment (cooking, navigating, collaborating, operating equipment), the hearing conversation partner cannot be perpetually glued to a screen. **Rime-generated speech is indispensable** — it allows the Deaf user to speak into the acoustic environment with a natural, expressive vocal identity. Removing speech would make the system materially worse.

---

## Key Innovation: Interruptible Full-Duplex Voice Orchestration

Conversations are not rigid turn-taking chatbot queries. Humans interrupt, interject, and react mid-sentence.

**The Hard Voice Engineering Problem:**
If a system naively plays synthesized speech to completion, user interruptions cause audio overlap, stale model responses, and state desynchronization.

**SignBridge solves this with a Full-Duplex Interruption State Machine:**
1. **Continuous Listening:** The microphone remains active while Rime speaks.
2. **Instant Audio Stop ($< 50\,\text{ms}$):** When user speech overlap is detected, active audio playback is immediately halted (measured at **$0.04\,\text{ms}$** on local buffers).
3. **Monotonic Token Fencing:** Active turns carry a unique `responseId`. Any delayed in-flight Rime packets matching a revoked turn are discarded, ensuring **0 stale audio leaks**.
4. **State Machine Recovery:** Deterministic transition `SPEAKING → INTERRUPTED → CANCELLED → LISTENING`. The newest speaker turn takes immediate conversational priority.

---

## Why Rime

- **Model:** `coda` — Rime's flagship conversational model with sub-100ms model latency.
- **Voice / Speaker:** `astra` — Natural, clear conversational delivery.
- **Transport:** REST audio streaming with server-side bearer token proxy.
- **Voice Experience:** Rime provides the core vocal identity, transforming hand gestures into fluent human speech.

---

## Architecture Overview

```
[DEAF PARTICIPANT]
       │
       ▼ (Live Webcam Feed)
[MediaPipe Hands: 21 3D Landmarks]
       │
       ▼ (Geometric Vector Feature Extraction)
[Sign Classifier (18-Token Lexicon, >70% Confidence)]
       │
       ▼
┌───────────────────────────────────────────────────────────┐
│              SIGNBRIDGE CONVERSATION ENGINE               │
│                                                           │
│  • ConversationStateMachine (Full-Duplex State Tracker)   │
│  • Token Fencing & Invalidation Engine (UUID Epochs)      │
│  • Telemetry Logger & Millisecond Event Stream            │
└───────────────────────────────────────────────────────────┘
       │                                     ▲
       │                                     │ (Continuous Mic Stream)
       ▼ (Prompt)                            │
[Rime TTS Service (Coda / astra)]    [SpeechRecognitionService]
       │                                     ▲
       ▼ (AudioBuffer)                       │
[AudioPlayer (<50ms Cutoff)]         [HEARING PARTICIPANT]
       │
       ▼ (Spoken Audio into Room)
       └─────────────────────────────────────┘
```

---

## Tech Stack

- **Backend:** Python 3.10+, Django 5.x, Django REST Framework, django-cors-headers, python-dotenv, requests
- **Frontend:** React 18 / Vite, Tailwind CSS, Lucide React, HTML5 Canvas
- **Computer Vision:** MediaPipe Hands (21 3D hand landmark mesh)
- **Voice Synthesis:** Official Rime TTS API (`coda` model, `astra` voice)
- **Speech Recognition:** Full-Duplex Web Speech API provider interface

---

## Project Structure

```
signbridge/
├── backend/
│   ├── config/
│   │   ├── settings.py           # Django configuration, CORS, Rime settings
│   │   ├── urls.py               # Root routing (/api/health, /api/conversation, etc.)
│   │   ├── wsgi.py / asgi.py
│   ├── apps/
│   │   ├── conversation/         # Session FSM, turns, telemetry endpoints
│   │   ├── rime/                 # Direct Rime synthesis proxy
│   │   ├── sign/                 # Sign vocabulary & prediction
│   │   ├── speech/               # Speech transcription & intent
│   │   └── evaluation/           # Benchmark endpoints
│   ├── services/
│   │   ├── rime_service.py       # Rime API client & latency metrics
│   │   ├── conversation_engine.py# State machine, fencing & turns
│   │   ├── sign_service.py       # 18-sign vocabulary catalog
│   │   ├── speech_service.py     # Transcript normalization
│   │   └── metrics_service.py    # Interruption benchmark suite
│   ├── tests/
│   │   ├── test_interruption.py  # Fencing & stale rejection tests
│   │   ├── test_rime.py          # Rime API synthesis tests
│   │   └── test_conversation_state.py
│   ├── run_benchmark.py          # CLI benchmark runner for judges
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation & mode badge
│   │   │   ├── Footer.jsx        # Team Ideologists & ethics
│   │   │   ├── HeroBridgeCanvas.jsx # Canvas visual communication bridge
│   │   │   ├── SignCamera.jsx    # Webcam feed, landmark mesh & HUD
│   │   │   ├── AudioWaveform.jsx # Waveform & stop latency indicator
│   │   │   ├── Timeline.jsx      # Full-duplex conversation dialogue
│   │   │   ├── SignAvatar.jsx    # Speech-to-sign avatar visualizer
│   │   │   ├── ObservabilityDrawer.jsx # Telemetry event drawer
│   │   │   ├── JudgeDemoModal.jsx# 11-step hackathon demo walkthrough
│   │   │   └── StatusBadge.jsx   # FSM state indicator
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # United Carriers-inspired editorial landing
│   │   │   ├── Conversation.jsx  # Core 3-column communication studio
│   │   │   ├── Evaluation.jsx    # Live empirical benchmark dashboard
│   │   │   ├── Technology.jsx    # Interactive FSM & architecture explorer
│   │   │   └── About.jsx         # Team Ideologists & disclosures
│   │   ├── hooks/
│   │   │   ├── useConversation.js
│   │   │   └── useAudioPlayer.js
│   │   ├── services/
│   │   │   ├── api.js            # REST API client
│   │   │   ├── audioController.js# Audio player with instant abort
│   │   │   ├── speechService.js  # Full-duplex speech recognition
│   │   │   └── signDetector.js   # Landmark classification
│   │   └── data/
│   │       ├── signs.js          # Vocabulary definitions
│   │       └── demoScript.js     # Scripted judge demo sequence
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── RIME_EVIDENCE.md              # Empirical verification document
├── .env.example
└── README.md
```

---

## Environment Setup & Configuration

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env with your RIME_API_KEY:
# RIME_API_KEY=your_rime_api_key_here
# RIME_MODEL=coda
# RIME_VOICE=astra

# Run migrations
python manage.py migrate

# Start backend server
python manage.py runserver 8000
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health, Rime provider status, and configuration |
| `GET` | `/api/conversation/state` | Current FSM state, active turn, turn count |
| `POST` | `/api/conversation/start` | Starts/resets conversation session |
| `POST` | `/api/conversation/input` | Ingests sign or speech turn and synthesizes speech |
| `POST` | `/api/conversation/interrupt` | Immediately halts active audio and fences response |
| `POST` | `/api/conversation/complete` | Signals audio playback completion |
| `GET` | `/api/conversation/telemetry`| Returns live millisecond event log stream |
| `POST` | `/api/rime/synthesize` | Direct Rime synthesis endpoint |
| `GET` | `/api/rime/health` | Direct Rime connectivity and voice catalog check |
| `GET` | `/api/sign/vocabulary` | Returns 18-sign catalog with metadata and phrases |
| `POST` | `/api/sign/predict` | Evaluates gesture token and confidence score |
| `POST` | `/api/evaluation/run` | Runs live $N$-iteration interruption benchmark |
| `GET` | `/api/evaluation/results` | Returns latest benchmark telemetry results |

---

## Demo Mode vs. Live AI Mode

- **LIVE AI MODE:** Uses live Rime API synthesis, active backend state machine, and real-time computer vision.
- **DEMO MODE:** A deterministic offline fallback using scripted fixtures so the entire product and state transitions can be demonstrated with 100% reliability regardless of network conditions.

### Judge Demonstration Sequence (11 Steps)
Click **"Judge Demo Script"** in the top navigation bar of `/conversation` to run the sequential verification flow:
1. Initialize session -> `LISTENING`
2. Deaf user signs `HELLO`
3. MediaPipe classifies `HELLO` (96% confidence)
4. Rime Coda synthesizes *"Hello, it is great to see you."*
5. Rime begins playback; mic stays hot
6. Hearing partner interrupts: *"Wait — where are you going?"*
7. Audio stops immediately ($< 50\,\text{ms}$)
8. Active `responseId` marked stale and fenced
9. New turn commits to state machine
10. Sign avatar animates ASL tokens `[WHERE, YOU, GO]`
11. Telemetry logged; 0 stale audio leaks verified

---

## Automated Evaluation & Tests

Run the repeatable test suite:

```bash
cd backend

# Run unit tests (interruption fencing, state transitions, Rime client)
python manage.py test tests

# Run empirical 20-run interruption benchmark
python run_benchmark.py --runs 20
```

---

## Known Limitations

- **Defined Vocabulary:** The prototype currently supports an 18-token conversational lexicon (`HELLO`, `THANK YOU`, `YES`, `NO`, `HELP`, `STOP`, `WHERE`, `YOU`, `ME`, `GOOD`, `BAD`, `NAME`, `GO`, `COME`, `WATER`, `FOOD`, `PLEASE`, `SORRY`, `HOW ARE YOU`).
- **Echo Cancellation:** Testing without headphones requires active browser acoustic echo cancellation so Rime speaker audio does not trigger false speech interrupts.

---

## Team Ideologists

- **ROSEMARIYA ROY**
- **RIDDHI SINGH**
- **ADHITH RAGHUNATH NAIR**

Built for the **DataForge x Pathway x Rime Hackathon Challenge** (September 2026).