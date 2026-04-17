"use client";

import { Info, PlugZap } from "lucide-react";
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
import type { VampireData } from "@/lib/types";

interface VampireAppliancesProps {
  vampireData: VampireData;
  totalMonthlyKwh: number;
}

const VAMPIRE_HIGH_PERCENT = 15;
const VAMPIRE_WARN_PERCENT = 8;

function getVampireColor(percent: number): string {
  if (percent >= VAMPIRE_HIGH_PERCENT) return "text-red-400";
  if (percent >= VAMPIRE_WARN_PERCENT) return "text-amber-400";
  return "text-primary";
}

function getVampireBarColor(percent: number): string {
  if (percent >= VAMPIRE_HIGH_PERCENT) return "bg-red-400";
  if (percent >= VAMPIRE_WARN_PERCENT) return "bg-amber-400";
  return "bg-primary";
}

export function VampireAppliances({
  vampireData,
  totalMonthlyKwh,
}: VampireAppliancesProps) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { topVampires, totalStandbyKwh, totalStandbyCost, vampirePercent } =
    vampireData;

  const percentColor = getVampireColor(vampirePercent);
  const barColor = getVampireBarColor(vampirePercent);
  const activeKwh = totalMonthlyKwh - totalStandbyKwh;
  const activePercent = totalMonthlyKwh > 0 ? (activeKwh / totalMonthlyKwh) * 100 : 100;

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden card-hover-glow h-full flex flex-col">
        {/* Header */}
        <div className="shrink-0 px-4 pt-4 pb-0 lg:px-5 lg:pt-5">
          <div className="flex items-center gap-2">
            <PlugZap className="h-4 w-4 text-amber-400 shrink-0" />
            <h3 className="text-sm font-bold">{t.VAMPIRE_CARD_TITLE}</h3>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              title={t.VAMPIRE_CARD_SUBTITLE}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition-all duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t.VAMPIRE_CARD_SUBTITLE}
          </p>
        </div>

        {/* Stats row */}
        <div className="shrink-0 grid grid-cols-3 gap-2 px-4 pt-3 pb-0 lg:px-5">
          <div>
            <p className="text-[10px] text-muted-foreground">{t.VAMPIRE_TOTAL_KWH}</p>
            <p className="mt-0.5 text-sm font-bold">{formatKwh(totalStandbyKwh)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">{t.VAMPIRE_TOTAL_COST}</p>
            <p className="mt-0.5 text-sm font-bold">{formatVnd(totalStandbyCost)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">{t.VAMPIRE_PERCENT_SUFFIX}</p>
            <p className={cn("mt-0.5 text-sm font-bold", percentColor)}>
              {vampirePercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Active vs standby bar */}
        <div className="shrink-0 px-4 pt-2 pb-0 lg:px-5">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full bg-primary/40 transition-all duration-700"
              style={{ width: `${activePercent}%` }}
            />
            <div
              className={cn("h-full transition-all duration-700", barColor)}
              style={{ width: `${vampirePercent}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Hoạt động</span>
            <span className={cn("font-medium", percentColor)}>
              Vô hình {vampirePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Vampire list */}
        <div className="flex-1 px-4 pb-4 pt-3 lg:px-5 lg:pb-5">
          {topVampires.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              {t.VAMPIRE_EMPTY}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t.VAMPIRE_TOP_TITLE}
              </p>
              {topVampires.map((v) => {
                const sharePercent =
                  totalStandbyKwh > 0
                    ? (v.monthlyStandbyKwh / totalStandbyKwh) * 100
                    : 0;
                return (
                  <div
                    key={v.applianceId}
                    className="flex items-center gap-2"
                  >
                    <PlugZap className="h-3 w-3 shrink-0 text-amber-400/70" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-medium">
                          {v.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatKwh(v.monthlyStandbyKwh)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex h-1 w-full overflow-hidden rounded-full bg-muted/30">
                        <div
                          className="h-full bg-amber-400/60"
                          style={{ width: `${sharePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Info dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          <div className="border-b border-border/40 bg-amber-400/8 px-5 py-4">
            <DialogHeader className="gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <PlugZap className="h-4 w-4 shrink-0 text-amber-400" />
                {t.VAMPIRE_CARD_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t.VAMPIRE_CARD_SUBTITLE}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Tại sao quan trọng?
            </p>
            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground leading-relaxed">
              <p>🔌 <strong>10%</strong> điện năng của hộ gia đình trung bình bị tiêu thụ âm thầm bởi thiết bị ở chế độ chờ.</p>
              <p>⚡ <strong>1 Watt chờ = 9 kWh/năm</strong> — một thiết bị nhỏ cũng đang hút điện 24/7.</p>
              <p>💡 Rút phích hoặc dùng ổ điện có công tắc để loại bỏ hoàn toàn điện ma.</p>
            </div>
            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/8 px-3.5 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                💡 {t.VAMPIRE_UNPLUG_TIP} — tiết kiệm ngay {formatVnd(totalStandbyCost)}/tháng.
              </p>
            </div>
          </div>
          <div className="border-t border-border/30 bg-muted/30 px-4 py-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              * Tính dựa trên công suất chờ đã cấu hình, hoạt động liên tục 24/7.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
