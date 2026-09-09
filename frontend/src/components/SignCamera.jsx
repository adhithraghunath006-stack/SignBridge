import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  GestureRecognizer,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

// MediaPipe built-in gestures -> SignBridge vocabulary
const GESTURE_MAP = {
  Open_Palm: {
    label: "HELLO",
    meaning: "Hello",
  },

  Thumb_Up: {
    label: "YES",
    meaning: "Yes",
  },

  Thumb_Down: {
    label: "NO",
    meaning: "No",
  },

  Closed_Fist: {
    label: "HELP",
    meaning: "Help",
  },

  Victory: {
    label: "THANK YOU",
    meaning: "Thank you",
  },

  ILoveYou: {
    label: "I LOVE YOU",
    meaning: "I love you",
  },

  Pointing_Up: {
    label: "POINT",
    meaning: "Point",
  },
};

function SignCamera({
  onSignDetected,
  onGestureDetected,
}) {
  // ---------------------------------------------------------
  // REFS
  // ---------------------------------------------------------

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const streamRef = useRef(null);
  const recognizerRef = useRef(null);
  const animationRef = useRef(null);

  const lastVideoTimeRef = useRef(-1);

  const stableGestureRef = useRef("");
  const stableCountRef = useRef(0);

  const lastEmittedGestureRef = useRef("");
  const lastEmitTimeRef = useRef(0);

  const fpsFramesRef = useRef(0);
  const fpsStartTimeRef = useRef(performance.now());

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  const [cameraActive, setCameraActive] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);

  const [currentDetection, setCurrentDetection] = useState("IDLE");
  const [confidence, setConfidence] = useState(0);

  const [fps, setFps] = useState(0);

  const [showLandmarks, setShowLandmarks] = useState(true);

  const [permissionError, setPermissionError] = useState("");

  // ---------------------------------------------------------
  // LOAD MEDIAPIPE
  // ---------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadRecognizer = async () => {
      try {
        console.log("[SignCamera] Loading MediaPipe...");

        setLoadingModel(true);

        const vision = await FilesetResolver.forVisionTasks(
          WASM_URL
        );

        if (cancelled) return;

        const recognizer =
          await GestureRecognizer.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath: MODEL_URL,
                delegate: "GPU",
              },

              runningMode: "VIDEO",

              numHands: 1,

              minHandDetectionConfidence: 0.45,
              minHandPresenceConfidence: 0.45,
              minTrackingConfidence: 0.45,

              cannedGesturesClassifierOptions: {
                scoreThreshold: 0.30,
                maxResults: 1,
              },
            }
          );

        if (cancelled) {
          recognizer.close();
          return;
        }

        recognizerRef.current = recognizer;

        setModelReady(true);
        setLoadingModel(false);

        console.log(
          "[SignCamera] MediaPipe Gesture Recognizer READY"
        );
      } catch (error) {
        console.error(
          "[SignCamera] MediaPipe initialization failed:",
          error
        );

        setLoadingModel(false);
        setModelReady(false);
      }
    };

    loadRecognizer();

    return () => {
      cancelled = true;

      if (recognizerRef.current) {
        try {
          recognizerRef.current.close();
        } catch (error) {
          console.warn(
            "[SignCamera] Recognizer cleanup failed",
            error
          );
        }

        recognizerRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------
  // START CAMERA
  // ---------------------------------------------------------

  const startCamera = async () => {
    try {
      setPermissionError("");

      console.log("[SignCamera] Requesting camera...");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera API is not available in this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },

            facingMode: "user",
          },

          audio: false,
        });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        throw new Error(
          "Video element is unavailable."
        );
      }

      video.srcObject = stream;

      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      await video.play();

      setCameraActive(true);

      console.log(
        "[SignCamera] Camera started successfully"
      );

      startRecognition();
    } catch (error) {
      console.error(
        "[SignCamera] Camera error:",
        error
      );

      setPermissionError(
        error?.message ||
          "Unable to access camera. Please allow camera permission."
      );

      setCameraActive(false);
    }
  };

  // ---------------------------------------------------------
  // STOP CAMERA
  // ---------------------------------------------------------

  const stopCamera = () => {
    console.log("[SignCamera] Stopping camera...");

    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          try {
            track.stop();
          } catch (error) {}
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    clearCanvas();

    setCameraActive(false);
    setCurrentDetection("IDLE");
    setConfidence(0);
    setFps(0);

    lastVideoTimeRef.current = -1;

    stableGestureRef.current = "";
    stableCountRef.current = 0;

    lastEmittedGestureRef.current = "";
    lastEmitTimeRef.current = 0;
  };

  // ---------------------------------------------------------
  // CLEAR CANVAS
  // ---------------------------------------------------------

  const clearCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  };

  // ---------------------------------------------------------
  // DRAW HAND LANDMARKS
  // ---------------------------------------------------------

  const drawLandmarks = (result) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) return;

    if (
      canvas.width !== width ||
      canvas.height !== height
    ) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (!showLandmarks) return;

    if (
      !result?.landmarks ||
      result.landmarks.length === 0
    ) {
      return;
    }

    const drawingUtils = new DrawingUtils(ctx);

    for (const landmarks of result.landmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        GestureRecognizer.HAND_CONNECTIONS,
        {
          color: "#00ffcc",
          lineWidth: 3,
        }
      );

      drawingUtils.drawLandmarks(
        landmarks,
        {
          color: "#ffffff",
          fillColor: "#00ffcc",
          radius: 4,
        }
      );
    }
  };

  // ---------------------------------------------------------
  // PROCESS GESTURE
  // ---------------------------------------------------------

  const processGesture = (result) => {
    if (!result) return;

    if (
      !result.gestures ||
      result.gestures.length === 0
    ) {
      setCurrentDetection("IDLE");
      setConfidence(0);

      stableGestureRef.current = "";
      stableCountRef.current = 0;

      return;
    }

    const bestGesture =
      result.gestures[0]?.[0];

    if (!bestGesture) {
      setCurrentDetection("IDLE");
      setConfidence(0);
      return;
    }

    const rawGesture =
      bestGesture.categoryName;

    const score =
      bestGesture.score || 0;

    const mapped =
      GESTURE_MAP[rawGesture];

    // Unknown MediaPipe gesture
    if (!mapped) {
      setCurrentDetection(
        rawGesture || "DETECTED"
      );

      setConfidence(
        Math.round(score * 100)
      );

      return;
    }

    const label = mapped.label;

    setCurrentDetection(label);

    setConfidence(
      Math.round(score * 100)
    );

    // -------------------------------------------------------
    // STABILITY FILTER
    // -------------------------------------------------------

    if (
      stableGestureRef.current === label
    ) {
      stableCountRef.current += 1;
    } else {
      stableGestureRef.current = label;
      stableCountRef.current = 1;
    }

    // Wait for 5 consecutive frames
    if (stableCountRef.current < 5) {
      return;
    }

    const now = performance.now();

    // Prevent duplicate events
    if (
      lastEmittedGestureRef.current === label &&
      now - lastEmitTimeRef.current < 1200
    ) {
      return;
    }

    lastEmittedGestureRef.current = label;
    lastEmitTimeRef.current = now;

    const payload = {
      token: label,
      label: label,
      confidence: score,
      rawGesture: rawGesture,
      meaning: mapped.meaning,
      timestamp: Date.now(),
    };

    console.log(
      `[SignCamera] DETECTED ${label} - ${Math.round(
        score * 100
      )}%`
    );

    // Parent callback
    if (
      typeof onSignDetected === "function"
    ) {
      onSignDetected(payload);
    }

    if (
      typeof onGestureDetected ===
      "function"
    ) {
      onGestureDetected(payload);
    }
  };

  // ---------------------------------------------------------
  // RECOGNITION LOOP
  // ---------------------------------------------------------

  const startRecognition = () => {
    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    const loop = () => {
      const video = videoRef.current;
      const recognizer =
        recognizerRef.current;

      if (
        !video ||
        !recognizer ||
        video.readyState < 2 ||
        video.videoWidth === 0
      ) {
        animationRef.current =
          requestAnimationFrame(loop);

        return;
      }

      try {
        // Only process new video frames
        if (
          video.currentTime !==
          lastVideoTimeRef.current
        ) {
          const timestamp =
            performance.now();

          const result =
            recognizer.recognizeForVideo(
              video,
              timestamp
            );

          lastVideoTimeRef.current =
            video.currentTime;

          drawLandmarks(result);

          processGesture(result);

          // FPS
          fpsFramesRef.current += 1;

          const now = performance.now();

          if (
            now - fpsStartTimeRef.current >=
            1000
          ) {
            setFps(
              fpsFramesRef.current
            );

            fpsFramesRef.current = 0;

            fpsStartTimeRef.current =
              now;
          }
        }
      } catch (error) {
        console.error(
          "[SignCamera] Recognition error:",
          error
        );
      }

      animationRef.current =
        requestAnimationFrame(loop);
    };

    animationRef.current =
      requestAnimationFrame(loop);
  };

  // ---------------------------------------------------------
  // COMPONENT CLEANUP
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            try {
              track.stop();
            } catch (error) {}
          });
      }
    };
  }, []);

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div
      className="sign-camera"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* CAMERA VIEW */}

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          borderRadius: "18px",
          background: "#080b0f",
          border:
            "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* VIDEO */}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
            display: "block",
            background: "#080b0f",
          }}
        />

        {/* LANDMARK CANVAS */}

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
            pointerEvents: "none",
          }}
        />

        {/* TOP STATUS */}

        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            right: "14px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              padding: "7px 11px",
              borderRadius: "999px",
              background:
                "rgba(0,0,0,0.65)",
              backdropFilter:
                "blur(10px)",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing:
                "0.08em",
            }}
          >
            {cameraActive
              ? "● LIVE"
              : "CAMERA STANDBY"}
          </div>

          <div
            style={{
              padding: "7px 11px",
              borderRadius: "999px",
              background:
                "rgba(0,0,0,0.65)",
              backdropFilter:
                "blur(10px)",
              color: "#fff",
              fontSize: "11px",
            }}
          >
            {fps > 0
              ? `${fps} FPS`
              : "-- FPS"}
          </div>
        </div>

        {/* STANDBY */}

        {!cameraActive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              flexDirection:
                "column",
              gap: "10px",
              color: "#fff",
              background:
                "radial-gradient(circle at center, rgba(20,30,40,0.7), rgba(5,7,10,0.95))",
            }}
          >
            <div
              style={{
                fontSize: "42px",
              }}
            >
              ✋
            </div>

            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              Camera Feed Standby
            </div>

            <div
              style={{
                fontSize: "12px",
                opacity: 0.6,
              }}
            >
              Start camera to detect
              gestures
            </div>
          </div>
        )}

        {/* DETECTION */}

        {cameraActive && (
          <div
            style={{
              position: "absolute",
              bottom: "14px",
              left: "14px",
              right: "14px",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "flex-end",
              pointerEvents: "none",
            }}
          >
            {/* DETECTED */}

            <div
              style={{
                padding:
                  "12px 15px",
                borderRadius: "12px",
                background:
                  "rgba(0,0,0,0.72)",
                backdropFilter:
                  "blur(12px)",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  opacity: 0.6,
                  letterSpacing:
                    "0.12em",
                  color: "#fff",
                  marginBottom: "3px",
                }}
              >
                DETECTED
              </div>

              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color:
                    currentDetection !==
                    "IDLE"
                      ? "#00ffcc"
                      : "#ffffff",
                }}
              >
                {currentDetection}
              </div>
            </div>

            {/* CONFIDENCE */}

            <div
              style={{
                padding:
                  "12px 15px",
                borderRadius: "12px",
                background:
                  "rgba(0,0,0,0.72)",
                backdropFilter:
                  "blur(12px)",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  opacity: 0.6,
                  letterSpacing:
                    "0.12em",
                  color: "#fff",
                  marginBottom: "3px",
                }}
              >
                CONFIDENCE
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {confidence}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ERROR */}

      {permissionError && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            background:
              "rgba(255,70,70,0.1)",
            border:
              "1px solid rgba(255,70,70,0.3)",
            color: "#ff8585",
            fontSize: "12px",
          }}
        >
          {permissionError}
        </div>
      )}

      {/* CONTROLS */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {!cameraActive ? (
          <button
            onClick={startCamera}
            disabled={
              loadingModel ||
              !modelReady
            }
            style={{
              flex: 1,
              minWidth: "160px",
              padding:
                "13px 18px",
              border: "none",
              borderRadius: "10px",
              background:
                loadingModel ||
                !modelReady
                  ? "#30343a"
                  : "#00ffcc",
              color:
                loadingModel ||
                !modelReady
                  ? "#888"
                  : "#06100d",
              fontWeight: 800,
              cursor:
                loadingModel ||
                !modelReady
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loadingModel
              ? "Loading AI..."
              : modelReady
              ? "Start Camera"
              : "Preparing AI..."}
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{
              flex: 1,
              minWidth: "160px",
              padding:
                "13px 18px",
              border:
                "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              background:
                "rgba(255,255,255,0.06)",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Stop Camera
          </button>
        )}

        <button
          onClick={() =>
            setShowLandmarks(
              (value) => !value
            )
          }
          style={{
            padding:
              "13px 18px",
            border:
              "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px",
            background:
              "rgba(255,255,255,0.05)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {showLandmarks
            ? "Hide Landmarks"
            : "Show Landmarks"}
        </button>
      </div>

      {/* MODEL STATUS */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "11px",
          color:
            "rgba(255,255,255,0.55)",
        }}
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background:
              modelReady
                ? "#00ffcc"
                : "#777",
            display: "inline-block",
          }}
        />

        {modelReady
          ? "MediaPipe Gesture Recognizer ready"
          : loadingModel
          ? "Loading gesture model..."
          : "Gesture model offline"}
      </div>
    </div>
  );
}

// BOTH EXPORTS — prevents import mismatch
export { SignCamera };
export default SignCamera;