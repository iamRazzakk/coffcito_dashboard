import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { ProductRecord, ProductSize } from "@/store/services/product.api";
import { useGetAllProductsQuery } from "@/store/services/product.api";
import { useDebouncedCallback } from "../../lib/useDebounce";
import type { Product, ProductCategory } from "./types";
import { formatPrice } from "./types";
import { resolveImageUrl } from "../../utils/imageUrl";

interface ProductGridProps {
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
}

const PAGE_SIZE = 10;
const CARD_H = "h-[312px]";
const SIZE_FILTERS = ["", "S", "M", "L"] as const;

type ProductGridFilters = {
  searchTerm: string;
  debouncedSearchTerm: string;
  size: "" | ProductSize;
  page: number;
};

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

function categoryOf(categoryId: ProductRecord["categoryId"]) {
  if (categoryId && typeof categoryId === "object") {
    return {
      categoryId: categoryId._id,
      categoryName: categoryId.name?.trim() || "Category",
    };
  }
  return { categoryId: categoryId || "", categoryName: "Category" };
}

function toMenuProduct(productRecord: ProductRecord): Product {
  const category = categoryOf(productRecord.categoryId);
  return {
    id: productRecord._id,
    name: productRecord.productName,
    category: category.categoryName as ProductCategory,
    categoryId: category.categoryId,
    description: productRecord.description,
    image: resolveImageUrl(productRecord.image),
    price: productRecord.discountPrice,
    costPrice: productRecord.originalPrice,
    sold: 0,
    status: "Active",
    sizes: [
      {
        id: productRecord.size,
        label: productRecord.size,
        priceOffset: 0,
      },
    ],
    extras: [],
  };
}

function ProductCardSkeleton() {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${CARD_H}`}
    >
      <Bone className="h-[140px] w-full rounded-none" />
      <div className="p-3.5 flex flex-col flex-1">
        <Bone className="h-3 w-16 mb-2" />
        <Bone className="h-4 w-[80%] mb-3" />
        <div className="flex items-center justify-between mb-3">
          <Bone className="h-4 w-12" />
          <Bone className="h-3 w-16" />
        </div>
        <div className="mt-auto flex gap-2">
          <Bone className="h-9 flex-1 rounded-lg" />
          <Bone className="h-9 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  productRecord,
  onView,
  onEdit,
}: {
  productRecord: ProductRecord;
  onView: () => void;
  onEdit: () => void;
}) {
  const imageSrc = resolveImageUrl(productRecord.image);
  const categoryName = categoryOf(productRecord.categoryId).categoryName;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${CARD_H}`}
    >
      <div className="relative h-[140px] bg-gray-100 shrink-0">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={productRecord.productName}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : null}
        <span className="absolute top-2.5 right-2.5 inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold bg-[#1E90FF] text-white">
          {productRecord.size}
        </span>
      </div>

      <div className="p-3.5 flex flex-col flex-1 min-h-0">
        <div className="text-[11px] font-semibold text-[#1E90FF] leading-none mb-1.5 truncate">
          {categoryName}
        </div>
        <div className="text-[14px] font-bold text-[#0B1F3A] leading-tight truncate mb-2">
          {productRecord.productName}
        </div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[15px] font-bold text-[#1E90FF] leading-none">
            {formatPrice(productRecord.discountPrice)}
          </span>
          <span className="text-[11px] text-gray-400 line-through truncate">
            {formatPrice(productRecord.originalPrice)}
          </span>
        </div>
        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={onView}
            className="flex-1 h-9 rounded-lg bg-[#E8F3FF] text-[#1E90FF] text-[12px] font-semibold hover:bg-[#d7ebff] transition-colors"
          >
            View
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="h-9 px-3.5 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-semibold hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ onView, onEdit }: ProductGridProps) {
  const [filters, setFilters] = useState<ProductGridFilters>({
    searchTerm: "",
    debouncedSearchTerm: "",
    size: "",
    page: 1,
  });

  const applySearchTerm = useDebouncedCallback((searchTerm: string) => {
    setFilters((current) => ({
      ...current,
      debouncedSearchTerm: searchTerm,
      page: 1,
    }));
  });

  const {
    data: productListResponse,
    isLoading,
    isFetching,
  } = useGetAllProductsQuery({
    page: filters.page,
    limit: PAGE_SIZE,
    searchTerm: filters.debouncedSearchTerm || undefined,
    size: filters.size || undefined,
  });

  const productList = productListResponse?.data ?? [];
  const totalProductCount = productListResponse?.pagination?.total ?? productList.length;
  const totalPageCount = Math.max(1, productListResponse?.pagination?.totalPage ?? 1);
  const isProductListLoading = isLoading || isFetching;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-[240px] shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(event) => {
              const searchTerm = event.target.value;
              setFilters((current) => ({ ...current, searchTerm }));
              applySearchTerm(searchTerm.trim());
            }}
            placeholder="Search products..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          {SIZE_FILTERS.map((sizeOption) => (
            <button
              key={sizeOption || "all"}
              type="button"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  size: sizeOption,
                  page: 1,
                }))
              }
              className={`h-9 px-3.5 rounded-full text-[12px] font-medium transition-colors ${
                filters.size === sizeOption
                  ? "bg-[#1E90FF] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {sizeOption || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isProductListLoading ? (
            Array.from({ length: PAGE_SIZE }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : productList.length === 0 ? (
            <div className="col-span-full h-[200px] flex items-center justify-center text-[13px] text-gray-400">
              No products found
            </div>
          ) : (
            productList.map((productRecord) => (
              <ProductCard
                key={productRecord._id}
                productRecord={productRecord}
                onView={() => onView(toMenuProduct(productRecord))}
                onEdit={() => onEdit(toMenuProduct(productRecord))}
              />
            ))
          )}
        </div>
      </div>

      <div className="px-4 h-[52px] border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12px] text-gray-500 min-w-[160px]">
          {isProductListLoading
            ? "Loading products..."
            : `Showing ${productList.length} of ${totalProductCount} products`}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isProductListLoading || filters.page <= 1}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page - 1 }))
            }
            className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          {Array.from({ length: totalPageCount }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                disabled={isProductListLoading}
                onClick={() =>
                  setFilters((current) => ({ ...current, page: pageNumber }))
                }
                className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors disabled:cursor-not-allowed ${
                  filters.page === pageNumber
                    ? "bg-[#1E90FF] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={isProductListLoading || filters.page >= totalPageCount}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page + 1 }))
            }
            className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
