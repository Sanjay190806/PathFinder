import React from "react";
import { ExternalLink, Clock, Award, Layers } from "lucide-react";
import { ResourceDetail } from "@/lib/types";
import { Card, Button } from "@/components/ui";
import { formatTimeHours } from "@/lib/utils";

interface ResourceHeroProps {
  resource: ResourceDetail;
}

export function ResourceHero({ resource }: ResourceHeroProps) {
  return (
    <Card variant="highlight" className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Provider: {resource.provider}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {resource.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {resource.description}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button size="lg" className="w-full sm:w-auto shadow-md" rightIcon={<ExternalLink className="h-4 w-4" />}>
                Open External Course
              </Button>
            </a>
          )}
          <span className="text-[11px] text-slate-400 text-center sm:text-right">
            Opens on {resource.provider} platform
          </span>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-surface-border">
        <div className="rounded-xl bg-surface-raised/40 p-3 text-center border border-surface-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
          <span className="text-sm font-bold text-white font-mono mt-0.5 block">
            {formatTimeHours(resource.estimated_hours)}
          </span>
        </div>
        <div className="rounded-xl bg-surface-raised/40 p-3 text-center border border-surface-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Quality Score</span>
          <span className="text-sm font-bold text-accent-cyan font-mono mt-0.5 block">
            {Math.round(resource.quality_score * 100)}%
          </span>
        </div>
        <div className="rounded-xl bg-surface-raised/40 p-3 text-center border border-surface-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Format</span>
          <span className="text-sm font-bold text-accent-purple capitalize mt-0.5 block">
            {resource.format}
          </span>
        </div>
        <div className="rounded-xl bg-surface-raised/40 p-3 text-center border border-surface-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Difficulty</span>
          <span className="text-sm font-bold text-slate-200 mt-0.5 block">
            {resource.difficulty}
          </span>
        </div>
      </div>
    </Card>
  );
}
