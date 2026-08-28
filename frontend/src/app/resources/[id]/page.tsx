'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AIAssistantDrawer } from "@/components/AIAssistantDrawer";
import { api, getAuthToken } from "@/lib/api";
import { ResourceDetail, Profile } from "@/lib/types";
import { Alert } from "@/components/ui";

import { ResourceHeader } from "@/components/resources/ResourceHeader";
import { ResourceHero } from "@/components/resources/ResourceHero";
import { LearningObjectives } from "@/components/resources/LearningObjectives";
import { ResourceSkills } from "@/components/resources/ResourceSkills";
import { ResourcePrerequisites } from "@/components/resources/ResourcePrerequisites";
import { ResourceRecommendation } from "@/components/resources/ResourceRecommendation";
import { ResourceCompletionCard } from "@/components/resources/ResourceCompletionCard";
import { ResourceFeedbackCard } from "@/components/resources/ResourceFeedbackCard";
import { ResourceSkeleton } from "@/components/resources/ResourceSkeleton";
import { ResourceErrorState } from "@/components/resources/ResourceErrorState";

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.id as string;

  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const loadResource = useCallback(async () => {
    if (!resourceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        const demoRes = await api.demoLogin();
        localStorage.setItem("pathfinder_token", demoRes.access_token);
      }

      const [resData, profData] = await Promise.all([
        api.getResource(resourceId),
        api.getProfile().catch(() => null)
      ]);
      setResource(resData);
      setProfile(profData);
    } catch (err: any) {
      console.error("Error loading learning resource", err);
      setError(err.message || "Learning resource could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    loadResource();
  }, [loadResource]);

  const handleToggleComplete = async () => {
    if (!resource || isCompleting) return;
    setIsCompleting(true);
    const newStatus = resource.learner_status === "completed" ? "in_progress" : "completed";

    try {
      await api.updateProgress({
        resource_id: resource.id,
        status: newStatus,
        time_spent_minutes: Math.round(resource.estimated_hours * 60)
      });
      await loadResource();
    } catch (err: any) {
      console.error("Failed to record progress", err);
      setError("Failed to record completion with the server. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleFeedback = async (type: string, rating: number) => {
    if (!resource) return;
    try {
      await api.submitFeedback({
        resource_id: resource.id,
        feedback_type: type,
        rating,
        idempotency_key: `fb-${resource.id}-${Date.now()}`
      });
      setFeedbackAlert(`Feedback recorded: "${type.replace("_", " ")}". The adaptive engine has recalibrated your path.`);
      setTimeout(() => setFeedbackAlert(null), 5000);
      await loadResource();
    } catch (err: any) {
      console.error("Failed to submit feedback", err);
    }
  };

  const isCompleted = resource?.learner_status === "completed";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Global Navigation */}
      <Navbar
        user={profile}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto w-full space-y-8">
        {isLoading ? (
          <ResourceSkeleton />
        ) : error || !resource ? (
          <ResourceErrorState error={error || "Resource not found"} onRetry={loadResource} />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header & Breadcrumb */}
            <ResourceHeader resource={resource} profile={profile} />

            {/* Feedback Alert Banner if adaptive trigger fired */}
            {feedbackAlert && (
              <Alert variant="success" message={feedbackAlert} onClose={() => setFeedbackAlert(null)} />
            )}

            {/* Hero Card with External Link */}
            <ResourceHero resource={resource} />

            {/* 2-Column Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Objectives, Skills, and Prerequisites */}
              <div className="space-y-6">
                <LearningObjectives skills={resource.skills} />
                <ResourceSkills skills={resource.skills} />
                <ResourcePrerequisites prerequisites={resource.prerequisites} />
              </div>

              {/* Right Column: Recommendation Explanation, Completion Action, and Feedback */}
              <div className="space-y-6">
                <ResourceRecommendation
                  qualityScore={resource.quality_score}
                  difficulty={resource.difficulty}
                  skills={resource.skills}
                />

                <ResourceCompletionCard
                  isCompleted={isCompleted}
                  isCompleting={isCompleting}
                  onToggleComplete={handleToggleComplete}
                />

                <ResourceFeedbackCard onFeedback={handleFeedback} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onPlanAdjusted={loadResource}
      />
    </div>
  );
}
