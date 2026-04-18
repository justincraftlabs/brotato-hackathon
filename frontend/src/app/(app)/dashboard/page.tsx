"use client";

import {
  ArrowUpRight,
  DollarSign,
  Gauge,
  Home,
  Leaf,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { AnomalyAlert } from "@/components/dashboard/AnomalyAlert";
import { CarbonWaterfallChart } from "@/components/dashboard/CarbonWaterfallChart";
import { Co2TreeVisual } from "@/components/dashboard/Co2TreeVisual";
import { EfficiencyGauge } from "@/components/dashboard/EfficiencyGauge";
import { EvnTierProgress } from "@/components/dashboard/EvnTierProgress";
import { FixedBottomActions } from "@/components/dashboard/FixedBottomActions";
import { MonthComparison } from "@/components/dashboard/MonthComparison";
import { MonthlyBillProjection } from "@/components/dashboard/MonthlyBillProjection";
import { RoomEnergyHeatmap } from "@/components/dashboard/RoomEnergyHeatmap";
import { SavingsCounter } from "@/components/dashboard/SavingsCounter";
import { SavingsForecastChart } from "@/components/dashboard/SavingsForecastChart";
import { TopConsumersChart } from "@/components/dashboard/TopConsumersChart";
import { VampireAppliances } from "@/components/dashboard/VampireAppliances";
import { WasteHotspotChart } from "@/components/dashboard/WasteHotspotChart";
import { Button } from "@/components/ui/button";
import { AnimatedCounter, CrossFade, FadeSlide, StaggerList } from "@/components/ui/motion";
import { SkeletonChart, SkeletonStatCard } from "@/components/ui/skeleton";
import { useT } from "@/hooks/use-t";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LOCAL_STORAGE_HOME_ID_KEY, NAV_ROUTES } from "@/lib/constants";
import { getDashboard } from "@/lib/api";
import { formatCo2, formatKwh, formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/lib/types";
import type { Translations } from "@/lib/translations";

type PageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: DashboardData };

const INITIAL_STATE: PageState = { status: "idle" };
const SKELETON_COUNT = 4;

/* ---------- Dot Plot (empty state preview charts) ---------- */

interface MiniDotChartProps {
  color: string;
  heights: number[];
}

function MiniDotChart({ color, heights }: MiniDotChartProps) {
  const maxH = Math.max(...heights);
  return (
    <div className="flex items-end gap-1.5" style={{ height: `${maxH * 14}px` }}>
      {heights.map((h, colIdx) => (
        <div key={colIdx} className="flex flex-col-reverse gap-1.5">
          {Array.from({ length: h }).map((_, dotIdx) => (
            <span
              key={dotIdx}
              className={`block h-2 w-2 rounded-full ${color}`}
              style={{ opacity: 0.55 + (dotIdx / h) * 0.35 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const PREVIEW_CHART_DEFS = [
  { key: "electricity" as const, color: "bg-chart-1", heights: [1, 2, 2, 3, 4, 5, 6] },
  { key: "cost" as const, color: "bg-chart-2", heights: [1, 1, 2, 3, 3, 4, 5] },
  { key: "co2" as const, color: "bg-chart-3", heights: [1, 2, 2, 2, 3, 4, 4] },
];

/* ---------- Stat Card ---------- */

type StatVariant = "primary" | "default";

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle: string;
  icon: ReactNode;
  variant?: StatVariant;
}

const VARIANT_PRIMARY: StatVariant = "primary";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}: StatCardProps) {
  const isPrimary = variant === VARIANT_PRIMARY;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl p-4 card-hover-glow",
        isPrimary ? "stat-card-primary" : "glass"
      )}
    >
      <div className="flex items-start justify-between">
        <p
          className={cn(
            "text-xs font-medium",
            isPrimary ? "text-white/80" : "text-muted-foreground"
          )}
        >
          {title}
        </p>
        <div
          className={cn(
            "rounded-lg p-1.5",
            isPrimary ? "bg-white/15" : "bg-primary/10"
          )}
        >
          <span className={isPrimary ? "text-white/90" : "text-primary"}>
            {icon}
          </span>
        </div>
      </div>
      <p className={cn("mt-2 text-xl font-bold sm:text-2xl", isPrimary && "text-white")}>
        {value}
      </p>
      <div className="mt-1 flex items-center gap-1 text-xs">
        <ArrowUpRight
          className={cn(
            "h-3 w-3 shrink-0",
            isPrimary ? "text-white/60" : "text-primary"
          )}
        />
        <span
          className={cn(
            "truncate",
            isPrimary ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
}

/* ---------- Empty State ---------- */

interface EmptyStateProps {
  t: Translations;
}

function EmptyState({ t }: EmptyStateProps) {
  const previewCharts = [
    { label: t.DASHBOARD_PREVIEW_ELECTRICITY, color: "bg-chart-1", heights: PREVIEW_CHART_DEFS[0].heights },
    { label: t.DASHBOARD_TOTAL_COST, color: "bg-chart-2", heights: PREVIEW_CHART_DEFS[1].heights },
    { label: t.DASHBOARD_PREVIEW_CO2_KG, color: "bg-chart-3", heights: PREVIEW_CHART_DEFS[2].heights },
  ];

  const previewRoomTags = [
    t.ROOM_TYPE_LABELS.living_room,
    t.ROOM_TYPE_LABELS.bedroom,
    t.ROOM_TYPE_LABELS.kitchen,
    t.ROOM_TYPE_LABELS.bathroom,
  ];

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader t={t} />

      {/* Preview: dot-plot charts like EcoHeart Analytics */}
      <div className="glass rounded-2xl p-5 mb-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t.DASHBOARD_PREVIEW_SECTION_LABEL}
        </p>
        <div className="grid grid-cols-3 gap-6">
          {previewCharts.map((chart) => (
            <div key={chart.label}>
              <p className="mb-3 text-xs text-muted-foreground">{chart.label}</p>
              <MiniDotChart color={chart.color} heights={chart.heights} />
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {previewRoomTags.map((room) => (
            <span
              key={room}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {room}
            </span>
          ))}
          <span className="rounded-full border border-dashed border-primary/40 px-3 py-1 text-xs text-primary/70">
            {t.DASHBOARD_PREVIEW_ADD_ROOM}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 py-8 text-center">
        <div className="rounded-2xl bg-primary/10 p-5 ring-1 ring-primary/20">
          <Home className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t.DASHBOARD_SETUP_TITLE}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.DASHBOARD_SETUP_DESCRIPTION}
          </p>
        </div>
        <Button asChild size="lg" className="btn-primary-gradient w-full rounded-xl">
          <Link href={NAV_ROUTES.SETUP}>{t.DASHBOARD_SETUP_CTA}</Link>
        </Button>
      </div>
    </div>
  );
}

/* ---------- Page Header ---------- */

interface PageHeaderProps {
  t: Translations;
}

function PageHeader({ t }: PageHeaderProps) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold lg:text-2xl">
        {t.DASHBOARD_PAGE_TITLE}
      </h1>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {t.DASHBOARD_PAGE_SUBTITLE}
      </p>
    </div>
  );
}

/* ---------- Skeleton ---------- */

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <SkeletonChart height={180} />
        <SkeletonChart height={180} />
      </div>
    </div>
  );
}

/* ---------- Error ---------- */

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  t: Translations;
}

function ErrorBanner({ message, onRetry, t }: ErrorBannerProps) {
  return (
    <div className="glass rounded-2xl border border-destructive/40 p-8 text-center">
      <p className="text-sm font-semibold text-destructive">
        {t.DASHBOARD_ERROR_TITLE}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        {t.DASHBOARD_RETRY}
      </Button>
    </div>
  );
}

/* ---------- Dashboard Content ---------- */

interface DashboardContentProps {
  homeId: string;
  data: DashboardData;
  t: Translations;
}

function DashboardContent({ homeId, data, t }: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Stat Cards — 2×2 on mobile, 4-col on lg */}
      <StaggerList className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <FadeSlide className="h-full">
          <StatCard
            title={t.DASHBOARD_TOTAL_KWH}
            value={<AnimatedCounter value={data.totalMonthlyKwh} format={formatKwh} />}
            subtitle={t.STAT_THIS_MONTH}
            icon={<Zap className="h-4 w-4" />}
            variant="primary"
          />
        </FadeSlide>
        <FadeSlide className="h-full">
          <StatCard
            title={t.DASHBOARD_TOTAL_COST}
            value={<AnimatedCounter value={data.totalMonthlyCost} format={formatVnd} />}
            subtitle={t.STAT_THIS_MONTH}
            icon={<DollarSign className="h-4 w-4" />}
          />
        </FadeSlide>
        <FadeSlide className="h-full">
          <StatCard
            title={t.DASHBOARD_TOTAL_CO2}
            value={<AnimatedCounter value={data.co2.totalKg} format={formatCo2} />}
            subtitle={t.STAT_THIS_MONTH}
            icon={<Leaf className="h-4 w-4" />}
          />
        </FadeSlide>
        <FadeSlide className="h-full">
          <StatCard
            title={t.DASHBOARD_EVN_TIER_PREFIX}
            value={`${t.DASHBOARD_EVN_TIER_PREFIX} ${data.evnTier}`}
            subtitle={t.STAT_THIS_MONTH}
            icon={<Gauge className="h-4 w-4" />}
          />
        </FadeSlide>
      </StaggerList>

      {/* Anomaly Alert */}
      <AnomalyAlert anomalies={data.anomalies} />

      {/* Charts Grid — 1-col → 2-col at md */}
      <StaggerList className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
        <FadeSlide className="h-full"><TopConsumersChart consumers={data.topConsumers} /></FadeSlide>
        <FadeSlide className="h-full">
          <VampireAppliances
            vampireData={data.vampireData}
            totalMonthlyKwh={data.totalMonthlyKwh}
          />
        </FadeSlide>
        <FadeSlide className="h-full">
          <WasteHotspotChart
            consumers={data.topConsumers}
            totalMonthlyCost={data.totalMonthlyCost}
          />
        </FadeSlide>
        <FadeSlide className="h-full"><SavingsForecastChart monthlyCost={data.totalMonthlyCost} /></FadeSlide>

        {/* Row: Room heatmap + Bill projection */}
        <FadeSlide className="h-full">
          <RoomEnergyHeatmap roomStats={data.roomStats} />
        </FadeSlide>
        <FadeSlide className="h-full">
          <MonthlyBillProjection totalMonthlyCost={data.totalMonthlyCost} />
        </FadeSlide>

        {/* Row: Stat cluster + Eco Score */}
        <FadeSlide className="h-full">
          <div className="flex h-full flex-col gap-4">
            <MonthComparison comparison={data.comparison} />
            <EvnTierProgress evnTier={data.evnTier} totalKwh={data.totalMonthlyKwh} />
            <Co2TreeVisual co2={data.co2} />
          </div>
        </FadeSlide>
        <FadeSlide className="h-full">
          <EfficiencyGauge
            evnTier={data.evnTier}
            percentDifference={data.comparison.percentDifference}
          />
        </FadeSlide>

        <FadeSlide className="md:col-span-2">
          <SavingsCounter homeId={homeId} />
        </FadeSlide>
        <FadeSlide className="md:col-span-2">
          <CarbonWaterfallChart co2TotalKg={data.co2.totalKg} consumers={data.topConsumers} />
        </FadeSlide>
      </StaggerList>
    </div>
  );
}

/* ---------- Page ---------- */

export default function DashboardPage() {
  const t = useT();
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
    return <EmptyState t={t} />;
  }

  const crossFadeKey =
    pageState.status === "loading" || pageState.status === "idle"
      ? "skeleton"
      : pageState.status;

  return (
    // pb-24 mobile: clears BottomNav (64px) + ActionBar (~60px); pb-20 desktop: clears ActionBar only
    <div className="flex flex-col gap-4 pb-24 lg:pb-20">
      <PageHeader t={t} />
      <CrossFade stateKey={crossFadeKey}>
        {(pageState.status === "loading" || pageState.status === "idle") && (
          <DashboardSkeleton />
        )}
        {pageState.status === "error" && (
          <ErrorBanner
            message={pageState.message}
            onRetry={() => fetchDashboard(homeId)}
            t={t}
          />
        )}
        {pageState.status === "success" && (
          <DashboardContent homeId={homeId} data={pageState.data} t={t} />
        )}
      </CrossFade>

      {pageState.status === "success" && (
        <FixedBottomActions
          tipsLabel={t.DASHBOARD_CTA_VIEW_SUGGESTIONS}
          simulateLabel={t.DASHBOARD_CTA_SIMULATE}
          tipsHref={NAV_ROUTES.TIPS}
          simulateHref={NAV_ROUTES.SIMULATOR}
        />
      )}
    </div>
  );
}
