import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";

export function AnalyticsEmptyState() {
  return (
    <div className="py-12 max-w-lg mx-auto">
      <EmptyState
        icon={<TrendingUp className="h-8 w-8 text-primary-400" />}
        title="No growth telemetry yet"
        description="Complete your diagnostic assessment and begin learning modules to unlock real-time mastery analytics."
        action={
          <Link href="/assessment">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start Skill Calibration
            </Button>
          </Link>
        }
      />
    </div>
  );
}
