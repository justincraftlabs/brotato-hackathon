"use client";

import { Bell, LayoutDashboard, Lightbulb, MessageCircle, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";
import { NAV_ROUTES } from "@/lib/constants";
import { useT } from "@/hooks/use-t";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export function BottomNav() {
  const t = useT();
  const pathname = usePathname();

  const NAV_ITEMS: NavItem[] = [
    { href: NAV_ROUTES.DASHBOARD, label: t.NAV_OVERVIEW, icon: LayoutDashboard },
    { href: NAV_ROUTES.ASSISTANT, label: t.NAV_ASSISTANT, icon: MessageCircle },
    { href: NAV_ROUTES.TIPS, label: t.NAV_TIPS, icon: Lightbulb },
    { href: NAV_ROUTES.SCHEDULES, label: t.NAV_SCHEDULES, icon: Bell },
    { href: NAV_ROUTES.SETUP, label: t.NAV_SETUP, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border/50 glass-strong lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs transition-all duration-200",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
              )}
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  isActive ? "bg-primary/15" : ""
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
