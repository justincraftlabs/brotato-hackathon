"use client";

import { useLanguage } from "@/contexts/language-context";
import { getT } from "@/lib/translations";
import type { Translations } from "@/lib/translations";

export function useT(): Translations {
  const { lang } = useLanguage();
  return getT(lang);
}
