import { X } from "lucide-react";
import DrawerShell from "./DrawerShell";
import type { Shop } from "./types";
import { STATUS_STYLES, formatOrders, formatRevenue } from "./types";

interface ShopDetailsProps {
  shop: Shop | null;
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  onEdit: (shop: Shop) => void;
  onSuspend: (shop: Shop) => void;
}

export default function ShopDetails({
  shop,
  open,
  onClose,
  onExited,
  onEdit,
  onSuspend,
}: ShopDetailsProps) {
  return (
    <DrawerShell open={open && !!shop} onClose={onClose} onExited={onExited}>
      {shop && (
        <>
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
            <h2 className="text-[18px] font-bold text-[#0B1F3A]">{shop.name}</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5 space-y-4">
            <div className="h-44 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={shop.image}
                alt={shop.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center h-7 px-3 rounded-full text-[12px] font-semibold ${STATUS_STYLES[shop.status]}`}
              >
                {shop.status}
              </span>
              <span className="text-[12px] text-gray-400">Since {shop.since}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 h-[72px] flex flex-col justify-center">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Orders
                </div>
                <div className="text-[18px] font-bold text-[#0B1F3A] mt-1">
                  {formatOrders(shop.orders)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 h-[72px] flex flex-col justify-center">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Revenue
                </div>
                <div className="text-[18px] font-bold text-[#1E90FF] mt-1">
                  {formatRevenue(shop.revenue)}
                </div>
              </div>
            </div>

            <section className="rounded-xl border border-gray-100 p-4 space-y-2">
              <div className="flex justify-between gap-3 text-[13px]">
                <span className="text-gray-400">Phone</span>
                <span className="font-medium text-[#0B1F3A] text-right">
                  {shop.phone}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-[13px]">
                <span className="text-gray-400">Address</span>
                <span className="font-medium text-[#0B1F3A] text-right">
                  {shop.location}
                </span>
              </div>
            </section>

            {shop.hours.length > 0 && (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Working Hours
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-2">
                  {shop.hours.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between text-[13px]"
                    >
                      <span className="text-gray-500">{h.day}</span>
                      <span className="font-medium text-[#0B1F3A]">
                        {h.open} – {h.close}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {shop.faqs.length > 0 && (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  FAQs
                </div>
                <div className="space-y-2">
                  {shop.faqs.map((f) => (
                    <div
                      key={f.id}
                      className="rounded-xl border border-gray-100 p-3"
                    >
                      <div className="text-[13px] font-semibold text-[#0B1F3A]">
                        {f.question}
                      </div>
                      <div className="text-[12px] text-gray-500 mt-1">
                        {f.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {shop.about && (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  About
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {shop.about}
                </p>
              </section>
            )}
          </div>

          <div className="p-5 border-t border-gray-100 shrink-0 space-y-2">
            <button
              type="button"
              onClick={() => onEdit(shop)}
              className="w-full h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8] transition-colors"
            >
              Edit Shop
            </button>
            <button
              type="button"
              onClick={() => onSuspend(shop)}
              className="w-full h-11 rounded-xl border border-red-200 text-red-500 text-[14px] font-semibold hover:bg-red-50 transition-colors"
            >
              Suspend
            </button>
          </div>
        </>
      )}
    </DrawerShell>
  );
}
