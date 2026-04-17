"use client";

import { Home, MessageCircle, Settings, Sliders } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";
import { NAV_LABELS, NAV_ROUTES } from "@/lib/constants";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: NAV_ROUTES.DASHBOARD, label: NAV_LABELS.OVERVIEW, icon: Home },
  { href: NAV_ROUTES.CHAT, label: NAV_LABELS.CHAT, icon: MessageCircle },
  { href: NAV_ROUTES.SIMULATOR, label: NAV_LABELS.SIMULATOR, icon: Sliders },
  { href: NAV_ROUTES.SETUP, label: NAV_LABELS.SETUP, icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
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
