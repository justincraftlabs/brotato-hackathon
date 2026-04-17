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
import { EvnTierProgress } from "@/components/dashboard/EvnTierProgress";
import { MonthComparison } from "@/components/dashboard/MonthComparison";
import { SavingsForecastChart } from "@/components/dashboard/SavingsForecastChart";
import { TopConsumersChart } from "@/components/dashboard/TopConsumersChart";
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

const PREVIEW_CHARTS = [
  { label: "Điện (kWh)", color: "bg-chart-1", heights: [1, 2, 2, 3, 4, 5, 6] },
  { label: "Chi phí", color: "bg-chart-2", heights: [1, 1, 2, 3, 3, 4, 5] },
  { label: "CO₂ (kg)", color: "bg-chart-3", heights: [1, 2, 2, 2, 3, 4, 4] },
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
        "relative overflow-hidden rounded-2xl p-5 card-hover-glow",
        isPrimary ? "stat-card-primary" : "glass"
      )}
    >
      <div className="flex items-start justify-between">
        <p
          className={cn(
            "text-sm font-medium",
            isPrimary ? "text-white/80" : "text-muted-foreground"
          )}
        >
          {title}
        </p>
        <div
          className={cn(
            "rounded-xl p-1.5",
            isPrimary ? "bg-white/15" : "bg-primary/10"
          )}
        >
          <span className={isPrimary ? "text-white/90" : "text-primary"}>
            {icon}
          </span>
        </div>
      </div>
      <p className={cn("mt-3 text-3xl font-bold", isPrimary && "text-white")}>
        {value}
      </p>
      <div className="mt-1.5 flex items-center gap-1 text-xs">
        <ArrowUpRight
          className={cn(
            "h-3.5 w-3.5",
            isPrimary ? "text-white/60" : "text-primary"
          )}
        />
        <span
          className={cn(
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

const PREVIEW_ROOM_TAGS = ["Phòng khách", "Phòng ngủ", "Bếp", "Nhà tắm"];

function EmptyState({ t }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader t={t} />

      {/* Preview: dot-plot charts like EcoHeart Analytics */}
      <div className="glass rounded-2xl p-5 mb-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Xem trước dữ liệu năng lượng
        </p>
        <div className="grid grid-cols-3 gap-6">
          {PREVIEW_CHARTS.map((chart) => (
            <div key={chart.label}>
              <p className="mb-3 text-xs text-muted-foreground">{chart.label}</p>
              <MiniDotChart color={chart.color} heights={chart.heights} />
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {PREVIEW_ROOM_TAGS.map((room) => (
            <span
              key={room}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {room}
            </span>
          ))}
          <span className="rounded-full border border-dashed border-primary/40 px-3 py-1 text-xs text-primary/70">
            + Thêm phòng
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
    <div className="mb-6">
      <h1 className="text-2xl font-bold lg:text-3xl">
        {t.DASHBOARD_PAGE_TITLE}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t.DASHBOARD_PAGE_SUBTITLE}
      </p>
    </div>
  );
}

/* ---------- Skeleton ---------- */

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
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
  data: DashboardData;
  t: Translations;
}

function DashboardContent({ data, t }: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards — staggered slide-up */}
      <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        <FadeSlide>
          <StatCard
            title={t.DASHBOARD_TOTAL_KWH}
            value={<AnimatedCounter value={data.totalMonthlyKwh} format={formatKwh} />}
            subtitle={t.STAT_THIS_MONTH}
            icon={<Zap className="h-4 w-4" />}
            variant="primary"
          />
        </FadeSlide>
        <FadeSlide>
          <StatCard
            title={t.DASHBOARD_TOTAL_COST}
            value={<AnimatedCounter value={data.totalMonthlyCost} format={formatVnd} />}
            subtitle={t.STAT_THIS_MONTH}
            icon={<DollarSign className="h-4 w-4" />}
          />
        </FadeSlide>
        <FadeSlide>
          <StatCard
            title={t.DASHBOARD_TOTAL_CO2}
            value={<AnimatedCounter value={data.co2.totalKg} format={formatCo2} />}
            subtitle={t.STAT_THIS_MONTH}
            icon={<Leaf className="h-4 w-4" />}
          />
        </FadeSlide>
        <FadeSlide>
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

      {/* Charts Grid — staggered */}
      <StaggerList className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <FadeSlide><TopConsumersChart consumers={data.topConsumers} /></FadeSlide>
        <FadeSlide>
          <WasteHotspotChart
            consumers={data.topConsumers}
            totalMonthlyCost={data.totalMonthlyCost}
          />
        </FadeSlide>
        <FadeSlide><SavingsForecastChart monthlyCost={data.totalMonthlyCost} /></FadeSlide>
        <FadeSlide>
          <div className="flex flex-col gap-4 lg:gap-6">
            <MonthComparison comparison={data.comparison} />
            <EvnTierProgress evnTier={data.evnTier} totalKwh={data.totalMonthlyKwh} />
            <Co2TreeVisual co2={data.co2} />
          </div>
        </FadeSlide>
        <FadeSlide className="lg:col-span-2">
          <CarbonWaterfallChart co2TotalKg={data.co2.totalKg} consumers={data.topConsumers} />
        </FadeSlide>
      </StaggerList>

      {/* CTAs */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <Button asChild className="btn-primary-gradient rounded-xl lg:flex-1">
          <Link href={NAV_ROUTES.TIPS}>{t.DASHBOARD_CTA_VIEW_SUGGESTIONS}</Link>
        </Button>
        <Button variant="outline" asChild className="rounded-xl border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40 lg:flex-1">
          <Link href={NAV_ROUTES.TIPS}>{t.DASHBOARD_CTA_SIMULATE}</Link>
        </Button>
      </div>
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
    <div className="flex flex-col gap-6">
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
          <DashboardContent data={pageState.data} t={t} />
        )}
      </CrossFade>
    </div>
  );
}
