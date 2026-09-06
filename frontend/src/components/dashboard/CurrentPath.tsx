import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Play, Sparkles } from "lucide-react";
import { LearningPathItem } from "@/lib/types";
import { Card, Button, Badge } from "@/components/ui";
import { formatTimeHours } from "@/lib/utils";

interface CurrentPathProps {
  items: LearningPathItem[];
  onWhyClick: (item: LearningPathItem) => void;
}

export function CurrentPath({ items, onWhyClick }: CurrentPathProps) {
  const previewItems = items.slice(0, 4);

  return (
    <Card className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Curriculum
          </h3>
        </div>
        <Link href="/roadmap" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          Full Roadmap <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-thin">
        {previewItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200
              ${item.is_completed 
                ? "bg-success/5 border-success/20 hover:border-success/40" 
                : "bg-surface hover:bg-surface-muted border-border hover:border-primary/30"
              }`}
          >
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={item.is_completed ? "success" : "neutral"} size="sm" className="bg-background">
                  Phase {item.phase_number}
                </Badge>
                {item.is_completed && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Done
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-foreground truncate">{item.resource_title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="truncate max-w-[100px]">{item.resource_provider}</span>
                <div className="h-3 w-[1px] bg-border" />
                <span>{formatTimeHours(item.estimated_hours)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onWhyClick(item)}
                className="rounded-full p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="Why is this recommended?"
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <Link href={`/resources/${item.resource_id}`}>
                <Button size="sm" variant={item.is_completed ? "outline" : "secondary"}>
                  {item.is_completed ? "Review" : "Open"}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
