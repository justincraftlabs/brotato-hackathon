"use client";

import { Moon, Sun } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <span className="text-lg font-bold tracking-tight">
          E-<span className="text-primary">LUMI</span>-NATE
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="w-10 text-xs font-semibold"
            aria-label={SWITCH_TO_LANGUAGE_LABEL[lang]}
          >
            {LANGUAGE_LABELS[lang]}
          </Button>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === THEME_DARK ? SWITCH_TO_LIGHT_LABEL : SWITCH_TO_DARK_LABEL}
            >
              {theme === THEME_DARK ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
