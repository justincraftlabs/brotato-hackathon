import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ScheduleToastContainer } from "@/components/schedule/ScheduleToastContainer";
import { SchedulesProvider } from "@/contexts/schedules-context";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SchedulesProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto px-4 pb-20 pt-4 lg:px-8 lg:pb-8 lg:pt-6">
            {children}
          </main>
          <ScheduleToastContainer />
          <BottomNav />
        </div>
      </div>
    </SchedulesProvider>
  );
}
