import { useRef, useState } from "react";
import { CloudUpload, Plus, Trash2, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import { useGetAllCategoriesQuery } from "@/store/services/category.api";
import type {
  CreateProductArgs,
  ProductExtraInput,
  ProductSize,
  ProductSizeInput,
} from "@/store/services/product.api";
import type {
  Product,
  ProductFormExtra,
  ProductFormSize,
  ProductFormValues,
} from "./types";
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
    productArgs: Omit<CreateProductArgs, "imageFile"> & {
      imageFile: File | null;
    },
    productId?: string,
  ) => Promise<boolean>;
}

const SIZES: ProductSize[] = ["S", "M", "L"];

const fieldClass =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors";
const labelClass = "block text-[12px] font-medium text-gray-600 mb-1.5";

function rowId() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseNonNegative(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const number = Number(trimmed);
  if (!Number.isFinite(number) || number < 0) return null;
  return number;
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return parseNonNegative(trimmed) ?? undefined;
}

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
  const { data: categories = [], isFetching: isCategoriesLoading } =
    useGetAllCategoriesQuery();

  const setField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const replacePreview = (preview: string) => {
    setForm((current) => {
      if (current.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(current.imagePreview);
      }
      return { ...current, imagePreview: preview };
    });
  };

  const handleImage = (file?: File | null) => {
    if (!file) return;
    setImageFile(file);
    replacePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setForm((current) => {
      if (current.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(current.imagePreview);
      }
      return emptyProductForm();
    });
  };

  const updateSize = (id: string, patch: Partial<ProductFormSize>) => {
    setField(
      "sizes",
      form.sizes.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const updateExtra = (id: string, patch: Partial<ProductFormExtra>) => {
    setField(
      "extras",
      form.extras.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const addSize = () => {
    const used = new Set(form.sizes.map((row) => row.name));
    const next = SIZES.find((size) => !used.has(size));
    if (!next) return;
    setField("sizes", [
      ...form.sizes,
      { id: rowId(), name: next, additionalPrice: "" },
    ]);
  };

  const addExtra = () => {
    setField("extras", [
      ...form.extras,
      { id: rowId(), name: "", additionalPrice: "" },
    ]);
  };

  const originalPrice = parseNonNegative(form.originalPrice);
  const sizesReady = form.sizes.every(
    (row) => parseNonNegative(row.additionalPrice) !== null,
  );
  const extrasReady = form.extras.every(
    (row) => row.name.trim() && parseNonNegative(row.additionalPrice) !== null,
  );
  const optionalReady = [
    form.discountPrice,
    form.costPrice,
    form.taxPercentage,
    form.point,
  ].every((value) => !value.trim() || parseNonNegative(value) !== null);
  const canSubmit =
    !submitting &&
    Boolean(form.productName.trim()) &&
    Boolean(form.categoryId.trim()) &&
    (mode === "edit" || Boolean(imageFile)) &&
    originalPrice !== null &&
    sizesReady &&
    extrasReady &&
    optionalReady;

  const handleSubmit = async () => {
    if (!canSubmit || originalPrice === null) return;

    const description = form.description.trim();
    const discountPrice = optionalNumber(form.discountPrice);
    const costPrice = optionalNumber(form.costPrice);
    const taxPercentage = optionalNumber(form.taxPercentage);
    const point = optionalNumber(form.point);
    const sizes: ProductSizeInput[] = form.sizes.map((row) => ({
      name: row.name,
      additionalPrice: parseNonNegative(row.additionalPrice) ?? 0,
    }));
    const extras: ProductExtraInput[] = form.extras.map((row) => ({
      name: row.name.trim(),
      additionalPrice: parseNonNegative(row.additionalPrice) ?? 0,
    }));

    const created = await onSubmit(
      {
        productName: form.productName.trim(),
        categoryId: form.categoryId.trim(),
        originalPrice,
        status: form.status,
        sizes,
        extras,
        imageFile,
        ...(description ? { description } : {}),
        ...(discountPrice !== undefined ? { discountPrice } : {}),
        ...(costPrice !== undefined ? { costPrice } : {}),
        ...(taxPercentage !== undefined ? { taxPercentage } : {}),
        ...(point !== undefined ? { point } : {}),
      },
      product?.id,
    );

    if (created && mode === "add") resetForm();
  };

  const title =
    mode === "edit" && product ? `Edit: ${product.name}` : "Add New Product";

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      onExited={onExited}
      widthClass="max-w-[520px]"
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
          <label className={labelClass}>
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            className={fieldClass}
            value={form.productName}
            onChange={(event) => setField("productName", event.target.value)}
            placeholder="e.g. Latte"
          />
        </div>

        <div>
          <label className={labelClass}>
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className={fieldClass}
            value={form.categoryId}
            onChange={(event) => setField("categoryId", event.target.value)}
            disabled={isCategoriesLoading && categories.length === 0}
          >
            <option value="">
              {isCategoriesLoading
                ? "Loading categories..."
                : "Select category"}
            </option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

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
          <label className={labelClass}>Description</label>
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>
                Original Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={form.originalPrice}
                onChange={(event) =>
                  setField("originalPrice", event.target.value)
                }
              />
            </div>
            <div>
              <label className={labelClass}>Discount Price</label>
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={form.discountPrice}
                onChange={(event) =>
                  setField("discountPrice", event.target.value)
                }
              />
            </div>
            <div>
              <label className={labelClass}>Cost Price</label>
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={form.costPrice}
                onChange={(event) => setField("costPrice", event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Sizes
            </div>
            <button
              type="button"
              onClick={addSize}
              disabled={form.sizes.length >= SIZES.length}
              className="h-8 px-2.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-700 inline-flex items-center gap-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Add size
            </button>
          </div>
          {form.sizes.length === 0 ? (
            <p className="text-[12px] text-gray-400">No sizes added.</p>
          ) : (
            form.sizes.map((row) => {
              const taken = new Set(
                form.sizes
                  .filter((item) => item.id !== row.id)
                  .map((item) => item.name),
              );
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[88px_1fr_36px] gap-2"
                >
                  <select
                    className={fieldClass}
                    value={row.name}
                    onChange={(event) =>
                      updateSize(row.id, {
                        name: event.target.value as ProductSize,
                      })
                    }
                  >
                    {SIZES.filter(
                      (size) => size === row.name || !taken.has(size),
                    ).map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    className={fieldClass}
                    placeholder="Additional price"
                    value={row.additionalPrice}
                    onChange={(event) =>
                      updateSize(row.id, {
                        additionalPrice: event.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setField(
                        "sizes",
                        form.sizes.filter((item) => item.id !== row.id),
                      )
                    }
                    className="h-10 w-9 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 inline-flex items-center justify-center"
                    aria-label={`Remove size ${row.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Extras
            </div>
            <button
              type="button"
              onClick={addExtra}
              className="h-8 px-2.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-700 inline-flex items-center gap-1 hover:bg-gray-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add extra
            </button>
          </div>
          {form.extras.length === 0 ? (
            <p className="text-[12px] text-gray-400">No extras added.</p>
          ) : (
            form.extras.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_110px_36px] gap-2"
              >
                <input
                  className={fieldClass}
                  placeholder="Extra name"
                  value={row.name}
                  onChange={(event) =>
                    updateExtra(row.id, { name: event.target.value })
                  }
                />
                <input
                  type="number"
                  min={0}
                  className={fieldClass}
                  placeholder="Price"
                  value={row.additionalPrice}
                  onChange={(event) =>
                    updateExtra(row.id, { additionalPrice: event.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setField(
                      "extras",
                      form.extras.filter((item) => item.id !== row.id),
                    )
                  }
                  className="h-10 w-9 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 inline-flex items-center justify-center"
                  aria-label="Remove extra"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Tax percentage</label>
            <input
              type="number"
              min={0}
              className={fieldClass}
              value={form.taxPercentage}
              onChange={(event) =>
                setField("taxPercentage", event.target.value)
              }
            />
          </div>
          <div>
            <label className={labelClass}>Points</label>
            <input
              type="number"
              min={0}
              className={fieldClass}
              value={form.point}
              onChange={(event) => setField("point", event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
          <div>
            <div className="text-[13px] font-medium text-gray-700">Status</div>
            <div className="text-[11px] text-gray-400">
              {form.status ? "Active" : "Inactive"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setField("status", !form.status)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.status ? "bg-[#1E90FF]" : "bg-gray-200"
            }`}
            aria-pressed={form.status}
            aria-label="Toggle product status"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                form.status ? "translate-x-5" : ""
              }`}
            />
          </button>
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
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="flex-1 h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting
            ? "Saving..."
            : mode === "edit"
              ? "Save changes"
              : "Add Product"}
        </button>
      </div>
    </DrawerShell>
  );
}
