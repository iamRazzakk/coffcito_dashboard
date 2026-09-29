import type { Shop } from "./types";

interface ShopCardProps {
  shops: Shop[];
  loading?: boolean;
}

export default function ShopCard({ shops, loading = false }: ShopCardProps) {
  const total = shops.length;
  const active = shops.filter((s) => s.status === "Active").length;
  const maintenance = shops.filter((s) => s.status === "Maintenance").length;
  const inactive = shops.filter((s) => s.status === "Inactive").length;

  const cards = [
    {
      label: "Total Shops",
      value: total,
      valueClass: "text-[#1E90FF]",
      bar: "bg-[#1E90FF]",
    },
    {
      label: "Active",
      value: active,
      valueClass: "text-emerald-500",
      bar: "bg-emerald-500",
    },
    {
      label: "Maintenance",
      value: maintenance,
      valueClass: "text-amber-500",
      bar: "bg-amber-500",
    },
    {
      label: "Inactive",
      value: inactive,
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
