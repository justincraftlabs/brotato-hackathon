"use client";

import { Clock, Smartphone, Wifi, Zap } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface IotAction {
  icon: ReactNode;
  label: string;
  description: string;
}

const IOT_ACTIONS: IotAction[] = [
  {
    icon: <Zap className="h-3.5 w-3.5" />,
    label: "Tắt standby tự động",
    description: "Smart plug cắt điện khi không dùng >30 phút",
  },
  {
    icon: <Clock className="h-3.5 w-3.5" />,
    label: "Lên lịch cắt điện đêm",
    description: "Tự động tắt 23:00, bật lại 6:00 sáng",
  },
  {
    icon: <Smartphone className="h-3.5 w-3.5" />,
    label: "Điều khiển từ xa",
    description: "Tắt tất cả standby chỉ với 1 nút",
  },
];

interface IotActionCardProps {
  className?: string;
}

export function IotActionCard({ className }: IotActionCardProps) {
  const [selectedAction, setSelectedAction] = useState<IotAction | null>(null);

  function handleActionClick(action: IotAction) {
    setSelectedAction(action);
  }

  return (
    <>
      <div className={cn("ml-9 mt-2 glass rounded-2xl border border-primary/20 p-3.5", className)}>
        <div className="mb-2.5 flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
            <Wifi className="h-3 w-3 text-primary" />
          </div>
          <p className="text-xs font-semibold text-primary">Tự động hóa với IoT</p>
          <span className="ml-auto rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Phase 2
          </span>
        </div>
        <p className="mb-2.5 text-xs text-muted-foreground">
          Muốn app tự động điều khiển thiết bị để loại bỏ điện vô hình?
        </p>
        <div className="flex flex-col gap-1.5">
          {IOT_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleActionClick(action)}
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
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/60 bg-card p-0 sm:rounded-2xl">
          <div className="border-b border-border/40 bg-primary/8 px-5 py-4">
            <DialogHeader className="gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Wifi className="h-4 w-4 shrink-0 text-primary" />
                {selectedAction?.label}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedAction?.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-5 py-4">
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/8 px-4 py-3">
                <p className="mb-1 text-xs font-semibold text-amber-400">
                  🚧 Tính năng IoT — Phase 2
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Tính năng này yêu cầu tích hợp thiết bị Smart Plug / IoT
                  Gateway vào hệ thống.
                </p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                🗓️ <strong>Lộ trình:</strong> Chúng tôi đang lên kế hoạch tích
                hợp IoT trong <strong>Phase 2</strong> — cho phép E-LUMI-NATE
                điều khiển trực tiếp ổ cắm thông minh, lên lịch tắt thiết bị,
                và giám sát tiêu thụ theo thời gian thực.
              </p>
              <div className="rounded-xl bg-muted/30 px-3.5 py-3">
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  💡 Hiện tại: Làm theo gợi ý thủ công từ AI để rút phích hoặc
                  bật/tắt đúng giờ — tiết kiệm tương đương!
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-border/30 px-4 py-3">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => setSelectedAction(null)}
            >
              Đã hiểu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
