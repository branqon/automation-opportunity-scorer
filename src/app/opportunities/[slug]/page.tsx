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

const siteUrl = "https://branqon.github.io/automation-opportunity-scorer/";

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

  const pageUrl = `${siteUrl}opportunities/${slug}`;

  return {
    title: detail.opportunity.name,
    description: detail.opportunity.summary,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: detail.opportunity.name,
      description: detail.opportunity.summary,
      url: pageUrl,
      images: [
        {
          url: "social-preview.png",
          width: 1200,
          height: 630,
          alt: "Automation Opportunity Scorer dashboard preview",
        },
      ],
    },
    twitter: {
      title: detail.opportunity.name,
      description: detail.opportunity.summary,
      images: ["social-preview.png"],
    },
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
