import { Wallet } from "lucide-react";
import { useGetRevenueSummaryQuery } from "@/store/services/overview";
import type { RevenueSummary } from "@/store/services/overview";
import { readEntity } from "../../store/http";

interface SideInsightsProps {
  loading?: boolean;
}

function formatPeso(value: number | undefined) {
  return `₱${(value ?? 0).toLocaleString()}`;
}

function InsightCard({
  title,
  icon: Icon,
  loading,
  rows,
}: {
  title: string;
  icon: typeof Wallet;
  loading?: boolean;
  rows: { label: string; value: string; valueClass?: string }[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex-1 flex flex-col min-h-[148px]">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#E8F3FF] text-[#1E90FF] flex items-center justify-center shrink-0">
          <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
        </div>
        <h3 className="text-[15px] font-semibold text-[#0B1F3A]">{title}</h3>
      </div>

      <div className="mt-auto space-y-4 pt-6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            {loading ? (
              <>
                <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
              </>
            ) : (
              <>
                <span className="text-[13px] text-gray-500">{row.label}</span>
                <span
                  className={`text-[15px] font-bold leading-none ${row.valueClass ?? "text-[#0B1F3A]"}`}
                >
                  {row.value}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SideInsights({ loading = false }: SideInsightsProps) {
  const { data, isLoading } = useGetRevenueSummaryQuery();
  const summary = readEntity<RevenueSummary>(data);
  const showSkeleton = loading || isLoading;

  return (
    <div className="flex flex-col gap-4 h-full">
      <InsightCard
        title="Revenue"
        icon={Wallet}
        loading={showSkeleton}
        rows={[
          { label: "Total Revenue", value: formatPeso(summary?.totalRevenue) },
          {
            label: "This Month",
            value: formatPeso(summary?.thisMonthRevenue),
            valueClass: "text-[#1E90FF]",
          },
        ]}
      />
    </div>
  );
}
