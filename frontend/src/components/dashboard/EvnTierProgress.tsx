"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import { EVN_TIERS } from "@/lib/constants";
import { formatVnd } from "@/lib/format";

interface EvnTierProgressProps {
  evnTier: number;
  totalKwh: number;
}

const TIER_INDEX_OFFSET = 1;
const FULL_PROGRESS_PERCENT = 100;
const TIER_COLORS = [
  "bg-primary",
  "bg-primary-mid",
  "bg-yellow-500",
  "bg-accent",
  "bg-orange-500",
  "bg-red-500",
];

interface TierLabels {
  evnTierMax: string;
  evnTierPrefix: string;
  evnTierPriceSuffix: string;
  evnTierNextWarning: string;
}

function getTierDescription(evnTier: number, totalKwh: number, labels: TierLabels): string {
  const currentTierData = EVN_TIERS[evnTier - TIER_INDEX_OFFSET];
  if (!currentTierData) {
    return labels.evnTierMax;
  }

  const priceFormatted = formatVnd(currentTierData.pricePerKwh);
  const tierLabel = `${labels.evnTierPrefix} ${evnTier}: ${priceFormatted}${labels.evnTierPriceSuffix}`;

  const nextTierIndex = evnTier;
  if (nextTierIndex >= EVN_TIERS.length) {
    return `${tierLabel} — ${labels.evnTierMax}`;
  }

  const remaining = Math.max(currentTierData.maxKwh - totalKwh, 0);
  const nextTierNumber = evnTier + TIER_INDEX_OFFSET;

  const warning = labels.evnTierNextWarning.replace(
    "{remaining}",
    String(Math.round(remaining))
  ).replace("{nextTier}", String(nextTierNumber));

  return `${tierLabel} — ${warning}`;
}

export function EvnTierProgress({ evnTier, totalKwh }: EvnTierProgressProps) {
  const t = useT();
  const tierLabels: TierLabels = {
    evnTierMax: t.DASHBOARD_EVN_TIER_MAX,
    evnTierPrefix: t.DASHBOARD_EVN_TIER_PREFIX,
    evnTierPriceSuffix: t.DASHBOARD_EVN_TIER_PRICE_SUFFIX,
    evnTierNextWarning: t.DASHBOARD_EVN_TIER_NEXT_WARNING,
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
          {EVN_TIERS.map((tier, index) => {
            const tierNumber = index + TIER_INDEX_OFFSET;
            const isActive = tierNumber <= evnTier;
            const isCurrent = tierNumber === evnTier;

            let widthPercent: number;
            if (isCurrent && tier.maxKwh !== Infinity) {
              const tierRange = tier.maxKwh - tier.minKwh;
              const kwhInTier = Math.max(totalKwh - tier.minKwh, 0);
              const segmentWidth = FULL_PROGRESS_PERCENT / EVN_TIERS.length;
              widthPercent =
                (Math.min(kwhInTier / tierRange, 1) * segmentWidth);
            } else if (isActive) {
              widthPercent = FULL_PROGRESS_PERCENT / EVN_TIERS.length;
            } else {
              widthPercent = 0;
            }

            return (
              <div
                key={tier.tier}
                className={`${TIER_COLORS[index]} transition-all`}
                style={{ width: `${widthPercent}%` }}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {getTierDescription(evnTier, totalKwh, tierLabels)}
        </p>
      </CardContent>
    </Card>
  );
}
