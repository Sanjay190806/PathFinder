import React from "react";
import { Skeleton, Card } from "@/components/ui";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-surface-border">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      {/* Hero next step skeleton */}
      <Skeleton className="h-48 w-full rounded-3xl" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* 2-column content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-6 w-48" />
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
