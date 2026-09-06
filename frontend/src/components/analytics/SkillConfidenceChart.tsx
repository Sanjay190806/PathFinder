import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from "recharts";
import { Card } from "@/components/ui";

interface SkillConfidenceChartProps {
  skills: Array<{
    skill: string;
    category: string;
    confidence: number;
    target_confidence: number;
  }>;
}

export function SkillConfidenceChart({ skills }: SkillConfidenceChartProps) {
  if (!skills || skills.length === 0) return null;

  const data = skills.map((s) => ({
    name: s.skill,
    confidencePct: Math.round(s.confidence * 100),
    targetPct: Math.round((s.target_confidence || 0.85) * 100),
    category: s.category
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-xl border border-border bg-popover text-popover-foreground p-3 shadow-xl text-xs space-y-1">
          <p className="font-bold text-foreground">{d.name}</p>
          <p className="text-[11px] text-muted-foreground">Category: {d.category}</p>
          <div className="pt-1 flex items-center gap-2 font-mono">
            <span className="text-primary font-bold">Confidence: {d.confidencePct}%</span>
            <span className="text-muted-foreground">| Target: {d.targetPct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card variant="default" className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">
            Skill Confidence vs Target Benchmark
          </h3>
          <p className="text-xs text-muted-foreground">
            Assessed mastery levels compared to the 85% readiness target
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span>Confidence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-cyan-500" />
            <span>85% Target</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              width={100}
              tickFormatter={(v) => (v.length > 12 ? `${v.slice(0, 11)}?` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={85} stroke="#22d3ee" strokeDasharray="3 3" />
            <Bar dataKey="confidencePct" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.confidencePct >= 80 ? "#10b981" : entry.confidencePct >= 50 ? "#6366f1" : "#0284c7"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
