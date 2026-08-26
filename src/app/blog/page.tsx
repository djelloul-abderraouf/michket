import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { posts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog | Michket",
  description:
    "Conseils, idées cadeaux et actualités de l'atelier Michket.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-michket-white">
      {/* Hero */}
      <section className="bg-michket-cream py-16 sm:py-20">
        <div className="michket-container text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-medium tracking-widest uppercase text-michket-gold mb-3">
            Le journal
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-michket-black mb-4">
            Blog Michket
          </h1>
          <p className="text-base text-michket-charcoal/60">
            Conseils, astuces et idées cadeaux pour chaque occasion.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-12 sm:py-16">
        <div className="michket-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={post.href}
                className="group block bg-michket-cream overflow-hidden"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="inline-block bg-michket-gold text-white text-[10px] font-medium uppercase tracking-wider px-2 py-1">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-michket-charcoal/50 mb-2">{post.date}</p>
                  <h2 className="text-base font-semibold text-michket-black group-hover:text-michket-gold transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-michket-charcoal/60 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
