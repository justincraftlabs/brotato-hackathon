"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  activateAllSchedules,
  deleteAllSchedules,
  deleteScheduleApi,
  listSchedules,
  toggleSchedule,
} from "@/lib/api";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LOCAL_STORAGE_HOME_ID_KEY } from "@/lib/constants";
import type { ActivateAllItem, Schedule } from "@/lib/types";

interface SchedulesContextValue {
  schedules: Schedule[];
  loading: boolean;
  /** Set of "roomName:applianceName" keys that are already scheduled */
  activatedKeys: Set<string>;
  /** Activate a batch of items (or a single item) and update shared state */
  activate: (items: ActivateAllItem[]) => Promise<Schedule[]>;
  /** Toggle pause/active on a schedule */
  toggle: (scheduleId: string) => Promise<void>;
  /** Delete a single schedule */
  remove: (scheduleId: string) => Promise<void>;
  /** Delete ALL schedules for this home (called on Re-analyze) */
  clearAll: () => Promise<void>;
  /** Force a refresh from the backend */
  refresh: () => Promise<void>;
}

const SchedulesContext = createContext<SchedulesContextValue | null>(null);

export function SchedulesProvider({ children }: { children: ReactNode }) {
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedForHomeId = useRef<string | null>(null);

  const fetch = useCallback(async (id: string) => {
    setLoading(true);
    const result = await listSchedules(id);
    setLoading(false);
    if (result.success) {
      setSchedules(result.data);
    }
  }, []);

  // Initial load when homeId becomes available
  useEffect(() => {
    if (!homeId || fetchedForHomeId.current === homeId) return;
    fetchedForHomeId.current = homeId;
    fetch(homeId);
  }, [homeId, fetch]);

  const activatedKeys = new Set(
    schedules.map((s) => `${s.roomName}:${s.applianceName}`)
  );

  const activate = useCallback(
    async (items: ActivateAllItem[]): Promise<Schedule[]> => {
      if (!homeId || items.length === 0) return [];
      const result = await activateAllSchedules(homeId, items);
      if (result.success) {
        setSchedules((prev) => {
          const existingIds = new Set(prev.map((s) => s.scheduleId));
          const newOnes = result.data.filter((s) => !existingIds.has(s.scheduleId));
          return [...prev, ...newOnes];
        });
        return result.data;
      }
      return [];
    },
    [homeId]
  );

  const toggle = useCallback(async (scheduleId: string) => {
    const result = await toggleSchedule(scheduleId);
    if (result.success) {
      setSchedules((prev) =>
        prev.map((s) => (s.scheduleId === scheduleId ? result.data : s))
      );
    }
  }, []);

  const remove = useCallback(async (scheduleId: string) => {
    await deleteScheduleApi(scheduleId);
    setSchedules((prev) => prev.filter((s) => s.scheduleId !== scheduleId));
  }, []);

  const clearAll = useCallback(async () => {
    if (!homeId) return;
    await deleteAllSchedules(homeId);
    setSchedules([]);
    fetchedForHomeId.current = null; // allow re-fetch after re-analyze
  }, [homeId]);

  const refresh = useCallback(async () => {
    if (!homeId) return;
    await fetch(homeId);
  }, [homeId, fetch]);

  return (
    <SchedulesContext.Provider
      value={{ schedules, loading, activatedKeys, activate, toggle, remove, clearAll, refresh }}
    >
      {children}
    </SchedulesContext.Provider>
  );
}

export function useSchedules(): SchedulesContextValue {
  const ctx = useContext(SchedulesContext);
  if (!ctx) throw new Error("useSchedules must be used within SchedulesProvider");
  return ctx;
}
