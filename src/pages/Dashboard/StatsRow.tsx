import { DASHBOARD_STATS } from "./data";

interface StatsRowProps {
  loading?: boolean;
}

export default function StatsRow({ loading = false }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {DASHBOARD_STATS.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm h-[120px] flex flex-col"
        >
          <div className="w-9 h-9 rounded-lg bg-[#E8F3FF] text-[#1E90FF] flex items-center justify-center shrink-0">
            {loading ? (
              <div className="w-4 h-4 rounded bg-[#1E90FF]/20 animate-pulse" />
            ) : (
              <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
            )}
          </div>

          <div className="mt-auto">
            <div className="h-7 flex items-center">
              {loading ? (
                <div className="h-6 w-16 rounded-md bg-gray-200 animate-pulse" />
              ) : (
                <div className="text-[22px] font-bold text-[#0B1F3A] leading-none tracking-tight">
                  {value}
                </div>
              )}
            </div>
            <div className="h-[16px] mt-1.5 flex items-center">
              {loading ? (
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
