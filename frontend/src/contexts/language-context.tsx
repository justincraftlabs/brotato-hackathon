"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { Language } from "@/lib/translations";

const LANGUAGE_STORAGE_KEY = "lang";
const DEFAULT_LANGUAGE: Language = "en";
const VALID_LANGUAGES: Language[] = ["en", "vi"];

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANGUAGE,
  setLang: () => undefined,
});

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (stored !== null && VALID_LANGUAGES.includes(stored)) {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
