import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="w-full min-w-0 flex-1 px-4 pb-20 pt-4 lg:px-8 lg:pb-6 lg:pt-6">{children}</main>
  );
}
