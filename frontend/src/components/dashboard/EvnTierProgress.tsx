"use client";

import { Info, Zap } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
const STAIR_HEIGHT_PX = 88;
const PRICE_INCREASE_DIVISOR = 100;
const VN_LOCALE = "vi-VN";

function formatStairPrice(price: number): string {
  return `${(price / PRICE_DIVISOR).toFixed(1)}k`;
}

function formatTablePrice(price: number): string {
  return new Intl.NumberFormat(VN_LOCALE).format(price);
}

function calcIncreasePercent(oldPrice: number, newPrice: number): number {
  return Math.round(((newPrice - oldPrice) / oldPrice) * PRICE_INCREASE_DIVISOR * 10) / 10;
}

function usageLabel(minKwh: number, maxKwh: number): string {
  if (maxKwh === Infinity) return `${minKwh}+ kWh`;
  return `${minKwh}–${maxKwh} kWh`;
}

/* ─── Pricing Dialog ─── */

interface PricingDialogProps {
  open: boolean;
  onClose: () => void;
  activeTier: number;
}

function PricingDialog({ open, onClose, activeTier }: PricingDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
        {/* Header strip */}
        <div className="border-b border-border/40 bg-primary/8 px-5 py-4">
          <DialogHeader className="gap-0.5">
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Zap className="h-4 w-4 shrink-0 text-primary" />
              {t.DASHBOARD_EVN_TIER_DIALOG_TITLE}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t.DASHBOARD_EVN_TIER_DIALOG_SUBTITLE}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Pricing table */}
        <div className="px-4 py-3">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="pb-2 pr-3 text-left font-semibold text-muted-foreground">
                  {t.DASHBOARD_EVN_TIER_DIALOG_COL_TIER}
                </th>
                <th className="pb-2 pr-3 text-left font-semibold text-muted-foreground">
                  {t.DASHBOARD_EVN_TIER_DIALOG_COL_USAGE}
                </th>
                <th className="pb-2 text-right font-semibold text-muted-foreground">
                  {t.DASHBOARD_EVN_TIER_DIALOG_COL_PRICE}
                </th>
              </tr>
            </thead>
            <tbody>
              {EVN_TIERS.map((tier) => {
                const isActive = tier.tier === activeTier;
                const increase = calcIncreasePercent(tier.priceRange[0], tier.priceRange[1]);

                return (
                  <tr
                    key={tier.tier}
                    className={cn(
                      "border-b border-border/20 transition-colors last:border-0",
                      isActive
                        ? "bg-primary/10"
                        : "hover:bg-muted/40"
                    )}
                  >
                    {/* Tier number */}
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {tier.tier}
                        </span>
                        {isActive && (
                          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                            {t.DASHBOARD_EVN_TIER_DIALOG_CURRENT_BADGE}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Usage range */}
                    <td className="py-2.5 pr-3 text-muted-foreground">
                      {usageLabel(tier.minKwh, tier.maxKwh)}
                    </td>

                    {/* Price range + increase badge */}
                    <td className="py-2.5 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={cn("font-semibold tabular-nums", isActive && "text-primary")}>
                          {formatTablePrice(tier.priceRange[0])}
                          <span className="mx-0.5 text-muted-foreground/60">→</span>
                          {formatTablePrice(tier.priceRange[1])}
                        </span>
                        <span className="text-[9px] font-bold text-amber-500 dark:text-amber-400">
                          +{increase}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="border-t border-border/30 bg-muted/30 px-4 py-2.5">
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {t.DASHBOARD_EVN_TIER_DIALOG_VAT_NOTE}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main component ─── */

export function EvnTierProgress({ evnTier, totalKwh }: EvnTierProgressProps) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  const currentTierData = EVN_TIERS[evnTier - TIER_INDEX_OFFSET];
  const isMaxTier = evnTier >= EVN_TIERS.length;

  const remainingKwh =
    currentTierData && currentTierData.maxKwh !== Infinity
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

  const defaultWarning = isMaxTier
    ? t.DASHBOARD_EVN_TIER_MAX
    : t.DASHBOARD_EVN_TIER_NEXT_WARNING
        .replace("{remaining}", String(Math.round(remainingKwh)))
        .replace("{nextTier}", String(evnTier + TIER_INDEX_OFFSET));

  const hoveredTierData = hoveredTier !== null ? EVN_TIERS[hoveredTier - TIER_INDEX_OFFSET] : null;
  const bottomCaption = hoveredTierData
    ? `${t.DASHBOARD_EVN_TIER_PREFIX} ${hoveredTierData.tier}: ${usageLabel(hoveredTierData.minKwh, hoveredTierData.maxKwh)} · ${formatTablePrice(hoveredTierData.priceRange[0])}→${formatTablePrice(hoveredTierData.priceRange[1])} đ/kWh`
    : defaultWarning;

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden flex-1 card-hover-glow">
        <div className="flex flex-col gap-3 p-4 lg:p-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">{t.DASHBOARD_EVN_TIER_PREFIX}</p>
              {/* Info button — opens pricing dialog */}
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                title={t.DASHBOARD_EVN_TIER_HOVER_PROMPT}
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition-all duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-black text-primary">
                {t.DASHBOARD_EVN_TIER_PREFIX} {evnTier}
              </span>
            </div>
          </div>

          {/* Staircase — each bar is interactive */}
          <div
            className="flex items-end gap-1.5"
            style={{ height: STAIR_HEIGHT_PX }}
          >
            {EVN_TIERS.map((tier, index) => {
              const tierNumber = index + TIER_INDEX_OFFSET;
              const isActive = tierNumber === evnTier;
              const isPassed = tierNumber < evnTier;
              const isHovered = hoveredTier === tierNumber;
              const stepRatio = (index + TIER_INDEX_OFFSET) / EVN_TIERS.length;
              const heightPercent =
                STAIR_BASE_HEIGHT_PERCENT + stepRatio * STAIR_GROWTH_PERCENT;

              return (
                <button
                  key={tier.tier}
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  onMouseEnter={() => setHoveredTier(tierNumber)}
                  onMouseLeave={() => setHoveredTier(null)}
                  className="flex flex-1 cursor-pointer flex-col items-center gap-1 focus-visible:outline-none"
                  aria-label={`${t.DASHBOARD_EVN_TIER_PREFIX} ${tierNumber}: ${usageLabel(tier.minKwh, tier.maxKwh)}`}
                >
                  {/* Price label above bar */}
                  <span
                    className={cn(
                      "text-[10px] font-semibold leading-tight transition-colors",
                      isActive || isHovered
                        ? "text-primary"
                        : isPassed
                          ? "text-primary/50"
                          : "text-muted-foreground/40"
                    )}
                  >
                    {formatStairPrice(tier.pricePerKwh)}
                  </span>

                  {/* Bar */}
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all duration-200",
                      isActive
                        ? "bg-primary shadow-[0_0_12px_rgba(59,140,42,0.4)]"
                        : isHovered
                          ? "bg-primary/60 shadow-[0_0_8px_rgba(59,140,42,0.2)]"
                          : isPassed
                            ? "bg-primary/25"
                            : "bg-muted"
                    )}
                    style={{
                      height: `${heightPercent}%`,
                      minHeight: 20,
                      transform: isHovered ? "scaleY(1.04)" : "scaleY(1)",
                      transformOrigin: "bottom",
                    }}
                  />

                  {/* Tier number below bar */}
                  <span
                    className={cn(
                      "text-[10px] font-bold transition-colors",
                      isActive || isHovered ? "text-primary" : "text-muted-foreground/50"
                    )}
                  >
                    {tierNumber}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress bar in current tier */}
          <div className="flex flex-col gap-1.5">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${tierProgressPercent}%` }}
              />
            </div>
            {/* Dynamic caption: shows hover info or default warning */}
            <p
              className={cn(
                "min-h-[1rem] text-xs transition-colors duration-150",
                hoveredTierData ? "text-primary/80" : "text-muted-foreground"
              )}
            >
              {bottomCaption}
            </p>
          </div>

          {/* Tap hint */}
          <p className="text-[10px] text-muted-foreground/50">
            {t.DASHBOARD_EVN_TIER_HOVER_PROMPT}
          </p>
        </div>
      </div>

      <PricingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        activeTier={evnTier}
      />
    </>
  );
}
