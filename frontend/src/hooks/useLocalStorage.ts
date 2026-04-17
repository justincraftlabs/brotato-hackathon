"use client";

import { useCallback, useState } from "react";

export function useLocalStorage(
  key: string
): [string | null, (value: string) => void] {
  const [storedValue, setStoredValue] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(key);
  });

  const setValue = useCallback(
    (value: string) => {
      setStoredValue(value);
      window.localStorage.setItem(key, value);
    },
    [key]
  );

  return [storedValue, setValue];
}
