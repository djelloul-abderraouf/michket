import type { MetadataRoute } from "next";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { posts } from "@/data/blog";

const BASE_URL = "https://michket.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/collections/all`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/politique-de-confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/conditions-generales-de-vente`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  // Fetch categories from API
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await fetchCategories();
    categoryPages = categories.map((cat) => ({
      url: `${BASE_URL}/collections/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    categoryPages = [];
  }

  // Fetch products from API
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const allProducts: MetadataRoute.Sitemap = [];
    let page = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await fetchProducts({ page, limit: 50 });
      allProducts.push(
        ...res.data.map((p) => ({
          url: `${BASE_URL}/produits/${p.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),
      );
      if (page >= res.meta.totalPages) break;
      page++;
    }
    productPages = allProducts;
  } catch {
    productPages = [];
  }

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}${post.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
