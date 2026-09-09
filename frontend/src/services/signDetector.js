// frontend/src/services/signDetector.js

let handsInstance = null;
let initialized = false;

const createHandsDetector = async () => {
  try {
    const module = await import("@mediapipe/hands");

    const Hands =
      module.Hands ||
      module.default?.Hands ||
      module.default;

    if (!Hands) {
      console.warn("[SignDetector] MediaPipe Hands export not available.");
      return null;
    }

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (!results?.multiHandLandmarks?.length) return;

      const landmarks = results.multiHandLandmarks[0];

      if (landmarks?.length >= 21) {
        console.debug(
          "[SignDetector] Hand landmarks detected:",
          landmarks.length
        );
      }
    });

    handsInstance = hands;
    initialized = true;

    console.log("[SignDetector] MediaPipe Hands initialized.");

    return hands;
  } catch (error) {
    console.warn(
      "[SignDetector] MediaPipe unavailable:",
      error?.message || error
    );

    return null;
  }
};

export const signDetector = {
  async initialize() {
    if (initialized && handsInstance) {
      return handsInstance;
    }

    return await createHandsDetector();
  },

  async processFrame(videoElement) {
    if (!videoElement) return null;

    if (!handsInstance) {
      await this.initialize();
    }

    if (!handsInstance) {
      return null;
    }

    try {
      await handsInstance.send({
        image: videoElement,
      });

      return true;
    } catch (error) {
      console.warn(
        "[SignDetector] Frame processing failed:",
        error?.message || error
      );

      return null;
    }
  },

  // IMPORTANT:
  // SignCamera.jsx calls signDetector.stop()
  // so this method must exist.
  stop() {
    try {
      if (handsInstance) {
        handsInstance.close?.();
      }
    } catch (error) {
      console.warn(
        "[SignDetector] Cleanup warning:",
        error?.message || error
      );
    }

    handsInstance = null;
    initialized = false;

    console.log("[SignDetector] Stopped.");
  },

  reset() {
    this.stop();
  },

  getInstance() {
    return handsInstance;
  },

  isReady() {
    return initialized && !!handsInstance;
  },
};

export default signDetector;