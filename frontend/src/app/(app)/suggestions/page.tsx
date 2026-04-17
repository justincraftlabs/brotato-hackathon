"use client";

import { Loader2, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useT } from "@/hooks/use-t";
import { getRecommendations } from "@/lib/api";
import { LOCAL_STORAGE_HOME_ID_KEY, NAV_ROUTES } from "@/lib/constants";
import { formatKwh, formatVnd } from "@/lib/format";
import type { Translations } from "@/lib/translations";
import type {
  Recommendation,
  RecommendationDifficulty,
  RecommendationPriority,
} from "@/lib/types";

interface SuccessData {
  recommendations: Recommendation[];
  totalVnd: number;
  totalKwh: number;
}

type PageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: SuccessData };

const INITIAL_STATE: PageState = { status: "idle" };

type PriorityVariant = "destructive" | "secondary" | "outline";

const PRIORITY_VARIANT_MAP: Record<RecommendationPriority, PriorityVariant> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

type DifficultyVariant = "default" | "secondary" | "outline";

const DIFFICULTY_VARIANT_MAP: Record<RecommendationDifficulty, DifficultyVariant> = {
  easy: "default",
  medium: "secondary",
  hard: "outline",
};

interface NoHomeStateProps {
  t: Translations;
}

function NoHomeState({ t }: NoHomeStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <Lightbulb className="h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">{t.SUGGESTIONS_NO_HOME_TITLE}</p>
        <p className="text-sm text-muted-foreground">
          {t.SUGGESTIONS_NO_HOME_MESSAGE}
        </p>
        <Button asChild>
          <Link href={NAV_ROUTES.SETUP}>{t.SUGGESTIONS_NO_HOME_CTA}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  t: Translations;
}

function ErrorBanner({ message, onRetry, t }: ErrorBannerProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm font-semibold text-destructive">
          {t.SUGGESTIONS_ERROR_TITLE}
        </p>
        <p className="text-xs text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t.SUGGESTIONS_RETRY}
        </Button>
      </CardContent>
    </Card>
  );
}

interface EmptyAnalysisProps {
  onAnalyze: () => void;
  t: Translations;
}

function EmptyAnalysis({ onAnalyze, t }: EmptyAnalysisProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <Lightbulb className="h-10 w-10 text-primary" />
        <p className="text-lg font-semibold">
          {t.SUGGESTIONS_EMPTY_STATE_TITLE}
        </p>
        <p className="text-sm text-muted-foreground">
          {t.SUGGESTIONS_EMPTY_STATE_MESSAGE}
        </p>
        <Button onClick={onAnalyze}>{t.SUGGESTIONS_ANALYZE_FIRST_BUTTON}</Button>
      </CardContent>
    </Card>
  );
}

interface TotalSavingsCardProps {
  totalVnd: number;
  totalKwh: number;
  t: Translations;
}

function TotalSavingsCard({ totalVnd, totalKwh, t }: TotalSavingsCardProps) {
  return (
    <Card className="border-primary bg-primary/10">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">
          {t.SUGGESTIONS_TOTAL_SAVINGS}
        </p>
        <p className="mt-1 text-2xl font-bold text-primary">
          {formatVnd(totalVnd)}
        </p>
        <p className="text-sm text-muted-foreground">{formatKwh(totalKwh)}</p>
      </CardContent>
    </Card>
  );
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  t: Translations;
}

function RecommendationCard({ recommendation, t }: RecommendationCardProps) {
  const priorityLabel: Record<RecommendationPriority, string> = {
    high: t.SUGGESTIONS_PRIORITY_HIGH,
    medium: t.SUGGESTIONS_PRIORITY_MEDIUM,
    low: t.SUGGESTIONS_PRIORITY_LOW,
  };

  const difficultyLabel: Record<RecommendationDifficulty, string> = {
    easy: t.SUGGESTIONS_DIFFICULTY_EASY,
    medium: t.SUGGESTIONS_DIFFICULTY_MEDIUM,
    hard: t.SUGGESTIONS_DIFFICULTY_HARD,
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <p className="font-semibold leading-tight">{recommendation.title}</p>
        <p className="text-xs text-muted-foreground">
          {recommendation.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={PRIORITY_VARIANT_MAP[recommendation.priority]}>
            {priorityLabel[recommendation.priority]}
          </Badge>
          <Badge variant={DIFFICULTY_VARIANT_MAP[recommendation.difficulty]}>
            {difficultyLabel[recommendation.difficulty]}
          </Badge>
        </div>
        <p className="text-sm font-medium text-primary">
          {formatVnd(recommendation.savingsVnd)}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            {t.SUGGESTIONS_SAVINGS_PER_MONTH}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

interface RoomGroupProps {
  roomName: string;
  recommendations: Recommendation[];
  t: Translations;
}

function RoomGroup({ roomName, recommendations, t }: RoomGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-foreground">{roomName}</p>
        <span className="text-xs text-muted-foreground">
          {recommendations.length} {t.SUGGESTIONS_TIPS_SUFFIX}
        </span>
      </div>
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} t={t} />
      ))}
    </div>
  );
}

function groupByRoom(recommendations: Recommendation[]): Map<string, Recommendation[]> {
  const groups = new Map<string, Recommendation[]>();

  for (const rec of recommendations) {
    const existing = groups.get(rec.roomName) ?? [];
    groups.set(rec.roomName, [...existing, rec]);
  }

  return groups;
}

export default function SuggestionsPage() {
  const t = useT();
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const [pageState, setPageState] = useState<PageState>(INITIAL_STATE);

  const fetchRecommendations = useCallback(async (id: string) => {
    setPageState({ status: "loading" });

    const result = await getRecommendations(id);

    if (!result.success) {
      setPageState({ status: "error", message: result.error });
      return;
    }

    setPageState({
      status: "success",
      data: {
        recommendations: result.data.recommendations,
        totalVnd: result.data.totalPotentialSavingsVnd,
        totalKwh: result.data.totalPotentialSavingsKwh,
      },
    });
  }, []);

  useEffect(() => {
    if (!homeId) {
      return;
    }
    if (pageState.status !== "idle") {
      return;
    }
    fetchRecommendations(homeId);
  }, [homeId, pageState.status, fetchRecommendations]);

  if (!homeId) {
    return <NoHomeState t={t} />;
  }

  if (pageState.status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.SUGGESTIONS_ANALYZING}</p>
      </div>
    );
  }

  if (pageState.status === "error") {
    return (
      <ErrorBanner
        message={pageState.message}
        onRetry={() => fetchRecommendations(homeId)}
        t={t}
      />
    );
  }

  if (pageState.status === "idle") {
    return <EmptyAnalysis onAnalyze={() => fetchRecommendations(homeId)} t={t} />;
  }

  const { data } = pageState;
  const grouped = groupByRoom(data.recommendations);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">{t.SUGGESTIONS_PAGE_TITLE}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchRecommendations(homeId)}
        >
          {t.SUGGESTIONS_ANALYZE_BUTTON}
        </Button>
      </div>

      <TotalSavingsCard
        totalVnd={data.totalVnd}
        totalKwh={data.totalKwh}
        t={t}
      />

      {Array.from(grouped.entries()).map(([roomName, recs]) => (
        <RoomGroup
          key={roomName}
          roomName={roomName}
          recommendations={recs}
          t={t}
        />
      ))}
    </div>
  );
}
