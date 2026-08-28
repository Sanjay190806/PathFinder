import React from "react";
import { CheckCircle2, Lock, ArrowRight, Layers } from "lucide-react";
import { SkillGraphNode } from "@/lib/types";
import { Badge } from "@/components/ui";

interface MobileSkillListProps {
  nodes: SkillGraphNode[];
  onSelectSkill: (skill: SkillGraphNode) => void;
}

export function MobileSkillList({ nodes, onSelectSkill }: MobileSkillListProps) {
  // Group nodes by topological depth
  const depthMap = new Map<number, SkillGraphNode[]>();
  for (const n of nodes) {
    if (!depthMap.has(n.topological_depth)) {
      depthMap.set(n.topological_depth, []);
    }
    depthMap.get(n.topological_depth)!.push(n);
  }

  const sortedDepths = Array.from(depthMap.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="space-y-6 md:hidden">
      {sortedDepths.map(([depth, skillNodes]) => (
        <div key={depth} className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Layers className="h-3.5 w-3.5 text-primary-400" />
            <span>{depth === 0 ? "Foundations" : `Depth Level ${depth}`}</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {skillNodes.map((sk) => (
              <div
                key={sk.slug}
                onClick={() => onSelectSkill(sk)}
                className="rounded-xl border border-surface-border bg-surface p-3.5 flex items-center justify-between hover:border-slate-600 transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{sk.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {sk.category} &bull; {Math.round(sk.confidence * 100)}% Conf
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {sk.status === "completed" ? (
                    <Badge variant="success" size="sm">Mastered</Badge>
                  ) : sk.status === "locked" ? (
                    <Badge variant="warning" size="sm"><Lock className="h-3 w-3" /></Badge>
                  ) : (
                    <Badge variant="primary" size="sm">Eligible</Badge>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
