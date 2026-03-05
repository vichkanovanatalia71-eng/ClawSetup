import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clawsetup.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const steps = await prisma.step.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      updatedAt: true,
      module: {
        select: {
          scenario: { select: { slug: true } },
        },
      },
    },
  });

  const stepPages: MetadataRoute.Sitemap = steps.map((step) => ({
    url: `${baseUrl}/instruction/${step.module.scenario.slug}/${step.slug}`,
    lastModified: step.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const scenarios = await prisma.scenario.findMany({
    select: { slug: true, updatedAt: true },
  });

  const scenarioPages: MetadataRoute.Sitemap = scenarios.map((s) => ({
    url: `${baseUrl}/instruction/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...scenarioPages, ...stepPages];
}
