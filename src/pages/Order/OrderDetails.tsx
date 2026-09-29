import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Order } from "./types";
import {
  STATUS_STYLES,
  formatAmount,
  getInitials,
} from "./types";

interface OrderDetailsProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  onMarkComplete?: (order: Order) => void;
  onCancel?: (order: Order) => void;
}

const ANIM_MS = 320;

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-[12px] text-gray-400 shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-[#0B1F3A] text-right">
        {value}
      </span>
    </div>
  );
}

export default function OrderDetails({
  order,
  open,
  onClose,
  onExited,
  onMarkComplete,
  onCancel,
}: OrderDetailsProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showFrame = 0;
    let hideTimer = 0;

    if (open && order) {
      setMounted(true);
      showFrame = window.requestAnimationFrame(() => {
        showFrame = window.requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      hideTimer = window.setTimeout(() => {
        setMounted(false);
        onExited?.();
      }, ANIM_MS);
    }

    return () => {
      if (showFrame) window.cancelAnimationFrame(showFrame);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
    // intentionally omit onExited — stable via parent useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order]);

  // Lock scroll without layout jump (compensate scrollbar width)
  useEffect(() => {
    if (!mounted) return;

    const scrollbar =
      window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [mounted]);

  if (!mounted || !order) return null;

  const canAct =
    order.status === "Pending" || order.status === "Processing";
  const showCancel = order.status === "Pending";

  return (
    <div
      className={`fixed inset-0 z-50 ${visible ? "" : "pointer-events-none"}`}
      aria-modal="true"
      role="dialog"
    >
      <button
        type="button"
        aria-label="Close overlay"
        tabIndex={visible ? 0 : -1}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col will-change-transform transition-transform duration-300 ease-out ${
          visible ? "translate-x-0 pointer-events-auto" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
          <h2 className="text-[18px] font-bold text-[#0B1F3A]">
            Order #{order.id}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-4 flex flex-wrap items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center h-7 px-3 rounded-full text-[12px] font-semibold ${STATUS_STYLES[order.status].badge}`}
          >
            {order.status}
          </span>

          {canAct && (
            <>
              <button
                type="button"
                onClick={() => onMarkComplete?.(order)}
                className="h-8 px-3.5 rounded-lg bg-[#1E90FF] text-white text-[12px] font-semibold hover:bg-[#1878d8] transition-colors"
              >
                Mark Complete
              </button>
              {showCancel && (
                <button
                  type="button"
                  onClick={() => onCancel?.(order)}
                  className="h-8 px-3.5 rounded-lg border border-red-300 text-red-500 text-[12px] font-semibold hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5 space-y-4">
          <section className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Customer
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#1E90FF] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                {getInitials(order.customerName)}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-[#0B1F3A]">
                  {order.customerName}
                </div>
                <div className="text-[12px] text-gray-400">
                  {order.customerEmail}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-50 pt-2">
              <MetaRow label="Phone" value={order.customerPhone} />
              <MetaRow label="Shop" value={order.shop} />
              <MetaRow label="Shop Address" value={order.shopAddress} />
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Order Items
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={`${item.name}-${item.qty}`}
                  className="flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-[13px] font-medium text-[#0B1F3A]">
                      {item.name}
                    </div>
                    <div className="text-[12px] text-gray-400">
                      Qty: {item.qty}
                    </div>
                  </div>
                  <div className="text-[13px] font-semibold text-[#0B1F3A]">
                    {formatAmount(item.price)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[13px] font-medium text-gray-500">Total</span>
              <span className="text-[16px] font-bold text-[#1E90FF]">
                {formatAmount(order.amount)}
              </span>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Payment
            </div>
            <MetaRow label="Method" value={order.paymentMethod} />
            <MetaRow label="Reference" value={order.paymentRef} />
            <MetaRow
              label="Date"
              value={`${order.date} · ${order.time}`}
            />
          </section>

          {order.extras && (
            <section>
              <div className="text-[12px] font-semibold text-amber-600 mb-2">
                Extras
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-[13px] text-[#0B1F3A]">
                {order.extras}
              </div>
            </section>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}
