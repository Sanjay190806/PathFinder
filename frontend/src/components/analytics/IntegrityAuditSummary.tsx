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
    <Card variant="default" className="p-5 space-y-4 border-border bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-foreground">Assessment Integrity & Proctoring Audit</h3>
            <p className="text-xs text-muted-foreground">Strictly isolated from academic evaluation scores</p>
          </div>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-muted text-foreground border border-border">
          Privacy-Conscious Audit
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
        <div className="p-3 bg-muted/40 rounded-xl border border-border">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Monitored Exams</span>
          <p className="text-lg font-black text-foreground font-mono mt-0.5">{integrityData.monitored_assessments_taken}</p>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Integrity Warnings</span>
          <p className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">{integrityData.warnings_issued}</p>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Camera Glitches</span>
          <p className="text-lg font-black text-sky-600 dark:text-cyan-400 font-mono mt-0.5">{integrityData.camera_interruptions_count}</p>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Review Required</span>
          <p className="text-lg font-black text-amber-600 dark:text-amber-300 font-mono mt-0.5">{integrityData.review_required_sessions}</p>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Invalidated</span>
          <p className="text-lg font-black text-red-600 dark:text-red-400 font-mono mt-0.5">{integrityData.invalidated_sessions}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl border border-border text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {integrityData.audit_note}
        </p>
      </div>
    </Card>
  );
}
