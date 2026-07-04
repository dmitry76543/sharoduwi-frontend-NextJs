import type { Metadata } from "next";

import { InfoPageShell } from "@/components/InfoPageShell";
import { JsonLd } from "@/components/JsonLd";
import { ReviewsPageContent } from "@/components/ReviewsPageContent";
import { REVIEWS } from "@/lib/data";
import { buildRootRegionalDuplicateMetadata } from "@/lib/cities";
import {
  buildBreadcrumbSchema,
  buildReviewsPageSchema,
  toJsonLdGraph,
} from "@/lib/seo/schema";

export const metadata: Metadata = buildRootRegionalDuplicateMetadata({
  title: "Отзывы о гелиевых и воздушных шарах",
  description:
    "Отзывы о магазине ШАРОДУВЫ в Жуковском: гелиевые и воздушные шары, доставка, обслуживание. Реальные отзывы с Яндекс.Карт — ул. Чкалова и ТЦ «Фермер».",
  restPath: "/reviews",
});

export default function ReviewsPage() {
  const schema = toJsonLdGraph(
    buildBreadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "Отзывы", path: "/reviews" },
    ]),
    buildReviewsPageSchema(REVIEWS)
  );

  return (
    <>
      <JsonLd data={schema} />
      <InfoPageShell>
        <ReviewsPageContent />
      </InfoPageShell>
    </>
  );
}
