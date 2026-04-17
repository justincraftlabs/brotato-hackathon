"use client";

import { Lightbulb, Loader2, Sliders } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ApplianceAdjuster } from "@/components/simulator/ApplianceAdjuster";
import { ComparisonBar } from "@/components/simulator/ComparisonBar";
import { ImpactSummary } from "@/components/simulator/ImpactSummary";
import { RoomAccordionItem } from "@/components/savings/RoomAccordionItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

/* ---------- Simulation helpers ---------- */

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
      totalKwh += calculateMonthlyKwh(effectiveWattage, hours);
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
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 py-20">
      <div className="rounded-2xl bg-primary/10 p-6">
        <Lightbulb className="h-12 w-12 text-primary" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold">{t.SUGGESTIONS_NO_HOME_TITLE}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.SUGGESTIONS_NO_HOME_MESSAGE}
        </p>
      </div>
      <Button asChild size="lg" className="rounded-xl px-8">
        <Link href={NAV_ROUTES.SETUP}>{t.SUGGESTIONS_NO_HOME_CTA}</Link>
      </Button>
    </div>
  );
}

/* ---------- Page ---------- */

export default function TipsPage() {
  const t = useT();
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);

  // Suggestions state
  const [suggestionsState, setSuggestionsState] =
    useState<SuggestionsState>(INITIAL_SUGGESTIONS);

  // Simulator state
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">
          {t.TIPS_PAGE_TITLE}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.TIPS_PAGE_SUBTITLE}
        </p>
      </div>

      <Tabs defaultValue={TAB_SUGGESTIONS}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value={TAB_SUGGESTIONS} className="flex-1 gap-1.5 sm:flex-initial">
            <Lightbulb className="h-4 w-4" />
            {t.TIPS_TAB_SUGGESTIONS}
          </TabsTrigger>
          <TabsTrigger value={TAB_SIMULATOR} className="flex-1 gap-1.5 sm:flex-initial">
            <Sliders className="h-4 w-4" />
            {t.TIPS_TAB_SIMULATOR}
          </TabsTrigger>
        </TabsList>

        {/* Suggestions Tab */}
        <TabsContent value={TAB_SUGGESTIONS} className="mt-4">
          <SuggestionsContent
            state={suggestionsState}
            homeId={homeId}
            onRefresh={() => fetchSuggestions(homeId, true)}
            t={t}
          />
        </TabsContent>

        {/* Simulator Tab */}
        <TabsContent value={TAB_SIMULATOR} className="mt-4">
          <SimulatorContent
            homeState={homeState}
            adjustments={adjustments}
            onAdjust={handleAdjust}
            onReset={handleReset}
            homeId={homeId}
            onRetry={() => fetchHome(homeId)}
            t={t}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- Suggestions Tab Content ---------- */

interface SuggestionsContentProps {
  state: SuggestionsState;
  homeId: string;
  onRefresh: () => void;
  t: Translations;
}

function SuggestionsContent({
  state,
  homeId,
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
      <Card className="border-destructive shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm font-semibold text-destructive">
            {t.SUGGESTIONS_ERROR_TITLE}
          </p>
          <p className="text-xs text-muted-foreground">{state.message}</p>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            {t.SUGGESTIONS_RETRY}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { data } = state;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Card className="flex-1 border-primary bg-primary/10 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              {t.SUGGESTIONS_TOTAL_SAVINGS}
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatVnd(data.grandTotalSavingsVnd)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatKwh(data.grandTotalSavingsKwh)}
            </p>
          </CardContent>
        </Card>
        <Button
          variant="outline"
          size="sm"
          className="ml-4 shrink-0"
          onClick={onRefresh}
        >
          {t.SUGGESTIONS_ANALYZE_BUTTON}
        </Button>
      </div>

      {data.rooms.map((room, index) => (
        <RoomAccordionItem
          key={`room-${index}`}
          room={room}
          defaultOpen={index === FIRST_ROOM_INDEX}
          t={t}
        />
      ))}
    </div>
  );
}

/* ---------- Simulator Tab Content ---------- */

interface SimulatorContentProps {
  homeState: HomeState;
  adjustments: Record<string, ApplianceAdjustment>;
  onAdjust: (applianceId: string, adjustment: ApplianceAdjustment) => void;
  onReset: () => void;
  homeId: string;
  onRetry: () => void;
  t: Translations;
}

function SimulatorContent({
  homeState,
  adjustments,
  onAdjust,
  onReset,
  onRetry,
  t,
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
      <Card className="border-destructive shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm font-semibold text-destructive">
            {t.SIMULATOR_ERROR_TITLE}
          </p>
          <p className="text-xs text-muted-foreground">{homeState.message}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t.SIMULATOR_RETRY}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { data: homeData } = homeState;
  const original = calculateOriginal(homeData);
  const adjusted = recalculate(homeData, adjustments);

  const savingsKwh = original.totalKwh - adjusted.totalKwh;
  const savingsVnd = original.totalCost - adjusted.totalCost;
  const savingsCo2Kg = original.totalCo2Kg - adjusted.totalCo2Kg;

  return (
    <div className="flex flex-col gap-4">
      <ImpactSummary
        savingsKwh={savingsKwh}
        savingsVnd={savingsVnd}
        savingsCo2Kg={savingsCo2Kg}
      />
      <ApplianceAdjuster
        rooms={homeData.rooms}
        adjustments={adjustments}
        onAdjust={onAdjust}
      />
      <ComparisonBar
        originalCost={original.totalCost}
        adjustedCost={adjusted.totalCost}
        originalCo2={original.totalCo2Kg}
        adjustedCo2={adjusted.totalCo2Kg}
        onReset={onReset}
      />
    </div>
  );
}
