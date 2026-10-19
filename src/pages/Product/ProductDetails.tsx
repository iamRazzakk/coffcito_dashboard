import { X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import { useGetAllCategoriesQuery } from "@/store/services/category.api";
import { useGetProductByIdQuery } from "@/store/services/product.api";
import type { Product } from "./types";
import { STATUS_STYLES, formatPrice } from "./types";
import { resolveImageUrl } from "../../utils/imageUrl";
import { toMenuProduct } from "./ProductGrid";

interface ProductDetailsProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

function hasNumber(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-[13px]">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-[#0B1F3A] text-right">{value}</span>
    </div>
  );
}

export default function ProductDetails({
  product,
  open,
  onClose,
  onExited,
  onEdit,
  onToggleStatus,
}: ProductDetailsProps) {
  const { data: categories = [] } = useGetAllCategoriesQuery(undefined, {
    skip: !open,
  });
  const { data: detailResponse, isFetching } = useGetProductByIdQuery(
    product?.id ?? "",
    { skip: !open || !product?.id },
  );

  const detailRecord = detailResponse?.data;
  const shown =
    product && detailRecord
      ? {
          ...toMenuProduct(detailRecord, categories),
          status: product.status,
        }
      : product;

  const sellingPrice = hasNumber(shown?.discountPrice)
    ? shown.discountPrice
    : (shown?.originalPrice ?? shown?.price);
  const hasDiscount =
    shown != null &&
    hasNumber(shown.discountPrice) &&
    hasNumber(shown.originalPrice) &&
    shown.discountPrice !== shown.originalPrice;
  const imageSrc = resolveImageUrl(shown?.image);

  return (
    <DrawerShell open={open && !!product} onClose={onClose} onExited={onExited}>
      {shown && (
        <>
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
            <div className="min-w-0">
              {shown.category ? (
                <div className="text-[11px] font-semibold text-[#1E90FF] mb-1">
                  {shown.category}
                </div>
              ) : null}
              <h2 className="text-[18px] font-bold text-[#0B1F3A] truncate">
                {shown.name}
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
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={shown.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : null}
              <span
                className={`absolute top-3 right-3 inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[shown.status]}`}
              >
                {shown.status}
              </span>
            </div>

            {hasNumber(sellingPrice) ? (
              <div className={`grid gap-3 ${hasDiscount ? "grid-cols-2" : "grid-cols-1"}`}>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 h-[72px] flex flex-col justify-center">
                  <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                    {hasDiscount ? "Discount price" : "Price"}
                  </div>
                  <div className="text-[18px] font-bold text-[#1E90FF] mt-1">
                    {formatPrice(sellingPrice)}
                  </div>
                </div>
                {hasDiscount && hasNumber(shown.originalPrice) ? (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 h-[72px] flex flex-col justify-center">
                    <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                      Original
                    </div>
                    <div className="text-[18px] font-bold text-[#0B1F3A] mt-1 line-through decoration-gray-300">
                      {formatPrice(shown.originalPrice)}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <section className="rounded-xl border border-gray-100 p-4 space-y-2">
              <DetailRow label="Product ID" value={shown.id} />
              {hasNumber(shown.costPrice) ? (
                <DetailRow label="Cost" value={formatPrice(shown.costPrice)} />
              ) : null}
              {hasNumber(shown.costPrice) && hasNumber(sellingPrice) ? (
                <div className="flex justify-between gap-3 text-[13px]">
                  <span className="text-gray-400">Margin</span>
                  <span
                    className={`font-medium ${
                      sellingPrice - shown.costPrice < 0
                        ? "text-red-500"
                        : "text-emerald-600"
                    }`}
                  >
                    {formatPrice(sellingPrice - shown.costPrice)}
                  </span>
                </div>
              ) : null}
              {hasNumber(shown.taxPercentage) ? (
                <DetailRow label="Tax" value={`${shown.taxPercentage}%`} />
              ) : null}
              {hasNumber(shown.point) ? (
                <DetailRow label="Points" value={shown.point.toLocaleString()} />
              ) : null}
              {shown.shopName ? (
                <DetailRow label="Shop" value={shown.shopName} />
              ) : null}
            </section>

            {isFetching && !detailRecord ? (
              <p className="text-[12px] text-gray-400">Loading product...</p>
            ) : null}

            {shown.description.trim() ? (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Description
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {shown.description}
                </p>
              </section>
            ) : null}

            {shown.sizes.length > 0 ? (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Sizes
                </div>
                <div className="flex flex-wrap gap-2">
                  {shown.sizes.map((size) => (
                    <span
                      key={size.id}
                      className="inline-flex items-center h-8 px-3 rounded-lg bg-[#E8F3FF] text-[12px] font-medium text-[#0B1F3A]"
                    >
                      {size.label}
                      {size.priceOffset > 0 ? ` · +$${size.priceOffset}` : ""}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {shown.extras.length > 0 ? (
              <section>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Extras
                </div>
                <div className="flex flex-wrap gap-2">
                  {shown.extras.map((extra) => (
                    <span
                      key={extra.id}
                      className="inline-flex items-center h-8 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[12px] font-medium text-[#0B1F3A]"
                    >
                      {extra.label}
                      {extra.price > 0 ? ` · +$${extra.price}` : ""}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="p-5 border-t border-gray-100 shrink-0 space-y-2">
            <button
              type="button"
              onClick={() => onEdit(shown)}
              className="w-full h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8] transition-colors"
            >
              Edit Product
            </button>
            <button
              type="button"
              onClick={() => onToggleStatus(shown)}
              className={`w-full h-11 rounded-xl border text-[14px] font-semibold transition-colors ${
                shown.status === "Active"
                  ? "border-red-200 text-red-500 hover:bg-red-50"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {shown.status === "Active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </>
      )}
    </DrawerShell>
  );
}
