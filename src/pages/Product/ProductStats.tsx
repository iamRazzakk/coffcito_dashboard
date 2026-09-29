import type { Product } from "./types";

interface ProductStatsProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductStats({
  products,
  loading = false,
}: ProductStatsProps) {
  const total = products.length;
  const active = products.filter((p) => p.status === "Active").length;
  const topSeller =
    [...products].sort((a, b) => b.sold - a.sold)[0]?.name ?? "—";

  const cards = [
    {
      key: "total",
      label: "Total Products",
      value: String(total),
      valueClass: "text-[#1E90FF]",
      isText: false,
    },
    {
      key: "active",
      label: "Active",
      value: String(active),
      valueClass: "text-emerald-500",
      isText: false,
    },
    {
      key: "top",
      label: "Top Seller",
      value: topSeller,
      valueClass: "text-[#1E90FF]",
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm h-[92px] flex flex-col justify-center"
        >
          <div className="h-[14px] mb-2 flex items-center">
            {loading ? (
              <div className="h-2.5 w-24 rounded bg-gray-200 animate-pulse" />
            ) : (
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 leading-none">
                {card.label}
              </div>
            )}
          </div>
          <div className="h-7 flex items-center min-w-0">
            {loading ? (
              <div
                className={`h-7 rounded-md bg-gray-200 animate-pulse ${
                  card.isText ? "w-40" : "w-10"
                }`}
              />
            ) : (
              <div
                className={`${
                  card.isText
                    ? "text-[18px] font-bold truncate"
                    : "text-[28px] font-bold leading-none"
                } ${card.valueClass}`}
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
