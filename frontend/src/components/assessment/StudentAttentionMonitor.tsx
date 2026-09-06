/**
 * StudentAttentionMonitor
 * -----------------------
 * Headless monitoring hook — processes webcam frames and emits
 * IntegrityObservation events. The actual UI banner is rendered by
 * the parent assessment page. This component is invisible in the DOM.
 *
 * Privacy Guarantees:
 * - No video data is uploaded or persisted.
 * - All processing occurs locally in the browser via MediaPipe FaceLandmarker.
 * - Camera stream stops immediately on unmount or when active=false.
 */

"use client";

import { useEffect, useRef } from "react";
import { processProctorFrame, loadCandidateProfile } from "@/lib/faceVision";

export enum AttentionState {
  ATTENTIVE = "ATTENTIVE",
  FACE_NOT_DETECTED = "FACE_NOT_DETECTED",
  MULTIPLE_FACES = "MULTIPLE_FACES",
  LOOKING_AWAY = "LOOKING_AWAY",
  DIFFERENT_PERSON = "DIFFERENT_PERSON",
  CAMERA_UNAVAILABLE = "CAMERA_UNAVAILABLE",
  MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE",
}

export interface IntegrityObservation {
  type: AttentionState;
  timestamp: number;
  confidence?: number;
  duration?: number;
}

interface StudentAttentionMonitorProps {
  /** Whether monitoring is active (camera will only start when true). */
  active?: boolean;
  /** Called when an observation is emitted. */
  onObservation?: (obs: IntegrityObservation) => void;
  /** Optional config to adjust thresholds */
  config?: {
    FACE_MISSING_WARNING_MS?: number;
    LOOKING_AWAY_WARNING_MS?: number;
    MULTIPLE_FACE_WARNING_MS?: number;
    INFERENCE_FPS?: number;
  };
}

export function StudentAttentionMonitor({
  active = false,
  onObservation,
  config = {},
}: StudentAttentionMonitorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const emit = (type: AttentionState) => {
    onObservation?.({ type, timestamp: Date.now() });
  };

  const stopAll = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!active) {
      stopAll();
      return;
    }

    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        // Create hidden video element for processing
        const video = document.createElement("video");
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        videoRef.current = video;
        await video.play().catch(() => {});

        const procCanvas = document.createElement("canvas");
        canvasRef.current = procCanvas;

        const FPS = config.INFERENCE_FPS ?? 4;
        let lastTs = 0;
        const candidateProfile = loadCandidateProfile();

        const loop = async (now: number) => {
          if (cancelled || !streamRef.current) return;
          if (now - lastTs >= 1000 / FPS) {
            lastTs = now;
            try {
              const res = await processProctorFrame(procCanvas, video, candidateProfile);
              if (cancelled) return;

              if (res.status === "ATTENTIVE") {
                emit(AttentionState.ATTENTIVE);
              } else if (res.status === "LOOKING_AWAY") {
                emit(AttentionState.LOOKING_AWAY);
              } else if (res.status === "MULTIPLE_FACES") {
                emit(AttentionState.MULTIPLE_FACES);
              } else if (res.status === "DIFFERENT_PERSON") {
                emit(AttentionState.DIFFERENT_PERSON);
              } else if (res.status === "FACE_NOT_DETECTED") {
                emit(AttentionState.FACE_NOT_DETECTED);
              }
            } catch (_) {
              /* ignore frame processing errors */
            }
          }
          requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
      } catch (camErr) {
        console.warn("StudentAttentionMonitor camera unavailable:", camErr);
        emit(AttentionState.CAMERA_UNAVAILABLE);
      }
    };

    start();
    return () => {
      cancelled = true;
      stopAll();
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Headless component renders nothing
  return null;
}
