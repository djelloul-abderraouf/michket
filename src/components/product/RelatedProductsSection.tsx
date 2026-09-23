import Image from "next/image";
import Link from "next/link";

import { fetchProductsForCategoryPage } from "@/lib/api";

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("ar-DZ", {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price)} دج`;
}

export async function RelatedProductsSection({
  categorySlug,
  currentProductId,
}: {
  categorySlug: string;
  currentProductId: string;
}) {
  let relatedProducts;

  try {
    const page = await fetchProductsForCategoryPage(categorySlug, {
      page: 1,
      limit: 5,
    });

    relatedProducts = page.data
      .filter((product) => product.id !== currentProductId)
      .slice(0, 4);
  } catch {
    return null;
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto mt-2 max-w-[1240px] px-3 pb-6 sm:px-6 sm:pb-10 lg:px-8">
      <div className="rounded-[20px] border border-[#251713]/[0.07] bg-white p-4 shadow-[0_14px_36px_rgba(37,23,19,0.05)] sm:p-6">
        <div className="mb-4">
          <p className="text-[9px] font-extrabold tracking-[0.14em] text-[#8A6A20]">
            قد يعجبك أيضًا
          </p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.035em] sm:text-[27px]">
            اكتشف منتجات أخرى
          </h2>
        </div>

        <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {relatedProducts.map((related) => {
            const relatedImage =
              related.images.find((image) => image.variantId === null) ??
              related.images[0];

            return (
              <Link
                key={related.id}
                href={`/produits/${related.slug}`}
                className="group w-[78vw] max-w-[290px] shrink-0 snap-start overflow-hidden rounded-[15px] border border-[#251713]/[0.08] bg-[#FFFCF8] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(37,23,19,0.08)] sm:w-auto sm:max-w-none"
              >
                <div className="relative aspect-square bg-[#EDE3D7]">
                  {relatedImage ? (
                    <Image
                      src={relatedImage.src}
                      alt={relatedImage.alt || related.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 639px) 72vw, (max-width: 1023px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#251713]/30">
                      الصورة غير متوفرة
                    </div>
                  )}
                </div>

                <div className="p-3.5">
                  <h3 className="line-clamp-2 min-h-10 text-[13px] font-bold leading-5 text-[#251713]">
                    {related.title}
                  </h3>

                  <div className="mt-2 flex items-end justify-between gap-2">
                    <span className="text-[15px] font-extrabold text-[#251713]">
                      {formatPriceDA(related.price)}
                    </span>

                    <span className="text-[10px] font-bold text-[#8A6A20]">
                      عرض
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
