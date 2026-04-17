"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useScheduledEvents } from "@/hooks/useScheduledEvents";
import { LOCAL_STORAGE_HOME_ID_KEY } from "@/lib/constants";
import { ScheduleToast } from "./ScheduleToast";

export function ScheduleToastContainer() {
  const [homeId] = useLocalStorage(LOCAL_STORAGE_HOME_ID_KEY);
  const { events, dismiss } = useScheduledEvents(homeId ?? null);

  if (events.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex w-80 flex-col gap-3 lg:bottom-6 lg:right-6">
      {events.map((event) => (
        <ScheduleToast key={event.scheduleId} event={event} onDismiss={dismiss} />
      ))}
    </div>
  );
}
