import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Product, ProductCategory, ProductFilter } from "./types";
import {
  STATUS_STYLES,
  formatPrice,
  formatSold,
} from "./types";

interface ProductGridProps {
  products: Product[];
  categories: ProductCategory[];
  search: string;
  filter: ProductFilter;
  page: number;
  pageSize?: number;
  loading?: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: ProductFilter) => void;
  onPageChange: (page: number) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
}

const CARD_H = "h-[312px]";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
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
  product,
  onView,
  onEdit,
}: {
  product: Product;
  onView: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${CARD_H}`}
    >
      <div className="relative h-[140px] bg-gray-100 shrink-0">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-2.5 right-2.5 inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[product.status]}`}
        >
          {product.status}
        </span>
      </div>

      <div className="p-3.5 flex flex-col flex-1 min-h-0">
        <div className="text-[11px] font-semibold text-[#1E90FF] leading-none mb-1.5 truncate">
          {product.category}
        </div>
        <div className="text-[14px] font-bold text-[#0B1F3A] leading-tight truncate mb-2">
          {product.name}
        </div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[15px] font-bold text-[#1E90FF] leading-none">
            {formatPrice(product.price)}
          </span>
          <span className="text-[11px] text-gray-400 truncate">
            {formatSold(product.sold)}
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

export default function ProductGrid({
  products,
  categories,
  search,
  filter,
  page,
  pageSize = 10,
  loading = false,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onView,
  onEdit,
}: ProductGridProps) {
  const filters: ProductFilter[] = ["All", ...categories];
  const filtered = products.filter((p) => {
    const matchesFilter = filter === "All" || p.category === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-[240px] shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          {filters.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange(key)}
              className={`h-9 px-3.5 rounded-full text-[12px] font-medium transition-colors ${
                filter === key
                  ? "bg-[#1E90FF] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: pageSize }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : pageItems.length === 0
              ? (
                <div className="col-span-full h-[200px] flex items-center justify-center text-[13px] text-gray-400">
                  No products found
                </div>
              )
              : (
                pageItems.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onView={() => onView(p)}
                    onEdit={() => onEdit(p)}
                  />
                ))
              )}
        </div>
      </div>

      <div className="px-4 h-[52px] border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12px] text-gray-500 min-w-[160px]">
          {loading
            ? "Loading products..."
            : `Showing ${pageItems.length} of ${filtered.length} products`}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={loading || currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              disabled={loading}
              onClick={() => onPageChange(n)}
              className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors disabled:cursor-not-allowed ${
                currentPage === n
                  ? "bg-[#1E90FF] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            disabled={loading || currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
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
