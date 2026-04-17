"use client";

import { AlertTriangle } from "lucide-react";

import { useT } from "@/hooks/use-t";
import type { Anomaly } from "@/lib/types";

interface AnomalyAlertProps {
  anomalies: Anomaly[];
}

const FIRST_ANOMALY_INDEX = 0;

export function AnomalyAlert({ anomalies }: AnomalyAlertProps) {
  const t = useT();

  if (anomalies.length === 0) {
    return null;
  }

  const firstAnomaly = anomalies[FIRST_ANOMALY_INDEX];

  return (
    <div
      className="flex items-start gap-3 rounded-lg bg-accent-light p-3 dark:bg-accent-dark/30"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-accent-dark dark:text-accent">
          {t.DASHBOARD_ANOMALY_TITLE}
        </p>
        <p className="text-xs text-foreground/80">
          <span className="font-medium">{firstAnomaly.name}</span>
          {" — "}
          {firstAnomaly.reason}
        </p>
        <p className="text-xs text-muted-foreground">
          {firstAnomaly.suggestedAction}
        </p>
      </div>
    </div>
  );
}
