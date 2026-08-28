import React from "react";
import { Skeleton, Card } from "@/components/ui";

export function ResourceSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex justify-between items-center pb-4 border-b border-surface-border">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-28" />
      </div>

      <Skeleton className="h-56 w-full rounded-3xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );
}
