"use client";

import { cn } from "@/lib/utils";

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

const RANKS: readonly Rank[] = [
  { label: "Khoai Bạch Kim", emoji: "💎", color: "#22d3ee", trackColor: "rgba(34,211,238,0.15)", glowColor: "rgba(34,211,238,0.35)", min: 81 },
  { label: "Khoai Vàng",     emoji: "⭐", color: "#4ade80", trackColor: "rgba(74,222,128,0.15)", glowColor: "rgba(74,222,128,0.35)", min: 61 },
  { label: "Khoai Nảy Mầm", emoji: "🌱", color: "#fbbf24", trackColor: "rgba(251,191,36,0.15)",  glowColor: "rgba(251,191,36,0.35)",  min: 41 },
  { label: "Khoai Thô",      emoji: "🥔", color: "#f87171", trackColor: "rgba(248,113,113,0.15)", glowColor: "rgba(248,113,113,0.35)", min: 0  },
] as const;

function getRank(score: number): Rank {
  return RANKS.find((r) => score >= r.min) ?? RANKS[RANKS.length - 1];
}

function calculateScore(evnTier: number, percentDiff: number): number {
  const tierBase = TIER_SCORE_MAP[evnTier] ?? TIER_SCORE_MAP[MAX_TIER];
  const diffBonus = Math.max(-20, Math.min(20, -percentDiff * 0.3));
  return Math.max(0, Math.min(MAX_SCORE, Math.round(tierBase + diffBonus)));
}

export function EfficiencyGauge({ evnTier, percentDifference }: EfficiencyGaugeProps) {
  const score = calculateScore(evnTier, percentDifference);
  const rank = getRank(score);

  const filledLength = (score / MAX_SCORE) * CIRCUMFERENCE;
  const gapLength = CIRCUMFERENCE - filledLength;

  return (
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
          {/* Track ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={rank.trackColor}
            strokeWidth={STROKE_WIDTH}
          />
          {/* Filled arc */}
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Eco Score
          </p>
          <p
            className="mt-0.5 text-base font-black leading-tight"
            style={{ color: rank.color }}
          >
            {rank.emoji} {rank.label}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Bậc EVN</span>
            <span className="font-semibold">Bậc {evnTier}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">So hộ TB</span>
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

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${score}%`, backgroundColor: rank.color }}
          />
        </div>

        {/* Rank progression hint */}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {score < 41 && "Giảm standby để lên hạng 🌱"}
          {score >= 41 && score < 61 && "Gần tới Khoai Vàng rồi! ⭐"}
          {score >= 61 && score < 81 && "Hướng tới Bạch Kim! 💎"}
          {score >= 81 && "Bạn đang ở đỉnh cao! 🎉"}
        </p>
      </div>
    </div>
  );
}
