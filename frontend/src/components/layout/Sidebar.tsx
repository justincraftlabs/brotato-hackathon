"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
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
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { NAV_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/translations";

const THEME_DARK = "dark";
const THEME_LIGHT = "light";
const SIDEBAR_STORAGE_KEY = "sidebar-expanded";
const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_MINI_WIDTH = 68;
const LOGO_SIZE = 32;

const SIDEBAR_SPRING: Parameters<typeof motion.aside>[0]["transition"] = {
  type: "spring",
  stiffness: 340,
  damping: 32,
  mass: 0.85,
};

const LABEL_VARIANTS = {
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.07, duration: 0.16, ease: "easeOut" as const },
  },
  hidden: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.1, ease: "easeIn" as const },
  },
};

const LANGUAGE_LABELS: Record<Language, string> = {
  vi: "VI",
  en: "EN",
};

const NEXT_LANGUAGE: Record<Language, Language> = {
  vi: "en",
  en: "vi",
};

type NavLabelKey =
  | "NAV_OVERVIEW"
  | "NAV_ASSISTANT"
  | "NAV_TIPS"
  | "NAV_SIMULATOR"
  | "NAV_SETUP";

interface NavItemDef {
  href: string;
  labelKey: NavLabelKey;
  icon: ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItemDef[] = [
  { href: NAV_ROUTES.DASHBOARD, labelKey: "NAV_OVERVIEW", icon: LayoutDashboard },
  { href: NAV_ROUTES.ASSISTANT, labelKey: "NAV_ASSISTANT", icon: MessageCircle },
  { href: NAV_ROUTES.TIPS, labelKey: "NAV_TIPS", icon: Lightbulb },
  { href: NAV_ROUTES.SETUP, labelKey: "NAV_SETUP", icon: Settings },
];

export function Sidebar() {
  const t = useT();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [storedExpanded, setStoredExpanded] = useLocalStorage(SIDEBAR_STORAGE_KEY);

  // null means not yet hydrated from localStorage — default to expanded
  const expanded = storedExpanded !== "false";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep --sidebar-width in sync so offset-aware elements (FixedBottomActions etc.) align
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      expanded ? `${SIDEBAR_EXPANDED_WIDTH}px` : `${SIDEBAR_MINI_WIDTH}px`
    );
  }, [expanded]);

  function toggleExpanded() {
    setStoredExpanded(expanded ? "false" : "true");
  }

  function toggleTheme() {
    setTheme(theme === THEME_DARK ? THEME_LIGHT : THEME_DARK);
  }

  function toggleLanguage() {
    setLang(NEXT_LANGUAGE[lang]);
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_MINI_WIDTH }}
      transition={SIDEBAR_SPRING}
      className="hidden lg:flex lg:shrink-0 lg:flex-col glass-strong border-r border-border/50 overflow-hidden"
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          "flex items-center pb-5 pt-7 transition-[padding] duration-200",
          expanded ? "px-6" : "justify-center px-0"
        )}
      >
        <Link
          href={NAV_ROUTES.DASHBOARD}
          className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.png"
            alt="E-LUMI-NATE"
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            className="shrink-0 rounded-full ring-2 ring-primary/30"
          />
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.span
                key="logo-text"
                variants={LABEL_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="whitespace-nowrap text-lg font-bold tracking-tight"
              >
                E-
                <span className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">
                  LUMI
                </span>
                -NATE
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav
        className={cn(
          "flex flex-1 flex-col pt-1",
          expanded ? "px-3" : "px-2"
        )}
      >
        {/* Section label */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.p
              key="menu-heading"
              variants={LABEL_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70"
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>

        {/* Nav items */}
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const label = t[item.labelKey];

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!expanded ? label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "sidebar-nav-link",
                  isActive ? "sidebar-nav-active" : "sidebar-nav-inactive",
                  expanded ? "px-3" : "justify-center px-0"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.span
                      key="label"
                      variants={LABEL_VARIANTS}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex-1 overflow-hidden whitespace-nowrap text-sm"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active dot — only in expanded mode */}
                <AnimatePresence initial={false}>
                  {isActive && expanded && (
                    <motion.span
                      key="active-dot"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, transition: { delay: 0.12 } }}
                      exit={{ scale: 0, opacity: 0, transition: { duration: 0.08 } }}
                      className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.8)]"
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* ── Bottom controls: Language · Theme · Collapse ── */}
        <div
          className={cn(
            "mt-auto border-t border-border/40 py-4",
            expanded ? "px-1" : "px-0"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-1",
              !expanded && "flex-col"
            )}
          >
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              title="Toggle language"
              className="h-8 w-10 rounded-lg px-0 text-[11px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              {LANGUAGE_LABELS[lang]}
            </Button>

            {/* Theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title={theme === THEME_DARK ? "Switch to light mode" : "Switch to dark mode"}
                className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                {theme === THEME_DARK ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Collapse / Expand toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpanded}
              title={expanded ? "Collapse sidebar" : "Expand sidebar"}
              className={cn(
                "h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary",
                expanded && "ml-auto"
              )}
            >
              {expanded ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </nav>
    </motion.aside>
  );
}
