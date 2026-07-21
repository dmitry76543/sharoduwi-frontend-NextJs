import Image from "next/image";

import { CityLink } from "@/components/CityLink";
import { COLLECTIONS, COLORS } from "@/lib/data";
import { getCollectionImageSrc } from "@/lib/collection-images";
import { hexa } from "@/lib/balloons";
import type { CollectionSlug } from "@/lib/products";

interface CatalogCollectionGridProps {
  activeSlug?: CollectionSlug | null;
}

export function CatalogCollectionGrid({ activeSlug }: CatalogCollectionGridProps) {
  return (
    <div className="collections collections--catalog expanded" aria-label="Коллекции">
      {COLLECTIONS.map((collection) => {
        const grad =
          collection.bg ||
          `linear-gradient(150deg,${hexa(COLORS[collection.colors[0]], 0.3)},${hexa(COLORS[collection.colors[collection.colors.length - 1]], 0.16)})`;
        const imgSrc = collection.img ?? getCollectionImageSrc(collection.slug);

        return (
          <CityLink
            href={`/categories/${collection.slug}`}
            key={collection.slug}
            className={`col-card col-card--catalog${activeSlug === collection.slug ? " active" : ""}`}
          >
            <div className="col-bg" style={{ background: grad }}>
              <Image
                src={imgSrc}
                alt={collection.name}
                fill
                sizes="(max-width: 860px) 50vw, 25vw"
                quality={52}
                loading="lazy"
                className="col-img"
              />
            </div>
            <div className="col-overlay" />
            <div className="col-info">
              <h3>{collection.name}</h3>
              <span>
                {collection.sub}{" "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </CityLink>
        );
      })}
    </div>
  );
}
