import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="mx-auto max-w-lg px-4 pb-20 pt-4">{children}</main>
  );
}
