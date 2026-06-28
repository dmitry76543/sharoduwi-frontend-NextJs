"use client";

import { useState } from "react";
import type { ColorKey } from "@/lib/data";
import { COLORS } from "@/lib/data";
import { cluster, hexa } from "@/lib/balloons";

interface ProductGalleryProps {
  name: string;
  images: string[];
  colors: ColorKey[];
}

export function ProductGallery({ name, images, colors }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active];
  const bgTint = current
    ? undefined
    : {
        background: `linear-gradient(160deg,${hexa(COLORS[colors[0]], 0.16)},${hexa(COLORS[colors[colors.length - 1]], 0.1)})`,
      };

  return (
    <div className="product-gallery">
      <div className="product-gallery-main" style={bgTint}>
        {current ? (
          <img src={current} alt={name} />
        ) : (
          <div
            className="product-gallery-fallback"
            dangerouslySetInnerHTML={{
              __html: cluster(colors, 110, "product-gallery"),
            }}
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="product-thumbs">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`product-thumb${active === index ? " active" : ""}`}
              aria-label={`Фото ${index + 1}`}
              onClick={() => setActive(index)}
            >
              <img src={image} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
