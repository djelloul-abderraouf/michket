"use client";

import { useMemo } from "react";

export type ProductAdminCategory = {
  id: string;
  name: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder?: number;
};

export type ProductCategorySelection = {
  categoryId: string;
  subcategoryId: string;
  subsubcategoryId: string;
};

type ProductCategorySelectorProps = {
  categories: ProductAdminCategory[];
  value: ProductCategorySelection;
  onChange: (
    value: ProductCategorySelection,
  ) => void;
  disabled?: boolean;
  inputClassName: string;
  labelClassName: string;
};

function sortCategories(
  values: ProductAdminCategory[],
) {
  return [...values].sort(
    (a, b) =>
      (a.sortOrder ?? 0) -
        (b.sortOrder ?? 0) ||
      a.name.localeCompare(b.name, "fr"),
  );
}

export function ProductCategorySelector({
  categories,
  value,
  onChange,
  disabled = false,
  inputClassName,
  labelClassName,
}: ProductCategorySelectorProps) {
  const activeCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.isActive,
      ),
    [categories],
  );

  const mainCategories = useMemo(
    () =>
      sortCategories(
        activeCategories.filter(
          (category) =>
            category.parentId === null,
        ),
      ),
    [activeCategories],
  );

  const subcategories = useMemo(
    () =>
      value.categoryId
        ? sortCategories(
            activeCategories.filter(
              (category) =>
                category.parentId ===
                value.categoryId,
            ),
          )
        : [],
    [activeCategories, value.categoryId],
  );

  const subsubcategories = useMemo(
    () =>
      value.subcategoryId
        ? sortCategories(
            activeCategories.filter(
              (category) =>
                category.parentId ===
                value.subcategoryId,
            ),
          )
        : [],
    [
      activeCategories,
      value.subcategoryId,
    ],
  );

  function handleCategoryChange(
    categoryId: string,
  ) {
    onChange({
      categoryId,
      subcategoryId: "",
      subsubcategoryId: "",
    });
  }

  function handleSubcategoryChange(
    subcategoryId: string,
  ) {
    onChange({
      categoryId: value.categoryId,
      subcategoryId,
      subsubcategoryId: "",
    });
  }

  function handleSubsubcategoryChange(
    subsubcategoryId: string,
  ) {
    onChange({
      categoryId: value.categoryId,
      subcategoryId: value.subcategoryId,
      subsubcategoryId,
    });
  }

  return (
    <div className="grid gap-5">
      <div>
        <label
          htmlFor="product-category"
          className={labelClassName}
        >
          Catégorie *
        </label>

        <select
          id="product-category"
          value={value.categoryId}
          onChange={(event) =>
            handleCategoryChange(
              event.target.value,
            )
          }
          disabled={
            disabled ||
            mainCategories.length === 0
          }
          className={inputClassName}
          required
        >
          <option value="">
            Sélectionnez une catégorie
          </option>

          {mainCategories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ),
          )}
        </select>
      </div>

      {value.categoryId ? (
        subcategories.length > 0 ? (
          <div>
            <label
              htmlFor="product-subcategory"
              className={labelClassName}
            >
              Sous-catégorie *
            </label>

            <select
              id="product-subcategory"
              value={value.subcategoryId}
              onChange={(event) =>
                handleSubcategoryChange(
                  event.target.value,
                )
              }
              disabled={disabled}
              className={inputClassName}
              required
            >
              <option value="">
                Sélectionnez une sous-catégorie
              </option>

              {subcategories.map(
                (subcategory) => (
                  <option
                    key={subcategory.id}
                    value={subcategory.id}
                  >
                    {subcategory.name}
                  </option>
                ),
              )}
            </select>
          </div>
        ) : (
          <p className="-mt-2 text-[11px] leading-5 text-amber-600">
            Cette catégorie n&apos;a
            aucune sous-catégorie active.
            Un produit doit avoir une
            sous-catégorie.
          </p>
        )
      ) : null}

      {value.subcategoryId &&
      subsubcategories.length > 0 ? (
        <div>
          <label
            htmlFor="product-subsubcategory"
            className={labelClassName}
          >
            Sous-sous-catégorie
            <span className="ml-1 font-normal text-neutral-400">
              (facultatif)
            </span>
          </label>

          <select
            id="product-subsubcategory"
            value={
              value.subsubcategoryId
            }
            onChange={(event) =>
              handleSubsubcategoryChange(
                event.target.value,
              )
            }
            disabled={disabled}
            className={inputClassName}
          >
            <option value="">
              Aucune sous-sous-catégorie
            </option>

            {subsubcategories.map(
              (subsubcategory) => (
                <option
                  key={subsubcategory.id}
                  value={subsubcategory.id}
                >
                  {
                    subsubcategory.name
                  }
                </option>
              ),
            )}
          </select>
        </div>
      ) : null}

      {value.subcategoryId &&
      subsubcategories.length === 0 ? (
        <p className="-mt-2 text-[11px] leading-5 text-neutral-400">
          Cette sous-catégorie n&apos;a
          pas de sous-sous-catégorie.
          Le produit sera rattaché à la
          catégorie et à la
          sous-catégorie sélectionnées.
        </p>
      ) : null}
    </div>
  );
}
