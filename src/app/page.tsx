import { Suspense } from "react";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { AppShell } from "@/components/ui/app-shell";
import { getAllRawData } from "@/lib/opportunities";

export default async function Home() {
  const { rawOpportunities, teams } = await getAllRawData();

  return (
    <AppShell>
      <Suspense>
        <DashboardClient rawOpportunities={rawOpportunities} teams={teams} />
      </Suspense>
    </AppShell>
  );
}
