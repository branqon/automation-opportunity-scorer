import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OpportunityDetailClient } from "@/components/detail/opportunity-detail-client";
import { AppShell } from "@/components/ui/app-shell";
import { getAllRawData, getAllSlugs, getOpportunityDetail } from "@/lib/opportunities";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

type OpportunityPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: OpportunityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getOpportunityDetail(slug);

  if (!detail) {
    return {
      title: "Opportunity not found",
    };
  }

  return {
    title: detail.opportunity.name,
    description: detail.opportunity.summary,
  };
}

export default async function OpportunityPage({ params }: OpportunityPageProps) {
  const { slug } = await params;
  const { rawOpportunities, teams } = await getAllRawData();
  const exists = rawOpportunities.some((opportunity) => opportunity.slug === slug);

  if (!exists) {
    notFound();
  }

  return (
    <AppShell>
      <OpportunityDetailClient
        slug={slug}
        rawOpportunities={rawOpportunities}
        teams={teams}
      />
    </AppShell>
  );
}
