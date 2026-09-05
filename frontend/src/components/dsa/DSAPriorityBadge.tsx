import React from "react";

interface DSAPriorityBadgeProps {
  priority: string;
  size?: "sm" | "md" | "lg";
}

export const DSAPriorityBadge: React.FC<DSAPriorityBadgeProps> = ({ priority, size = "md" }) => {
  const norm = (priority || "").toUpperCase();

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-300";
  let label = norm;

  if (norm === "VERY_HIGH") {
    colorClasses = "bg-rose-50 text-rose-700 border-rose-300 font-semibold";
    label = "Very High Priority";
  } else if (norm === "HIGH") {
    colorClasses = "bg-amber-50 text-amber-700 border-amber-300 font-semibold";
    label = "High Priority";
  } else if (norm === "MEDIUM") {
    colorClasses = "bg-blue-50 text-blue-700 border-blue-300";
    label = "Medium Priority";
  } else if (norm === "LOW" || norm === "MINIMAL") {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-300";
    label = norm === "MINIMAL" ? "Minimal" : "Low Priority";
  } else if (norm === "NOT_APPLICABLE") {
    colorClasses = "bg-slate-100 text-slate-500 border-slate-200 italic";
    label = "Not Applicable";
  } else if (norm === "UNKNOWN") {
    colorClasses = "bg-gray-100 text-gray-400 border-gray-200";
    label = "Unknown";
  }

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-xs"
      : size === "lg"
      ? "px-3.5 py-1.5 text-sm"
      : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses} ${colorClasses} tracking-wide transition-colors`}
    >
      {label}
    </span>
  );
};
