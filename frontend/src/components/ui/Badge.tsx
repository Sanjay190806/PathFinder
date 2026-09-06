import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground font-semibold hover:bg-primary/90",
        secondary: "border-border/80 bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80",
        destructive: "border-red-300 dark:border-red-800/40 bg-red-100/90 dark:bg-red-950/60 text-red-950 dark:text-red-200 font-bold hover:bg-red-200/80",
        danger: "border-red-300 dark:border-red-800/40 bg-red-100/90 dark:bg-red-950/60 text-red-950 dark:text-red-200 font-bold hover:bg-red-200/80",
        outline: "text-foreground border-border bg-card/60 font-semibold",
        success: "border-emerald-300 dark:border-emerald-800/50 bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 font-bold hover:bg-emerald-200/80",
        warning: "border-amber-300 dark:border-amber-800/50 bg-amber-100/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 font-bold hover:bg-amber-200/80",
        info: "border-blue-300 dark:border-blue-800/50 bg-blue-100/90 dark:bg-blue-950/60 text-blue-950 dark:text-blue-300 font-bold hover:bg-blue-200/80",
        neutral: "border-border/80 bg-muted text-foreground font-semibold hover:bg-muted/80",
        primary: "border-transparent bg-primary text-primary-foreground font-semibold hover:bg-primary/90",
        cyan: "border-cyan-300 dark:border-cyan-800/50 bg-cyan-100/90 dark:bg-cyan-950/60 text-cyan-950 dark:text-cyan-300 font-bold hover:bg-cyan-200/80",
        purple: "border-purple-300 dark:border-purple-800/50 bg-purple-100/90 dark:bg-purple-950/60 text-purple-950 dark:text-purple-300 font-bold hover:bg-purple-200/80"
      },
      size: {
        sm: "text-[10px] px-2 py-0.5 font-medium",
        md: "text-xs px-2.5 py-1 font-semibold"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className="mr-1.5 flex h-2 w-2 rounded-full"
          style={{ backgroundColor: "currentColor" }}
        />
      )}
      {children}
    </div>
  );
}
