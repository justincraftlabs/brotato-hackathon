"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

interface EfficiencyGaugeProps {
  evnTier: number;
  percentDifference: number;
}

const MAX_TIER = 6;
const CIRCLE_RADIUS = 54;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const VIEW_SIZE = 140;
const CENTER = VIEW_SIZE / 2;
const FULL_CIRCLE_DEGREES = 360;
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

const SCORE_THRESHOLD_GREAT = 75;
const SCORE_THRESHOLD_OK = 45;

interface ScoreLevel {
  label: { vi: string; en: string };
  color: string;
  trackColor: string;
  bgClass: string;
}

const LEVEL_GREAT: ScoreLevel = {
  label: { vi: "Tuyệt vời!", en: "Great!" },
  color: "#2E7D32",
  trackColor: "#C8E6C9",
  bgClass: "bg-primary-light dark:bg-primary/10",
};

const LEVEL_OK: ScoreLevel = {
  label: { vi: "Khá tốt", en: "Not bad" },
  color: "#EF9F27",
  trackColor: "#FFF3E0",
  bgClass: "bg-accent-light dark:bg-accent/10",
};

const LEVEL_BAD: ScoreLevel = {
  label: { vi: "Cần cải thiện", en: "Needs work" },
  color: "#E53935",
  trackColor: "#FFCDD2",
  bgClass: "bg-red-50 dark:bg-red-950/20",
};

function getLevel(score: number): ScoreLevel {
  if (score >= SCORE_THRESHOLD_GREAT) return LEVEL_GREAT;
  if (score >= SCORE_THRESHOLD_OK) return LEVEL_OK;
  return LEVEL_BAD;
}

function calculateScore(evnTier: number, percentDiff: number): number {
  const tierBase = TIER_SCORE_MAP[evnTier] ?? TIER_SCORE_MAP[MAX_TIER];
  const diffBonus = Math.max(-20, Math.min(20, -percentDiff * 0.3));
  return Math.max(0, Math.min(MAX_SCORE, Math.round(tierBase + diffBonus)));
}

export function EfficiencyGauge({
  evnTier,
  percentDifference,
}: EfficiencyGaugeProps) {
  const t = useT();
  const score = calculateScore(evnTier, percentDifference);
  const level = getLevel(score);
  const lang = t.NAV_OVERVIEW === "Dashboard" ? "en" : "vi";

  const filledLength = (score / MAX_SCORE) * CIRCUMFERENCE;
  const gapLength = CIRCUMFERENCE - filledLength;

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-0 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08),0_8px_20px_-4px_rgba(0,0,0,0.04)]",
        level.bgClass
      )}
    >
      <CardContent className="flex items-center gap-5 p-5 lg:p-6">
        {/* Radial gauge */}
        <div className="relative shrink-0">
          <svg
            width={VIEW_SIZE}
            height={VIEW_SIZE}
            viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          >
            {/* Track */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={CIRCLE_RADIUS}
              fill="none"
              stroke={level.trackColor}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Filled arc */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={CIRCLE_RADIUS}
              fill="none"
              stroke={level.color}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={`${filledLength} ${gapLength}`}
              transform={`rotate(${ROTATION_OFFSET} ${CENTER} ${CENTER})`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-black tabular-nums"
              style={{ color: level.color }}
            >
              {score}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              / {MAX_SCORE}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <p className="text-base font-bold">
            {lang === "vi" ? "Điểm hiệu quả" : "Efficiency Score"}
          </p>
          <p
            className="text-lg font-black"
            style={{ color: level.color }}
          >
            {level.label[lang]}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "vi"
              ? `Dựa trên bậc EVN ${evnTier} và mức tiêu thụ`
              : `Based on EVN tier ${evnTier} & usage`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
