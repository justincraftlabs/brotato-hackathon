"use client";

import {
  ArrowUpRight,
  DollarSign,
  Gauge,
  Home,
  Leaf,
  Loader2,
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
import { Card, CardContent } from "@/components/ui/card";
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

/* ---------- Stat Card ---------- */

type StatVariant = "primary" | "default";

interface StatCardProps {
  title: string;
  value: string;
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
    <Card
      className={cn(
        "relative overflow-hidden shadow-sm",
        isPrimary && "border-primary bg-primary text-primary-foreground"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p
            className={cn(
              "text-sm font-medium",
              isPrimary ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {title}
          </p>
          <div
            className={cn(
              "rounded-lg p-1.5",
              isPrimary ? "bg-white/15" : "bg-muted"
            )}
          >
            {icon}
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold">{value}</p>
        <div className="mt-1.5 flex items-center gap-1 text-xs">
          <ArrowUpRight
            className={cn(
              "h-3.5 w-3.5",
              isPrimary ? "text-primary-foreground/60" : "text-primary"
            )}
          />
          <span
            className={cn(
              isPrimary ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Empty State ---------- */

interface EmptyStateProps {
  t: Translations;
}

function EmptyState({ t }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader t={t} />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 py-20">
        <div className="rounded-2xl bg-primary/10 p-6">
          <Home className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{t.DASHBOARD_SETUP_TITLE}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.DASHBOARD_SETUP_DESCRIPTION}
          </p>
        </div>
        <Button asChild size="lg" className="rounded-xl px-8">
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="p-5">
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          </CardContent>
        </Card>
      ))}
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
    <Card className="border-destructive shadow-sm">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm font-semibold text-destructive">
          {t.DASHBOARD_ERROR_TITLE}
        </p>
        <p className="text-xs text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t.DASHBOARD_RETRY}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ---------- Dashboard Content ---------- */

interface DashboardContentProps {
  data: DashboardData;
  t: Translations;
}

function DashboardContent({ data, t }: DashboardContentProps) {
  return (
    <>
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatCard
          title={t.DASHBOARD_TOTAL_KWH}
          value={formatKwh(data.totalMonthlyKwh)}
          subtitle={t.STAT_THIS_MONTH}
          icon={<Zap className="h-4 w-4" />}
          variant="primary"
        />
        <StatCard
          title={t.DASHBOARD_TOTAL_COST}
          value={formatVnd(data.totalMonthlyCost)}
          subtitle={t.STAT_THIS_MONTH}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title={t.DASHBOARD_TOTAL_CO2}
          value={formatCo2(data.co2.totalKg)}
          subtitle={t.STAT_THIS_MONTH}
          icon={<Leaf className="h-4 w-4" />}
        />
        <StatCard
          title={t.DASHBOARD_EVN_TIER_PREFIX}
          value={`${t.DASHBOARD_EVN_TIER_PREFIX} ${data.evnTier}`}
          subtitle={t.STAT_THIS_MONTH}
          icon={<Gauge className="h-4 w-4" />}
        />
      </div>

      {/* Anomaly Alert */}
      <AnomalyAlert anomalies={data.anomalies} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <TopConsumersChart consumers={data.topConsumers} />
        <WasteHotspotChart
          consumers={data.topConsumers}
          totalMonthlyCost={data.totalMonthlyCost}
        />
        <SavingsForecastChart monthlyCost={data.totalMonthlyCost} />
        <div className="flex flex-col gap-4 lg:gap-6">
          <MonthComparison comparison={data.comparison} />
          <EvnTierProgress
            evnTier={data.evnTier}
            totalKwh={data.totalMonthlyKwh}
          />
          <Co2TreeVisual co2={data.co2} />
        </div>
        <div className="lg:col-span-2">
          <CarbonWaterfallChart
            co2TotalKg={data.co2.totalKg}
            consumers={data.topConsumers}
          />
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <Button asChild className="rounded-xl lg:flex-1">
          <Link href={NAV_ROUTES.TIPS}>
            {t.DASHBOARD_CTA_VIEW_SUGGESTIONS}
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-xl lg:flex-1">
          <Link href={NAV_ROUTES.TIPS}>
            {t.DASHBOARD_CTA_SIMULATE}
          </Link>
        </Button>
      </div>
    </>
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

  if (pageState.status === "loading" || pageState.status === "idle") {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader t={t} />
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        <DashboardSkeleton />
      </div>
    );
  }

  if (pageState.status === "error") {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader t={t} />
        <ErrorBanner
          message={pageState.message}
          onRetry={() => fetchDashboard(homeId)}
          t={t}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader t={t} />
      <DashboardContent data={pageState.data} t={t} />
    </div>
  );
}
