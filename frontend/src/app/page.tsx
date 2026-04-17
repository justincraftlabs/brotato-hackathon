"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  APP_DESCRIPTION,
  APP_DESCRIPTION_VI,
  CTA_BACK_TO_DASHBOARD,
  CTA_GET_STARTED,
  LOCAL_STORAGE_HOME_ID_KEY,
  NAV_ROUTES,
} from "@/lib/constants";

export default function HomePage() {
  const [hasExistingHome, setHasExistingHome] = useState(false);

  useEffect(() => {
    const storedHomeId = localStorage.getItem(LOCAL_STORAGE_HOME_ID_KEY);
    if (storedHomeId) {
      setHasExistingHome(true);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          E-<span className="text-primary">LUMI</span>-NATE
        </h1>

        <p className="text-lg text-muted-foreground">{APP_DESCRIPTION}</p>

        <p className="text-sm text-muted-foreground">{APP_DESCRIPTION_VI}</p>

        <div className="flex flex-col gap-3 pt-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary-mid">
            <Link href={NAV_ROUTES.SETUP}>{CTA_GET_STARTED}</Link>
          </Button>

          {hasExistingHome && (
            <Button asChild variant="outline" size="lg">
              <Link href={NAV_ROUTES.DASHBOARD}>
                {CTA_BACK_TO_DASHBOARD}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
