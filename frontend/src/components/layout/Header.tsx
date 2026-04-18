"use client";

import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useT } from "@/hooks/use-t";
import type { Language } from "@/lib/translations";

const THEME_DARK = "dark";
const THEME_LIGHT = "light";
const LOGO_SIZE = 28;

const LANGUAGE_LABELS: Record<Language, string> = {
  vi: "VI",
  en: "EN",
};

const NEXT_LANGUAGE: Record<Language, Language> = {
  vi: "en",
  en: "vi",
};

export function Header() {
  const t = useT();
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
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-strong lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.png"
            alt="E-LUMI-NATE"
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            className="shrink-0 rounded-full object-cover"
            priority
          />
          <span className="text-lg font-bold tracking-tight">
            E-<span className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">LUMI</span>-NATE
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 w-10 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary"
            aria-label={t.HEADER_SWITCH_LANGUAGE}
          >
            {LANGUAGE_LABELS[lang]}
          </Button>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
              aria-label={theme === THEME_DARK ? t.HEADER_SWITCH_TO_LIGHT : t.HEADER_SWITCH_TO_DARK}
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
    </header>
  );
}
