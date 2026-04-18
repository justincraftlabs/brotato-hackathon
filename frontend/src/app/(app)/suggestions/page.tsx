"use client";

import { Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RoomAccordionItem } from "@/components/savings/RoomAccordionItem";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useT } from "@/hooks/use-t";
import { useLanguage } from "@/contexts/language-context";
import { getSavingsSuggestions } from "@/lib/api";
import { LOCAL_STORAGE_HOME_ID_KEY, NAV_ROUTES } from "@/lib/constants";
import { formatKwh, formatVnd } from "@/lib/format";
import type { Translations } from "@/lib/translations";
import type { SavingsSuggestionsResult } from "@/lib/types";

type PageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: SavingsSuggestionsResult };

const INITIAL_STATE: PageState = { status: "idle" };
const FIRST_ROOM_INDEX = 0;

interface NoHomeStateProps {
  t: Translations;
}

function NoHomeState({ t }: NoHomeStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <Lightbulb className="h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">{t.SUGGESTIONS_NO_HOME_TITLE}</p>
        <p className="text-sm text-muted-foreground">{t.SUGGESTIONS_NO_HOME_MESSAGE}</p>
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
        <p className="text-sm font-semibold text-destructive">{t.SUGGESTIONS_ERROR_TITLE}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t.SUGGESTIONS_RETRY}
        </Button>
      </CardContent>
    </Card>
  );
}

interface TotalSavingsCardProps {
  data: SavingsSuggestionsResult;
  t: Translations;
}

function TotalSavingsCard({ data, t }: TotalSavingsCardProps) {
  return (
    <Card className="border-primary bg-primary/10">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{t.SUGGESTIONS_TOTAL_SAVINGS}</p>
        <p className="mt-1 text-2xl font-bold text-primary">
          {formatVnd(data.grandTotalSavingsVnd)}
        </p>
        <p className="text-sm text-muted-foreground">{formatKwh(data.grandTotalSavingsKwh)}</p>
      </CardContent>
    </Card>
  );
}

export default function SuggestionsPage() {
  const t = useT();
  const { lang } = useLanguage();
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const [pageState, setPageState] = useState<PageState>(INITIAL_STATE);

  const fetchSuggestions = useCallback(
    async (id: string, forceRefresh: boolean) => {
      setPageState({ status: "loading" });

      const result = await getSavingsSuggestions(id, forceRefresh, lang);

      if (!result.success) {
        setPageState({ status: "error", message: result.error });
        return;
      }

      setPageState({ status: "success", data: result.data });
    },
    [lang]
  );

  useEffect(() => {
    if (!homeId) {
      return;
    }
    setPageState(INITIAL_STATE);
  }, [homeId, lang]);

  useEffect(() => {
    if (!homeId) {
      return;
    }
    if (pageState.status !== "idle") {
      return;
    }
    fetchSuggestions(homeId, false);
  }, [homeId, pageState.status, fetchSuggestions]);

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
        onRetry={() => fetchSuggestions(homeId, false)}
        t={t}
      />
    );
  }

  if (pageState.status === "idle") {
    return null;
  }

  const { data } = pageState;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">{t.SUGGESTIONS_PAGE_TITLE}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchSuggestions(homeId, true)}
        >
          {t.SUGGESTIONS_ANALYZE_BUTTON}
        </Button>
      </div>

      <TotalSavingsCard data={data} t={t} />

      {data.rooms.map((room, index) => (
        <RoomAccordionItem
          key={`room-${index}`}
          room={room}
          homeId={homeId}
          defaultOpen={index === FIRST_ROOM_INDEX}
          t={t}
        />
      ))}
    </div>
  );
}
