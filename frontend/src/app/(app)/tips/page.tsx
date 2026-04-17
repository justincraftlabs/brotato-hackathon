"use client";

import { Lightbulb, Loader2, RotateCcw, Sliders } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ApplianceAdjuster } from "@/components/simulator/ApplianceAdjuster";
import { ComparisonBar } from "@/components/simulator/ComparisonBar";
import { ImpactSummary } from "@/components/simulator/ImpactSummary";
import { RoomAccordionItem } from "@/components/savings/RoomAccordionItem";
import { IotActionCard } from "@/components/chat/IotActionCard";
import { Button } from "@/components/ui/button";
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
import type { Home, SavingsSuggestionsResult } from "@/lib/types";

/* ---------- Types ---------- */

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

const INITIAL_SUGGESTIONS: SuggestionsState = { status: "idle" };
const INITIAL_HOME: HomeState = { status: "idle" };
const TAB_SUGGESTIONS = "suggestions";
const TAB_SIMULATOR = "simulator";
const FIRST_ROOM_INDEX = 0;
const STANDBY_HOURS_PER_DAY = 24;
const STANDBY_DAYS_PER_MONTH = 30;

/* ---------- Simulation helpers ---------- */

function calcStandbyKwh(standbyWattage: number): number {
  return (standbyWattage / 1000) * STANDBY_HOURS_PER_DAY * STANDBY_DAYS_PER_MONTH;
}

function recalculate(
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

function calculateOriginal(homeData: Home): SimulationSnapshot {
  return recalculate(homeData, {});
}

/* ---------- Shared UI ---------- */

interface NoHomeProps {
  t: Translations;
}

function NoHomeState({ t }: NoHomeProps) {
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

/* ---------- Page ---------- */

export default function TipsPage() {
  const t = useT();
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === TAB_SIMULATOR ? TAB_SIMULATOR : TAB_SUGGESTIONS;

  const [suggestionsState, setSuggestionsState] =
    useState<SuggestionsState>(INITIAL_SUGGESTIONS);

  const [homeState, setHomeState] = useState<HomeState>(INITIAL_HOME);
  const [adjustments, setAdjustments] = useState<
    Record<string, ApplianceAdjustment>
  >({});

  const fetchSuggestions = useCallback(
    async (id: string, forceRefresh: boolean) => {
      setSuggestionsState({ status: "loading" });
      const result = await getSavingsSuggestions(id, forceRefresh);
      if (!result.success) {
        setSuggestionsState({ status: "error", message: result.error });
        return;
      }
      setSuggestionsState({ status: "success", data: result.data });
    },
    []
  );

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
    if (!homeId) {
      return;
    }
    fetchSuggestions(homeId, false);
    fetchHome(homeId);
  }, [homeId, fetchSuggestions, fetchHome]);

  const handleAdjust = useCallback(
    (applianceId: string, adjustment: ApplianceAdjustment) => {
      setAdjustments((prev) => ({ ...prev, [applianceId]: adjustment }));
    },
    []
  );

  const handleReset = useCallback(() => {
    setAdjustments({});
  }, []);

  if (!homeId) {
    return <NoHomeState t={t} />;
  }

  // Derive simulator values when home data is ready
  const original =
    homeState.status === "success"
      ? calculateOriginal(homeState.data)
      : null;
  const adjusted =
    homeState.status === "success" && original
      ? recalculate(homeState.data, adjustments)
      : null;

  const savingsKwh = original && adjusted ? original.totalKwh - adjusted.totalKwh : 0;
  const savingsVnd = original && adjusted ? original.totalCost - adjusted.totalCost : 0;
  const savingsCo2Kg = original && adjusted ? original.totalCo2Kg - adjusted.totalCo2Kg : 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">
          {t.TIPS_PAGE_TITLE}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.TIPS_PAGE_SUBTITLE}
        </p>
      </div>

      {/* Mobile: tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue={initialTab}>
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
              <Sliders className="h-4 w-4" />
              {t.TIPS_TAB_SIMULATOR}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={TAB_SUGGESTIONS} className="mt-4">
            <SuggestionsContent
              state={suggestionsState}
              onRefresh={() => fetchSuggestions(homeId, true)}
              t={t}
            />
          </TabsContent>

          <TabsContent value={TAB_SIMULATOR} className="mt-4">
            <SimulatorContent
              homeState={homeState}
              adjustments={adjustments}
              onAdjust={handleAdjust}
              onReset={handleReset}
              onRetry={() => fetchHome(homeId)}
              t={t}
              savingsKwh={savingsKwh}
              savingsVnd={savingsVnd}
              savingsCo2Kg={savingsCo2Kg}
              original={original}
              adjusted={adjusted}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: side-by-side split */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Left — Suggestions */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t.TIPS_TAB_SUGGESTIONS}
            </h2>
          </div>
          <SuggestionsContent
            state={suggestionsState}
            onRefresh={() => fetchSuggestions(homeId, true)}
            t={t}
          />
        </div>

        {/* Right — Simulator */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t.TIPS_TAB_SIMULATOR}
            </h2>
          </div>
          <SimulatorContent
            homeState={homeState}
            adjustments={adjustments}
            onAdjust={handleAdjust}
            onReset={handleReset}
            onRetry={() => fetchHome(homeId)}
            t={t}
            savingsKwh={savingsKwh}
            savingsVnd={savingsVnd}
            savingsCo2Kg={savingsCo2Kg}
            original={original}
            adjusted={adjusted}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Suggestions Tab Content ---------- */

const STANDBY_KEYWORDS = ["standby", "rút phích", "điện chờ", "vô hình", "điện ma", "tiêu thụ ngầm", "hút điện", "kẻ hút"];

function hasAnyStandbyTip(data: SavingsSuggestionsResult): boolean {
  const lower = data.rooms
    .flatMap((r) => r.devices.map((d) => d.tip))
    .join(" ")
    .toLowerCase();
  return STANDBY_KEYWORDS.some((kw) => lower.includes(kw));
}

interface SuggestionsContentProps {
  state: SuggestionsState;
  onRefresh: () => void;
  t: Translations;
}

function SuggestionsContent({
  state,
  onRefresh,
  t,
}: SuggestionsContentProps) {

  if (state.status === "loading" || state.status === "idle") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {t.SUGGESTIONS_ANALYZING}
        </p>
      </div>
    );
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

      {data.rooms.map((room, index) => (
        <RoomAccordionItem
          key={`room-${index}`}
          room={room}
          defaultOpen={index === FIRST_ROOM_INDEX}
          t={t}
        />
      ))}

      {hasAnyStandbyTip(data) && (
        <IotActionCard className="ml-0 mt-0" />
      )}
    </div>
  );
}

/* ---------- Simulator Tab/Column Content ---------- */

interface SimulatorContentProps {
  homeState: HomeState;
  adjustments: Record<string, ApplianceAdjustment>;
  onAdjust: (applianceId: string, adjustment: ApplianceAdjustment) => void;
  onReset: () => void;
  onRetry: () => void;
  t: Translations;
  savingsKwh: number;
  savingsVnd: number;
  savingsCo2Kg: number;
  original: SimulationSnapshot | null;
  adjusted: SimulationSnapshot | null;
}

function SimulatorContent({
  homeState,
  adjustments,
  onAdjust,
  onReset,
  onRetry,
  t,
  savingsKwh,
  savingsVnd,
  savingsCo2Kg,
  original,
  adjusted,
}: SimulatorContentProps) {
  if (homeState.status === "loading" || homeState.status === "idle") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {t.SIMULATOR_LOADING}
        </p>
      </div>
    );
  }

  if (homeState.status === "error") {
    return (
      <div className="glass rounded-2xl border border-destructive/40 p-6 text-center">
        <p className="text-sm font-semibold text-destructive">
          {t.SIMULATOR_ERROR_TITLE}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{homeState.message}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          {t.SIMULATOR_RETRY}
        </Button>
      </div>
    );
  }

  const { data: homeData } = homeState;

  return (
    <div className="flex flex-col gap-4">
      {/* Combined summary card: stats + comparison in one glass card */}
      <div className="glass rounded-2xl border border-border/50">
        <div className="p-3 lg:p-4">
          <ImpactSummary
            savingsKwh={savingsKwh}
            savingsVnd={savingsVnd}
            savingsCo2Kg={savingsCo2Kg}
            originalKwh={original?.totalKwh}
            originalCost={original?.totalCost}
            originalCo2={original?.totalCo2Kg}
            unstyled
          />
        </div>
        <div className="border-t border-border/40 p-3 lg:p-4">
          <ComparisonBar
            originalCost={original?.totalCost ?? 0}
            adjustedCost={adjusted?.totalCost ?? 0}
            originalCo2={original?.totalCo2Kg ?? 0}
            adjustedCo2={adjusted?.totalCo2Kg ?? 0}
            onReset={onReset}
            unstyled
          />
        </div>
      </div>
      <ApplianceAdjuster
        rooms={homeData.rooms}
        adjustments={adjustments}
        onAdjust={onAdjust}
      />
    </div>
  );
}
