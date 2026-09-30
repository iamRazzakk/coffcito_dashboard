import { useGetOverviewQuery } from "@/store/services/overview";
import type { DashboardOverview } from "@/store/services/overview";
import { readEntity } from "../../store/http";
import { DASHBOARD_STATS } from "./data";

interface StatsRowProps {
  loading?: boolean;
}

function formatStat(value: number | undefined, money?: boolean) {
  const amount = Number(value ?? 0);
  const formatted = Number.isFinite(amount) ? amount.toLocaleString() : "0";
  return money ? `₱${formatted}` : formatted;
}

export default function StatsRow({ loading = false }: StatsRowProps) {
  const { data, isLoading } = useGetOverviewQuery();
  const overview = readEntity<DashboardOverview>(data);
  const showSkeleton = loading || isLoading;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {DASHBOARD_STATS.map(({ label, key, icon: Icon, money }) => (
        <div
          key={key}
          className="bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm h-[120px] flex flex-col"
        >
          <div className="w-9 h-9 rounded-lg bg-[#E8F3FF] text-[#1E90FF] flex items-center justify-center shrink-0">
            {showSkeleton ? (
              <div className="w-4 h-4 rounded bg-[#1E90FF]/20 animate-pulse" />
            ) : (
              <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
            )}
          </div>

          <div className="mt-auto">
            <div className="h-7 flex items-center">
              {showSkeleton ? (
                <div className="h-6 w-16 rounded-md bg-gray-200 animate-pulse" />
              ) : (
                <div className="text-[22px] font-bold text-[#0B1F3A] leading-none tracking-tight">
                  {formatStat(overview?.[key], money)}
                </div>
              )}
            </div>
            <div className="h-[16px] mt-1.5 flex items-center">
              {showSkeleton ? (
                <div className="h-2.5 w-20 rounded bg-gray-200 animate-pulse" />
              ) : (
                <div className="text-[12px] text-gray-500 leading-none">
                  {label}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
