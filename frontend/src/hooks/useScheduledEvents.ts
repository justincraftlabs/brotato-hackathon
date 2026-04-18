"use client";

import { useEffect, useRef, useState } from "react";

import { connectScheduleEvents } from "@/lib/api";
import type { ScheduleFiredEvent } from "@/lib/types";

export function useScheduledEvents(homeId: string | null) {
  const [events, setEvents] = useState<ScheduleFiredEvent[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!homeId) return;

    const es = connectScheduleEvents(homeId);
    esRef.current = es;

    es.addEventListener("schedule-fired", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as ScheduleFiredEvent;
        setEvents((prev) => [...prev, data]);
      } catch {
        // malformed event — ignore
      }
    });

    es.addEventListener("error", () => {
      // SSE connection error — browser will auto-reconnect
    });

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [homeId]);

  function dismiss(scheduleId: string) {
    setEvents((prev) => prev.filter((e) => e.scheduleId !== scheduleId));
  }

  function dismissAll() {
    setEvents([]);
  }

  return { events, dismiss, dismissAll };
}
