import React from "react";

interface PriceBadgeProps {
  priceType: string;
  learningCost?: number;
  certificateCost?: string;
  size?: "sm" | "md";
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({
  priceType,
  learningCost = 0.0,
  certificateCost,
  size = "md",
}) => {
  const norm = (priceType || "").toUpperCase();

  let label = norm.replace(/_/g, " ");
  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";

  if (norm === "GENUINELY_FREE" || norm === "YOUTUBE_FREE_CONTENT") {
    label = "100% Free Learning";
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold";
  } else if (norm === "FREE_TO_ENROLL_PAID_CERTIFICATE" || norm === "FREE_AUDIT_PAID_CERTIFICATE") {
    label = "Free Learning (Optional Cert Fee)";
    colorClasses = "bg-blue-50 text-blue-700 border-blue-300 font-semibold";
  } else if (norm === "FREE_TRIAL") {
    label = "Free Trial (Then Paid)";
    colorClasses = "bg-amber-50 text-amber-700 border-amber-300";
  } else if (norm === "SUBSCRIPTION_REQUIRED") {
    label = "Subscription Required";
    colorClasses = "bg-purple-50 text-purple-700 border-purple-300";
  } else if (norm === "PAID") {
    label = learningCost > 0 ? `Paid ($${learningCost})` : "Paid Course";
    colorClasses = "bg-rose-50 text-rose-700 border-rose-300 font-semibold";
  } else if (norm === "PARTIALLY_FREE") {
    label = "Partially Free";
    colorClasses = "bg-yellow-50 text-yellow-700 border-yellow-300";
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses} ${colorClasses} tracking-wide transition-colors`}
    >
      {label}
    </span>
  );
};
