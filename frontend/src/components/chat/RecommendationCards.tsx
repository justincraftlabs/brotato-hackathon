"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CHAT_LABELS } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Recommendation, RecommendationPriority } from "@/lib/types";

interface RecommendationCardsProps {
  recommendations: Recommendation[];
  onSelect: (title: string) => void;
}

const HIGH_PRIORITY: RecommendationPriority = "high";

function getPriorityStyles(priority: RecommendationPriority): string {
  if (priority === HIGH_PRIORITY) {
    return "border-accent bg-accent/10";
  }
  return "border-primary/30 bg-primary/5";
}

export function RecommendationCards({
  recommendations,
  onSelect,
}: RecommendationCardsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {CHAT_LABELS.RECOMMENDATIONS_TITLE}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {recommendations.map((rec) => (
          <button
            key={rec.id}
            type="button"
            className="shrink-0"
            onClick={() => onSelect(rec.title)}
          >
            <Card
              className={cn(
                "h-[120px] w-[200px] cursor-pointer transition-colors hover:bg-muted/50",
                getPriorityStyles(rec.priority)
              )}
            >
              <CardContent className="flex h-full flex-col justify-between p-3">
                <div>
                  <p className="line-clamp-2 text-left text-xs font-semibold">
                    {rec.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-left text-[10px] text-muted-foreground">
                    {rec.description}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      rec.priority === HIGH_PRIORITY ? "destructive" : "default"
                    }
                    className="text-[10px]"
                  >
                    {CHAT_LABELS.SAVINGS_LABEL}: {formatVnd(rec.savingsVnd)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
