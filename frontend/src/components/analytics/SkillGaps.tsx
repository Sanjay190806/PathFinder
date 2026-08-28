import React from "react";
import { Target, ArrowRight } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import Link from "next/link";

interface SkillGapsProps {
  weaknesses: string[];
}

export function SkillGaps({ weaknesses }: SkillGapsProps) {
  if (!weaknesses || weaknesses.length === 0) {
    return (
      <Card variant="default" className="p-6 space-y-2">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Target className="h-4 w-4 text-accent-cyan" />
          Priority Growth Opportunities
        </h3>
        <p className="text-xs text-slate-400">
          No critical skill gaps identified. Your curriculum is on track.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="default" className="p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Target className="h-4 w-4 text-accent-cyan" />
          Priority Growth Opportunities
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Strengthening these foundational competencies will unlock downstream roadmap modules:
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {weaknesses.map((w, idx) => (
          <Badge key={idx} variant="warning" size="md">
            {w}
          </Badge>
        ))}
      </div>

      <div className="pt-2 border-t border-surface-border">
        <Link href="/roadmap">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            View Sequenced Modules
          </Button>
        </Link>
      </div>
    </Card>
  );
}
