"use client";

import { Leaf, Loader2, Zap, TrendingDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getScheduleSavings } from "@/lib/api";
import { formatKwh, formatVnd } from "@/lib/format";
import type { SavingsTotals } from "@/lib/types";

const POLL_INTERVAL_MS = 15000;

interface CounterValueProps {
  value: number;
  format: (v: number) => string;
}

// Minimal animated counter: animates from previous to next value
function CounterValue({ value, format }: CounterValueProps) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;

    const DURATION = 800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayed(from + (to - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <>{format(displayed)}</>;
}

interface SavingsCounterProps {
  homeId: string;
}

export function SavingsCounter({ homeId }: SavingsCounterProps) {
  const [data, setData] = useState<SavingsTotals | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSavings = useCallback(async () => {
    const result = await getScheduleSavings(homeId);
    if (result.success) {
      setData(result.data);
    }
    setLoading(false);
  }, [homeId]);

  useEffect(() => {
    fetchSavings();
    const interval = setInterval(fetchSavings, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchSavings]);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-4 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Đang tải tiết kiệm thực tế...</span>
      </div>
    );
  }

  const totals = data ?? { totalSavingsVnd: 0, totalSavingsKwh: 0, treesEquivalent: 0, completionCount: 0 };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingDown className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-primary">Đã tiết kiệm được</p>
        {totals.completionCount > 0 && (
          <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {totals.completionCount} hành động
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-primary/5 p-3 text-center">
          <TrendingDown className="h-4 w-4 text-primary" />
          <p className="text-lg font-bold text-primary leading-tight">
            <CounterValue value={totals.totalSavingsVnd} format={formatVnd} />
          </p>
          <p className="text-[10px] text-muted-foreground">VND tiết kiệm</p>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-xl bg-chart-1/10 p-3 text-center">
          <Zap className="h-4 w-4 text-chart-1" />
          <p className="text-lg font-bold text-chart-1 leading-tight">
            <CounterValue value={totals.totalSavingsKwh} format={formatKwh} />
          </p>
          <p className="text-[10px] text-muted-foreground">kWh tiết kiệm</p>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-xl bg-chart-3/10 p-3 text-center">
          <Leaf className="h-4 w-4 text-chart-3" />
          <p className="text-lg font-bold text-chart-3 leading-tight">
            🌳 {totals.treesEquivalent.toFixed(1)}
          </p>
          <p className="text-[10px] text-muted-foreground">cây tương đương</p>
        </div>
      </div>

      {totals.completionCount === 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Nhấn "Đã làm ✓" trên nhắc nhở để ghi nhận tiết kiệm
        </p>
      )}
    </div>
  );
}
