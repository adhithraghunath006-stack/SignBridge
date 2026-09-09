export class SpeechRecognitionService {
  constructor(options = {}) {
    this.recognition = null;
    this.isListening = false;
    this.onInterim = options.onInterim || (() => {});
    this.onFinal = options.onFinal || (() => {});
    this.onError = options.onError || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onInterruptionDetected = options.onInterruptionDetected || (() => {});

    this.isFullDuplex = true;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.energyInterval = null;

    this.initRecognition();
  }

  initRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('[SpeechService] Web Speech API not supported in this browser environment. Fallback mode enabled.');
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      this.isListening = true;
      this.onStatusChange({ isListening: true, status: 'LISTENING' });
    };

    rec.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        this.onInterim(interim.trim());
        // If energy or interim speech is detected, trigger full-duplex interruption hook
        this.onInterruptionDetected(interim.trim());
      }

      if (final) {
        this.onFinal(final.trim());
      }
    };

    rec.onerror = (event) => {
      console.warn('[SpeechService] Recognition error:', event.error);
      this.onError(event.error);
    };

    rec.onend = () => {
      // Auto-restart if we are intended to be listening (persistent full-duplex session)
      if (this.isListening) {
        try {
          rec.start();
        } catch (e) {
          this.isListening = false;
          this.onStatusChange({ isListening: false, status: 'IDLE' });
        }
      } else {
        this.onStatusChange({ isListening: false, status: 'IDLE' });
      }
    };

    this.recognition = rec;
  }

  async startListening() {
    if (!this.recognition) {
      this.isListening = true;
      this.onStatusChange({ isListening: true, status: 'MOCK_LISTENING' });
      return;
    }

    try {
      this.isListening = true;
      this.recognition.start();
    } catch (err) {
      console.warn('[SpeechService] Start error (may already be running):', err.message);
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.onStatusChange({ isListening: false, status: 'IDLE' });
  }
}
