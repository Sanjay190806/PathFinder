import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = "md",
  showSubtitle = true,
  href = "/",
  className = "",
}: BrandLogoProps) {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const titleSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const content = (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm border border-border shrink-0 group-hover:scale-105 transition-transform ${iconSizes[size]}`}
      >
        <img
          src="/sanzzdream_logo.png"
          alt="Sanzz Dream Logo"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col text-left">
        <span className={`font-bold tracking-tight text-foreground leading-tight ${titleSizes[size]}`}>
          PathFinder AI
        </span>
        {showSubtitle && (
          <span className="text-[10px] text-muted-foreground font-semibold leading-none tracking-wide">
            by Sanzz Dream
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus-visible:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
