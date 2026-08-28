import React from "react";
import Link from "next/link";
import { X, CheckCircle2, Lock, ArrowRight, BookOpen, Layers } from "lucide-react";
import { SkillGraphNode, SkillGraphEdge } from "@/lib/types";
import { Drawer, Button, Badge, ProgressBar } from "@/components/ui";

interface SkillInspectorProps {
  skill: SkillGraphNode | null;
  allNodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill: (slug: string) => void;
}

export function SkillInspector({
  skill,
  allNodes,
  edges,
  isOpen,
  onClose,
  onSelectSkill
}: SkillInspectorProps) {
  if (!skill) return null;

  const nodeMap = new Map(allNodes.map((n) => [n.slug, n]));
  const prereqNodes = skill.prerequisites.map((p) => nodeMap.get(p)).filter(Boolean) as SkillGraphNode[];
  const dependentNodes = skill.dependents.map((d) => nodeMap.get(d)).filter(Boolean) as SkillGraphNode[];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" size="sm"><CheckCircle2 className="h-3 w-3" /> Mastered</Badge>;
      case "in_progress":
        return <Badge variant="primary" size="sm">In Progress</Badge>;
      case "eligible":
        return <Badge variant="cyan" size="sm">Eligible</Badge>;
      default:
        return <Badge variant="warning" size="sm"><Lock className="h-3 w-3" /> Locked</Badge>;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={skill.name}
      description={`Category: ${skill.category} ? Tier: ${skill.difficulty_tier}`}
      width="md"
    >
      <div className="space-y-6 text-slate-100">
        {/* Status & Confidence */}
        <div className="rounded-2xl border border-surface-border bg-surface-raised/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current Confidence</span>
            {getStatusBadge(skill.status)}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-white font-bold">{Math.round(skill.confidence * 100)}%</span>
              <span className="text-slate-400">Target: 100%</span>
            </div>
            <ProgressBar progress={skill.confidence * 100} size="md" color={skill.confidence >= 0.8 ? "emerald" : "primary"} />
          </div>
        </div>

        {/* Prerequisites */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Prerequisites ({prereqNodes.length})
          </h4>
          {prereqNodes.length > 0 ? (
            <div className="space-y-2">
              {prereqNodes.map((p) => (
                <div
                  key={p.slug}
                  onClick={() => onSelectSkill(p.slug)}
                  className="rounded-xl border border-surface-border bg-surface p-3 flex items-center justify-between hover:border-primary-500 cursor-pointer transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{p.name}</span>
                    <span className="text-[10px] text-slate-400">{Math.round(p.confidence * 100)}% confidence</span>
                  </div>
                  {getStatusBadge(p.status)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No prerequisites required. This is a foundational competency.</p>
          )}
        </div>

        {/* Unlocked Dependents */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Unlocks Next ({dependentNodes.length})
          </h4>
          {dependentNodes.length > 0 ? (
            <div className="space-y-2">
              {dependentNodes.map((d) => (
                <div
                  key={d.slug}
                  onClick={() => onSelectSkill(d.slug)}
                  className="rounded-xl border border-surface-border bg-surface p-3 flex items-center justify-between hover:border-primary-500 cursor-pointer transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{d.name}</span>
                    <span className="text-[10px] text-slate-400">Tier: {d.difficulty_tier}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">This is a terminal specialization or capstone skill.</p>
          )}
        </div>

        <div className="pt-4 border-t border-surface-border">
          <Link href="/roadmap" className="w-full">
            <Button size="md" className="w-full" onClick={onClose}>
              View in Sequenced Timeline
            </Button>
          </Link>
        </div>
      </div>
    </Drawer>
  );
}
