import { X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import type { Product } from "./types";
import { STATUS_STYLES, formatPrice, formatSold } from "./types";
import { resolveImageUrl } from "../../utils/imageUrl";

interface ProductDetailsProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

export default function ProductDetails({
  product,
  open,
  onClose,
  onExited,
  onEdit,
  onToggleStatus,
}: ProductDetailsProps) {
  return (
    <DrawerShell open={open && !!product} onClose={onClose} onExited={onExited}>
      {product && (
        <>
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-[#1E90FF] mb-1">
                {product.category}
              </div>
              <h2 className="text-[18px] font-bold text-[#0B1F3A] truncate">
                {product.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5 space-y-4">
            <div className="relative h-44 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={resolveImageUrl(product.image)}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-3 right-3 inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[product.status]}`}
              >
                {product.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 h-[72px] flex flex-col justify-center">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Price
                </div>
                <div className="text-[18px] font-bold text-[#1E90FF] mt-1">
                  {formatPrice(product.price)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 h-[72px] flex flex-col justify-center">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Sold
                </div>
                <div className="text-[18px] font-bold text-[#0B1F3A] mt-1">
                  {formatSold(product.sold).replace(" sold", "")}
                </div>
              </div>
            </div>

            <section className="rounded-xl border border-gray-100 p-4 space-y-2">
              <div className="flex justify-between gap-3 text-[13px]">
                <span className="text-gray-400">Product ID</span>
                <span className="font-medium text-[#0B1F3A]">{product.id}</span>
              </div>
              <div className="flex justify-between gap-3 text-[13px]">
                <span className="text-gray-400">Cost</span>
                <span className="font-medium text-[#0B1F3A]">
                  {formatPrice(product.costPrice)}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-[13px]">
                <span className="text-gray-400">Margin</span>
                <span className="font-medium text-emerald-600">
                  {formatPrice(Math.max(0, product.price - product.costPrice))}
                </span>
              </div>
            </section>

            {product.description && (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Description
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </section>
            )}

            {product.sizes.length > 0 && (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Sizes
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center h-8 px-3 rounded-lg bg-[#E8F3FF] text-[12px] font-medium text-[#0B1F3A]"
                    >
                      {s.label}
                      {s.priceOffset > 0 ? ` · +$${s.priceOffset}` : ""}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {product.extras.length > 0 && (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Extras
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.extras.map((e) => (
                    <span
                      key={e.id}
                      className="inline-flex items-center h-8 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[12px] font-medium text-[#0B1F3A]"
                    >
                      {e.label} · +${e.price}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="p-5 border-t border-gray-100 shrink-0 space-y-2">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="w-full h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8] transition-colors"
            >
              Edit Product
            </button>
            <button
              type="button"
              onClick={() => onToggleStatus(product)}
              className={`w-full h-11 rounded-xl border text-[14px] font-semibold transition-colors ${
                product.status === "Active"
                  ? "border-red-200 text-red-500 hover:bg-red-50"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {product.status === "Active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </>
      )}
    </DrawerShell>
  );
}
