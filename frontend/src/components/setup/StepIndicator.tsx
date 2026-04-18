"use client";

import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";
import { TOTAL_STEPS } from "@/lib/setup-constants";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const t = useT();
  const steps = [t.STEP_ROOM_LABEL, t.STEP_APPLIANCE_LABEL, t.STEP_CONFIRM_LABEL];

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const stepNumber = index + 1;

        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-primary/80 text-primary-foreground",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {stepNumber}
              </div>
              <span
                className={cn(
                  "text-xs transition-colors",
                  isActive && "font-semibold text-foreground",
                  !isActive && "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {index < TOTAL_STEPS - 1 && (
              <div
                className={cn(
                  "mb-5 h-0.5 w-8 transition-colors",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
