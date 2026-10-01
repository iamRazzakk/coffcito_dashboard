import { useEffect, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import type { CategoryRecord } from "@/store/services/category.api";
import DrawerShell from "../../components/layout/DrawerShell";
import { CategoryAvatar } from "./CategoryList";

interface CategoryDrawerProps {
  open: boolean;
  categories: CategoryRecord[];
  onClose: () => void;
  onAdd: () => void;
}

type StatusFilter = "all" | "active" | "inactive";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function CategoryDrawer({
  open,
  categories,
  onClose,
  onAdd,
}: CategoryDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setStatus("all");
    }
  }, [open]);

  const visibleCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return categories
      .filter((category) => {
        const isActive = category.isActive !== false;
        if (status === "active" && !isActive) return false;
        if (status === "inactive" && isActive) return false;
        return !term || category.name.toLowerCase().includes(term);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, searchTerm, status]);

  return (
    <DrawerShell open={open} onClose={onClose} widthClass="max-w-[420px]">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B1F3A]">All Categories</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {categories.length} categories in your menu
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 pb-3 space-y-3 shrink-0 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search categories..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`h-8 px-3 rounded-full text-[12px] font-medium transition-colors ${
                status === option.value
                  ? "bg-[#1E90FF] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {visibleCategories.length === 0 ? (
          <div className="h-[160px] flex items-center justify-center text-[13px] text-gray-400">
            No categories found
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {visibleCategories.map((category) => {
              const isActive = category.isActive !== false;
              return (
                <li
                  key={category._id}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50"
                >
                  <CategoryAvatar category={category} size="md" />
                  <span
                    className="flex-1 min-w-0 text-[13px] font-semibold text-[#0B1F3A] truncate"
                    title={category.name}
                  >
                    {category.name}
                  </span>
                  <span
                    className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold shrink-0 ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="p-5 border-t border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onAdd}
          className="w-full h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-[#1878d8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>
    </DrawerShell>
  );
}
