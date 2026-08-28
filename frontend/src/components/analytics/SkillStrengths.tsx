import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, Badge } from "@/components/ui";

interface SkillStrengthsProps {
  strengths: string[];
}

export function SkillStrengths({ strengths }: SkillStrengthsProps) {
  if (!strengths || strengths.length === 0) {
    return (
      <Card variant="default" className="p-6 space-y-2">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Verified Competency Strengths
        </h3>
        <p className="text-xs text-slate-400">
          Complete diagnostic calibration assessments to identify your verified strengths.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="default" className="p-6 space-y-3">
      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        Verified Competency Strengths
      </h3>
      <p className="text-xs text-slate-400">
        High confidence competencies ready to support advanced specializations:
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        {strengths.map((s, idx) => (
          <Badge key={idx} variant="success" size="md">
            <CheckCircle2 className="h-3 w-3" /> {s}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
