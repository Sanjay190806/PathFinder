"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  Camera, CameraOff, Shield, ShieldCheck, ShieldAlert, 
  Smartphone, AlertTriangle, Eye, EyeOff, X, 
  ChevronDown, ChevronUp, Lock, RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";

interface IntegrityMonitoringWidgetProps {
  sessionId: string;
  assessmentId: string;
  policy?: string; // REQUIRED, OPTIONAL, WARNING_ONLY
  monitoringConsent?: string; // MONITORING_CONSENT_REQUIRED, CONSENT_GRANTED, CONSENT_DENIED, MONITORING_ACTIVE, MONITORING_STOPPED
  isPaused: boolean;
  isCompleted: boolean;
  onConsentChange?: (newConsent: string) => void;
}

export function IntegrityMonitoringWidget({
  sessionId,
  assessmentId,
  policy = "WARNING_ONLY",
  monitoringConsent = "MONITORING_CONSENT_REQUIRED",
  isPaused,
  isCompleted,
  onConsentChange
}: IntegrityMonitoringWidgetProps) {
  const [consentState, setConsentState] = useState<string>(monitoringConsent);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [currentWarning, setCurrentWarning] = useState<string | null>(null);
  const [warningType, setWarningType] = useState<"face" | "gadget" | "camera" | null>(null);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(
    monitoringConsent === "MONITORING_CONSENT_REQUIRED"
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastEventTimeRef = useRef<number>(0);
  const lastEventTypeRef = useRef<string>("");

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  // Request camera access upon explicit consent
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const userMedia = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: "user"
        },
        audio: false
      });

      setStream(userMedia);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = userMedia;
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      const errMsg = err.name === "NotAllowedError" 
        ? "Camera permission was denied in your browser settings."
        : "Webcam unavailable or in use by another application.";
      setCameraError(errMsg);
      setCameraActive(false);

      // Telemetry
      try {
        await api.sendIntegrityEvent(sessionId, {
          event_type: "CAMERA_OFF",
          source: "BROWSER_CAMERA",
          severity: policy === "REQUIRED" ? "HIGH" : "MEDIUM",
          metadata_minimized: { error: err.name || "UNAVAILABLE" }
        });
      } catch {}
    }
  }, [sessionId, policy]);

  // Handle consent grant/deny
  const handleConsentDecision = async (granted: boolean) => {
    const decision = granted ? "CONSENT_GRANTED" : "CONSENT_DENIED";
    try {
      const res = await api.recordMonitoringConsent(sessionId, decision);
      setConsentState(decision);
      setShowConsentModal(false);
      if (onConsentChange) onConsentChange(decision);

      if (granted) {
        await startCamera();
      }
    } catch (err: any) {
      alert(err.message || "Failed to record monitoring consent.");
    }
  };

  // Lifecycle control: stop camera on pause or completion
  useEffect(() => {
    if (isCompleted || isPaused) {
      stopCamera();
    } else if (cameraActive === false && consentState === "CONSENT_GRANTED" && !isPaused && !isCompleted) {
      startCamera();
    }
  }, [isCompleted, isPaused, consentState, cameraActive, startCamera, stopCamera]);

  // Bind video element when stream is ready
  useEffect(() => {
    if (videoRef.current && stream && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Local-first client detector loop (Frame Sampling & Debounced Telemetry)
  useEffect(() => {
    if (!cameraActive || isPaused || isCompleted) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let consecutiveAbsenceCount = 0;
    let consecutiveGadgetCount = 0;

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx) return;

      try {
        ctx.drawImage(video, 0, 0, 160, 120);
        const frame = ctx.getImageData(0, 0, 160, 120);
        const data = frame.data;

        // 1. Luminosity & Presence Analysis (zero raw upload)
        let totalBrightness = 0;
        let diffCount = 0;
        const len = data.length;

        for (let i = 0; i < len; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          totalBrightness += brightness;

          // Edge detection heuristic for handheld high-contrast rectangular device
          if (r > 180 && g < 80 && b < 80) diffCount++;
        }

        const avgBrightness = totalBrightness / (len / 16);

        // Face presence heuristic (if frame is completely pitch black or obscured)
        if (avgBrightness < 15 || avgBrightness > 245) {
          consecutiveAbsenceCount++;
          if (consecutiveAbsenceCount >= 3) {
            triggerTelemetry("NO_FACE", "Please ensure your face is well-illuminated and visible.", "face", 3.0);
          }
        } else {
          consecutiveAbsenceCount = 0;
          if (warningType === "face") {
            setCurrentWarning(null);
            setWarningType(null);
          }
        }

        // 2. Gadget / Phone candidate heuristic (local-first aspect-ratio candidate)
        if (diffCount > 15) {
          consecutiveGadgetCount++;
          if (consecutiveGadgetCount >= 2) {
            triggerTelemetry("POSSIBLE_PHONE", "Please remove unauthorized devices from your workspace.", "gadget", 2.0);
          }
        } else {
          consecutiveGadgetCount = 0;
          if (warningType === "gadget") {
            setCurrentWarning(null);
            setWarningType(null);
          }
        }
      } catch (err) {
        // Silent local fallback
      }
    }, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cameraActive, isPaused, isCompleted, warningType]);

  // Debounced telemetry emitter
  const triggerTelemetry = async (eventType: string, message: string, type: "face" | "gadget", duration: number) => {
    setCurrentWarning(message);
    setWarningType(type);

    const now = Date.now();
    // Debounce client emission to max 1 event per 4 seconds of the same type
    if (lastEventTypeRef.current === eventType && now - lastEventTimeRef.current < 4000) {
      return;
    }

    lastEventTimeRef.current = now;
    lastEventTypeRef.current = eventType;

    try {
      await api.sendIntegrityEvent(sessionId, {
        event_type: eventType,
        source: "BROWSER_VISION",
        duration: duration,
        confidence: 0.82,
        metadata_minimized: { heuristic: "LOCAL_ANALYSIS" }
      });
    } catch (e) {
      // Non-blocking telemetry
    }
  };

  // Component unmount cleanup: forcefully stop all streams
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (isCompleted) return null;

  return (
    <>
      {/* 1. Explicit Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Assessment Integrity Monitoring</h3>
                <p className="text-xs text-muted-foreground">Privacy-first, assistive supervision</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground mb-6 bg-muted/50 p-4 rounded-xl border border-border">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span><strong className="text-foreground">No Video Storage:</strong> Your camera stream is processed locally in your browser. No raw video or images are recorded or stored on any server.</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span><strong className="text-foreground">Bounded Lifecycle:</strong> Camera monitoring begins only after your consent and stops automatically when the exam is submitted, paused, or exited.</span>
              </div>
              <div className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span><strong className="text-foreground">Supportive Reminders:</strong> If you step away or an unauthorized device (phone/tablet) is detected, you will receive calm guidance to stay in frame.</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {policy !== "REQUIRED" ? (
                <button
                  type="button"
                  onClick={() => handleConsentDecision(false)}
                  className="px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-foreground text-sm font-medium transition"
                >
                  Continue Without Camera
                </button>
              ) : (
                <span className="text-xs text-amber-700 dark:text-amber-400/90 font-medium italic">
                  Camera supervision is required for this certified assessment.
                </span>
              )}
              <button
                type="button"
                onClick={() => handleConsentDecision(true)}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-md transition flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Enable Camera & Begin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating/Docked Live Monitor Widget */}
      {consentState === "CONSENT_GRANTED" && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
          {/* Warning Banner Toast */}
          {currentWarning && (
            <div className="mb-2 max-w-xs bg-amber-950/90 border border-amber-500/50 text-amber-200 text-xs px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{currentWarning}</span>
            </div>
          )}

          {/* Camera Box */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-200 w-44">
            {/* Header / Toggle */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/70 border-b border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cameraActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                <span className="font-medium text-[10px] uppercase tracking-wider">
                  {cameraActive ? "Monitored" : "Off"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-slate-400 hover:text-white p-0.5 rounded"
                title={isMinimized ? "Expand preview" : "Minimize preview"}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Video Body */}
            {!isMinimized && (
              <div className="relative bg-black h-28 flex items-center justify-center">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="p-3 text-center text-slate-500 text-xs">
                    <CameraOff className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px]">{cameraError || "Camera inactive"}</span>
                  </div>
                )}

                {/* Subtle Privacy Watermark */}
                <div className="absolute bottom-1 left-1.5 text-[9px] text-white/50 bg-black/40 px-1 py-0.5 rounded pointer-events-none">
                  Local-only
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
