import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { SubcategoryHeroCarousel } from "@/components/category/SubcategoryHeroCarousel";
import {
  fetchCategoryBySlugSafe,
  fetchProductsForCategory,
} from "@/lib/api";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type PageParams = {
  categorySlug: string;
  subcategorySlug: string;
  subsubcategorySlug: string;
};

function localizeCatalogueLabel(value: string): string {
  const normalized = value
    .trim()
    .toLocaleLowerCase("fr");

  const labels: Record<string, string> = {
    "lampes 3d": "مصابيح ثلاثية الأبعاد",
    "anniversaire": "عيد الميلاد",
    "médecine": "الطب",
    "medecine": "الطب",
    "mariage": "الزفاف",
    "nouveau-né": "مولود جديد",
    "nouveau né": "مولود جديد",
    "nouveau nee": "مولود جديد",
    "nouveau née": "مولود جديد",
    "football": "كرة القدم",
    "soutenance": "التخرج",
    "maman": "الأم",
    "chirurgie": "الجراحة",
    "dentiste": "طب الأسنان",
    "dentisterie": "طب الأسنان",
    "pharmacie": "الصيدلة",
    "infirmier": "التمريض",
    "infirmière": "التمريض",
    "cardiologie": "طب القلب",
    "pédiatrie": "طب الأطفال",
    "pediatrie": "طب الأطفال",
    "gynécologie": "طب النساء",
    "gynecologie": "طب النساء",
    "cartes du monde": "خرائط العالم",
    "néon led": "نيون LED",
    "neon led": "نيون LED",
    "trophées": "الجوائز",
    "trophees": "الجوائز",
  };

  return labels[normalized] ?? value;
}

function getArabicBadgeLabel(
  badge: string | null | undefined,
): string | null {
  if (!badge) return null;

  const labels: Record<string, string> = {
    BEST_SELLER: "الأكثر مبيعًا",
    NOUVEAU: "جديد",
    PROMO: "عرض",
    PERSONNALISABLE: "قابل للتخصيص",
    ENVOI_GRATUIT: "توصيل مجاني",
  };

  return labels[badge] ?? badge;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const {
    categorySlug,
    subcategorySlug,
    subsubcategorySlug,
  } = await params;

  const [category, subcategory, subsubcategory] =
    await Promise.all([
      fetchCategoryBySlugSafe(categorySlug),
      fetchCategoryBySlugSafe(subcategorySlug),
      fetchCategoryBySlugSafe(subsubcategorySlug),
    ]);

  if (
    !category ||
    category.parentId !== null ||
    !subcategory ||
    subcategory.parentId !== category.id ||
    !subsubcategory ||
    subsubcategory.parentId !== subcategory.id
  ) {
    return {
      title:
        "الفئة الفرعية من المستوى الثالث غير موجودة | Michket",
    };
  }

  const localizedSubsubcategoryName =
    localizeCatalogueLabel(subsubcategory.name);

  return {
    title:
      subsubcategory.metaTitle ||
      `${localizedSubsubcategoryName} | Michket`,
    description:
      subsubcategory.metaDescription ||
      subsubcategory.description ||
      `اكتشف مجموعة ${localizedSubsubcategoryName} على Michket.`,
  };
}

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("ar-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} دج`;
}

export default async function SubSubcategoryPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const {
    categorySlug,
    subcategorySlug,
    subsubcategorySlug,
  } = await params;

  const [category, subcategory, subsubcategory] =
    await Promise.all([
      fetchCategoryBySlugSafe(categorySlug),
      fetchCategoryBySlugSafe(subcategorySlug),
      fetchCategoryBySlugSafe(subsubcategorySlug),
    ]);

  if (
    !category ||
    category.parentId !== null ||
    !subcategory ||
    subcategory.parentId !== category.id ||
    !subsubcategory ||
    subsubcategory.parentId !== subcategory.id
  ) {
    notFound();
  }

  let products: Awaited<
    ReturnType<typeof fetchProductsForCategory>
  > = [];
  let apiError = false;

  try {
    products =
      await fetchProductsForCategory(
        subsubcategory.slug,
      );
  } catch {
    apiError = true;
  }

  const localizedCategoryName =
    localizeCatalogueLabel(category.name);
  const localizedSubcategoryName =
    localizeCatalogueLabel(subcategory.name);
  const localizedSubsubcategoryName =
    localizeCatalogueLabel(subsubcategory.name);

  const localizedPageTitle =
    subsubcategory.pageTitle?.trim()
      ? localizeCatalogueLabel(
          subsubcategory.pageTitle,
        )
      : null;

  const displayName =
    subsubcategory.productsTitle?.trim() ||
    localizedPageTitle ||
    localizedSubsubcategoryName;

  return (
    <main lang="ar" dir="rtl" className="min-h-screen bg-[#F8F3EB] text-[#2A1B16]">
      {/* HERO */}
      <section
        className="relative border-b border-[#2A1B16]/[0.08]"
        style={{
          background:
            "linear-gradient(120deg, rgba(236,171,28,0.065) 0%, rgba(248,243,235,0) 28%), linear-gradient(180deg, #FCF8F2 0%, #F6EFE6 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:gap-10">
            {/* Mobile: hero image first. Desktop: hero image stays on the right. */}
            <div className="min-w-0 lg:order-2">
              {subsubcategory.heroImages.length > 0 ? (
                <SubcategoryHeroCarousel
                  images={subsubcategory.heroImages}
                  categoryName={localizedSubsubcategoryName}
                />
              ) : subsubcategory.imageUrl ? (
                <div className="relative min-h-[230px] overflow-hidden rounded-[18px] border border-[#2A1B16]/[0.06] bg-[#EEE5DA] shadow-[0_14px_36px_rgba(42,27,22,0.10)] sm:min-h-[320px] lg:min-h-[390px]">
                  <Image
                    src={subsubcategory.imageUrl}
                    alt={subsubcategory.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1023px) 100vw, 54vw"
                  />

                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#21130F]/12 via-transparent to-white/5"
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <div
                  className="min-h-[230px] rounded-[18px] border border-[#2A1B16]/[0.06] bg-gradient-to-br from-[#E8DCCF] via-[#F4ECE3] to-[#D8C7B6] shadow-[0_14px_36px_rgba(42,27,22,0.08)] sm:min-h-[320px] lg:min-h-[390px]"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Mobile: title and description after the image. Desktop: text stays left. */}
            <div className="max-w-[620px] text-right lg:order-1">
              <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#2A1B16]/35 sm:text-[10px]">
                <Link
                  href="/"
                  className="transition-colors hover:text-[#ECAB1C]"
                >
                  الرئيسية
                </Link>

                <span>/</span>

                <Link
                  href={`/${category.slug}`}
                  className="transition-colors hover:text-[#ECAB1C]"
                >
                  {localizedCategoryName}
                </Link>

                <span>/</span>

                <Link
                  href={`/${category.slug}/${subcategory.slug}`}
                  className="transition-colors hover:text-[#ECAB1C]"
                >
                  {localizedSubcategoryName}
                </Link>

                <span>/</span>

                <span className="text-[#8A6A20]">
                  {localizedSubsubcategoryName}
                </span>
              </div>

              <h1 className="mt-3 font-body text-[31px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[39px] lg:text-[48px]">
                {localizedPageTitle ||
                  localizedSubsubcategoryName}
              </h1>

              {subsubcategory.description ? (
                <p className="mt-4 max-w-[560px] text-[12px] leading-6 text-[#2A1B16]/52 sm:text-[13px]">
                  {subsubcategory.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <section
        id="produits"
        className="scroll-mt-24 py-7 sm:py-9 lg:py-11"
        style={{
          background:
            "linear-gradient(180deg, #F8F3EB 0%, #F3ECE3 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-5 max-w-[680px] text-center sm:mb-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#8A6A20] sm:text-[10px]">
              المجموعة المتوفرة
            </p>

            <h2 className="mt-1.5 font-body text-[24px] font-semibold tracking-[-0.04em] sm:text-[30px]">
              {displayName}
            </h2>

            <p className="mt-1.5 text-[10px] font-medium text-[#2A1B16]/42 sm:text-[11px]">
              كل المنتجات
            </p>
          </div>

          <div className="mb-5 flex items-center justify-between gap-3 border-y border-[#2A1B16]/[0.08] py-3 sm:mb-6 sm:py-3.5">
            <p className="text-[10px] font-medium text-[#2A1B16]/45 sm:text-[11px]">
              {products.length === 0
                ? "لا توجد منتجات"
                : products.length === 1
                  ? "منتج واحد"
                  : products.length === 2
                    ? "منتجان"
                    : `${products.length} منتجات`}
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {products.map(
                (product, index) => {
                  const image =
                    product.images[0];

                  const hasDiscount =
                    typeof product.compareAtPrice ===
                      "number" &&
                    product.compareAtPrice >
                      product.price;

                  const discount = hasDiscount
                    ? Math.round(
                        ((product.compareAtPrice! -
                          product.price) /
                          product.compareAtPrice!) *
                          100,
                      )
                    : null;

                  return (
                    <article
                      key={product.id}
                      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[13px] border border-[#2A1B16]/[0.07] bg-[#FFFDFC] shadow-[0_8px_24px_rgba(42,27,22,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ECAB1C]/35 hover:shadow-[0_16px_38px_rgba(42,27,22,0.10)]"
                    >
                      <Link
                        href={`/produits/${product.slug}`}
                        className="relative block aspect-[4/5] overflow-hidden bg-[#EEE5DA]"
                      >
                        {image ? (
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            priority={
                              index < 2
                            }
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw"
                          />
                        ) : null}

                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#21130F]/24 via-transparent to-transparent"
                          aria-hidden="true"
                        />

                        {(product.badge ||
                          discount) ? (
                          <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                            {product.badge ? (
                              <span className="inline-flex rounded-[5px] bg-[#ECAB1C] px-2 py-1.5 text-[7px] font-bold uppercase tracking-[0.09em] text-[#2A1B16] sm:text-[8px]">
                                {getArabicBadgeLabel(
                                  product.badge,
                                )}
                              </span>
                            ) : null}

                            {discount ? (
                              <span className="inline-flex rounded-[5px] bg-[#2A1B16]/85 px-2 py-1.5 text-[7px] font-bold text-white backdrop-blur-sm sm:text-[8px]">
                                -{discount}%
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </Link>

                      <div className="flex flex-1 flex-col p-3 sm:p-4">
                        <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-[#8A6A20] sm:text-[9px]">
                          {localizeCatalogueLabel(
                            product.categoryName ??
                              subsubcategory.name,
                          )}
                        </p>

                        <Link
                          href={`/produits/${product.slug}`}
                        >
                          <h3 className="mt-1.5 line-clamp-2 min-h-[2.25rem] font-body text-[12px] font-semibold leading-[1.35] tracking-[-0.02em] text-[#2A1B16] sm:min-h-[2.6rem] sm:text-[14px]">
                            {product.title}
                          </h3>
                        </Link>

                        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 sm:mt-3">
                          <span className="text-[13px] font-bold tracking-[-0.02em] text-[#2A1B16] sm:text-[16px]">
                            {formatPriceDA(
                              product.price,
                            )}
                          </span>

                          {product.compareAtPrice ? (
                            <span className="text-[8px] text-[#2A1B16]/30 line-through sm:text-[9px]">
                              {formatPriceDA(
                                product.compareAtPrice,
                              )}
                            </span>
                          ) : null}
                        </div>

                        <Link
                          href={`/produits/${product.slug}`}
                          className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#2A1B16] px-2 text-[8px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#ECAB1C] hover:text-[#2A1B16] sm:min-h-10 sm:text-[9px]"
                        >
                          عرض المنتج

                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.9}
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 12H5m6-6-6 6 6 6"
                            />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : apiError ? (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-5 py-10 text-center">
              <p className="font-body text-base font-semibold text-red-800">
                تعذر تحميل المنتجات في الوقت الحالي.
              </p>

              <p className="mt-1 text-[11px] text-red-600/70">
                يرجى المحاولة مرة أخرى لاحقًا.
              </p>
            </div>
          ) : (
            <div className="border border-[#2A1B16]/[0.08] bg-white px-5 py-10 text-center">
              <p className="font-body text-base font-semibold">
                لا توجد منتجات متوفرة حاليًا.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
