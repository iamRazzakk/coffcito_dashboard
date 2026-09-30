import { useRef, useState } from "react";
import { CloudUpload, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import type { CreateProductArgs, ProductSize } from "@/store/services/product.api";
import type { Product, ProductFormValues } from "./types";
import { emptyProductForm, productToForm } from "./types";
import { resolveImageUrl } from "../../utils/imageUrl";

interface ProductFormProps {
  open: boolean;
  mode: "add" | "edit";
  product: Product | null;
  submitting?: boolean;
  onClose: () => void;
  onExited?: () => void;
  onSubmit: (
    productArgs: Omit<CreateProductArgs, "imageFile"> & { imageFile: File | null },
    productId?: string,
  ) => void;
}

const SIZES: ProductSize[] = ["S", "M", "L"];

const fieldClass =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors";
const labelClass = "block text-[12px] font-medium text-gray-600 mb-1.5";

export default function ProductForm({
  open,
  mode,
  product,
  submitting = false,
  onClose,
  onExited,
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValues>(() =>
    mode === "edit" && product ? productToForm(product) : emptyProductForm(),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const handleImage = (file?: File | null) => {
    if (!file) return;
    setImageFile(file);
    setField("imagePreview", URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (submitting || (mode === "add" && !imageFile)) return;
    onSubmit(
      {
        productName: form.productName.trim(),
        categoryId: form.categoryId.trim(),
        size: form.size,
        description: form.description.trim(),
        discountPrice: form.discountPrice,
        originalPrice: form.originalPrice,
        imageFile,
      },
      product?.id,
    );
  };

  const title = mode === "edit" && product ? `Edit: ${product.name}` : "Add New Product";
  const canSubmit =
    !submitting &&
    (mode === "edit" || Boolean(imageFile)) &&
    Boolean(form.productName.trim()) &&
    Boolean(form.categoryId.trim()) &&
    Boolean(form.description.trim());

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      onExited={onExited}
      widthClass="max-w-[480px]"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B1F3A]">{title}</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Create a product and customize options by category
          </p>
        </div>
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
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleImage(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleImage(event.dataTransfer.files?.[0]);
            }}
            className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex flex-col items-center justify-center gap-2 hover:border-[#1E90FF]/40 transition-colors"
          >
            {form.imagePreview ? (
              <img
                src={resolveImageUrl(form.imagePreview)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            ) : null}
            <CloudUpload className="w-7 h-7 text-gray-400 relative z-10" />
            <span className="text-[12px] text-gray-500 relative z-10">
              JPG, PNG, WebP · max 5MB
            </span>
            <span className="relative z-10 h-8 px-3 rounded-lg bg-white border border-gray-200 text-[12px] font-semibold text-gray-700 inline-flex items-center">
              Select Image <span className="text-red-500 ml-1">*</span>
            </span>
          </button>
        </div>

        <div>
          <label className={labelClass}>
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            className={fieldClass}
            value={form.productName}
            onChange={(event) => setField("productName", event.target.value)}
            placeholder="e.g. Iced Americano"
          />
        </div>

        <div>
          <label className={labelClass}>
            Category <span className="text-red-500">*</span>
          </label>
          <input
            className={fieldClass}
            value={form.categoryId}
            onChange={(event) => setField("categoryId", event.target.value)}
            placeholder="Category id"
          />
        </div>

        <div>
          <label className={labelClass}>
            Size <span className="text-red-500">*</span>
          </label>
          <select
            className={fieldClass}
            value={form.size}
            onChange={(event) => setField("size", event.target.value as ProductSize)}
          >
            {SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(event) =>
              setField("description", event.target.value.slice(0, 300))
            }
            rows={3}
            placeholder="Short product description..."
            className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors resize-none"
          />
          <div className="text-right text-[11px] text-gray-400 mt-1">
            {form.description.length}/300
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Pricing
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Discount Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={form.discountPrice || ""}
                onChange={(event) =>
                  setField("discountPrice", Number(event.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className={labelClass}>
                Original Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={form.originalPrice || ""}
                onChange={(event) =>
                  setField("originalPrice", Number(event.target.value) || 0)
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-gray-100 shrink-0 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1 h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : mode === "edit" ? "Save changes" : "Add Product"}
        </button>
      </div>
    </DrawerShell>
  );
}
