import { Link } from "react-router-dom";
import {
  useGetTopProductsQuery,
  type TopProductItem,
} from "@/store/services/overview";

interface TopProductsProps {
  loading?: boolean;
  /** Hide "View all" when embedded on Reports */
  showViewAll?: boolean;
}

const PRODUCT_COLORS = ["#C4A484", "#3B82F6", "#D4A574", "#4ADE80", "#78350F"];

function productInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function readTopProducts(payload: unknown): TopProductItem[] {
  if (Array.isArray(payload)) return payload as TopProductItem[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as TopProductItem[];
  }
  return [];
}

export default function TopProducts({
  loading = false,
  showViewAll = true,
}: TopProductsProps) {
  const { data, isLoading } = useGetTopProductsQuery();
  const products = readTopProducts(data);
  const showSkeleton = loading || isLoading;

  return (
    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm h-full min-h-[320px]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[#0B1F3A]">
          Top Selling Products
        </h2>
        {showViewAll && (
          <Link
            to="/products"
            className="text-[12px] font-semibold text-[#1E90FF] hover:underline"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Units Sold</th>
              <th className="pb-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {showSkeleton ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 h-[58px]">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-gray-200 animate-pulse" />
                      <div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div className="h-3.5 w-20 rounded bg-gray-200 animate-pulse" />
                  </td>
                  <td className="py-3.5">
                    <div className="h-3.5 w-12 rounded bg-gray-200 animate-pulse" />
                  </td>
                  <td className="py-3.5">
                    <div className="h-3.5 w-16 rounded bg-gray-200 animate-pulse" />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr className="h-[58px]">
                <td
                  colSpan={4}
                  className="py-8 text-center text-[13px] text-gray-400"
                >
                  No products sold yet
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr
                  key={`${product.product}-${index}`}
                  className="border-b border-gray-50 last:border-0 h-[58px]"
                >
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                        style={{
                          backgroundColor:
                            PRODUCT_COLORS[index % PRODUCT_COLORS.length],
                        }}
                      >
                        {productInitials(product.product)}
                      </div>
                      <span className="text-[13px] font-medium text-[#0B1F3A]">
                        {product.product}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-[13px] text-gray-500">
                    {product.category}
                  </td>
                  <td className="py-3.5 text-[13px] font-semibold text-[#1E90FF]">
                    {(product.unitsSold ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3.5 text-[13px] font-bold text-[#0B1F3A]">
                    ₱{(product.revenue ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
