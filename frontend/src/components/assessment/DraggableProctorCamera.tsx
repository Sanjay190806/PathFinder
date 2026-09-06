"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  CameraOff, AlertTriangle, Eye, ShieldCheck, 
  GripHorizontal, Minimize2, Maximize2, ShieldAlert, Sparkles, UserCheck, RefreshCw
} from "lucide-react";
import { 
  CandidateFaceProfile, 
  DetectedFaceBox, 
  loadCandidateProfile, 
  processProctorFrame, 
  ProctorAttentionStatus 
} from "@/lib/faceVision";

export type { ProctorAttentionStatus };

interface DraggableProctorCameraProps {
  stream: MediaStream | null;
  cameraActive: boolean;
  cameraError?: string | null;
  strikesCount: number;
  maxStrikes?: number;
  candidateProfile?: CandidateFaceProfile | null;
  onStatusChange?: (status: ProctorAttentionStatus) => void;
  onMalpracticeAlert?: (reason: string) => void;
  onStreamReady?: (stream: MediaStream) => void;
  onRequestRecalibrate?: () => void;
}

export function DraggableProctorCamera({
  stream,
  cameraActive,
  cameraError,
  strikesCount,
  maxStrikes = 3,
  candidateProfile: propCandidateProfile,
  onStatusChange,
  onMalpracticeAlert,
  onStreamReady,
  onRequestRecalibrate,
}: DraggableProctorCameraProps) {
  // Widget size constants
  const WIDGET_WIDTH = 230;
  const VIDEO_HEIGHT = 150;

  // Position state (defaults safely to top right)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== "undefined") {
      return { x: Math.max(16, window.innerWidth - WIDGET_WIDTH - 24), y: 24 };
    }
    return { x: 300, y: 24 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [attentionStatus, setAttentionStatus] = useState<ProctorAttentionStatus>("ATTENTIVE");
  const [detectedFaces, setDetectedFaces] = useState<DetectedFaceBox[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<CandidateFaceProfile | null>(() => {
    return propCandidateProfile || loadCandidateProfile();
  });
  const [matchScore, setMatchScore] = useState<number | null>(null);

  // Sync prop changes for candidateProfile
  useEffect(() => {
    if (propCandidateProfile) {
      setCandidateProfile(propCandidateProfile);
    } else {
      const stored = loadCandidateProfile();
      if (stored) setCandidateProfile(stored);
    }
  }, [propCandidateProfile]);

  // Fallback internal webcam stream if stream prop is null
  const [internalStream, setInternalStream] = useState<MediaStream | null>(null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const activeStream = stream || internalStream;
  const isCamActive = cameraActive || !!activeStream;

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Debounce consecutive alert counters
  const missingTicksRef = useRef(0);
  const mismatchTicksRef = useRef(0);
  const multipleFacesTicksRef = useRef(0);
  const lookingAwayTicksRef = useRef(0);
  const lastAlertTimeRef = useRef(0);

  // Initialize position to top-right corner once window is available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initialX = Math.max(16, window.innerWidth - WIDGET_WIDTH - 24);
      setPosition((prev) => (prev.x === 300 ? { x: initialX, y: 24 } : prev));
    }
  }, []);

  // Fallback: If stream is null, automatically attempt to obtain webcam stream
  useEffect(() => {
    if (stream || internalStream) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      if (stream || internalStream || !isMounted) return;
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Webcam API not supported in this browser");
        }
        const ms = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
        });
        if (isMounted) {
          setInternalStream(ms);
          setInternalError(null);
          onStreamReady?.(ms);
        }
      } catch {
        try {
          if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Webcam API not supported");
          }
          const fallbackMs = await navigator.mediaDevices.getUserMedia({ video: true });
          if (isMounted) {
            setInternalStream(fallbackMs);
            setInternalError(null);
            onStreamReady?.(fallbackMs);
          }
        } catch (e: any) {
          if (isMounted) {
            setInternalError(
              e.name === "NotAllowedError"
                ? "Camera permission denied in browser."
                : "Camera unavailable or in use."
            );
          }
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [stream, internalStream, onStreamReady]);

  // Clean up internal stream on unmount
  useEffect(() => {
    return () => {
      if (internalStream) {
        internalStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [internalStream]);

  // Bind stream to video element
  const bindStreamToVideo = useCallback((video: HTMLVideoElement | null, mediaStream: MediaStream | null) => {
    if (!video || !mediaStream) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    if (video.srcObject !== mediaStream) {
      video.srcObject = mediaStream;
    }
    const tryPlay = () => {
      if (!video) return;
      video.muted = true;
      video.play().catch(() => {});
    };
    tryPlay();
    video.addEventListener("loadedmetadata", tryPlay, { once: true });
    video.addEventListener("canplay", tryPlay, { once: true });
  }, []);

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && activeStream) {
      bindStreamToVideo(node, activeStream);
    }
  }, [activeStream, bindStreamToVideo]);

  useEffect(() => {
    if (videoRef.current && activeStream) {
      bindStreamToVideo(videoRef.current, activeStream);
    }
  }, [activeStream, bindStreamToVideo]);

  // Drag handlers using window pointer events
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      let newX = dragStartRef.current.startX + deltaX;
      let newY = dragStartRef.current.startY + deltaY;

      const maxX = window.innerWidth - WIDGET_WIDTH - 12;
      const maxY = window.innerHeight - 80;

      newX = Math.max(12, Math.min(newX, maxX));
      newY = Math.max(12, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, position]);

  // Helper to throttle malpractice strike triggers
  const triggerMalpracticeAlert = useCallback((reason: string) => {
    const now = Date.now();
    if (now - lastAlertTimeRef.current < 4000) return; // 4s cooldown
    lastAlertTimeRef.current = now;
    onMalpracticeAlert?.(reason);
  }, [onMalpracticeAlert]);

  // ─── Real-Time Computer Vision & Proctoring Evaluation Loop ─────────────────
  useEffect(() => {
    if (!isCamActive || !activeStream) {
      if (cameraError || internalError) {
        setAttentionStatus("CAMERA_OFF");
        onStatusChange?.("CAMERA_OFF");
      }
      return;
    }

    const processFrame = async () => {
      const video = videoRef.current;
      if (!video) return;

      if (activeStream && video.srcObject !== activeStream) {
        video.srcObject = activeStream;
        video.play().catch(() => {});
      }

      if (video.readyState < 2) return;

      const canvas = canvasRef.current || document.createElement("canvas");
      canvasRef.current = canvas;

      try {
        const result = await processProctorFrame(canvas, video, candidateProfile);

        setAttentionStatus(result.status);
        onStatusChange?.(result.status);
        setDetectedFaces(result.faces);
        setMatchScore(result.similarityScore);

        // State-specific strike & warning triggers
        if (result.status === "FACE_NOT_DETECTED") {
          missingTicksRef.current++;
          mismatchTicksRef.current = 0;
          multipleFacesTicksRef.current = 0;
          lookingAwayTicksRef.current = 0;

          // 8 ticks (~3.2 seconds) of missing face -> Trigger Strike
          if (missingTicksRef.current === 8) {
            triggerMalpracticeAlert("Face not visible in camera frame. Adjust camera.");
          }
        } else if (result.status === "MULTIPLE_FACES") {
          multipleFacesTicksRef.current++;
          missingTicksRef.current = 0;
          mismatchTicksRef.current = 0;
          lookingAwayTicksRef.current = 0;

          if (multipleFacesTicksRef.current === 3) {
            triggerMalpracticeAlert("Multiple faces detected in assessment environment.");
          }
        } else if (result.status === "DIFFERENT_PERSON") {
          mismatchTicksRef.current++;
          missingTicksRef.current = 0;
          multipleFacesTicksRef.current = 0;
          lookingAwayTicksRef.current = 0;

          if (mismatchTicksRef.current === 5) {
            triggerMalpracticeAlert("Biometric mismatch: Unregistered candidate detected.");
          }
        } else if (result.status === "LOOKING_AWAY") {
          lookingAwayTicksRef.current++;
          missingTicksRef.current = 0;
          mismatchTicksRef.current = 0;
          multipleFacesTicksRef.current = 0;

          if (lookingAwayTicksRef.current === 12) {
            triggerMalpracticeAlert("Attention warning: Candidate repeatedly looking away from screen.");
          }
        } else {
          // Attentive & Compliant
          missingTicksRef.current = 0;
          mismatchTicksRef.current = 0;
          multipleFacesTicksRef.current = 0;
          lookingAwayTicksRef.current = 0;
        }
      } catch (err) {
        console.warn("Proctor vision frame processing error:", err);
      }
    };

    intervalRef.current = window.setInterval(processFrame, 400);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isCamActive, activeStream, cameraError, internalError, candidateProfile, onStatusChange, triggerMalpracticeAlert]);

  // ─── Render HUD Brackets Over Detected Faces ────────────────────────────────
  useEffect(() => {
    const canvas = hudCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If no face is detected or camera is off, STRICTLY DRAW NOTHING!
    // (Prevents any false positive green box on clothing or lap)
    if (
      attentionStatus === "FACE_NOT_DETECTED" ||
      attentionStatus === "CAMERA_OFF" ||
      detectedFaces.length === 0
    ) {
      return;
    }

    const strokeColor =
      attentionStatus === "ATTENTIVE"
        ? "#22c55e"
        : attentionStatus === "LOOKING_AWAY"
        ? "#eab308"
        : "#ef4444";

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = strokeColor;

    for (const face of detectedFaces) {
      // Mirror horizontally to match mirrored video display
      const boxW = face.width * WIDGET_WIDTH;
      const boxH = face.height * VIDEO_HEIGHT;
      const boxX = (1 - face.x - face.width) * WIDGET_WIDTH;
      const boxY = face.y * VIDEO_HEIGHT;
      const bracketLen = Math.max(10, Math.min(18, boxW * 0.2));

      // Top-left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + bracketLen);
      ctx.lineTo(boxX, boxY);
      ctx.lineTo(boxX + bracketLen, boxY);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW - bracketLen, boxY);
      ctx.lineTo(boxX + boxW, boxY);
      ctx.lineTo(boxX + boxW, boxY + bracketLen);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + boxH - bracketLen);
      ctx.lineTo(boxX, boxY + boxH);
      ctx.lineTo(boxX + bracketLen, boxY + boxH);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW - bracketLen, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH - bracketLen);
      ctx.stroke();

      // Verified tag
      if (attentionStatus === "ATTENTIVE" && candidateProfile) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText("✓ Verified", boxX + 4, boxY + boxH - 6);
      } else if (attentionStatus === "DIFFERENT_PERSON") {
        ctx.fillStyle = "rgba(239, 68, 68, 0.95)";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText("⚠️ Unverified", boxX + 4, boxY + boxH - 6);
      }
    }
  }, [detectedFaces, attentionStatus, candidateProfile]);

  // Status visual mapping
  const statusConfig = {
    ATTENTIVE: {
      color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-medium",
      dot: "bg-emerald-500 animate-pulse",
      label: candidateProfile ? "Attentive (Candidate Verified)" : "Attentive (Compliant)",
      icon: <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    },
    LOOKING_AWAY: {
      color: "bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300 font-medium",
      dot: "bg-amber-500 animate-pulse",
      label: "Looking Away / Off-Center",
      icon: <Eye className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />,
    },
    FACE_NOT_DETECTED: {
      color: "bg-red-500/15 border-red-500/30 text-red-800 dark:text-red-300 font-semibold",
      dot: "bg-red-500",
      label: "Face Not In Frame",
      icon: <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400 shrink-0" />,
    },
    DIFFERENT_PERSON: {
      color: "bg-red-500/20 border-red-500/50 text-red-900 dark:text-red-200 font-bold",
      dot: "bg-red-500 animate-ping",
      label: "Different Person Detected!",
      icon: <ShieldAlert className="h-3 w-3 text-red-600 dark:text-red-400 shrink-0" />,
    },
    MULTIPLE_FACES: {
      color: "bg-red-500/20 border-red-500/50 text-red-900 dark:text-red-200 font-bold",
      dot: "bg-red-500 animate-ping",
      label: "Multiple Faces Detected!",
      icon: <ShieldAlert className="h-3 w-3 text-red-600 dark:text-red-400 shrink-0" />,
    },
    CAMERA_OFF: {
      color: "bg-slate-500/15 border-slate-500/30 text-slate-800 dark:text-slate-300 font-medium",
      dot: "bg-slate-400",
      label: "Camera Inactive",
      icon: <CameraOff className="h-3 w-3 text-slate-600 dark:text-slate-400 shrink-0" />,
    },
  }[attentionStatus];

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Proctoring Camera Feed"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: `${WIDGET_WIDTH}px`,
      }}
      className={`proctor-camera-widget fixed top-0 left-0 z-50 select-none rounded-2xl border border-border/80 bg-surface/95 backdrop-blur-md shadow-2xl transition-shadow duration-200 ${
        isDragging ? "shadow-primary/30 ring-2 ring-primary/50 cursor-grabbing" : "shadow-black/50"
      }`}
    >
      {/* ── Drag Header ────────────────────────────────────────── */}
      <div
        onPointerDown={handlePointerDown}
        className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/60 rounded-t-2xl cursor-grab active:cursor-grabbing touch-none"
        title="Drag anywhere to reposition"
      >
        <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
          <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">AI Proctor</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Candidate Recalibrate Button */}
          {onRequestRecalibrate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequestRecalibrate();
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Recalibrate Face Profile"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}

          {/* Strikes Counter */}
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
              strikesCount > 0
                ? "bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-300 animate-pulse font-bold"
                : "bg-muted border-border text-foreground font-semibold"
            }`}
            title={`Malpractice strikes: ${strikesCount} of ${maxStrikes}`}
          >
            Strikes: {strikesCount}/{maxStrikes}
          </span>

          {/* Minimize / Maximize Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={isMinimized ? "Expand Camera" : "Minimize Camera"}
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* ── Camera Preview & HUD ────────────────────────────────── */}
      {!isMinimized && (
        <div
          className="relative bg-black w-full overflow-hidden flex items-center justify-center"
          style={{ height: `${VIDEO_HEIGHT}px` }}
        >
          {isCamActive ? (
            <>
              <video
                ref={setVideoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  v.muted = true;
                  v.play().catch(() => {});
                }}
                onCanPlay={(e) => {
                  const v = e.currentTarget;
                  v.muted = true;
                  v.play().catch(() => {});
                }}
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Face Tracking HUD Canvas */}
              <canvas
                ref={hudCanvasRef}
                width={WIDGET_WIDTH}
                height={VIDEO_HEIGHT}
                className="absolute inset-0 pointer-events-none"
              />

              {/* Registered Candidate Thumbnail Badge */}
              {candidateProfile?.thumbnailDataUrl && (
                <div
                  className="absolute top-1.5 left-2 flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-medium text-white/90 pointer-events-none"
                  title="Registered Exam Candidate"
                >
                  <img
                    src={candidateProfile.thumbnailDataUrl}
                    alt="Baseline"
                    className="w-4 h-4 rounded-full object-cover border border-emerald-400"
                  />
                  <span className="truncate max-w-[70px]">{candidateProfile.name || "Enrolled"}</span>
                  <UserCheck className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                </div>
              )}

              {/* Biometric match percentage badge */}
              {matchScore !== null && candidateProfile && (
                <div className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-mono text-white/80 pointer-events-none">
                  {Math.round(matchScore * 100)}% match
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground space-y-1.5">
              <CameraOff className="h-6 w-6 opacity-40 text-red-400" />
              <span className="text-[10px] leading-tight">
                {cameraError || internalError || "Camera feed disconnected"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Proctoring Attention & Malpractice Status ───────────── */}
      <div className="p-2.5 space-y-1.5 bg-surface/80 rounded-b-2xl">
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-medium leading-none ${statusConfig.color}`}
        >
          {statusConfig.icon}
          <span className="truncate flex-1">{statusConfig.label}</span>
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusConfig.dot}`} />
        </div>

        {strikesCount >= 2 && (
          <p className="text-[10px] text-red-700 dark:text-red-400 font-bold px-1 leading-tight text-center">
            ⚠️ 1 strike remaining before auto-submit!
          </p>
        )}
      </div>
    </div>
  );
}
