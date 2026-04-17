"use client";

import { Home, Lightbulb, MessageCircle, Settings, Sliders } from "lucide-react";
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
    { href: NAV_ROUTES.DASHBOARD, label: t.NAV_OVERVIEW, icon: Home },
    { href: NAV_ROUTES.CHAT, label: t.NAV_CHAT, icon: MessageCircle },
    { href: NAV_ROUTES.SIMULATOR, label: t.NAV_SIMULATOR, icon: Sliders },
    { href: NAV_ROUTES.SETUP, label: t.NAV_SETUP, icon: Settings },
    { href: NAV_ROUTES.SUGGESTIONS, label: t.NAV_SUGGESTIONS, icon: Lightbulb },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="flex h-16 items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-xs transition-colors",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
