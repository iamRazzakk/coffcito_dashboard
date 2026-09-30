import { Download } from "lucide-react";
import StatsRow from "../Dashboard/StatsRow";
import RevenueChart from "../Dashboard/RevenueChart";
import OrdersOverview from "../Dashboard/OrdersOverview";
import TopProducts from "../Dashboard/TopProducts";
import SideInsights from "../Dashboard/SideInsights";
import { notify } from "../../lib/notify";
import { usePageBoot } from "../../lib/usePageLoad";

export default function ReportsPage() {
  const pageLoading = usePageBoot();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
            Reports & Analytics
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Performance insights across shops, products, gift cards and wallet
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            notify.success("Export started", "Analytics report will download shortly.")
          }
          className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <StatsRow loading={pageLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <RevenueChart loading={pageLoading} />
        <OrdersOverview loading={pageLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <TopProducts loading={pageLoading} showViewAll />
        <SideInsights loading={pageLoading} />
      </div>
    </div>
  );
}
