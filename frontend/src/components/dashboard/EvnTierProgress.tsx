"use client";

import { Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import { EVN_TIERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EvnTierProgressProps {
  evnTier: number;
  totalKwh: number;
}

const TIER_INDEX_OFFSET = 1;
const FULL_PERCENT = 100;
const PRICE_DIVISOR = 1000;
const STAIR_BASE_HEIGHT_PERCENT = 25;
const STAIR_GROWTH_PERCENT = 75;

function formatPrice(price: number): string {
  return `${(price / PRICE_DIVISOR).toFixed(1)}k`;
}

export function EvnTierProgress({ evnTier, totalKwh }: EvnTierProgressProps) {
  const t = useT();

  const currentTierData = EVN_TIERS[evnTier - TIER_INDEX_OFFSET];
  const isMaxTier = evnTier >= EVN_TIERS.length;

  const remainingKwh = currentTierData && currentTierData.maxKwh !== Infinity
    ? Math.max(0, currentTierData.maxKwh - totalKwh)
    : 0;

  const tierProgressPercent = currentTierData
    ? currentTierData.maxKwh === Infinity
      ? FULL_PERCENT
      : Math.min(
          FULL_PERCENT,
          ((totalKwh - currentTierData.minKwh) /
            (currentTierData.maxKwh - currentTierData.minKwh)) *
            FULL_PERCENT
        )
    : 0;

  const nextTierWarning = isMaxTier
    ? t.DASHBOARD_EVN_TIER_MAX
    : t.DASHBOARD_EVN_TIER_NEXT_WARNING
        .replace("{remaining}", String(Math.round(remainingKwh)))
        .replace("{nextTier}", String(evnTier + TIER_INDEX_OFFSET));

  return (
    <Card className="flex-1 overflow-hidden rounded-2xl border-0 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08),0_8px_20px_-4px_rgba(0,0,0,0.04)]">
      <CardContent className="flex h-full flex-col gap-4 p-5 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-base font-bold">
            {t.DASHBOARD_EVN_TIER_PREFIX}
          </p>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-black text-primary">
              {t.DASHBOARD_EVN_TIER_PREFIX} {evnTier}
            </span>
          </div>
        </div>

        {/* Tier staircase */}
        <div className="flex flex-1 items-end gap-1.5">
          {EVN_TIERS.map((tier, index) => {
            const tierNumber = index + TIER_INDEX_OFFSET;
            const isActive = tierNumber === evnTier;
            const isPassed = tierNumber < evnTier;
            const stepRatio = (index + TIER_INDEX_OFFSET) / EVN_TIERS.length;
            const heightPercent =
              STAIR_BASE_HEIGHT_PERCENT + stepRatio * STAIR_GROWTH_PERCENT;

            return (
              <div
                key={tier.tier}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold leading-tight",
                    isActive
                      ? "text-primary"
                      : isPassed
                        ? "text-primary/50"
                        : "text-muted-foreground/40"
                  )}
                >
                  {formatPrice(tier.pricePerKwh)}
                </span>
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all",
                    isActive
                      ? "bg-primary shadow-[0_0_12px_rgba(59,140,42,0.4)]"
                      : isPassed
                        ? "bg-primary/25"
                        : "bg-muted"
                  )}
                  style={{ height: `${heightPercent}%`, minHeight: 20 }}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    isActive ? "text-primary" : "text-muted-foreground/50"
                  )}
                >
                  {tierNumber}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress in current tier */}
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${tierProgressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {nextTierWarning}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
