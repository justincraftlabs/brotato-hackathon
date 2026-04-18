"use client";

import { Info, Map as MapIcon } from "lucide-react";
import { useState } from "react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/use-t";
import { formatKwh, formatVnd } from "@/lib/format";
import type { RoomStat } from "@/lib/types";

interface RoomEnergyHeatmapProps {
  roomStats: RoomStat[];
}

interface TreemapEntry extends RoomStat {
  size: number;
  sharePercent: number;
  [key: string]: unknown;
}

function buildTreemapData(roomStats: RoomStat[], totalKwh: number): TreemapEntry[] {
  return roomStats.map((r) => ({
    ...r,
    size: r.totalKwh,
    sharePercent: totalKwh > 0 ? Math.round((r.totalKwh / totalKwh) * 1000) / 10 : 0,
  }));
}

// Hottest (index 0) → red/orange; coolest (last) → green
const HEAT_COLORS = [
  "hsl(0 75% 48%)",
  "hsl(20 82% 50%)",
  "hsl(38 88% 48%)",
  "hsl(60 75% 42%)",
  "hsl(142 55% 40%)",
];

function heatColor(index: number, total: number): string {
  const slot = Math.min(
    Math.floor((index / Math.max(total - 1, 1)) * (HEAT_COLORS.length - 1)),
    HEAT_COLORS.length - 1
  );
  return HEAT_COLORS[slot];
}

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  sharePercent?: number;
  index?: number;
  root?: { children?: unknown[] };
}

function TreemapCell(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", value = 0, sharePercent = 0, index = 0, root } = props;
  const total = (root?.children ?? []).length;
  const fill = heatColor(index, total);

  if (width < 40 || height < 24) return <g />;

  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={width - 2}
        height={height - 2}
        fill={fill}
        fillOpacity={0.85}
        rx={6}
        ry={6}
      />
      <text
        x={x + 9}
        y={y + 18}
        fill="white"
        fontSize={11}
        fontWeight={700}
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
      >
        {name}
      </text>
      {height > 42 && (
        <text
          x={x + 9}
          y={y + 32}
          fill="white"
          fillOpacity={0.88}
          fontSize={10}
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
        >
          {formatKwh(value)}
        </text>
      )}
      {height > 56 && width > 60 && (
        <text
          x={x + 9}
          y={y + 46}
          fill="white"
          fillOpacity={0.72}
          fontSize={9}
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
        >
          {sharePercent}%
        </text>
      )}
    </g>
  );
}

interface TooltipPayload {
  payload?: TreemapEntry;
}

interface HeatmapTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  applianceLabel: string;
}

function HeatmapTooltip({ active, payload, applianceLabel }: HeatmapTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card/95 px-3 py-2.5 shadow-xl backdrop-blur-sm">
      <p className="text-sm font-bold">{d.roomName}</p>
      <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
        <span>{formatKwh(d.totalKwh)} ({d.sharePercent}%)</span>
        <span>{formatVnd(d.totalCost)}</span>
        <span>{d.applianceCount} {applianceLabel}</span>
      </div>
    </div>
  );
}

const CHART_MIN_HEIGHT = 220;

export function RoomEnergyHeatmap({ roomStats }: RoomEnergyHeatmapProps) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalKwh = roomStats.reduce((sum, r) => sum + r.totalKwh, 0);
  const data = buildTreemapData(roomStats, totalKwh);

  if (data.length === 0) return null;

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden card-hover-glow h-full flex flex-col">
        <div className="shrink-0 px-4 pt-4 pb-0 lg:px-5 lg:pt-5">
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-primary shrink-0" />
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

        <div
          className="flex-1 px-3 pb-4 pt-3 lg:px-4 lg:pb-5"
          style={{ minHeight: CHART_MIN_HEIGHT }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data}
              dataKey="size"
              content={<TreemapCell />}
              isAnimationActive
              animationDuration={800}
            >
              <Tooltip
                content={(p) => (
                  <HeatmapTooltip
                    active={p.active}
                    payload={p.payload as unknown as TooltipPayload[]}
                    applianceLabel={t.LABEL_APPLIANCE_COUNT}
                  />
                )}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          <div className="border-b border-border/40 bg-primary/8 px-5 py-4">
            <DialogHeader className="gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <MapIcon className="h-4 w-4 shrink-0 text-primary" />
                {t.CHART_HEATMAP_INFO_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t.CHART_HEATMAP_INFO_SUBTITLE}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.CHART_HEATMAP_INFO_COLOR_LABEL}
            </p>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-3 flex-1 rounded-full bg-gradient-to-r from-[hsl(0_75%_48%)] via-[hsl(38_88%_48%)] to-[hsl(142_55%_40%)]" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">{t.CHART_HEATMAP_INFO_COLOR_DESC}</p>

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
