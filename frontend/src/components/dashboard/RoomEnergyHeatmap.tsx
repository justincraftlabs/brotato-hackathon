"use client";

import { motion } from "framer-motion";
import { Flame, Info } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/use-t";
import { formatKwh, formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RoomStat } from "@/lib/types";

interface RoomEnergyHeatmapProps {
  roomStats: RoomStat[];
}

interface RankedRoom extends RoomStat {
  rank: number;
  sharePercent: number;
}

const MAX_VISIBLE_ROOMS = 6;
const BAR_ANIMATION_STAGGER = 0.07;
const BAR_ANIMATION_DURATION = 0.7;

function rankRooms(rooms: RoomStat[]): RankedRoom[] {
  const total = rooms.reduce((sum, r) => sum + r.totalKwh, 0);
  return [...rooms]
    .sort((a, b) => b.totalKwh - a.totalKwh)
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      sharePercent: total > 0 ? (r.totalKwh / total) * 100 : 0,
    }));
}

export function RoomEnergyHeatmap({ roomStats }: RoomEnergyHeatmapProps) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);

  const ranked = rankRooms(roomStats);
  if (ranked.length === 0) return null;

  const topShare = ranked[0]?.sharePercent ?? 0;
  const visible = ranked.slice(0, MAX_VISIBLE_ROOMS);

  return (
    <>
      <div className="glass rounded-2xl card-hover-glow h-full flex flex-col p-4 lg:p-5">
        {/* Header */}
        <div className="shrink-0">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary shrink-0" />
            <h3 className="text-sm font-bold">{t.CHART_HEATMAP_TITLE}</h3>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              title={t.CHART_HEATMAP_INFO_SUBTITLE}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition-all duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t.CHART_HEATMAP_SUBTITLE}
          </p>
        </div>

        {/* Ranked rooms */}
        <ul className="mt-4 flex flex-1 flex-col gap-2.5">
          {visible.map((room) => {
            const isTop = room.rank === 1;
            const barWidthPercent = topShare > 0 ? (room.sharePercent / topShare) * 100 : 0;

            return (
              <li
                key={room.roomName}
                className="group rounded-xl border border-border/40 bg-card/40 px-3 py-2.5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                      isTop
                        ? "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/40"
                        : "bg-muted/60 text-muted-foreground"
                    )}
                  >
                    {room.rank}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Name + share */}
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{room.roomName}</span>
                      <span className="shrink-0 text-xs font-bold tabular-nums">
                        {room.sharePercent.toFixed(1)}%
                      </span>
                    </div>

                    {/* Animated bar */}
                    <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidthPercent}%` }}
                        transition={{
                          duration: BAR_ANIMATION_DURATION,
                          delay: room.rank * BAR_ANIMATION_STAGGER,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full",
                          isTop
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_hsl(38_85%_55%/0.35)]"
                            : "bg-gradient-to-r from-primary/60 to-primary"
                        )}
                      />
                    </div>

                    {/* Stats */}
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground tabular-nums">
                      <span>{formatKwh(room.totalKwh)}</span>
                      <span>{formatVnd(room.totalCost)}</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          <div className="border-b border-border/40 bg-primary/8 px-5 py-4">
            <DialogHeader className="gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Flame className="h-4 w-4 shrink-0 text-primary" />
                {t.CHART_HEATMAP_INFO_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t.CHART_HEATMAP_INFO_SUBTITLE}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-5 py-4">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.CHART_HEATMAP_INFO_SIZE_LABEL}
            </p>
            <p className="text-xs text-muted-foreground mb-4">{t.CHART_HEATMAP_INFO_SIZE_DESC}</p>

            <div className="rounded-xl border border-primary/20 bg-primary/8 px-3.5 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                💡 {t.CHART_HEATMAP_INFO_TIP}
              </p>
            </div>
          </div>

          <div className="border-t border-border/30 bg-muted/30 px-4 py-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              * {t.CHART_HEATMAP_INFO_FOOTER}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
