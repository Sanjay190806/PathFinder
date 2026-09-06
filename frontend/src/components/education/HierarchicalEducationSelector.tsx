'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  EducationLevel,
  EducationSearchResult,
  StructuredEducationSelection,
  searchEducationCatalog
} from "@/lib/educationCatalog";
import { api } from "@/lib/api";
import { Select, Input, Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Search,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  HelpCircle,
  AlertCircle
} from "lucide-react";

interface HierarchicalEducationSelectorProps {
  value?: Partial<StructuredEducationSelection>;
  onChange: (val: StructuredEducationSelection) => void;
  compact?: boolean;
  showInstitutionFields?: boolean;
}

export function HierarchicalEducationSelector({
  value,
  onChange,
  compact = false,
  showInstitutionFields = true
}: HierarchicalEducationSelectorProps) {
  // 1. Catalog State
  const [catalog, setCatalog] = useState<EducationLevel[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 2. Search & Alias State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // 3. Selection State
  const [levelId, setLevelId] = useState<string>(value?.education_level || "undergraduate");
  const [streamId, setStreamId] = useState<string>(value?.stream || "engineering-technology");
  const [specializationId, setSpecializationId] = useState<string>(
    value?.specialization || "computer-science-engineering"
  );
  const [qualification, setQualification] = useState<string>(value?.qualification || "B.Tech");
  const [customLabel, setCustomLabel] = useState<string>(value?.custom_education_label || "");
  const [institution, setInstitution] = useState<string>(value?.institution || "");
  const [graduationYear, setGraduationYear] = useState<string>(value?.graduation_year || "");

  // Fetch catalog on mount
  useEffect(() => {
    let isMounted = true;
    api
      .getEducationCatalog()
      .then((res) => {
        if (isMounted && res?.education_levels) {
          setCatalog(res.education_levels);
          // If initial value exists, respect it
          if (!levelId && res.education_levels.length > 0) {
            setLevelId(res.education_levels[2]?.id || res.education_levels[0].id);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Could not fetch remote education catalog, using fallback", err);
          setLoadError("Catalog loaded in offline resilience mode");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingCatalog(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derived current level, stream, and specialization objects
  const currentLevel = useMemo(
    () => catalog.find((l) => l.id === levelId) || catalog[0] || null,
    [catalog, levelId]
  );

  const availableStreams = useMemo(
    () => currentLevel?.streams || [],
    [currentLevel]
  );

  const currentStream = useMemo(
    () => availableStreams.find((s) => s.id === streamId) || availableStreams[0] || null,
    [availableStreams, streamId]
  );

  const availableSpecializations = useMemo(
    () => currentStream?.specializations || [],
    [currentStream]
  );

  const currentSpecialization = useMemo(
    () =>
      availableSpecializations.find((sp) => sp.id === specializationId) ||
      availableSpecializations[0] ||
      null,
    [availableSpecializations, specializationId]
  );

  const availableQualifications = useMemo(() => {
    if (currentSpecialization?.suggested_qualifications?.length) {
      return currentSpecialization.suggested_qualifications;
    }
    return currentStream?.default_qualifications || ["Degree / Certificate", "Other"];
  }, [currentSpecialization, currentStream]);

  // Handle Parent Selection Changes (Reset Dependents)
  const handleLevelChange = (newLevelId: string) => {
    setLevelId(newLevelId);
    const newLevel = catalog.find((l) => l.id === newLevelId);
    const nextStreams = newLevel?.streams || [];
    if (nextStreams.length > 0) {
      const firstStream = nextStreams[0];
      setStreamId(firstStream.id);
      if (firstStream.specializations.length > 0) {
        const firstSpec = firstStream.specializations[0];
        setSpecializationId(firstSpec.id);
        const quals = firstSpec.suggested_qualifications.length > 0
          ? firstSpec.suggested_qualifications
          : firstStream.default_qualifications;
        setQualification(quals[0] || "");
      } else {
        setSpecializationId("");
        setQualification("");
      }
    } else {
      setStreamId("");
      setSpecializationId("");
      setQualification("");
    }
  };

  const handleStreamChange = (newStreamId: string) => {
    setStreamId(newStreamId);
    const newStream = availableStreams.find((s) => s.id === newStreamId);
    if (newStream && newStream.specializations.length > 0) {
      const firstSpec = newStream.specializations[0];
      setSpecializationId(firstSpec.id);
      const quals = firstSpec.suggested_qualifications.length > 0
        ? firstSpec.suggested_qualifications
        : newStream.default_qualifications;
      setQualification(quals[0] || "");
    } else {
      setSpecializationId("");
      setQualification("");
    }
  };

  const handleSpecializationChange = (newSpecId: string) => {
    setSpecializationId(newSpecId);
    const spec = availableSpecializations.find((sp) => sp.id === newSpecId);
    if (spec) {
      const quals = spec.suggested_qualifications.length > 0
        ? spec.suggested_qualifications
        : currentStream?.default_qualifications || [];
      if (quals.length > 0 && !quals.includes(qualification)) {
        setQualification(quals[0]);
      }
    }
  };

  // Search Results
  const searchResults: EducationSearchResult[] = useMemo(() => {
    return searchEducationCatalog(catalog, searchQuery);
  }, [catalog, searchQuery]);

  const handleSelectSearchResult = (res: EducationSearchResult) => {
    setLevelId(res.education_level_id);
    setStreamId(res.stream_id);
    setSpecializationId(res.specialization_id);
    if (res.suggested_qualifications.length > 0) {
      setQualification(res.suggested_qualifications[0]);
    }
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  // Notify Parent on change
  useEffect(() => {
    const isCustom =
      specializationId.includes("custom") ||
      specializationId.includes("other") ||
      qualification.toLowerCase().includes("other") ||
      streamId.includes("other");

    onChange({
      education_level: levelId,
      stream: streamId,
      specialization: specializationId,
      qualification: qualification,
      institution: institution.trim() || undefined,
      graduation_year: graduationYear.trim() || undefined,
      custom_education_label: isCustom ? customLabel : undefined
    });
  }, [
    levelId,
    streamId,
    specializationId,
    qualification,
    customLabel,
    institution,
    graduationYear
  ]);

  const isCustomSelected =
    specializationId.includes("custom") ||
    specializationId.includes("other") ||
    qualification.toLowerCase().includes("other") ||
    streamId.includes("other");

  return (
    <div className="space-y-4 text-left w-full">
      {/* Search Bar with Alias Recognition */}
      <div className="relative" ref={searchDropdownRef}>
        <label
          htmlFor="education-alias-search"
          className="block text-xs font-semibold text-foreground mb-1 flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-primary" />
            <span>Search Stream or Shortcut (e.g. &quot;CSE&quot;, &quot;ECE&quot;, &quot;PCM&quot;, &quot;BCA&quot;, &quot;COPA&quot;)</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">Auto-calibrates hierarchy</span>
        </label>
        <div className="relative">
          <input
            id="education-alias-search"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search by degree, branch acronym (CSE, ECE, PCM) or discipline..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-card border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            aria-autocomplete="list"
            aria-expanded={isSearchFocused && searchResults.length > 0}
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Live Search Suggestions Dropdown */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-xl bg-card border border-border shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="p-1.5 space-y-1">
                {searchResults.map((item) => (
                  <button
                    key={`${item.education_level_id}-${item.stream_id}-${item.specialization_id}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full p-2 rounded-lg text-left hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground group-hover:text-primary">
                        {item.specialization_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span>{item.education_level_name}</span>
                        <span>&bull;</span>
                        <span>{item.stream_name}</span>
                      </div>
                    </div>
                    <Badge variant="primary" size="sm">
                      Select &rarr;
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No matching streams found for &quot;{searchQuery}&quot;. You can use the cascading dropdowns below or pick &quot;Other / Custom&quot;.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4-Level Cascading Hierarchy */}
      <div className="p-4 rounded-2xl border border-border bg-card/50 space-y-4">
        {/* Level 1: Education Level */}
        <div>
          <label
            htmlFor="select-education-level"
            className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5"
          >
            1. Education Level
          </label>
          <Select
            id="select-education-level"
            value={levelId}
            onChange={(e) => handleLevelChange(e.target.value)}
            className="w-full text-xs font-medium"
            disabled={isLoadingCatalog}
          >
            {catalog.map((lvl) => (
              <option key={lvl.id} value={lvl.id} className="bg-card text-foreground">
                {lvl.name}
              </option>
            ))}
          </Select>
          {currentLevel?.description && !compact && (
            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
              {currentLevel.description}
            </p>
          )}
        </div>

        {/* Level 2: Broad Stream / Field */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="select-broad-stream"
              className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between"
            >
              <span>2. Broad Stream / Field</span>
              <span className="text-[10px] text-muted-foreground">
                {availableStreams.length} available
              </span>
            </label>
            <Select
              id="select-broad-stream"
              value={streamId}
              onChange={(e) => handleStreamChange(e.target.value)}
              className="w-full text-xs font-medium"
              disabled={availableStreams.length === 0}
            >
              {availableStreams.map((st) => (
                <option key={st.id} value={st.id} className="bg-card text-foreground">
                  {st.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Level 3: Specialization / Subject Combination */}
          <div>
            <label
              htmlFor="select-specialization"
              className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between"
            >
              <span>3. Specialization / Subjects</span>
              <span className="text-[10px] text-muted-foreground">
                {availableSpecializations.length} options
              </span>
            </label>
            <Select
              id="select-specialization"
              value={specializationId}
              onChange={(e) => handleSpecializationChange(e.target.value)}
              className="w-full text-xs font-medium"
              disabled={availableSpecializations.length === 0}
            >
              {availableSpecializations.map((spec) => (
                <option key={spec.id} value={spec.id} className="bg-card text-foreground">
                  {spec.name}
                </option>
              ))}
              <option value="other-custom" className="bg-card text-foreground">Other / Custom</option>
            </Select>
          </div>
        </div>

        {/* Level 4: Qualification */}
        <div>
          <label
            htmlFor="select-qualification"
            className="block text-xs font-bold text-foreground mb-1.5"
          >
            4. Current / Expected Degree or Qualification
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              id="select-qualification"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="w-full text-xs font-medium"
            >
              {availableQualifications.map((q) => (
                <option key={q} value={q} className="bg-card text-foreground">
                  {q}
                </option>
              ))}
              <option value="Other / Custom Degree" className="bg-card text-foreground">Other / Custom Degree</option>
            </Select>

            {/* Custom Input Reveal when Other / Custom is chosen */}
            {isCustomSelected && (
              <Input
                label="Specify Custom Specialization / Degree"
                placeholder="e.g. B.Tech in Marine Mechatronics"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="text-xs"
                required
              />
            )}
          </div>
        </div>

        {/* Optional Institution & Year */}
        {showInstitutionFields && !compact && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            <Input
              label="Institution / Board / University (Optional)"
              placeholder="e.g. Anna University, IIT Bombay, CBSE, Delhi University"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              leftIcon={<Building2 className="h-3.5 w-3.5 text-muted-foreground" />}
              className="text-xs"
            />

            <Input
              label="Graduation Year / Class Year (Optional)"
              placeholder="e.g. 2025, 2026"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              leftIcon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
              className="text-xs"
            />
          </div>
        )}

        {/* Active Selection Breadcrumb Summary */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span>Path:</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface border border-border text-foreground">
            {currentLevel?.short_label || currentLevel?.name || "Level"}
          </span>
          <span className="text-muted-foreground/60">&rarr;</span>
          <span className="px-2 py-0.5 rounded-md bg-surface border border-border text-foreground">
            {currentStream?.name || "Stream"}
          </span>
          <span className="text-muted-foreground/60">&rarr;</span>
          <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary font-medium">
            {currentSpecialization?.name || customLabel || "Specialization"}
          </span>
          <span className="text-muted-foreground/60">&bull;</span>
          <span className="text-primary font-semibold">
            {qualification || "Degree"}
          </span>
        </div>
      </div>
    </div>
  );
}
