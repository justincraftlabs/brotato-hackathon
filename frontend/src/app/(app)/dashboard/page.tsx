"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AnomalyAlert } from "@/components/dashboard/AnomalyAlert";
import { Co2TreeVisual } from "@/components/dashboard/Co2TreeVisual";
import { EnergyOverview } from "@/components/dashboard/EnergyOverview";
import { EvnTierProgress } from "@/components/dashboard/EvnTierProgress";
import { MonthComparison } from "@/components/dashboard/MonthComparison";
import { TopConsumersChart } from "@/components/dashboard/TopConsumersChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  DASHBOARD_LABELS,
  LOCAL_STORAGE_HOME_ID_KEY,
  NAV_ROUTES,
} from "@/lib/constants";
import { getDashboard } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

type PageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: DashboardData };

const INITIAL_STATE: PageState = { status: "idle" };
const SKELETON_COUNT = 4;

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-3">
            <div className="h-16 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-lg font-semibold">
          {DASHBOARD_LABELS.EMPTY_STATE_TITLE}
        </p>
        <p className="text-sm text-muted-foreground">
          {DASHBOARD_LABELS.EMPTY_STATE_MESSAGE}
        </p>
        <Button asChild>
          <Link href={NAV_ROUTES.SETUP}>{DASHBOARD_LABELS.EMPTY_STATE_CTA}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm font-semibold text-destructive">
          {DASHBOARD_LABELS.ERROR_TITLE}
        </p>
        <p className="text-xs text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {DASHBOARD_LABELS.RETRY}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const [pageState, setPageState] = useState<PageState>(INITIAL_STATE);

  const fetchDashboard = useCallback(async (id: string) => {
    setPageState({ status: "loading" });

    const result = await getDashboard(id);

    if (!result.success) {
      setPageState({ status: "error", message: result.error });
      return;
    }

    setPageState({ status: "success", data: result.data });
  }, []);

  useEffect(() => {
    if (!homeId) {
      return;
    }

    fetchDashboard(homeId);
  }, [homeId, fetchDashboard]);

  if (!homeId) {
    return <EmptyState />;
  }

  if (pageState.status === "loading" || pageState.status === "idle") {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <DashboardSkeleton />
      </div>
    );
  }

  if (pageState.status === "error") {
    return (
      <ErrorBanner
        message={pageState.message}
        onRetry={() => fetchDashboard(homeId)}
      />
    );
  }

  const { data } = pageState;

  return (
    <div className="flex flex-col gap-4">
      <AnomalyAlert anomalies={data.anomalies} />
      <EnergyOverview data={data} />
      <EvnTierProgress evnTier={data.evnTier} totalKwh={data.totalMonthlyKwh} />
      <TopConsumersChart consumers={data.topConsumers} />
      <MonthComparison comparison={data.comparison} />
      <Co2TreeVisual co2={data.co2} />
      <div className="flex flex-col gap-2">
        <Button asChild>
          <Link href={NAV_ROUTES.CHAT}>
            {DASHBOARD_LABELS.CTA_VIEW_SUGGESTIONS}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={NAV_ROUTES.SIMULATOR}>
            {DASHBOARD_LABELS.CTA_SIMULATE}
          </Link>
        </Button>
      </div>
    </div>
  );
}
