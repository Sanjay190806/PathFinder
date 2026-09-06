"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera, CheckCircle2, AlertTriangle, ShieldCheck,
  RefreshCw, ArrowRight, UserCheck, Sparkles, Scan, Lock
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  CandidateFaceProfile,
  extractCandidateProfileFromVideo,
  loadCandidateProfile,
  processProctorFrame,
} from "@/lib/faceVision";

interface CandidateFaceRegistrationModalProps {
  isOpen: boolean;
  stream: MediaStream | null;
  candidateName?: string;
  onRegistered: (profile: CandidateFaceProfile) => void;
  onClose?: () => void;
}

export function CandidateFaceRegistrationModal({
  isOpen,
  stream,
  candidateName = "Candidate",
  onRegistered,
}: CandidateFaceRegistrationModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [internalStream, setInternalStream] = useState<MediaStream | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Calibration state
  const [alignmentStatus, setAlignmentStatus] = useState<"NO_FACE" | "OFF_CENTER" | "ALIGNED">("NO_FACE");
  const [isCapturing, setIsCapturing] = useState(false);
  const [registeredProfile, setRegisteredProfile] = useState<CandidateFaceProfile | null>(() => {
    return loadCandidateProfile();
  });

  const activeStream = stream || internalStream;

  // Initialize webcam if not passed in
  useEffect(() => {
    if (!isOpen || activeStream) return;
    let mounted = true;

    async function initCam() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Webcam API not supported in browser.");
        }
        const ms = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        });
        if (mounted) {
          setInternalStream(ms);
          setStreamError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setStreamError("Camera access required for proctored check-in.");
        }
      }
    }

    initCam();
    return () => {
      mounted = false;
    };
  }, [isOpen, activeStream]);

  // Clean up internal stream on unmount
  useEffect(() => {
    return () => {
      if (internalStream) {
        internalStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [internalStream]);

  // Attach stream to video element
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && activeStream) {
      node.srcObject = activeStream;
      node.muted = true;
      node.play().catch(() => {});
    }
  }, [activeStream]);

  useEffect(() => {
    if (videoRef.current && activeStream) {
      videoRef.current.srcObject = activeStream;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [activeStream]);

  // Real-time alignment checker
  useEffect(() => {
    if (!isOpen || !activeStream || registeredProfile) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !isMounted) return;

      const canvas = canvasRef.current || document.createElement("canvas");
      canvasRef.current = canvas;

      try {
        const res = await processProctorFrame(canvas, video, null);
        if (!isMounted) return;

        if (res.faces.length === 0) {
          setAlignmentStatus("NO_FACE");
        } else {
          const face = res.primaryFace || res.faces[0];
          const centerX = face.x + face.width / 2;
          const centerY = face.y + face.height / 2;

          // Check if squarely inside central alignment oval and facing forward
          const isCentered =
            Math.abs(centerX - 0.5) < 0.14 &&
            Math.abs(centerY - 0.46) < 0.16 &&
            face.width >= 0.20 &&
            face.width <= 0.75;

          const isFacingCamera =
            Math.abs(face.yaw) < 0.22 &&
            Math.abs(face.pitch) < 0.25;

          if (isCentered && isFacingCamera) {
            setAlignmentStatus("ALIGNED");
          } else {
            setAlignmentStatus("OFF_CENTER");
          }
        }
      } catch {
        if (isMounted) setAlignmentStatus("NO_FACE");
      }
    }, 280);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, activeStream, registeredProfile]);

  // Capture candidate snapshot and train/enroll baseline
  const handleCaptureRegistration = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    setIsCapturing(true);
    setCaptureError(null);

    try {
      const profile = await extractCandidateProfileFromVideo(video, candidateName);
      if (profile) {
        setRegisteredProfile(profile);
      } else {
        setCaptureError("Face detection failed. Please center your face directly in the alignment guide.");
      }
    } catch (err: any) {
      setCaptureError(err?.message || "Failed to process face snapshot.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleProceed = () => {
    if (registeredProfile) {
      onRegistered(registeredProfile);
    }
  };

  const handleRecalibrate = () => {
    setRegisteredProfile(null);
    setAlignmentStatus("NO_FACE");
    setCaptureError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Scan className="h-3.5 w-3.5" /> Biometric Identity Registration
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Face Registration & Proctor Calibration
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Before starting your 100-mark exam, align your face inside the guide below.
            The AI computer vision engine will register your baseline to prevent malpractice.
          </p>
        </div>

        {/* Camera Preview Area */}
        <div className="relative mx-auto w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-border/80 shadow-inner flex items-center justify-center">
          {activeStream ? (
            <>
              <video
                ref={setVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Registration Guide Overlay */}
              {!registeredProfile && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  {/* Alignment Oval */}
                  <div
                    className={`relative w-48 h-60 rounded-[50%] border-2 transition-colors duration-300 ${
                      alignmentStatus === "ALIGNED"
                        ? "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] animate-pulse"
                        : alignmentStatus === "OFF_CENTER"
                        ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                        : "border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    }`}
                  >
                    {/* Upper Eye Alignment Level */}
                    <div className="absolute top-[32%] left-2 right-2 flex justify-between px-2">
                      <div className="h-0.5 w-4 bg-white/60" />
                      <span className="text-[9px] uppercase font-bold text-white/70 -translate-y-2">Eye Level</span>
                      <div className="h-0.5 w-4 bg-white/60" />
                    </div>

                    {/* Lower Chin Alignment Level */}
                    <div className="absolute bottom-[18%] left-8 right-8 flex justify-center">
                      <div className="h-0.5 w-8 bg-white/50" />
                    </div>
                  </div>

                  {/* Dynamic Instruction Badge */}
                  <div className="absolute bottom-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-md">
                    {alignmentStatus === "ALIGNED" ? (
                      <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Perfect Alignment — Ready to Register
                      </span>
                    ) : alignmentStatus === "OFF_CENTER" ? (
                      <span className="bg-amber-500/25 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Center Face Inside Oval & Look Forward
                      </span>
                    ) : (
                      <span className="bg-red-500/25 text-red-300 border border-red-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Camera className="h-3.5 w-3.5 text-red-400" /> Face Camera Directly
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Registered Profile Snapshot Preview */}
              {registeredProfile && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-in zoom-in-95">
                  <div className="relative">
                    <img
                      src={registeredProfile.thumbnailDataUrl}
                      alt="Registered Candidate"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-400 shadow-xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      Face Baseline Enrolled
                    </h3>
                    <p className="text-xs text-emerald-300/90 font-medium">
                      Candidate: {registeredProfile.name} • Quality: {registeredProfile.qualityScore}%
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center space-y-2 text-muted-foreground">
              <Camera className="h-8 w-8 mx-auto opacity-40 text-red-400" />
              <p className="text-xs">{streamError || "Initializing camera stream..."}</p>
            </div>
          )}
        </div>

        {/* Capture Error Message */}
        {captureError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-700 dark:text-red-400 font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{captureError}</span>
          </div>
        )}

        {/* Explanatory Policy Box */}
        <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span>Anti-Malpractice Verification Guarantees:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
            <li>Your facial profile is calibrated locally in your browser memory for this session.</li>
            <li>Pointing the camera away, covering the lens, or having someone else sit in front of the screen will trigger violation strikes.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {registeredProfile ? (
            <>
              <Button
                variant="outline"
                size="md"
                onClick={handleRecalibrate}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                className="flex-1"
              >
                Recalibrate Face
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleProceed}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20"
              >
                Proceed to Exam
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleCaptureRegistration}
              disabled={alignmentStatus !== "ALIGNED" || isCapturing}
              className="w-full font-bold shadow-lg shadow-primary/25 disabled:opacity-50"
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              {isCapturing ? "Analyzing & Calibrating..." : "Register & Verify Face"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
