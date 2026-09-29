import { useEffect, useRef, useState } from "react";
import { CloudUpload, Plus, Trash2, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import type {
  Product,
  ProductCategory,
  ProductExtra,
  ProductFormValues,
  ProductSize,
  ProductStatus,
} from "./types";
import { CATEGORIES, emptyProductForm, productToForm } from "./types";

interface ProductFormProps {
  open: boolean;
  mode: "add" | "edit";
  product: Product | null;
  categories: ProductCategory[];
  onClose: () => void;
  onExited?: () => void;
  onSubmit: (values: ProductFormValues, productId?: string) => void;
}

const fieldClass =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors";
const labelClass = "block text-[12px] font-medium text-gray-600 mb-1.5";

export default function ProductForm({
  open,
  mode,
  product,
  categories,
  onClose,
  onExited,
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValues>(emptyProductForm());
  const [sizesOn, setSizesOn] = useState(true);
  const [extrasOn, setExtrasOn] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && product) {
      const next = productToForm(product);
      setForm(next);
      setSizesOn(next.sizes.length > 0);
      setExtrasOn(next.extras.length > 0);
    } else {
      setForm(emptyProductForm(categories[0] ?? "Hot Drinks"));
      setSizesOn(true);
      setExtrasOn(true);
    }
  }, [open, mode, product, categories]);

  const setField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImage = (file?: File | null) => {
    if (!file) return;
    setField("image", URL.createObjectURL(file));
  };

  const updateSize = (id: string, patch: Partial<ProductSize>) => {
    setField(
      "sizes",
      form.sizes.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  };

  const addSize = () => {
    const item: ProductSize = {
      id: `s-${Date.now()}`,
      label: "",
      priceOffset: 0,
    };
    setField("sizes", [...form.sizes, item]);
  };

  const removeSize = (id: string) =>
    setField(
      "sizes",
      form.sizes.filter((s) => s.id !== id),
    );

  const updateExtra = (id: string, patch: Partial<ProductExtra>) => {
    setField(
      "extras",
      form.extras.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  };

  const addExtra = () => {
    const item: ProductExtra = {
      id: `e-${Date.now()}`,
      label: "",
      price: 0,
    };
    setField("extras", [...form.extras, item]);
  };

  const removeExtra = (id: string) =>
    setField(
      "extras",
      form.extras.filter((e) => e.id !== id),
    );

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit(
      {
        ...form,
        sizes: sizesOn ? form.sizes.filter((s) => s.label.trim()) : [],
        extras: extrasOn ? form.extras.filter((e) => e.label.trim()) : [],
      },
      product?.id,
    );
  };

  const title = mode === "edit" && product ? `Edit: ${product.name}` : "Add New Product";
  const submitLabel = mode === "edit" ? "Save changes" : "Add Product";
  const categoryOptions = categories.length ? categories : CATEGORIES;

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
            onChange={(e) => handleImage(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleImage(e.dataTransfer.files?.[0]);
            }}
            className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex flex-col items-center justify-center gap-2 hover:border-[#1E90FF]/40 transition-colors"
          >
            {form.image ? (
              <img
                src={form.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            ) : null}
            <CloudUpload className="w-7 h-7 text-gray-400 relative z-10" />
            <span className="text-[12px] text-gray-500 relative z-10">
              JPG, PNG, WebP · max 5MB
            </span>
            <span className="relative z-10 h-8 px-3 rounded-lg bg-white border border-gray-200 text-[12px] font-semibold text-gray-700 inline-flex items-center">
              Select Image
            </span>
          </button>
        </div>

        <div>
          <label className={labelClass}>
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            className={fieldClass}
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Iced Americano"
          />
        </div>

        <div>
          <label className={labelClass}>
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className={fieldClass}
            value={form.category}
            onChange={(e) =>
              setField("category", e.target.value as ProductCategory)
            }
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setField("description", e.target.value.slice(0, 300))
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
                Selling Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={form.price || ""}
                onChange={(e) => setField("price", Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className={labelClass}>Cost Price ($)</label>
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={form.costPrice || ""}
                onChange={(e) =>
                  setField("costPrice", Number(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            className={fieldClass}
            value={form.status}
            onChange={(e) =>
              setField("status", e.target.value as ProductStatus)
            }
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Sizes */}
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] font-semibold text-[#0B1F3A]">Sizes</div>
              <div className="text-[11px] text-gray-400">
                Optional size options with price offsets
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSizesOn((v) => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                sizesOn ? "bg-[#1E90FF]" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  sizesOn ? "translate-x-4" : ""
                }`}
              />
            </button>
          </div>

          {sizesOn && (
            <div className="space-y-2">
              {form.sizes.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <input
                    className={`${fieldClass} flex-1`}
                    value={s.label}
                    onChange={(e) => updateSize(s.id, { label: e.target.value })}
                    placeholder="S / M / L"
                  />
                  <input
                    type="number"
                    className={`${fieldClass} w-24`}
                    value={s.priceOffset || ""}
                    onChange={(e) =>
                      updateSize(s.id, {
                        priceOffset: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="+ $"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(s.id)}
                    className="w-9 h-9 rounded-lg text-red-400 hover:bg-red-50 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSize}
                className="h-9 px-3 rounded-lg text-[12px] font-semibold text-[#1E90FF] hover:bg-[#E8F3FF] inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Size
              </button>
            </div>
          )}
        </div>

        {/* Extras */}
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] font-semibold text-[#0B1F3A]">
                Extras (Optional)
              </div>
              <div className="text-[11px] text-gray-400">
                Add-ons customers can pick
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExtrasOn((v) => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                extrasOn ? "bg-[#1E90FF]" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  extrasOn ? "translate-x-4" : ""
                }`}
              />
            </button>
          </div>

          {extrasOn && (
            <div className="space-y-2">
              {form.extras.map((e) => (
                <div key={e.id} className="flex items-center gap-2">
                  <input
                    className={`${fieldClass} flex-1`}
                    value={e.label}
                    onChange={(ev) =>
                      updateExtra(e.id, { label: ev.target.value })
                    }
                    placeholder="e.g. Almond milk"
                  />
                  <input
                    type="number"
                    className={`${fieldClass} w-24`}
                    value={e.price || ""}
                    onChange={(ev) =>
                      updateExtra(e.id, { price: Number(ev.target.value) || 0 })
                    }
                    placeholder="+ $"
                  />
                  <button
                    type="button"
                    onClick={() => removeExtra(e.id)}
                    className="w-9 h-9 rounded-lg text-red-400 hover:bg-red-50 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExtra}
                className="h-9 px-3 rounded-lg text-[12px] font-semibold text-[#1E90FF] hover:bg-[#E8F3FF] inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Extra
              </button>
            </div>
          )}
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
          className="flex-1 h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8] transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </DrawerShell>
  );
}
