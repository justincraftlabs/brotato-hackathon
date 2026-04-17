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
    <aside className="hidden lg:flex lg:w-[var(--sidebar-width)] lg:shrink-0 lg:flex-col bg-card">
      {/* Logo + controls */}
      <div className="px-6 pb-2 pt-6">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="E-LUMI-NATE"
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            className="rounded-full"
          />
          <span className="text-lg font-bold tracking-tight">
            E-<span className="text-primary">LUMI</span>-NATE
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-7 w-9 px-0 text-[11px] font-semibold text-muted-foreground"
          >
            {LANGUAGE_LABELS[lang]}
          </Button>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-7 w-7 text-muted-foreground"
            >
              {theme === THEME_DARK ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-4 pt-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const label = t[item.labelKey];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "font-bold text-foreground"
                  : "font-medium text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
