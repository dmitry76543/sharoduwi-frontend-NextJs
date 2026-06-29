import type { Metadata } from "next";

import { BlogIndexContent } from "@/components/BlogIndexContent";
import { InfoPageShell } from "@/components/InfoPageShell";
import { JsonLd } from "@/components/JsonLd";
import { BLOG_POSTS } from "@/lib/blog";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBlogListSchema,
  buildBreadcrumbSchema,
  toJsonLdGraph,
} from "@/lib/seo/schema";

export const metadata: Metadata = buildPageMetadata({
  title: "Гелиевые и воздушные шары: советы и идеи",
  description:
    "Статьи о гелиевых и воздушных шарах: срок полёта, идеи для дня рождения, выписка из роддома. Советы от магазина ШАРОДУВЫ в Жуковском.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const schema = toJsonLdGraph(
    buildBreadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "Полезное", path: "/blog" },
    ]),
    buildBlogListSchema(BLOG_POSTS)
  );

  return (
    <>
      <JsonLd data={schema} />
      <InfoPageShell>
        <BlogIndexContent />
      </InfoPageShell>
    </>
  );
}
