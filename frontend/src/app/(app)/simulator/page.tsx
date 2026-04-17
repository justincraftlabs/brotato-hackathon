"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ApplianceAdjuster } from "@/components/simulator/ApplianceAdjuster";
import { ComparisonBar } from "@/components/simulator/ComparisonBar";
import { ImpactSummary } from "@/components/simulator/ImpactSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getHome } from "@/lib/api";
import {
  calculateCo2,
  calculateMonthlyCost,
  calculateMonthlyKwh,
} from "@/lib/calculations";
import { LOCAL_STORAGE_HOME_ID_KEY, NAV_ROUTES } from "@/lib/constants";
import { SIMULATOR_LABELS } from "@/lib/simulator-constants";
import type { Home } from "@/lib/types";

interface ApplianceAdjustment {
  newDailyHours?: number;
  newTemperature?: number;
}

interface SimulationSnapshot {
  totalKwh: number;
  totalCost: number;
  totalCo2Kg: number;
}

type PageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Home };

const INITIAL_STATE: PageState = { status: "idle" };
const SKELETON_COUNT = 3;

function recalculateSimulation(
  homeData: Home,
  adjustments: Record<string, ApplianceAdjustment>
): SimulationSnapshot {
  let totalKwh = 0;

  for (const room of homeData.rooms) {
    for (const appliance of room.appliances) {
      const adj = adjustments[appliance.id];
      const hours = adj?.newDailyHours ?? appliance.dailyUsageHours;
      const kwh = calculateMonthlyKwh(appliance.wattage, hours);
      totalKwh += kwh;
    }
  }

  const totalCost = calculateMonthlyCost(totalKwh);
  const totalCo2Kg = calculateCo2(totalKwh);

  return { totalKwh, totalCost, totalCo2Kg };
}

function calculateOriginalSnapshot(homeData: Home): SimulationSnapshot {
  let totalKwh = 0;

  for (const room of homeData.rooms) {
    for (const appliance of room.appliances) {
      totalKwh += calculateMonthlyKwh(
        appliance.wattage,
        appliance.dailyUsageHours
      );
    }
  }

  const totalCost = calculateMonthlyCost(totalKwh);
  const totalCo2Kg = calculateCo2(totalKwh);

  return { totalKwh, totalCost, totalCo2Kg };
}

function SimulatorSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-3">
            <div className="h-20 animate-pulse rounded bg-muted" />
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
          {SIMULATOR_LABELS.EMPTY_STATE_TITLE}
        </p>
        <p className="text-sm text-muted-foreground">
          {SIMULATOR_LABELS.EMPTY_STATE_MESSAGE}
        </p>
        <Button asChild>
          <Link href={NAV_ROUTES.SETUP}>
            {SIMULATOR_LABELS.EMPTY_STATE_CTA}
          </Link>
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
          {SIMULATOR_LABELS.ERROR_TITLE}
        </p>
        <p className="text-xs text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {SIMULATOR_LABELS.RETRY}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SimulatorPage() {
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const [pageState, setPageState] = useState<PageState>(INITIAL_STATE);
  const [adjustments, setAdjustments] = useState<
    Record<string, ApplianceAdjustment>
  >({});

  const fetchHomeData = useCallback(async (id: string) => {
    setPageState({ status: "loading" });

    const result = await getHome(id);

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
    fetchHomeData(homeId);
  }, [homeId, fetchHomeData]);

  const handleAdjust = useCallback(
    (applianceId: string, adjustment: ApplianceAdjustment) => {
      setAdjustments((prev) => ({
        ...prev,
        [applianceId]: adjustment,
      }));
    },
    []
  );

  const handleReset = useCallback(() => {
    setAdjustments({});
  }, []);

  if (!homeId) {
    return <EmptyState />;
  }

  if (pageState.status === "loading" || pageState.status === "idle") {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <SimulatorSkeleton />
      </div>
    );
  }

  if (pageState.status === "error") {
    return (
      <ErrorBanner
        message={pageState.message}
        onRetry={() => fetchHomeData(homeId)}
      />
    );
  }

  const { data: homeData } = pageState;
  const original = calculateOriginalSnapshot(homeData);
  const adjusted = recalculateSimulation(homeData, adjustments);

  const savingsKwh = original.totalKwh - adjusted.totalKwh;
  const savingsVnd = original.totalCost - adjusted.totalCost;
  const savingsCo2Kg = original.totalCo2Kg - adjusted.totalCo2Kg;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <ImpactSummary
        savingsKwh={savingsKwh}
        savingsVnd={savingsVnd}
        savingsCo2Kg={savingsCo2Kg}
      />

      <ApplianceAdjuster
        rooms={homeData.rooms}
        adjustments={adjustments}
        onAdjust={handleAdjust}
      />

      <ComparisonBar
        originalCost={original.totalCost}
        adjustedCost={adjusted.totalCost}
        originalCo2={original.totalCo2Kg}
        adjustedCo2={adjusted.totalCo2Kg}
        onReset={handleReset}
      />
    </div>
  );
}
