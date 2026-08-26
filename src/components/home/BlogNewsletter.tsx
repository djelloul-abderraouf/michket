// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { posts } from "@/data/blog";
// import { siteConfig } from "@/data/site-config";

// export function BlogNewsletter() {
//   return (
//     <section className="py-12 sm:py-16 bg-michket-cream" aria-labelledby="blog-heading">
//       <div className="michket-container">
//         {/* Blog section */}
//         <div className="mb-16">
//           <div className="text-center mb-8">
//             <span className="inline-block text-xs font-medium tracking-widest uppercase text-michket-gold mb-2">
//               Le journal Michket
//             </span>
//             <h2 id="blog-heading" className="font-display text-2xl sm:text-3xl text-michket-black">
//               Derniers articles
//             </h2>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {posts.map((post) => (
//               <Link
//                 key={post.id}
//                 href={post.href}
//                 className="group block bg-michket-white overflow-hidden"
//               >
//                 <div className="relative aspect-[16/9] overflow-hidden">
//                   <Image
//                     src={post.image}
//                     alt={post.alt}
//                     fill
//                     className="object-cover group-hover:scale-105 transition-transform duration-500"
//                     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//                   />
//                   <div className="absolute top-2 left-2">
//                     <span className="inline-block bg-michket-gold text-white text-[10px] font-medium uppercase tracking-wider px-2 py-1">
//                       {post.category}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="p-4">
//                   <p className="text-xs text-michket-charcoal/50 mb-1.5">{post.date}</p>
//                   <h3 className="text-sm font-semibold text-michket-black group-hover:text-michket-gold transition-colors line-clamp-2 mb-2">
//                     {post.title}
//                   </h3>
//                   <p className="text-xs text-michket-charcoal/60 line-clamp-2">
//                     {post.excerpt}
//                   </p>
//                 </div>
//               </Link>
//             ))}
//           </div>

//           <div className="mt-6 text-center">
//             <Link
//               href="/blog"
//               className="inline-flex items-center gap-1 text-sm font-medium text-michket-charcoal hover:text-michket-gold transition-colors group"
//             >
//               Voir tous les articles
//               <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//               </svg>
//             </Link>
//           </div>
//         </div>

//         {/* Newsletter */}
//         <div className="bg-michket-white p-6 sm:p-10 text-center max-w-2xl mx-auto">
//           <span className="inline-block text-xs font-medium tracking-widest uppercase text-michket-gold mb-3">
//             Newsletter
//           </span>
//           <h3 className="font-display text-xl sm:text-2xl text-michket-black mb-3">
//             {siteConfig.newsletter.headline}
//           </h3>
//           <p className="text-sm text-michket-charcoal/60 mb-6">
//             {siteConfig.newsletter.subtext}
//           </p>
//           <form
//             onSubmit={(e) => e.preventDefault()}
//             className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
//           >
//             <input
//               type="email"
//               placeholder="Votre adresse email"
//               required
//               className="flex-1 min-w-0 px-4 py-3 bg-michket-ivory border border-michket-gold/15 text-sm text-michket-black placeholder:text-michket-charcoal/40 focus:outline-none focus:border-michket-gold/40 transition-colors"
//               aria-label="Adresse email"
//             />
//             <button
//               type="submit"
//               className="px-6 py-3 bg-michket-gold text-white text-sm font-semibold hover:bg-michket-gold-dark transition-colors whitespace-nowrap w-full sm:w-auto"
//             >
//               {siteConfig.newsletter.ctaText}
//             </button>
//           </form>
//           <p className="text-[11px] text-michket-charcoal/40 mt-3">
//             {siteConfig.newsletter.trustText}
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// }
