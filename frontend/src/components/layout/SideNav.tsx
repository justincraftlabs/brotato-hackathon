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

export function SideNav() {
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
    <nav className="hidden lg:flex lg:w-56 lg:flex-col lg:shrink-0 lg:border-r lg:border-border lg:bg-background/95 lg:pt-2 lg:sticky lg:top-14 lg:self-start lg:h-[calc(100vh-3.5rem)]">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
