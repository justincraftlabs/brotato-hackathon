"use client";

import { Rocket, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSchedules } from "@/contexts/schedules-context";
import { NAV_ROUTES } from "@/lib/constants";
import type { ActivateAllItem } from "@/lib/types";

interface ActivateAllButtonProps {
  homeId: string;
  /** Only the unactivated (pending) items. Pass [] when all are already activated. */
  items: ActivateAllItem[];
  /** How many schedules are already activated (for display in the success banner). */
  totalActivated?: number;
  onActivated?: (count: number) => void;
}

type LoadingState = "idle" | "loading" | "error";

export function ActivateAllButton({ homeId, items, totalActivated = 0, onActivated }: ActivateAllButtonProps) {
  const { activate } = useSchedules();
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Derive display state directly from props — always reflects current context
  const allDone = items.length === 0 && totalActivated > 0;

  async function handleActivate() {
    if (items.length === 0) return;
    setLoadingState("loading");

    const created = await activate(items);

    if (created.length === 0) {
      setErrorMsg("Không thể kích hoạt lịch. Thử lại sau.");
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
            Tất cả {totalActivated} nhắc nhở đã được lên lịch! 🎉
          </p>
          <p className="text-xs opacity-75">Nhấn đây để xem trang Lịch →</p>
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
        {loadingState === "loading" ? "Đang kích hoạt..." : `Kích hoạt tất cả 🚀 (${items.length})`}
      </Button>
      {loadingState === "error" && (
        <p className="text-xs text-destructive text-center">{errorMsg}</p>
      )}
    </div>
  );
}
