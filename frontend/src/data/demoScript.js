export const DEMO_STEPS = [
  {
    step: 1,
    title: 'Initialize Session',
    description: 'System sets full-duplex session state and warms Rime voice pipeline.',
    actionType: 'STATE_CHANGE',
    targetState: 'LISTENING',
    log: 'MIC → LISTENING | CAM → TRACKING 21 HAND LANDMARKS'
  },
  {
    step: 2,
    title: 'Deaf User Signs: HELLO',
    description: 'Camera captures hand gesture at temple with open 5-handshape.',
    actionType: 'SIGN_INPUT',
    token: 'HELLO',
    confidence: 0.96,
    log: 'SIGN_RECOGNIZED → HELLO (conf: 96%)'
  },
  {
    step: 3,
    title: 'Rime Voice Synthesis (Coda)',
    description: 'Backend generates natural speech: \'Hello, it is great to see you.\'',
    actionType: 'RIME_SPEAK',
    text: 'Hello, it is great to see you.',
    model: 'coda',
    speaker: 'astra',
    log: 'RIME → SYNTHESIZE (model: coda, speaker: astra, TTFA: 820ms)'
  },
  {
    step: 4,
    title: 'Rime Begins Speaking',
    description: 'Audio playback streams to the hearing partner. Microphone remains HOT (Full-Duplex).',
    actionType: 'PLAYING',
    log: 'RIME → SPEAKING (req_id: 7f8a9...)'
  },
  {
    step: 5,
    title: 'Hearing Partner Interruption!',
    description: 'Hearing person interrupts mid-sentence: \'Wait — where are you going?\'',
    actionType: 'INTERRUPT',
    speechText: 'Wait — where are you going?',
    log: 'INTERRUPT → SPEECH OVERLAP DETECTED'
  },
  {
    step: 6,
    title: 'Instant Audio Stop (< 50ms)',
    description: 'Audio buffer is flushed immediately; current playback ceases.',
    actionType: 'AUDIO_STOP',
    stopLatencyMs: 24.8,
    log: 'AUDIO → STOPPED (stop latency: 24.8ms)'
  },
  {
    step: 7,
    title: 'Stale Response Fenced',
    description: 'Active responseId is invalidated. Delayed Rime buffers cannot play.',
    actionType: 'STALE_FENCE',
    invalidatedId: '7f8a9...',
    log: 'CONVERSATION → STALE RESPONSE 7f8a9... FENCED'
  },
  {
    step: 8,
    title: 'New Turn Commits to Listening State',
    description: 'Newest speaker turn takes immediate conversational priority.',
    actionType: 'NEW_TURN',
    speaker: 'listener',
    text: 'Wait — where are you going?',
    log: 'CONVERSATION → NEW_TURN (Speaker: Hearing Partner)'
  },
  {
    step: 9,
    title: 'Text-to-Sign Tokenization',
    description: 'Grammar engine converts \'Wait — where are you going?\' into ASL token sequence.',
    actionType: 'TOKENIZE',
    tokens: ['STOP', 'WHERE', 'YOU', 'GO'],
    log: 'SIGN_TOKENIZER → [STOP, WHERE, YOU, GO]'
  },
  {
    step: 10,
    title: 'Animated Sign Avatar Renders',
    description: 'Deaf user sees visual sign representation rendered sequentially on screen.',
    actionType: 'AVATAR_ANIMATE',
    tokens: ['STOP', 'WHERE', 'YOU', 'GO'],
    log: 'SIGN_AVATAR → ANIMATING TOKEN SEQUENCE'
  },
  {
    step: 11,
    title: 'Telemetry & Evaluation Logged',
    description: 'Zero stale responses played. End-to-end full duplex recovery successful.',
    actionType: 'VERIFIED',
    log: 'BENCHMARK → VERIFIED (Stale responses: 0, Recovery: 100%)'
  }
];
