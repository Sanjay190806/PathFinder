import React, { useState, useEffect } from "react";
import { Target, Search, CheckCircle2, Sparkles, Filter, ShieldAlert, ArrowUpRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CareerRole, CareerDomain, CareerSummary } from "@/lib/types";
import { Input, Skeleton, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface CareerDestinationStepProps {
  careerRoles: CareerRole[];
  selectedRole: string;
  customRole: string;
  onSelectRole: (role: string) => void;
  onChangeCustomRole: (custom: string) => void;
  isLoading: boolean;
}

export function CareerDestinationStep({
  careerRoles,
  selectedRole,
  customRole,
  onSelectRole,
  onChangeCustomRole,
  isLoading
}: CareerDestinationStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [domains, setDomains] = useState<CareerDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<CareerSummary[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch active career domains for filtering
  useEffect(() => {
    api.getCareerDomains()
      .then((data: CareerDomain[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setDomains(data);
        }
      })
      .catch(() => {
        // graceful fallback if network fails
      });
  }, []);

  // Dynamic search with debounce
  useEffect(() => {
    if (!searchQuery && selectedDomain === "all") {
      setSearchResults(null);
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(() => {
      setIsSearching(true);
      const params: Record<string, any> = { page_size: 30 };
      if (searchQuery) params.q = searchQuery;
      if (selectedDomain !== "all") params.domain = selectedDomain;

      api.searchCareers(params)
        .then((res) => {
          if (isCancelled) return;
          if (res && Array.isArray(res.items)) {
            setSearchResults(res.items);
          } else {
            setSearchResults([]);
          }
        })
        .catch(() => {
          if (isCancelled) return;
          // Fallback to client-side filter of careerRoles
          const q = searchQuery.toLowerCase();
          const fallback = careerRoles
            .filter((r) => {
              const matchQ = !q || r.role.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
              const matchD = selectedDomain === "all" || r.domain_category.toLowerCase().includes(selectedDomain.toLowerCase());
              return matchQ && matchD;
            })
            .map((r) => ({
              id: r.slug,
              slug: r.slug,
              canonical_name: r.role,
              display_name: r.title,
              short_description: r.description,
              domain_name: r.domain_category,
              key_skills: r.target_skills || [],
              is_emerging: false,
              is_regulated: false,
              status: "ACTIVE",
              version: 1
            }));
          setSearchResults(fallback as any);
        })
        .finally(() => {
          if (!isCancelled) {
            setIsSearching(false);
          }
        });
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedDomain, careerRoles]);

  // Combine display list
  const displayItems = searchResults !== null
    ? searchResults.map((item) => ({
        role: item.canonical_name,
        slug: item.slug,
        title: item.display_name || item.canonical_name,
        description: item.short_description,
        domain_category: item.domain_name || "General",
        target_skills: item.key_skills || [],
        is_regulated: item.is_regulated,
        is_emerging: item.is_emerging
      }))
    : careerRoles.map((r) => ({
        ...r,
        is_regulated: false,
        is_emerging: false
      }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <Target className="h-4 w-4" /> Step 1: Destination
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2 tracking-tight">
          What are you building toward?
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Explore global careers across technology, design, healthcare, engineering, business, and trades.
        </p>
      </div>

      {/* Controls: Search Bar & Domain Selector */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <Input
              placeholder="Search careers (e.g. AI, Graphic Designer, Doctor, Pilot, SDE)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          {domains.length > 0 && (
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              aria-label="Filter by Domain"
              className="bg-card border border-input text-foreground text-xs font-medium rounded-xl px-3 py-2 sm:max-w-[210px] focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all" className="bg-card text-foreground">All Domains ({careerRoles.length}+ careers)</option>
              {domains.map((d) => (
                <option key={d.slug} value={d.slug} className="bg-card text-foreground">
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Quick Domain Pills */}
        {domains.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedDomain("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0",
                selectedDomain === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-muted text-muted-foreground hover:text-foreground border border-border"
              )}
            >
              All Domains
            </button>
            {domains.slice(0, 7).map((d) => (
              <button
                key={d.slug}
                type="button"
                onClick={() => setSelectedDomain(d.slug)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0",
                  selectedDomain === d.slug
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-muted text-muted-foreground hover:text-foreground border border-border"
                )}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Career Cards Grid */}
      {isLoading || isSearching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon={<Target className="h-6 w-6 text-muted-foreground" />}
          title="No matching career found"
          description="You can define a custom destination below or explore another domain filter."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
          {displayItems.map((item) => {
            const isSelected = selectedRole === item.role && !customRole;

            return (
              <div
                key={item.slug || item.role}
                onClick={() => {
                  onSelectRole(item.role);
                  onChangeCustomRole("");
                  api.selectTargetCareer({
                    career_slug: item.slug || item.role.toLowerCase().replace(/ /g, "-"),
                    selection_source: searchQuery ? "SEARCH" : (selectedDomain !== "all" ? "BROWSE" : "RECOMMENDED")
                  }).catch(() => {});
                }}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all duration-150 relative cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground shadow-md shadow-primary/10 ring-1 ring-primary/50"
                    : "border-border bg-card text-muted-foreground hover:bg-surface-muted hover:border-border hover:text-foreground"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      <span className="inline-block rounded-md bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                        {item.domain_category}
                      </span>
                      {item.is_regulated && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-warning/10 px-1.5 py-0.5 text-[9px] font-semibold text-warning border border-warning/20">
                          <ShieldAlert className="h-2.5 w-2.5" /> Regulated
                        </span>
                      )}
                      {item.is_emerging && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-success/10 px-1.5 py-0.5 text-[9px] font-semibold text-success border border-success/20">
                          <Sparkles className="h-2.5 w-2.5" /> Emerging
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-foreground tracking-tight">{item.role}</h4>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1 animate-in zoom-in duration-150" />
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                {/* Key Skills Preview */}
                {item.target_skills && item.target_skills.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-2.5 pt-2 border-t border-border/50">
                    {item.target_skills.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-surface-muted text-muted-foreground font-mono border border-border"
                      >
                        {s}
                      </span>
                    ))}
                    {item.target_skills.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{item.target_skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Career Definition Option */}
      <div className="pt-4 border-t border-border">
        <label className="text-xs font-semibold text-foreground block mb-1.5">
          Or define a Custom Technical or Professional Destination
        </label>
        <Input
          placeholder="e.g. Autonomous Robotics Engineer, Drone Agronomist, Medical Device Specialist"
          value={customRole}
          onChange={(e) => {
            onChangeCustomRole(e.target.value);
            if (e.target.value) {
              onSelectRole(e.target.value);
              api.selectTargetCareer({
                career_slug: "custom",
                custom_role_name: e.target.value,
                selection_source: "CUSTOM"
              }).catch(() => {});
            }
          }}
        />
      </div>
    </div>
  );
}
