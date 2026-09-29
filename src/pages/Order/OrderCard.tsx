import type { Order } from "./types";

interface OrderCardProps {
  orders: Order[];
  loading?: boolean;
}

const CARD_LABELS = [
  "Total Orders",
  "Completed",
  "Pending / Processing",
  "Cancelled",
] as const;

export default function OrderCard({ orders, loading = false }: OrderCardProps) {
  const total = orders.length;
  const completed = orders.filter((o) => o.status === "Completed").length;
  const pendingProcessing = orders.filter(
    (o) => o.status === "Pending" || o.status === "Processing",
  ).length;
  const cancelled = orders.filter((o) => o.status === "Cancelled").length;

  const cards = [
    { label: CARD_LABELS[0], value: total, valueClass: "text-[#1E90FF]" },
    { label: CARD_LABELS[1], value: completed, valueClass: "text-emerald-500" },
    {
      label: CARD_LABELS[2],
      value: pendingProcessing,
      valueClass: "text-amber-500",
    },
    { label: CARD_LABELS[3], value: cancelled, valueClass: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm h-[92px] flex flex-col justify-center"
        >
          {/* Fixed label slot — same height as text-[11px] + mb-2 */}
          <div className="h-[14px] mb-2 flex items-center">
            {loading ? (
              <div className="h-2.5 w-[72%] max-w-[140px] rounded bg-gray-200 animate-pulse" />
            ) : (
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 leading-none">
                {card.label}
              </div>
            )}
          </div>

          {/* Fixed value slot — same height as text-[28px] leading-none */}
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
