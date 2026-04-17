"use client";

import {
  LayoutDashboard,
  Lightbulb,
  MessageCircle,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useT } from "@/hooks/use-t";
import { NAV_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/translations";

const THEME_DARK = "dark";
const THEME_LIGHT = "light";

const LANGUAGE_LABELS: Record<Language, string> = {
  vi: "VI",
  en: "EN",
};

const NEXT_LANGUAGE: Record<Language, Language> = {
  vi: "en",
  en: "vi",
};

interface NavItemDef {
  href: string;
  labelKey: "NAV_OVERVIEW" | "NAV_SETUP" | "NAV_TIPS" | "NAV_ASSISTANT";
  icon: ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItemDef[] = [
  { href: NAV_ROUTES.DASHBOARD, labelKey: "NAV_OVERVIEW", icon: LayoutDashboard },
  { href: NAV_ROUTES.SETUP, labelKey: "NAV_SETUP", icon: Settings },
  { href: NAV_ROUTES.TIPS, labelKey: "NAV_TIPS", icon: Lightbulb },
  { href: NAV_ROUTES.ASSISTANT, labelKey: "NAV_ASSISTANT", icon: MessageCircle },
];

const LOGO_SIZE = 32;

export function Sidebar() {
  const t = useT();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleTheme() {
    setTheme(theme === THEME_DARK ? THEME_LIGHT : THEME_DARK);
  }

  function toggleLanguage() {
    setLang(NEXT_LANGUAGE[lang]);
  }

  return (
    <aside className="hidden lg:flex lg:w-[var(--sidebar-width)] lg:shrink-0 lg:flex-col glass-strong border-r border-border/50">
      {/* Logo */}
      <div className="px-6 pb-4 pt-7">
        <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="E-LUMI-NATE"
              width={LOGO_SIZE}
              height={LOGO_SIZE}
              className="rounded-full ring-2 ring-primary/30"
            />
          </div>
          <span className="text-lg font-bold tracking-tight">
            E-<span className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">LUMI</span>-NATE
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-3 pt-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Menu
        </p>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const label = t[item.labelKey];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-active-bar relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary/12 font-semibold text-primary shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                    : "font-medium text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.8)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Language + Theme — pinned to bottom */}
        <div className="mt-auto border-t border-border/40 px-3 py-5">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="h-8 w-10 rounded-lg px-0 text-[11px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              {LANGUAGE_LABELS[lang]}
            </Button>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                {theme === THEME_DARK ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
