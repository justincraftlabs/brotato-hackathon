"use client";

import { Rocket, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSchedules } from "@/contexts/schedules-context";
import { useT } from "@/hooks/use-t";
import { NAV_ROUTES } from "@/lib/constants";
import type { ActivateAllItem } from "@/lib/types";

interface ActivateAllButtonProps {
  homeId: string;
  items: ActivateAllItem[];
  totalActivated?: number;
  onActivated?: (count: number) => void;
}

type LoadingState = "idle" | "loading" | "error";

export function ActivateAllButton({ items, totalActivated = 0, onActivated }: ActivateAllButtonProps) {
  const t = useT();
  const { activate } = useSchedules();
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");

  const allDone = items.length === 0 && totalActivated > 0;

  async function handleActivate() {
    if (items.length === 0 || loadingState === "loading") return;
    setLoadingState("loading");

    const created = await activate(items);

    if (created.length === 0) {
      setLoadingState("error");
      return;
    }

    setLoadingState("idle");
    onActivated?.(created.length);
  }

  if (allDone) {
    return (
      <Link
        href={NAV_ROUTES.SCHEDULES}
        className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-primary hover:bg-primary/20 transition-colors"
      >
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {t.ACTIVATE_ALL_SUCCESS_TITLE.replace("{count}", String(totalActivated))}
          </p>
          <p className="text-xs opacity-75">{t.ACTIVATE_ALL_SUCCESS_CTA}</p>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        className="btn-primary-gradient w-full rounded-xl gap-2"
        disabled={loadingState === "loading" || items.length === 0}
        onClick={handleActivate}
      >
        {loadingState === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Rocket className="h-4 w-4" />
        )}
        {loadingState === "loading"
          ? t.ACTIVATE_ALL_LOADING
          : t.ACTIVATE_ALL_BUTTON.replace("{count}", String(items.length))}
      </Button>
      {loadingState === "error" && (
        <p className="text-xs text-destructive text-center">{t.ACTIVATE_ALL_ERROR}</p>
      )}
    </div>
  );
}
