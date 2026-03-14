import type { Metadata } from "next";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { AppShell } from "@/components/ui/app-shell";
import { getAllRawData } from "@/lib/opportunities";

const siteUrl = "https://branqon.github.io/automation-opportunity-scorer/";

export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
  },
};

export default async function Home() {
  const { rawOpportunities, teams } = await getAllRawData();

  return (
    <AppShell>
      <DashboardClient rawOpportunities={rawOpportunities} teams={teams} />
    </AppShell>
  );
}
