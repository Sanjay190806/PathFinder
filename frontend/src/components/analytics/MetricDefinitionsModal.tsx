'use client';

import React from "react";
import { X, BookOpen, Calculator, Database, Clock } from "lucide-react";
import { MetricDefinition } from "@/lib/types";

interface MetricDefinitionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  definitions: MetricDefinition[];
}

export function MetricDefinitionsModal({ isOpen, onClose, definitions }: MetricDefinitionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-surface-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-raised/40">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-400" />
              Canonical Metric Definitions & Formulas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              PathFinder Phase 10 Authoritative Analytics Calculation Specifications
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-raised transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-5 overflow-y-auto space-y-4 divide-y divide-surface-border/50">
          {definitions.map((d) => (
            <div key={d.metric_key} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-white">{d.metric_name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-primary-950/80 text-primary-300 border border-primary-800/40">
                    {d.aggregation}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                    {d.freshness}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{d.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="flex items-start gap-1.5 text-slate-400 bg-surface-raised/40 p-2 rounded-lg border border-surface-border/60">
                  <Database className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300 block">Source:</strong>
                    <span>{d.source}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-slate-400 bg-surface-raised/40 p-2 rounded-lg border border-surface-border/60">
                  <Calculator className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300 block">Formula:</strong>
                    <span className="font-mono text-slate-200">{d.formula}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border bg-surface-raised/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close Definitions
          </button>
        </div>
      </div>
    </div>
  );
}
