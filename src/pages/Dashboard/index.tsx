import { useMemo, useState } from "react";
import StatsRow from "./StatsRow";
import RevenueChart from "./RevenueChart";
import OrdersOverview from "./OrdersOverview";
import TopProducts from "./TopProducts";
import SideInsights from "./SideInsights";
import { REVENUE_BY_RANGE, type RangeKey } from "./data";
import { useActionSkeleton, usePageBoot } from "../../lib/usePageLoad";

export default function Dashboard() {
  const [range, setRange] = useState<RangeKey>("30D");
  const isBooting = usePageBoot();
  const { isRefreshing, runWithSkeleton } = useActionSkeleton(220);

  const chartData = useMemo(() => REVENUE_BY_RANGE[range], [range]);

  const handleRangeChange = (nextRange: RangeKey) => {
    if (nextRange === range) return;
    runWithSkeleton(() => setRange(nextRange));
  };

  const pageLoading = isBooting;
  const chartLoading = isBooting || isRefreshing;

  return (
    <div className="space-y-4">
      <StatsRow loading={pageLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <RevenueChart
          range={range}
          chartData={chartData}
          loading={chartLoading}
          onRangeChange={handleRangeChange}
        />
        <OrdersOverview loading={pageLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <TopProducts loading={pageLoading} />
        <SideInsights loading={pageLoading} />
      </div>
    </div>
  );
}
