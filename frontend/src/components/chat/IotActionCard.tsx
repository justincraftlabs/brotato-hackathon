"use client";

import { Clock, Smartphone, Wifi, Zap } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

const PHASE2_FEATURES = [
  { icon: Zap, label: "Smart Plug", sub: "Điều khiển từ xa", colorClass: "text-primary", bgClass: "bg-primary/10" },
  { icon: Clock, label: "Lên lịch", sub: "Tự động bật/tắt", colorClass: "text-blue-400", bgClass: "bg-blue-400/10" },
  { icon: Wifi, label: "Theo dõi", sub: "Thời gian thực", colorClass: "text-teal-400", bgClass: "bg-teal-400/10" },
] as const;

interface IotAction {
  icon: ReactNode;
  label: string;
  description: string;
}

interface IotActionCardProps {
  className?: string;
}

export function IotActionCard({ className }: IotActionCardProps) {
  const t = useT();
  const [selectedAction, setSelectedAction] = useState<IotAction | null>(null);

  const IOT_ACTIONS: IotAction[] = [
    {
      icon: <Zap className="h-3.5 w-3.5" />,
      label: t.IOT_ACTION_1_LABEL,
      description: t.IOT_ACTION_1_DESC,
    },
    {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: t.IOT_ACTION_2_LABEL,
      description: t.IOT_ACTION_2_DESC,
    },
    {
      icon: <Smartphone className="h-3.5 w-3.5" />,
      label: t.IOT_ACTION_3_LABEL,
      description: t.IOT_ACTION_3_DESC,
    },
  ];

  return (
    <>
      <div className={cn("ml-9 mt-2 glass rounded-2xl border border-primary/20 p-3.5", className)}>
        <div className="mb-2.5 flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
            <Wifi className="h-3 w-3 text-primary" />
          </div>
          <p className="text-xs font-semibold text-primary">{t.IOT_CARD_TITLE}</p>
          <span className="ml-auto rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {t.IOT_PHASE_LABEL}
          </span>
        </div>
        <p className="mb-2.5 text-xs text-muted-foreground">
          {t.IOT_CARD_SUBTITLE}
        </p>
        <div className="flex flex-col gap-1.5">
          {IOT_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => setSelectedAction(action)}
              className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-card/60 px-3 py-2 text-left text-xs transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="shrink-0 text-primary">{action.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{action.label}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <span className="shrink-0 text-lg leading-none text-muted-foreground/40">›</span>
            </button>
          ))}
        </div>
      </div>

      <Dialog
        open={selectedAction !== null}
        onOpenChange={(open) => !open && setSelectedAction(null)}
      >
        <DialogContent className="max-w-[340px] overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          {/* Gradient hero header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/8 to-transparent px-5 pb-5 pt-5">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
              {t.IOT_DIALOG_PHASE_HEADER}
            </span>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 rounded-xl bg-primary/15 p-2.5">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-snug">
                  {selectedAction?.label}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-sm font-medium text-foreground/70">
                  {selectedAction?.description}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Sẽ có trong Phase 2
              </p>
              <div className="flex gap-2">
                {PHASE2_FEATURES.map(({ icon: FIcon, label, sub, colorClass, bgClass }) => (
                  <div
                    key={label}
                    className={cn("flex flex-1 flex-col items-center gap-1.5 rounded-xl px-1 py-3", bgClass)}
                  >
                    <FIcon className={cn("h-4 w-4", colorClass)} />
                    <p className={cn("text-center text-[9px] font-bold leading-none", colorClass)}>
                      {label}
                    </p>
                    <p className="text-center text-[8px] leading-tight text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 px-3.5 py-3">
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                {t.IOT_DIALOG_INTERIM_TIP}
              </p>
            </div>
          </div>

          <div className="flex justify-end border-t border-border/30 px-4 py-3">
            <Button
              size="sm"
              className="btn-primary-gradient rounded-xl px-5"
              onClick={() => setSelectedAction(null)}
            >
              {t.IOT_DIALOG_GOT_IT}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
