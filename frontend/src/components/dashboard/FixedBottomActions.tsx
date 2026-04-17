"use client";

import { Lightbulb, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FixedBottomActionsProps {
  tipsLabel: string;
  simulateLabel: string;
  tipsHref: string;
  simulateHref: string;
}

export function FixedBottomActions({
  tipsLabel,
  simulateLabel,
  tipsHref,
  simulateHref,
}: FixedBottomActionsProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        // positioning: above BottomNav on mobile (h-16 = bottom-16), flush bottom on desktop
        "fixed bottom-16 left-0 right-0 z-40",
        "lg:bottom-0 lg:left-[var(--sidebar-width)]",
        // glassmorphism
        "border-t border-border/30 backdrop-blur-md",
        "bg-background/70 dark:bg-black/40",
        // slide-up animation
        "transition-all duration-500 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-2.5 px-4 py-3 sm:flex-row sm:gap-3 lg:px-8 lg:py-4">
        <Button
          asChild
          className="btn-primary-gradient flex-1 gap-2 rounded-xl"
        >
          <Link href={tipsHref}>
            <Lightbulb className="h-4 w-4 shrink-0" />
            {tipsLabel}
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="flex-1 gap-2 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          <Link href={simulateHref}>
            <Zap className="h-4 w-4 shrink-0" />
            {simulateLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
}
