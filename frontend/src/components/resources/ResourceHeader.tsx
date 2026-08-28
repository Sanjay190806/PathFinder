import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Route, Target } from "lucide-react";
import { ResourceDetail, Profile } from "@/lib/types";
import { Badge, Button } from "@/components/ui";

interface ResourceHeaderProps {
  resource: ResourceDetail;
  profile: Profile | null;
}

export function ResourceHeader({ resource, profile }: ResourceHeaderProps) {
  const isCompleted = resource.learner_status === "completed";
  const targetRole = profile?.primary_goal?.target_role;

  return (
    <div className="space-y-3 pb-4 border-b border-surface-border">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/roadmap" className="hover:text-white flex items-center gap-1 transition-colors">
          <Route className="h-3.5 w-3.5" />
          <span>Roadmap</span>
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-200 font-semibold truncate max-w-xs">{resource.title}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" size="sm">
            {resource.resource_type.toUpperCase()}
          </Badge>
          <Badge variant="neutral" size="sm">
            {resource.difficulty}
          </Badge>
          {targetRole ? (
            <Badge variant="cyan" size="sm">
              <Target className="h-3 w-3" /> {targetRole}
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              Career Workspace
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="success" size="sm">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </Badge>
          )}
        </div>

        <Link href="/roadmap">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>
            Back to Roadmap
          </Button>
        </Link>
      </div>
    </div>
  );
}
