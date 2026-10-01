import { useGetAllShopsQuery } from "@/store/services/shop.api";
import type { ShopStatus } from "./types";

function useShopTotal(status?: ShopStatus) {
  const { data, isLoading } = useGetAllShopsQuery({
    page: 1,
    limit: 1,
    status,
  });

  return {
    total: data?.pagination?.total ?? 0,
    loading: isLoading,
  };
}

export default function ShopCard() {
  const allShops = useShopTotal();
  const activeShops = useShopTotal("Active");
  const maintenanceShops = useShopTotal("Maintenance");
  const inactiveShops = useShopTotal("Inactive");
  const loading =
    allShops.loading ||
    activeShops.loading ||
    maintenanceShops.loading ||
    inactiveShops.loading;

  const cards = [
    {
      label: "Total Shops",
      value: allShops.total,
      valueClass: "text-[#1E90FF]",
      bar: "bg-[#1E90FF]",
    },
    {
      label: "Active",
      value: activeShops.total,
      valueClass: "text-emerald-500",
      bar: "bg-emerald-500",
    },
    {
      label: "Maintenance",
      value: maintenanceShops.total,
      valueClass: "text-amber-500",
      bar: "bg-amber-500",
    },
    {
      label: "Inactive",
      value: inactiveShops.total,
      valueClass: "text-red-500",
      bar: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative bg-white rounded-xl border border-gray-100 pl-5 pr-5 py-4 shadow-sm h-[92px] flex flex-col justify-center overflow-hidden"
        >
          <div
            className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${card.bar}`}
          />

          <div className="h-[14px] mb-2 flex items-center">
            {loading ? (
              <div className="h-2.5 w-[70%] max-w-[120px] rounded bg-gray-200 animate-pulse" />
            ) : (
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 leading-none">
                {card.label}
              </div>
            )}
          </div>

          <div className="h-7 flex items-center">
            {loading ? (
              <div className="h-7 w-10 rounded-md bg-gray-200 animate-pulse" />
            ) : (
              <div
                className={`text-[28px] font-bold leading-none ${card.valueClass}`}
              >
                {card.value}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
