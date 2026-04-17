"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  APP_DESCRIPTION,
  LOCAL_STORAGE_HOME_ID_KEY,
  NAV_ROUTES,
} from "@/lib/constants";
import { useT } from "@/hooks/use-t";

export default function HomePage() {
  const t = useT();
  const [hasExistingHome, setHasExistingHome] = useState(false);

  useEffect(() => {
    const storedHomeId = localStorage.getItem(LOCAL_STORAGE_HOME_ID_KEY);
    if (storedHomeId) {
      setHasExistingHome(true);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center lg:max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          E-<span className="text-primary">LUMI</span>-NATE
        </h1>

        <p className="text-lg text-muted-foreground lg:text-xl">{APP_DESCRIPTION}</p>

        <p className="text-sm text-muted-foreground lg:text-base">{t.APP_DESCRIPTION_VI}</p>

        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="sm:min-w-40">
            <Link href={NAV_ROUTES.SETUP}>{t.CTA_GET_STARTED}</Link>
          </Button>

          {hasExistingHome && (
            <Button asChild variant="outline" size="lg" className="sm:min-w-40">
              <Link href={NAV_ROUTES.DASHBOARD}>
                {t.CTA_BACK_TO_DASHBOARD}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
