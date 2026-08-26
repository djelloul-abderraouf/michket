"use client";

import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/categories";

export function CategoryGrid() {
  return (
    <section className="py-12 sm:py-16 bg-michket-white" aria-labelledby="categories-heading">
      <div className="michket-container">
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-medium tracking-widest uppercase text-michket-gold mb-2">
            Nos univers
          </span>
          <h2 id="categories-heading" className="font-display text-2xl sm:text-3xl text-michket-black">
            Explorez nos collections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative aspect-[4/3] overflow-hidden bg-michket-cream"
            >
              <Image
                src={cat.image}
                alt={cat.description}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-michket-black/60 via-michket-black/10 to-transparent group-hover:from-michket-black/70 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <h3 className="text-white font-display text-lg sm:text-xl mb-0.5">
                  {cat.label}
                </h3>
                <p className="text-white/70 text-xs">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
