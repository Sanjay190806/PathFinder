'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock, ExternalLink, HelpCircle, Lock, Play, Sparkles, Star } from 'lucide-react';
import { LearningPathItem } from '@/lib/types';
import { formatTimeHours } from '@/lib/utils';

interface ResourceCardProps {
  item: LearningPathItem;
  onWhyClick: (item: LearningPathItem) => void;
  onToggleComplete?: (item: LearningPathItem) => void;
}

export function ResourceCard({ item, onWhyClick, onToggleComplete }: ResourceCardProps) {
  const diffColors: Record<string, string> = {
    Beginner: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/50',
    Intermediate: 'bg-indigo-950/70 text-indigo-400 border-indigo-800/50',
    Advanced: 'bg-purple-950/70 text-purple-400 border-purple-800/50'
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 ${
        item.is_completed
          ? 'bg-surface/50 border-surface-border opacity-90'
          : 'bg-surface border-surface-border hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-gray-400 bg-surface-raised px-2 py-0.5 rounded-md border border-surface-border">
              #{item.sequence_order}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${diffColors[item.difficulty] || diffColors.Beginner}`}>
              {item.difficulty}
            </span>
            <span className="text-[11px] font-medium text-gray-400 bg-surface-raised/70 px-2 py-0.5 rounded-md border border-surface-border">
              {item.resource_provider}
            </span>
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeHours(item.estimated_hours)}
            </span>
          </div>

          {/* Title */}
          <Link
            href={`/resources/${item.resource_id}`}
            className="text-sm sm:text-base font-bold text-white group-hover:text-primary-300 transition-colors line-clamp-1"
          >
            {item.resource_title}
          </Link>

          {/* Description */}
          <p className="mt-1 text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {item.resource_description}
          </p>

          {/* Skills Tagged */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {item.skills.map((s, idx) => (
              <span key={idx} className="rounded-md bg-surface-raised/90 px-2 py-0.5 text-[10px] font-medium text-gray-300 border border-surface-border/80">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-border">
          <button
            onClick={() => onWhyClick(item)}
            className="flex items-center gap-1 rounded-lg bg-surface-raised border border-surface-border px-2.5 py-1.5 text-[11px] font-semibold text-accent-cyan hover:bg-surface-border transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            Why This?
          </button>

          <Link
            href={`/resources/${item.resource_id}`}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              item.is_completed
                ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                : 'bg-primary-600 text-white hover:bg-primary-500 shadow-sm'
            }`}
          >
            {item.is_completed ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                Start
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
