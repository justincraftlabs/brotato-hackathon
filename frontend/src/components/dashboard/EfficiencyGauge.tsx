"use client";

import { Info, Gauge } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";
import type { Translations } from "@/lib/translations";

interface EfficiencyGaugeProps {
  evnTier: number;
  percentDifference: number;
}

const MAX_TIER = 6;
const CIRCLE_RADIUS = 48;
const STROKE_WIDTH = 9;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const VIEW_SIZE = 124;
const CENTER = VIEW_SIZE / 2;
const MAX_SCORE = 100;
const ROTATION_OFFSET = -90;

const TIER_SCORE_MAP: Record<number, number> = {
  1: 95,
  2: 82,
  3: 68,
  4: 50,
  5: 30,
  6: 15,
};

interface Rank {
  label: string;
  emoji: string;
  color: string;
  trackColor: string;
  glowColor: string;
  min: number;
}

function buildRanks(t: Translations): readonly Rank[] {
  return [
    { label: t.EFFICIENCY_RANK_PLATINUM, emoji: "💎", color: "#22d3ee", trackColor: "rgba(34,211,238,0.15)", glowColor: "rgba(34,211,238,0.35)", min: 81 },
    { label: t.EFFICIENCY_RANK_GOLD,     emoji: "⭐", color: "#4ade80", trackColor: "rgba(74,222,128,0.15)", glowColor: "rgba(74,222,128,0.35)", min: 61 },
    { label: t.EFFICIENCY_RANK_SPROUTING, emoji: "🌱", color: "#fbbf24", trackColor: "rgba(251,191,36,0.15)",  glowColor: "rgba(251,191,36,0.35)",  min: 41 },
    { label: t.EFFICIENCY_RANK_RAW,      emoji: "🥔", color: "#f87171", trackColor: "rgba(248,113,113,0.15)", glowColor: "rgba(248,113,113,0.35)", min: 0  },
  ] as const;
}

function getRank(score: number, ranks: readonly Rank[]): Rank {
  return ranks.find((r) => score >= r.min) ?? ranks[ranks.length - 1];
}

function calculateScore(evnTier: number, percentDiff: number): number {
  const tierBase = TIER_SCORE_MAP[evnTier] ?? TIER_SCORE_MAP[MAX_TIER];
  const diffBonus = Math.max(-20, Math.min(20, -percentDiff * 0.3));
  return Math.max(0, Math.min(MAX_SCORE, Math.round(tierBase + diffBonus)));
}

export function EfficiencyGauge({ evnTier, percentDifference }: EfficiencyGaugeProps) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const ranks = buildRanks(t);
  const score = calculateScore(evnTier, percentDifference);
  const rank = getRank(score, ranks);

  const filledLength = (score / MAX_SCORE) * CIRCUMFERENCE;
  const gapLength = CIRCUMFERENCE - filledLength;

  const rankRows = [
    { label: t.EFFICIENCY_INFO_ROW_PLATINUM, score: t.EFFICIENCY_INFO_SCORE_81 },
    { label: t.EFFICIENCY_INFO_ROW_GOLD,     score: t.EFFICIENCY_INFO_SCORE_61 },
    { label: t.EFFICIENCY_INFO_ROW_SPROUTING, score: t.EFFICIENCY_INFO_SCORE_41 },
    { label: t.EFFICIENCY_INFO_ROW_RAW,      score: t.EFFICIENCY_INFO_SCORE_0 },
  ];

  return (
    <>
    <div className="glass rounded-2xl overflow-hidden card-hover-glow h-full flex items-center gap-4 p-4 lg:p-5">
      {/* Radial gauge */}
      <div
        className="relative shrink-0"
        style={{ filter: `drop-shadow(0 0 14px ${rank.glowColor})` }}
      >
        <svg
          width={VIEW_SIZE}
          height={VIEW_SIZE}
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={rank.trackColor}
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={rank.color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${gapLength}`}
            transform={`rotate(${ROTATION_OFFSET} ${CENTER} ${CENTER})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span
            className="text-2xl font-black tabular-nums leading-none"
            style={{ color: rank.color }}
          >
            {score}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">
            / {MAX_SCORE}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 min-w-0 flex-col gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.EFFICIENCY_ECO_SCORE_LABEL}
            </p>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              title={t.EFFICIENCY_INFO_SUBTITLE}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition-all duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
          <p
            className="mt-0.5 text-base font-black leading-tight"
            style={{ color: rank.color }}
          >
            {rank.emoji} {rank.label}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t.EFFICIENCY_EVN_TIER_LABEL}</span>
            <span className="font-semibold">
              {t.EFFICIENCY_EVN_TIER_VALUE.replace("{tier}", String(evnTier))}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t.EFFICIENCY_COMPARE_LABEL}</span>
            <span
              className={cn(
                "font-semibold",
                percentDifference <= 0 ? "text-primary" : "text-amber-400"
              )}
            >
              {percentDifference > 0 ? "+" : ""}
              {percentDifference.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${score}%`, backgroundColor: rank.color }}
          />
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {score < 41 && t.EFFICIENCY_HINT_LOW}
          {score >= 41 && score < 61 && t.EFFICIENCY_HINT_MED}
          {score >= 61 && score < 81 && t.EFFICIENCY_HINT_HIGH}
          {score >= 81 && t.EFFICIENCY_HINT_MAX}
        </p>
      </div>
    </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          {/* Header strip */}
          <div className="border-b border-border/40 bg-primary/8 px-5 py-4">
            <DialogHeader className="gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Gauge className="h-4 w-4 shrink-0 text-primary" />
                {t.EFFICIENCY_INFO_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t.EFFICIENCY_INFO_SUBTITLE}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Rank table */}
          <div className="px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.EFFICIENCY_INFO_RANK_LABEL}
            </p>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="pb-2 pr-3 text-left font-semibold text-muted-foreground">{t.EFFICIENCY_INFO_RANK_LABEL}</th>
                  <th className="pb-2 text-right font-semibold text-muted-foreground">{t.EFFICIENCY_INFO_SCORE_LABEL}</th>
                </tr>
              </thead>
              <tbody>
                {rankRows.map(({ label, score: scoreRange }) => {
                  const isCurrentRank = label === `${rank.emoji} ${rank.label}`;
                  return (
                    <tr
                      key={label}
                      className={cn(
                        "border-b border-border/20 last:border-0",
                        isCurrentRank ? "bg-primary/10" : ""
                      )}
                    >
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{label}</span>
                          {isCurrentRank && (
                            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                              ▶
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={cn("py-2.5 text-right font-semibold tabular-nums", isCurrentRank && "text-primary")}>
                        {scoreRange}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-3 rounded-xl border border-border/40 bg-muted/30 px-3.5 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                📊 {t.EFFICIENCY_INFO_FORMULA}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/30 bg-muted/30 px-4 py-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              * {t.EFFICIENCY_INFO_FOOTER}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
