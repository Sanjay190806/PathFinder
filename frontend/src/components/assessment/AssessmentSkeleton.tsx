import React from "react";
import { Skeleton, Card } from "@/components/ui";

export function AssessmentSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex justify-between items-center pb-4 border-b border-surface-border">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-80 w-full rounded-3xl" />
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
