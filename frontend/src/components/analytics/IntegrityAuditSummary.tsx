'use client';

import React from "react";
import { ShieldCheck, ShieldAlert, Camera, AlertTriangle, XCircle, Info } from "lucide-react";
import { IntegrityAnalytics } from "@/lib/types";
import { Card } from "@/components/ui";

interface IntegrityAuditSummaryProps {
  integrityData: IntegrityAnalytics | null;
}

export function IntegrityAuditSummary({ integrityData }: IntegrityAuditSummaryProps) {
  if (!integrityData) return null;

  return (
    <Card variant="default" className="p-5 space-y-4 border-slate-800/80 bg-surface-raised/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-white">Assessment Integrity & Proctoring Audit</h3>
            <p className="text-xs text-slate-400">Strictly isolated from academic evaluation scores</p>
          </div>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
          Privacy-Conscious Audit
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
        <div className="p-3 bg-surface-raised/60 rounded-xl border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-400">Monitored Exams</span>
          <p className="text-lg font-black text-white font-mono mt-0.5">{integrityData.monitored_assessments_taken}</p>
        </div>

        <div className="p-3 bg-surface-raised/60 rounded-xl border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-400">Integrity Warnings</span>
          <p className="text-lg font-black text-amber-400 font-mono mt-0.5">{integrityData.warnings_issued}</p>
        </div>

        <div className="p-3 bg-surface-raised/60 rounded-xl border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-400">Camera Glitches</span>
          <p className="text-lg font-black text-cyan-400 font-mono mt-0.5">{integrityData.camera_interruptions_count}</p>
        </div>

        <div className="p-3 bg-surface-raised/60 rounded-xl border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-400">Review Required</span>
          <p className="text-lg font-black text-amber-300 font-mono mt-0.5">{integrityData.review_required_sessions}</p>
        </div>

        <div className="p-3 bg-surface-raised/60 rounded-xl border border-surface-border col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Invalidated</span>
          <p className="text-lg font-black text-red-400 font-mono mt-0.5">{integrityData.invalidated_sessions}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400">
        <Info className="h-4 w-4 text-primary-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {integrityData.audit_note}
        </p>
      </div>
    </Card>
  );
}
