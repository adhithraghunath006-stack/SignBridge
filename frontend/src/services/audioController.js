class AudioController {
  constructor() {
    this.audioElement = null;
    this.isPlaying = false;
    this.currentResponseId = null;
    this.currentRequestId = null;
    this.stopLatency = null;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    for (const listener of this.listeners) {
      listener({
        isPlaying: this.isPlaying,
        currentResponseId: this.currentResponseId,
        stopLatency: this.stopLatency,
      });
    }
  }

  async play(base64Audio, responseId, onEndedCallback) {
    // 1. If currently playing, stop the existing playback immediately
    if (this.isPlaying) {
      this.stop();
    }

    if (!base64Audio) {
      console.warn("[AudioController] No audio data to play");
      return;
    }

    this.currentResponseId = responseId;
    this.isPlaying = true;
    this._notify();

    try {
      const audioSrc = "data:audio/mp3;base64," + base64Audio;
      const audio = new Audio(audioSrc);
      this.audioElement = audio;

      audio.onended = () => {
        // Fencing check: only proceed if this responseId is still active
        if (this.currentResponseId === responseId) {
          this.isPlaying = false;
          this.currentResponseId = null;
          this._notify();
          if (onEndedCallback) onEndedCallback();
        }
      };

      audio.onerror = (e) => {
        console.error("[AudioController] Audio playback error:", e);
        this.isPlaying = false;
        this.currentResponseId = null;
        this._notify();
      };

      await audio.play();
    } catch (err) {
      console.warn("[AudioController] Playback failed or was aborted:", err.message);
      this.isPlaying = false;
      this.currentResponseId = null;
      this._notify();
    }
  }

  stop() {
    const startTime = performance.now();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement.src = "";
      this.audioElement = null;
    }
    this.isPlaying = false;
    this.currentResponseId = null;
    this.stopLatency = Math.round((performance.now() - startTime) * 100) / 100;
    this._notify();
    return this.stopLatency;
  }

  interrupt() {
    const stopMs = this.stop();
    console.log("[AudioController] Interruption executed in " + stopMs + " ms");
    return stopMs;
  }

  cancel() {
    return this.stop();
  }
}

export const audioController = new AudioController();