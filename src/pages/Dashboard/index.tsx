import StatsRow from "./StatsRow";
import RevenueChart from "./RevenueChart";
import OrdersOverview from "./OrdersOverview";
import TopProducts from "./TopProducts";
import SideInsights from "./SideInsights";
import { usePageBoot } from "../../lib/usePageLoad";

export default function Dashboard() {
  const pageLoading = usePageBoot();

  return (
    <div className="space-y-4">
      <StatsRow loading={pageLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <RevenueChart loading={pageLoading} />
        <OrdersOverview loading={pageLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <TopProducts loading={pageLoading} />
        <SideInsights loading={pageLoading} />
      </div>
    </div>
  );
}
