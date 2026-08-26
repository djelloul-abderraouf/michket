"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: Array<{ src: string; alt: string }>;
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-16 flex-shrink-0 overflow-hidden border-2 transition-colors ${
                i === selected
                  ? "border-michket-gold"
                  : "border-michket-ivory hover:border-michket-gold/40"
              }`}
              aria-label={`Voir image ${i + 1}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 aspect-square bg-michket-cream overflow-hidden">
        <Image
          src={images[selected]?.src || images[0].src}
          alt={images[selected]?.alt || images[0].alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
    </div>
  );
}
