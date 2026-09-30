import { useGetPurchasesQuery } from "@/store/services/overview";
import type { PurchasesOverview } from "@/store/services/overview";
import { readEntity } from "../../store/http";
import { ORDER_STATUS } from "./data";

interface OrdersOverviewProps {
  loading?: boolean;
}

export default function OrdersOverview({
  loading = false,
}: OrdersOverviewProps) {
  const { data, isLoading } = useGetPurchasesQuery();
  const purchases = readEntity<PurchasesOverview>(data);
  const total = purchases?.totalOrder ?? 0;
  const showSkeleton = loading || isLoading;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col min-h-[360px]">
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#0B1F3A]">
          Orders Overview
        </h2>
        <p className="text-[12px] text-gray-400 mt-0.5">This month</p>
      </div>

      <div className="space-y-6 flex-1">
        {ORDER_STATUS.map((item) => {
          const value = purchases?.[item.key] ?? 0;
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;

          return (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-2 h-5">
                {showSkeleton ? (
                  <>
                    <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-10 rounded bg-gray-200 animate-pulse" />
                  </>
                ) : (
                  <>
                    <span className="text-[13px] text-gray-600">
                      {item.label}
                    </span>
                    <span className="text-[13px] font-semibold text-[#0B1F3A]">
                      {value.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                {showSkeleton ? (
                  <div className="h-full w-2/3 rounded-full bg-gray-200 animate-pulse" />
                ) : (
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="h-8 flex items-center">
          {showSkeleton ? (
            <div className="h-7 w-16 rounded-md bg-gray-200 animate-pulse" />
          ) : (
            <div className="text-[28px] font-bold text-[#1E90FF] leading-none">
              {total.toLocaleString()}
            </div>
          )}
        </div>
        <div className="text-[12px] text-gray-500 mt-1.5">Total Orders</div>
      </div>
    </div>
  );
}
