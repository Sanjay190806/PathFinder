import React from "react";
import { Layers } from "lucide-react";
import { Card, Badge } from "@/components/ui";

interface ResourceSkillsProps {
  skills: string[];
}

export function ResourceSkills({ skills }: ResourceSkillsProps) {
  return (
    <Card variant="default" className="p-6 space-y-3">
      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary-400" />
        Skills Developed
      </h3>
      <p className="text-xs text-slate-400">
        Completing this module advances your verified competence in:
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        {skills.map((s, idx) => (
          <Badge key={idx} variant="primary" size="md">
            {s}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
