"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, ArrowLeft, Plus, Building2, MapPin, Calendar, 
  Clock, DollarSign, Trash2, ChevronRight, ChevronLeft, 
  CheckCircle2, XCircle, Search
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { SanzzOSStore } from "@/lib/sanzzos/sanzzosStore";
import { PlacementCompany, PlacementStage } from "@/lib/sanzzos/types";

const STAGES: { stage: PlacementStage; label: string; color: string }[] = [
  { stage: "Target", label: "Target", color: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { stage: "Applied", label: "Applied", color: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { stage: "OA", label: "Online Assessment", color: "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { stage: "Interview", label: "Interview Rounds", color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  { stage: "Offer", label: "Offer Received", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { stage: "Rejected", label: "Archived", color: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400" }
];

export default function PlacementOSPage() {
  const [companies, setCompanies] = useState<PlacementCompany[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New company form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [stage, setStage] = useState<PlacementStage>("Target");
  const [packageLPA, setPackageLPA] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setCompanies(SanzzOSStore.getCompanies());
  }, []);

  const handleStageChange = (id: string, newStage: PlacementStage) => {
    SanzzOSStore.updateCompanyStage(id, newStage);
    setCompanies(SanzzOSStore.getCompanies());
  };

  const handleDelete = (id: string) => {
    SanzzOSStore.deleteCompany(id);
    setCompanies(SanzzOSStore.getCompanies());
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    SanzzOSStore.addCompany({
      name,
      role,
      stage,
      packageLPA,
      location,
      notes
    });

    setCompanies(SanzzOSStore.getCompanies());
    setName("");
    setRole("");
    setPackageLPA("");
    setLocation("");
    setNotes("");
    setIsAddModalOpen(false);
  };

  const filteredCompanies = companies.filter(c => 
    !searchQuery || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Link href="/sanzzos" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> SanzzOS Hub
            </Link>
            <span>&bull;</span>
            <span>Career Recruitment Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight flex items-center gap-2">
            <span>💼 Placement OS Kanban</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-800 dark:text-purple-300 font-bold border border-purple-500/30">
              {companies.length} Companies Tracked
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize recruitment pipelines, online assessment deadlines, interview rounds, and job offers in one unified Kanban board.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Add Company
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search company or target role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-input text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {STAGES.map(({ stage: colStage, label, color }) => {
          const colItems = filteredCompanies.filter(c => c.stage === colStage);

          return (
            <div key={colStage} className="rounded-2xl bg-surface-muted/40 border border-border p-3 space-y-3 min-h-[450px]">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${color}`}>
                  {label}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {colItems.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="space-y-3">
                {colItems.map((company) => (
                  <Card key={company.id} className="p-3.5 space-y-2.5 border-border bg-card shadow-2xs hover:shadow-xs transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-tight">
                          {company.name}
                        </h4>
                        <div className="text-xs text-muted-foreground font-medium mt-0.5">
                          {company.role}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        title="Delete company"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {company.packageLPA && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="h-3 w-3" />
                        <span>{company.packageLPA}</span>
                      </div>
                    )}

                    {company.notes && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed bg-surface-muted/60 p-1.5 rounded-md">
                        {company.notes}
                      </p>
                    )}

                    {/* Move Controls */}
                    <div className="pt-2 border-t border-border flex items-center justify-between gap-1">
                      <select
                        value={company.stage}
                        onChange={(e) => handleStageChange(company.id, e.target.value as PlacementStage)}
                        aria-label={`Change stage for ${company.name}`}
                        className="w-full text-[10px] font-bold px-1.5 py-1 rounded bg-surface-muted border border-border text-foreground"
                      >
                        {STAGES.map(s => (
                          <option key={s.stage} value={s.stage}>Move: {s.label}</option>
                        ))}
                      </select>
                    </div>
                  </Card>
                ))}

                {colItems.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground italic">
                    No companies
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-500" />
                Add Target Company
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zoho, Amazon, Google"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-input text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Developer, SDE-1"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-input text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Pipeline Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as PlacementStage)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-input text-xs text-foreground focus:outline-none"
                  >
                    {STAGES.map(s => (
                      <option key={s.stage} value={s.stage}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Package (CTC / LPA)</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.5 LPA"
                    value={packageLPA}
                    onChange={(e) => setPackageLPA(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-input text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Preparation Notes / Syllabus</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Round 1 is C Programming & flowcharts, Round 2 is OOPs system design."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-input text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  Save Company
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
