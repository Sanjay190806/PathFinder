import React from "react";
import { CheckSquare, Lock } from "lucide-react";
import { Card, Badge } from "@/components/ui";

interface ResourcePrerequisitesProps {
  prerequisites: string[];
}

export function ResourcePrerequisites({ prerequisites }: ResourcePrerequisitesProps) {
  if (!prerequisites || prerequisites.length === 0) {
    return (
      <Card variant="default" className="p-6 space-y-2">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-emerald-400" />
          Prerequisites
        </h3>
        <p className="text-xs text-slate-400">
          No mandatory prerequisites required. This module starts from fundamental concepts.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="default" className="p-6 space-y-3">
      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-accent-cyan" />
        Prerequisites Expected
      </h3>
      <p className="text-xs text-slate-400">
        Review these foundational topics to ensure smooth comprehension:
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        {prerequisites.map((p, idx) => (
          <Badge key={idx} variant="neutral" size="md">
            {p}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
