import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/queries";
import { siteConfig } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublishedProducts();

  return [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/catalogue`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({
      url: `${siteConfig.url}/produit/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
