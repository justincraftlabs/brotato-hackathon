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
import { useT } from "@/hooks/use-t";
import { getHome } from "@/lib/api";
import {
  calculateCo2,
  calculateMonthlyCost,
  calculateMonthlyKwh,
  calculateTemperatureFactor,
} from "@/lib/calculations";
import { LOCAL_STORAGE_HOME_ID_KEY, NAV_ROUTES } from "@/lib/constants";
import type { Translations } from "@/lib/translations";
import type { Home } from "@/lib/types";

interface ApplianceAdjustment {
  newDailyHours?: number;
  newTemperature?: number;
  standbyOff?: boolean;
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
const STANDBY_HOURS_PER_DAY = 24;
const STANDBY_DAYS_PER_MONTH = 30;

function calcStandbyKwh(standbyWattage: number): number {
  return (standbyWattage / 1000) * STANDBY_HOURS_PER_DAY * STANDBY_DAYS_PER_MONTH;
}

function recalculateSimulation(
  homeData: Home,
  adjustments: Record<string, ApplianceAdjustment>
): SimulationSnapshot {
  let totalKwh = 0;

  for (const room of homeData.rooms) {
    for (const appliance of room.appliances) {
      const adj = adjustments[appliance.id];
      const hours = adj?.newDailyHours ?? appliance.dailyUsageHours;
      const tempFactor =
        adj?.newTemperature !== undefined
          ? calculateTemperatureFactor(appliance.type, adj.newTemperature)
          : 1;
      const effectiveWattage = appliance.wattage * tempFactor;
      const activeKwh = calculateMonthlyKwh(effectiveWattage, hours);
      const standbyKwh = adj?.standbyOff ? 0 : calcStandbyKwh(appliance.standbyWattage);
      totalKwh += activeKwh + standbyKwh;
    }
  }

  const totalCost = calculateMonthlyCost(totalKwh);
  const totalCo2Kg = calculateCo2(totalKwh);

  return { totalKwh, totalCost, totalCo2Kg };
}

function calculateOriginalSnapshot(homeData: Home): SimulationSnapshot {
  return recalculateSimulation(homeData, {});
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

interface EmptyStateProps {
  t: Translations;
}

function EmptyState({ t }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-lg font-semibold">
          {t.SIMULATOR_EMPTY_STATE_TITLE}
        </p>
        <p className="text-sm text-muted-foreground">
          {t.SIMULATOR_EMPTY_STATE_MESSAGE}
        </p>
        <Button asChild>
          <Link href={NAV_ROUTES.SETUP}>
            {t.SIMULATOR_EMPTY_STATE_CTA}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  t: Translations;
}

function ErrorBanner({ message, onRetry, t }: ErrorBannerProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm font-semibold text-destructive">
          {t.SIMULATOR_ERROR_TITLE}
        </p>
        <p className="text-xs text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t.SIMULATOR_RETRY}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SimulatorPage() {
  const t = useT();
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
    return <EmptyState t={t} />;
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
        t={t}
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
    <div className="pb-4">
      {/* ── Desktop: sticky left panel + scrollable right ── */}
      <div className="hidden lg:flex lg:flex-row lg:items-start lg:gap-6">
        {/* Left sticky panel */}
        <div className="sticky top-0 flex w-72 shrink-0 flex-col gap-4 xl:w-80">
          <ImpactSummary
            savingsKwh={savingsKwh}
            savingsVnd={savingsVnd}
            savingsCo2Kg={savingsCo2Kg}
            originalKwh={original.totalKwh}
            originalCost={original.totalCost}
            originalCo2={original.totalCo2Kg}
          />
          <ComparisonBar
            originalCost={original.totalCost}
            adjustedCost={adjusted.totalCost}
            originalCo2={original.totalCo2Kg}
            adjustedCo2={adjusted.totalCo2Kg}
            onReset={handleReset}
          />
        </div>

        {/* Right scrollable content */}
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">
              {t.SIMULATOR_PAGE_TITLE}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.TIPS_PAGE_SUBTITLE}
            </p>
          </div>
          <ApplianceAdjuster
            rooms={homeData.rooms}
            adjustments={adjustments}
            onAdjust={handleAdjust}
          />
        </div>
      </div>

      {/* ── Mobile: stacked layout ── */}
      <div className="flex flex-col gap-4 lg:hidden">
        <ImpactSummary
          savingsKwh={savingsKwh}
          savingsVnd={savingsVnd}
          savingsCo2Kg={savingsCo2Kg}
          originalKwh={original.totalKwh}
          originalCost={original.totalCost}
          originalCo2={original.totalCo2Kg}
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
    </div>
  );
}
