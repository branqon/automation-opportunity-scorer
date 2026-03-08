import { AppShell } from "@/components/ui/app-shell";
import { CreateOpportunityClient } from "@/components/opportunities/create-opportunity-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "New Opportunity" };

export default async function NewOpportunityPage() {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  return (
    <AppShell>
      <CreateOpportunityClient
        teams={teams.map((t) => ({ id: t.id, slug: t.slug, name: t.name }))}
      />
    </AppShell>
  );
}
