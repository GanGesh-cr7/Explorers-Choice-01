import type { MetadataRoute } from "next";
import { stories } from "@/data/stories";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticRoutes = ["", "/destinations", "/packages", "/about", "/stories", "/faq", "/contact", "/book"];

type SlugSource = { slug: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  for (const story of stories) {
    entries.push({
      url: `${BASE}/stories/${story.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  const { SERVER_API_URL: api } = await import("@/lib/api");

  for (const [prefix, endpoint] of [
    ["/destinations", "/destinations?active=true"],
    ["/packages", "/packages"],
  ] as const) {
    try {
      const res = await fetch(`${api}${endpoint}`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const items = (await res.json()) as SlugSource[];
        for (const item of items) {
          if (item.slug) {
            entries.push({
              url: `${BASE}${prefix}/${item.slug}`,
              changeFrequency: "monthly",
              priority: 0.7,
            });
          }
        }
      }
    } catch {
      // API unavailable at build time — static routes still published.
    }
  }

  return entries;
}