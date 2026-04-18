"use client";

import { Activity, Lightbulb, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { RoomAccordionItem } from "@/components/savings/RoomAccordionItem";
import { ApplianceAdjuster } from "@/components/simulator/ApplianceAdjuster";
import { ComparisonBar } from "@/components/simulator/ComparisonBar";
import { ImpactSummary } from "@/components/simulator/ImpactSummary";
import { ActivateAllButton } from "@/components/recommendations/ActivateAllButton";
import { IotSuggestionsPanel } from "@/components/tips/IotSuggestionsPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useT } from "@/hooks/use-t";
import { getHome, getSavingsSuggestions } from "@/lib/api";
import {
  calculateCo2,
  calculateMonthlyCost,
  calculateMonthlyKwh,
  calculateTemperatureFactor,
} from "@/lib/calculations";
import { LOCAL_STORAGE_HOME_ID_KEY, NAV_ROUTES } from "@/lib/constants";
import { formatKwh, formatVnd } from "@/lib/format";
import type { Translations } from "@/lib/translations";
import type { ActivateAllItem, Home, SavingsSuggestionsResult } from "@/lib/types";
import { useSchedules } from "@/contexts/schedules-context";

/* ---------- Types ---------- */

type SuggestionsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: SavingsSuggestionsResult };

type HomeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Home };

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

const INITIAL_SUGGESTIONS: SuggestionsState = { status: "idle" };
const INITIAL_HOME: HomeState = { status: "idle" };
const TAB_SUGGESTIONS = "suggestions";
const TAB_SIMULATOR = "simulator";
const FIRST_ROOM_INDEX = 0;
const STANDBY_HOURS_PER_DAY = 24;
const STANDBY_DAYS_PER_MONTH = 30;
const SKELETON_COUNT = 3;

/* ---------- Simulator helpers ---------- */

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

  return {
    totalKwh,
    totalCost: calculateMonthlyCost(totalKwh),
    totalCo2Kg: calculateCo2(totalKwh),
  };
}

/* ---------- Shared UI ---------- */

function NoHomeState({ t }: { t: Translations }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 py-20 text-center">
      <div className="rounded-2xl bg-primary/10 p-5 ring-1 ring-primary/20">
        <Lightbulb className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-bold">{t.SUGGESTIONS_NO_HOME_TITLE}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.SUGGESTIONS_NO_HOME_MESSAGE}
        </p>
      </div>
      <Button asChild size="lg" className="btn-primary-gradient w-full rounded-xl">
        <Link href={NAV_ROUTES.SETUP}>{t.SUGGESTIONS_NO_HOME_CTA}</Link>
      </Button>
    </div>
  );
}

/* ---------- Suggestions skeleton ---------- */

const SKELETON_ROOM_COUNT = 3;

function SuggestionsSkeletonLoader() {
  return (
    <div className="flex flex-col gap-4">
      <div className="stat-card-primary rounded-2xl p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-28 rounded-md bg-white/20" />
            <Skeleton className="h-8 w-36 rounded-lg bg-white/25" />
            <Skeleton className="h-3 w-20 rounded-md bg-white/15" />
          </div>
          <Skeleton className="mt-0.5 h-7 w-7 rounded-lg bg-white/20" />
        </div>
      </div>
      {Array.from({ length: SKELETON_ROOM_COUNT }).map((_, i) => (
        <div key={i} className="glass rounded-2xl border border-border/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-4 w-4 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Simulator skeleton ---------- */

function SimulatorSkeletonLoader() {
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

/* ---------- Suggestions Content ---------- */

interface SuggestionsContentProps {
  state: SuggestionsState;
  homeId: string;
  onRefresh: () => void;
  t: Translations;
}

function SuggestionsContent({ state, homeId, onRefresh, t }: SuggestionsContentProps) {
  const { activatedKeys } = useSchedules();

  const handleDeviceActivated = useCallback(
    (_roomName: string, _applianceName: string, _item: ActivateAllItem) => {
      // activate is called inside DeviceSuggestionCard via context
    },
    []
  );

  if (state.status === "loading" || state.status === "idle") {
    return <SuggestionsSkeletonLoader />;
  }

  if (state.status === "error") {
    return (
      <div className="glass rounded-2xl border border-destructive/40 p-6 text-center">
        <p className="text-sm font-semibold text-destructive">
          {t.SUGGESTIONS_ERROR_TITLE}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{state.message}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onRefresh}>
          {t.SUGGESTIONS_RETRY}
        </Button>
      </div>
    );
  }

  const { data } = state;

  const activateItems: ActivateAllItem[] = data.rooms.flatMap((room) =>
    room.devices.map((device) => ({
      applianceName: device.applianceName,
      roomName: room.roomName,
      type: "behavior" as const,
      title: device.tip,
      savingsKwh: device.savingsKwh,
      savingsVnd: device.savingsVnd,
    }))
  );

  const pendingItems = activateItems.filter(
    (item) => !activatedKeys.has(`${item.roomName}:${item.applianceName}`)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="stat-card-primary rounded-2xl p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-white/70">{t.SUGGESTIONS_TOTAL_SAVINGS}</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatVnd(data.grandTotalSavingsVnd)}
            </p>
            <p className="text-sm text-white/60">
              {formatKwh(data.grandTotalSavingsKwh)}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            title={t.SUGGESTIONS_ANALYZE_BUTTON}
            className="mt-0.5 rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ActivateAllButton
        homeId={homeId}
        items={pendingItems}
        totalActivated={activatedKeys.size}
      />

      {data.rooms.map((room, index) => (
        <RoomAccordionItem
          key={`room-${index}`}
          room={room}
          homeId={homeId}
          activatedKeys={activatedKeys}
          onActivated={handleDeviceActivated}
          defaultOpen={index === FIRST_ROOM_INDEX}
          t={t}
        />
      ))}
    </div>
  );
}

/* ---------- Tab 1: Tips + IoT ---------- */

interface TipsTabContentProps {
  suggestionsState: SuggestionsState;
  homeData: Home | null;
  homeId: string;
  iotLoading: boolean;
  onRefresh: () => void;
  t: Translations;
}

function TipsTabContent({
  suggestionsState,
  homeData,
  homeId,
  iotLoading,
  onRefresh,
  t,
}: TipsTabContentProps) {
  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-6">
      {/* Suggestions column */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t.TIPS_TAB_SUGGESTIONS}
          </h2>
        </div>
        <SuggestionsContent
          state={suggestionsState}
          homeId={homeId}
          onRefresh={onRefresh}
          t={t}
        />
      </div>

      {/* IoT column */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tự động hóa IoT
          </h2>
        </div>
        <IotSuggestionsPanel home={homeData} loading={iotLoading} />
      </div>
    </div>
  );
}

/* ---------- Tab 2: Simulator ---------- */

interface SimulatorTabContentProps {
  homeData: Home | null;
  homeLoading: boolean;
  homeError: string | null;
  onRetry: () => void;
  t: Translations;
}

function SimulatorTabContent({
  homeData,
  homeLoading,
  homeError,
  onRetry,
  t,
}: SimulatorTabContentProps) {
  const [adjustments, setAdjustments] = useState<Record<string, ApplianceAdjustment>>({});

  const handleAdjust = useCallback(
    (applianceId: string, adjustment: ApplianceAdjustment) => {
      setAdjustments((prev) => ({ ...prev, [applianceId]: adjustment }));
    },
    []
  );

  const handleReset = useCallback(() => setAdjustments({}), []);

  if (homeLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <SimulatorSkeletonLoader />
      </div>
    );
  }

  if (homeError) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm font-semibold text-destructive">
            {t.SIMULATOR_ERROR_TITLE}
          </p>
          <p className="text-xs text-muted-foreground">{homeError}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t.SIMULATOR_RETRY}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!homeData) return <SimulatorSkeletonLoader />;

  const original = recalculateSimulation(homeData, {});
  const adjusted = recalculateSimulation(homeData, adjustments);
  const savingsKwh = original.totalKwh - adjusted.totalKwh;
  const savingsVnd = original.totalCost - adjusted.totalCost;
  const savingsCo2Kg = original.totalCo2Kg - adjusted.totalCo2Kg;

  return (
    <div className="pb-4">
      {/* Desktop: sticky left + scrollable right */}
      <div className="hidden lg:flex lg:flex-row lg:items-start lg:gap-6">
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
        <div className="flex flex-1 flex-col gap-4">
          <ApplianceAdjuster
            rooms={homeData.rooms}
            adjustments={adjustments}
            onAdjust={handleAdjust}
          />
        </div>
      </div>

      {/* Mobile: stacked */}
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

/* ---------- Page ---------- */

export default function TipsPage() {
  const t = useT();
  const router = useRouter();
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const { clearAll } = useSchedules();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") === TAB_SIMULATOR ? TAB_SIMULATOR : TAB_SUGGESTIONS;
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      router.replace(`?tab=${tab}`, { scroll: false });
    },
    [router]
  );

  const [suggestionsState, setSuggestionsState] =
    useState<SuggestionsState>(INITIAL_SUGGESTIONS);
  const [homeState, setHomeState] = useState<HomeState>(INITIAL_HOME);

  const fetchSuggestions = useCallback(async (id: string, forceRefresh: boolean) => {
    setSuggestionsState({ status: "loading" });
    const result = await getSavingsSuggestions(id, forceRefresh);
    if (!result.success) {
      setSuggestionsState({ status: "error", message: result.error });
      return;
    }
    setSuggestionsState({ status: "success", data: result.data });
  }, []);

  const fetchHome = useCallback(async (id: string) => {
    setHomeState({ status: "loading" });
    const result = await getHome(id);
    if (!result.success) {
      setHomeState({ status: "error", message: result.error });
      return;
    }
    setHomeState({ status: "success", data: result.data });
  }, []);

  useEffect(() => {
    if (!homeId) return;
    fetchSuggestions(homeId, false);
    fetchHome(homeId);
  }, [homeId, fetchSuggestions, fetchHome]);

  if (!homeId) {
    return <NoHomeState t={t} />;
  }

  const homeData = homeState.status === "success" ? homeState.data : null;
  const iotLoading = homeState.status === "loading" || homeState.status === "idle";
  const homeLoading = homeState.status === "loading" || homeState.status === "idle";
  const homeError = homeState.status === "error" ? homeState.message : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">{t.TIPS_PAGE_TITLE}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.TIPS_PAGE_SUBTITLE}</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="glass rounded-xl p-1">
          <TabsTrigger
            value={TAB_SUGGESTIONS}
            className="gap-1.5 rounded-lg data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            <Lightbulb className="h-4 w-4" />
            {t.TIPS_TAB_SUGGESTIONS}
          </TabsTrigger>
          <TabsTrigger
            value={TAB_SIMULATOR}
            className="gap-1.5 rounded-lg data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            <Activity className="h-4 w-4" />
            {t.TIPS_TAB_SIMULATOR}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={TAB_SUGGESTIONS} className="mt-4">
          <TipsTabContent
            suggestionsState={suggestionsState}
            homeData={homeData}
            homeId={homeId}
            iotLoading={iotLoading}
            onRefresh={async () => {
              await clearAll();
              fetchSuggestions(homeId, true);
            }}
            t={t}
          />
        </TabsContent>

        <TabsContent value={TAB_SIMULATOR} className="mt-4">
          <SimulatorTabContent
            homeData={homeData}
            homeLoading={homeLoading}
            homeError={homeError}
            onRetry={() => fetchHome(homeId)}
            t={t}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
