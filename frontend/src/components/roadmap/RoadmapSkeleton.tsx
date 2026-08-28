import React from "react";
import { Skeleton } from "@/components/ui";

export function RoadmapSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex justify-between items-center pb-4 border-b border-surface-border">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-20 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-3xl" />
    </div>
  );
}
