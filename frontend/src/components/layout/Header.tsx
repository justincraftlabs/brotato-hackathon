"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
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

const SWITCH_TO_LANGUAGE_LABEL: Record<Language, string> = {
  vi: "Chuyển sang tiếng Anh",
  en: "Chuyển sang tiếng Việt",
};

const SWITCH_TO_DARK_LABEL = "Chuyển sang chế độ tối";
const SWITCH_TO_LIGHT_LABEL = "Chuyển sang chế độ sáng";

export function Header() {
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
        <Link href="/dashboard" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
          E-<span className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">LUMI</span>-NATE
        </Link>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 w-10 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary"
            aria-label={SWITCH_TO_LANGUAGE_LABEL[lang]}
          >
            {LANGUAGE_LABELS[lang]}
          </Button>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
              aria-label={theme === THEME_DARK ? SWITCH_TO_LIGHT_LABEL : SWITCH_TO_DARK_LABEL}
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
