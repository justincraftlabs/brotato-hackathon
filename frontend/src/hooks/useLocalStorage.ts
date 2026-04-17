"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage(
  key: string
): [string | null, (value: string) => void] {
  const [storedValue, setStoredValue] = useState<string | null>(null);

  useEffect(() => {
    setStoredValue(window.localStorage.getItem(key));
  }, [key]);

  const setValue = useCallback(
    (value: string) => {
      setStoredValue(value);
      window.localStorage.setItem(key, value);
    },
    [key]
  );

  return [storedValue, setValue];
}
