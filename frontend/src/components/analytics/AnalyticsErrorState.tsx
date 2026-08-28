import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button, Card } from "@/components/ui";

interface AnalyticsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function AnalyticsErrorState({ error, onRetry }: AnalyticsErrorStateProps) {
  return (
    <Card variant="default" className="py-12 max-w-lg mx-auto text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-950 text-rose-400 border border-rose-800/60 mx-auto">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-white tracking-tight">Unable to Load Growth Analytics</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">{error}</p>
      <div className="pt-2 flex justify-center">
        <Button onClick={onRetry} variant="primary" size="md" leftIcon={<RefreshCw className="h-4 w-4" />}>
          Retry Connection
        </Button>
      </div>
    </Card>
  );
}
