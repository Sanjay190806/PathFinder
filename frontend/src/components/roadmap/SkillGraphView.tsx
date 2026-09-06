import React, { useState, useMemo, useRef } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { SkillGraphNode, SkillGraphEdge } from "@/lib/types";
import { SkillGraphLegend } from "./SkillGraphLegend";
import { MobileSkillList } from "./MobileSkillList";
import { cn } from "@/lib/utils";

interface SkillGraphViewProps {
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
  selectedSkillSlug: string | null;
  onSelectSkill: (skill: SkillGraphNode) => void;
}

export function SkillGraphView({
  nodes,
  edges,
  selectedSkillSlug,
  onSelectSkill
}: SkillGraphViewProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Calculate layout coordinates based on topological depth & node clustering
  const { layoutNodes, layoutEdges, svgDimensions } = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { layoutNodes: [], layoutEdges: [], svgDimensions: { width: 800, height: 400 } };
    }

    const columnWidth = 180;
    const rowHeight = 70;
    const paddingX = 70;
    const paddingY = 60;

    // Group nodes by depth
    const depthMap = new Map<number, SkillGraphNode[]>();
    for (const n of nodes) {
      if (!depthMap.has(n.topological_depth)) {
        depthMap.set(n.topological_depth, []);
      }
      depthMap.get(n.topological_depth)!.push(n);
    }

    const maxDepth = Math.max(...Array.from(depthMap.keys()), 0);
    const maxNodesInCol = Math.max(...Array.from(depthMap.values()).map((v) => v.length), 1);

    const width = Math.max(850, (maxDepth + 1) * columnWidth + paddingX * 2);
    const height = Math.max(450, maxNodesInCol * rowHeight + paddingY * 2);

    const positions = new Map<string, { x: number; y: number }>();

    for (const [depth, colNodes] of Array.from(depthMap.entries())) {
      const colX = paddingX + depth * columnWidth;
      const totalColHeight = colNodes.length * rowHeight;
      const startY = (height - totalColHeight) / 2 + rowHeight / 2;

      colNodes.forEach((node, idx) => {
        const nodeY = startY + idx * rowHeight;
        positions.set(node.slug, { x: colX, y: nodeY });
      });
    }

    const computedNodes = nodes.map((n) => ({
      ...n,
      x: positions.get(n.slug)?.x || 0,
      y: positions.get(n.slug)?.y || 0
    }));

    const computedEdges = edges
      .map((e) => {
        const src = positions.get(e.source);
        const tgt = positions.get(e.target);
        if (!src || !tgt) return null;
        return {
          ...e,
          x1: src.x + 60,
          y1: src.y,
          x2: tgt.x - 60,
          y2: tgt.y
        };
      })
      .filter(Boolean);

    return {
      layoutNodes: computedNodes,
      layoutEdges: computedEdges as any[],
      svgDimensions: { width, height }
    };
  }, [nodes, edges]);

  const selectedNode = nodes.find((n) => n.slug === selectedSkillSlug);
  const highlightedPrereqs = new Set(selectedNode?.prerequisites || []);
  const highlightedDeps = new Set(selectedNode?.dependents || []);

  const handleZoomIn = () => setZoom((z) => Math.min(1.8, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.15));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Top Legend and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SkillGraphLegend />

        <div className="hidden md:flex items-center gap-1.5 bg-surface-raised p-1 rounded-xl border border-surface-border">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom in graph"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom out graph"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            aria-label="Reset zoom and pan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Interactive SVG Graph for Desktop/Tablet */}
      <div className="hidden md:block relative w-full overflow-hidden rounded-3xl border border-surface-border bg-surface/90 shadow-2xl backdrop-blur-xl h-[520px]">
        <svg
          suppressHydrationWarning
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
          className="cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out"
          }}
        >
          <defs>
            <marker
              id="arrow-mandatory"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>
            <marker
              id="arrow-optional"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Render Edges */}
          {layoutEdges.map((e, idx) => {
            const isHighlighted =
              selectedSkillSlug &&
              ((e.target === selectedSkillSlug && highlightedPrereqs.has(e.source)) ||
                (e.source === selectedSkillSlug && highlightedDeps.has(e.target)));

            const isDimmed = selectedSkillSlug && !isHighlighted;

            return (
              <path
                key={idx}
                d={`M ${e.x1} ${e.y1} C ${(e.x1 + e.x2) / 2} ${e.y1}, ${(e.x1 + e.x2) / 2} ${e.y2}, ${e.x2} ${e.y2}`}
                fill="none"
                stroke={isHighlighted ? "#6366f1" : e.is_mandatory ? "#334155" : "#1e293b"}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                strokeDasharray={e.is_mandatory ? "none" : "4 3"}
                markerEnd={e.is_mandatory ? "url(#arrow-mandatory)" : "url(#arrow-optional)"}
                opacity={isDimmed ? 0.2 : 1}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Render Nodes */}
          {layoutNodes.map((n) => {
            const isSelected = selectedSkillSlug === n.slug;
            const isPrereq = highlightedPrereqs.has(n.slug);
            const isDependent = highlightedDeps.has(n.slug);
            const isDimmed = selectedSkillSlug && !isSelected && !isPrereq && !isDependent;

            const getNodeStyles = () => {
              if (isSelected) return { fill: "#1e1b4b", stroke: "#6366f1", strokeWidth: 2.5 };
              if (n.status === "completed") return { fill: "#064e3b", stroke: "#10b981", strokeWidth: 1.5 };
              if (n.status === "in_progress") return { fill: "#1e1b4b", stroke: "#6366f1", strokeWidth: 1.5 };
              if (n.status === "eligible") return { fill: "#083344", stroke: "#22d3ee", strokeWidth: 1.5 };
              return { fill: "#0f172a", stroke: "#334155", strokeWidth: 1 };
            };

            const styles = getNodeStyles();

            return (
              <g
                key={n.slug}
                transform={`translate(${n.x}, ${n.y})`}
                onClick={() => onSelectSkill(n)}
                opacity={isDimmed ? 0.3 : 1}
                className="cursor-pointer transition-all duration-200 group"
              >
                {/* Node Pill Background */}
                <rect
                  x="-60"
                  y="-18"
                  width="120"
                  height="36"
                  rx="18"
                  fill={styles.fill}
                  stroke={styles.stroke}
                  strokeWidth={styles.strokeWidth}
                  className="transition-all group-hover:filter group-hover:brightness-125"
                />

                {/* Node Text Label */}
                <text
                  x="0"
                  y="1"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="600"
                  className="pointer-events-none tracking-tight select-none"
                >
                  {n.name.length > 14 ? n.name.slice(0, 13) + "?" : n.name}
                </text>

                {/* Status Dot */}
                <circle
                  cx="46"
                  cy="0"
                  r="3.5"
                  fill={
                    n.status === "completed"
                      ? "#10b981"
                      : n.status === "in_progress"
                      ? "#6366f1"
                      : n.status === "eligible"
                      ? "#22d3ee"
                      : "#64748b"
                  }
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Mobile-Friendly Hierarchical Tree Fallback */}
      <MobileSkillList nodes={nodes} onSelectSkill={onSelectSkill} />
    </div>
  );
}
