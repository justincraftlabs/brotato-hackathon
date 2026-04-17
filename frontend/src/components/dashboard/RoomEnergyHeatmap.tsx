"use client";

import { Map as MapIcon } from "lucide-react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";

import { formatKwh, formatVnd } from "@/lib/format";
import type { TopConsumer } from "@/lib/types";

interface RoomEnergyHeatmapProps {
  consumers: TopConsumer[];
}

interface RoomStat {
  name: string;
  size: number;
  cost: number;
  count: number;
  [key: string]: unknown;
}

function buildRoomData(consumers: TopConsumer[]): RoomStat[] {
  const map = new Map<string, RoomStat>();
  consumers.forEach((c) => {
    const existing = map.get(c.roomName);
    if (existing) {
      existing.size += c.monthlyKwh;
      existing.cost += c.monthlyCost;
      existing.count += 1;
    } else {
      map.set(c.roomName, {
        name: c.roomName,
        size: c.monthlyKwh,
        cost: c.monthlyCost,
        count: 1,
      });
    }
  });
  return Array.from(map.values())
    .map((r) => ({ ...r, size: Math.round(r.size * 10) / 10 }))
    .sort((a, b) => b.size - a.size);
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

// Recharts Treemap custom cell renderer
interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  index?: number;
  root?: { children?: unknown[] };
}

function TreemapCell(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", value = 0, index = 0, root } = props;
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
    </g>
  );
}

interface TooltipPayload {
  payload?: RoomStat;
}

interface HeatmapTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function HeatmapTooltip({ active, payload }: HeatmapTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card/95 px-3 py-2.5 shadow-xl backdrop-blur-sm">
      <p className="text-sm font-bold">{d.name}</p>
      <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
        <span>{formatKwh(d.size)}</span>
        <span>{formatVnd(d.cost)}</span>
        <span>{d.count} thiết bị</span>
      </div>
    </div>
  );
}

const CHART_MIN_HEIGHT = 220;

export function RoomEnergyHeatmap({ consumers }: RoomEnergyHeatmapProps) {
  const data = buildRoomData(consumers);

  if (data.length === 0) return null;

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover-glow h-full flex flex-col">
      <div className="shrink-0 px-4 pt-4 pb-0 lg:px-5 lg:pt-5">
        <div className="flex items-center gap-2">
          <MapIcon className="h-4 w-4 text-primary shrink-0" />
          <h3 className="text-sm font-bold">Bản đồ nhiệt theo phòng</h3>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Phòng nào đang tiêu thụ nhiều nhất?
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
                />
              )}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
