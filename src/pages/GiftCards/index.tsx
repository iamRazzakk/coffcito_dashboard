import { useState } from "react";
import CouponsPanel from "./CouponsPanel";
import GiftsPanel from "./GiftsPanel";

type PageTab = "gifts" | "coupons";

export default function GiftCardsPage() {
  const [tab, setTab] = useState<PageTab>("gifts");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
          Gift & Coupons
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Manage gifts and promotional coupon codes
        </p>
      </div>

      <div className="flex gap-0 border-b border-gray-200">
        {(
          [
            { key: "gifts" as const, label: "Gifts" },
            { key: "coupons" as const, label: "Coupons" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`h-11 px-4 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === item.key
                ? "border-[#1E90FF] text-[#1E90FF]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "gifts" ? <GiftsPanel /> : <CouponsPanel />}
    </div>
  );
}
