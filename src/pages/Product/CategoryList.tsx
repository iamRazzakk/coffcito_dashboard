import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Plus } from "lucide-react";
import type { CategoryRecord } from "@/store/services/category.api";
import { resolveImageUrl } from "../../utils/imageUrl";

interface CategoryListProps {
  categories: CategoryRecord[];
  loading?: boolean;
  onAdd: () => void;
  onViewAll: () => void;
}

export function CategoryAvatar({
  category,
  size = "sm",
}: {
  category: CategoryRecord;
  size?: "sm" | "md";
}) {
  const [failed, setFailed] = useState(false);
  const src = resolveImageUrl(category.image);
  const sizeClass =
    size === "md" ? "w-10 h-10 rounded-lg text-[15px]" : "w-7 h-7 rounded-full text-[12px]";

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={category.name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`${sizeClass} object-cover bg-gray-100 shrink-0`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} bg-[#E8F3FF] text-[#1E90FF] font-bold flex items-center justify-center shrink-0 uppercase`}
    >
      {category.name.charAt(0)}
    </span>
  );
}

export default function CategoryList({
  categories,
  loading = false,
  onAdd,
  onViewAll,
}: CategoryListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateScrollState, categories.length, loading]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  };

  const activeCount = categories.filter((c) => c.isActive !== false).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0 pr-3 border-r border-gray-100">
          <div className="text-[13px] font-bold text-[#0B1F3A] leading-tight">
            Categories
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5 whitespace-nowrap">
            {loading ? "Loading..." : `${activeCount} active · ${categories.length} total`}
          </div>
        </div>

        <div className="relative flex-1 min-w-0">
          {canScrollLeft ? (
            <>
              <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Scroll categories left"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#1E90FF]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : null}

          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loading
              ? Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="h-9 w-28 rounded-full bg-gray-200 animate-pulse shrink-0"
                  />
                ))
              : categories.map((category) => {
                  const isActive = category.isActive !== false;
                  return (
                    <div
                      key={category._id}
                      title={category.name}
                      className={`h-9 pl-1 pr-3 rounded-full border flex items-center gap-2 shrink-0 max-w-[180px] ${
                        isActive
                          ? "border-gray-200 bg-white"
                          : "border-dashed border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <CategoryAvatar category={category} />
                      <span className="text-[12px] font-semibold text-gray-700 truncate">
                        {category.name}
                      </span>
                    </div>
                  );
                })}
            {!loading && categories.length === 0 ? (
              <span className="text-[12px] text-gray-400">No categories yet</span>
            ) : null}
          </div>

          {canScrollRight ? (
            <>
              <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Scroll categories right"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#1E90FF]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : null}
        </div>

        <div className="shrink-0 flex items-center gap-2 pl-3 border-l border-gray-100">
          <button
            type="button"
            onClick={onViewAll}
            disabled={loading}
            className="h-9 px-3 rounded-lg bg-[#E8F3FF] text-[#1E90FF] text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#d7ebff] transition-colors disabled:opacity-40"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">View all</span>
          </button>
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add category"
            className="w-9 h-9 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center hover:border-[#1E90FF]/40 hover:text-[#1E90FF] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
