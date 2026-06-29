import type { BlogPost } from "@/lib/blog";
import type { Product, ProductDetails } from "@/lib/data";
import type { CollectionSlug } from "@/lib/products";
import { getProductSlug } from "@/lib/product-slug";
import { absoluteUrl, resolveImageUrl } from "@/lib/seo/metadata";
import {
  SITE_LOCATIONS,
  SITE_NAME,
  SITE_PHONE,
  SITE_URL,
} from "@/lib/seo/site";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function toJsonLdGraph(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function buildOrganizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/favicon.svg"),
    telephone: SITE_PHONE,
    sameAs: [
      "https://max.ru/u/f9LHodD0cOJ0iFHpDtxRvHxZb55wWIT4L1UpmBingh61XxPU-GdBpm5h-ls",
      "https://t.me/+79267086374",
    ],
  };
}

export function buildLocalBusinessSchema() {
  return {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    description:
      "Магазин гелиевых и воздушных шаров и праздничных композиций в Жуковском с доставкой по Раменскому району.",
    url: SITE_URL,
    telephone: SITE_PHONE,
    image: resolveImageUrl(),
    priceRange: "₽₽",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Жуковский",
      addressRegion: "Московская область",
      addressCountry: "RU",
    },
    department: SITE_LOCATIONS.map((location) => ({
      "@type": "LocalBusiness",
      name: location.name,
      url: location.mapUrl,
      telephone: SITE_PHONE,
      address: {
        "@type": "PostalAddress",
        streetAddress: location.streetAddress,
        addressLocality: location.addressLocality,
        addressRegion: location.addressRegion,
        postalCode: location.postalCode,
        addressCountry: "RU",
      },
    })),
  };
}

export function buildWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "ru-RU",
  };
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildProductSchema(product: ProductDetails) {
  const slug = getProductSlug(product);
  const productUrl = absoluteUrl(`/products/${slug}`);
  const description =
    stripHtml(product.briefDescription ?? product.description ?? "") ||
    `${product.name} из коллекции «${product.collection}». Гелиевые и воздушные шары с доставкой по Жуковскому и Раменскому району.`;
  const images = (product.images.length ? product.images : product.img ? [product.img] : [])
    .map((src) => resolveImageUrl(src))
    .filter(Boolean);

  return {
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description,
    sku: product.artNo ?? String(product.id),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    image: images.length ? images : [resolveImageUrl()],
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "RUB",
      price: product.price > 0 ? product.price : undefined,
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

export function buildCollectionItemListSchema(
  collectionName: string,
  collectionSlug: CollectionSlug,
  products: Product[]
) {
  return {
    "@type": "ItemList",
    name: collectionName,
    url: absoluteUrl(`/categories/${collectionSlug}`),
    numberOfItems: products.length,
    itemListElement: products.slice(0, 24).map((product, index) => {
      const slug = getProductSlug(product);
      return {
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/products/${slug}`),
        name: product.name,
      };
    }),
  };
}

export type ReviewItem = {
  name: string;
  rating: number;
  text: string;
};

export function buildReviewsPageSchema(reviews: ReviewItem[]) {
  const reviewCount = reviews.length;
  const ratingValue =
    reviewCount > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
      : "5";

  return {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/reviews#reviews`,
    name: SITE_NAME,
    url: absoluteUrl("/reviews"),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount: String(reviewCount),
      bestRating: "5",
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(review.rating),
        bestRating: "5",
      },
      reviewBody: review.text,
    })),
  };
}

export function buildBlogPostingSchema(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: url,
    url,
    inLanguage: "ru-RU",
    image: resolveImageUrl(),
  };
}

export function buildBlogListSchema(posts: BlogPost[]) {
  return {
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: "Полезное о шарах — ШАРОДУВЫ",
    url: absoluteUrl("/blog"),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt,
    })),
  };
}

export function buildCatalogItemListSchema(products: Product[]) {
  return {
    "@type": "ItemList",
    name: "Каталог гелиевых и воздушных шаров",
    url: absoluteUrl("/catalog"),
    numberOfItems: products.length,
    itemListElement: products.slice(0, 24).map((product, index) => {
      const slug = getProductSlug(product);
      return {
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/products/${slug}`),
        name: product.name,
      };
    }),
  };
}