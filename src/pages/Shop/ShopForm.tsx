import { useEffect, useRef, useState } from "react";
import { CloudUpload, Pencil, X } from "lucide-react";
import DrawerShell from "./DrawerShell";
import type { Shop, ShopFormValues, ShopHours, ShopFaq, ShopStatus } from "./types";
import { DAYS, emptyShopForm, shopToForm } from "./types";

interface ShopFormProps {
  open: boolean;
  mode: "add" | "edit";
  shop: Shop | null;
  onClose: () => void;
  onExited?: () => void;
  onSubmit: (values: ShopFormValues, shopId?: string) => void;
}

const fieldClass =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors";

const labelClass =
  "block text-[12px] font-medium text-gray-600 mb-1.5";

export default function ShopForm({
  open,
  mode,
  shop,
  onClose,
  onExited,
  onSubmit,
}: ShopFormProps) {
  const [form, setForm] = useState<ShopFormValues>(emptyShopForm());
  const [faqDraft, setFaqDraft] = useState("");
  const [day, setDay] = useState<string>(DAYS[0]);
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("21:00");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && shop) {
      setForm(shopToForm(shop));
    } else {
      setForm(emptyShopForm());
    }
    setFaqDraft("");
    setDay(DAYS[0]);
    setOpenTime("08:00");
    setCloseTime("21:00");
  }, [open, mode, shop]);

  const setField = <K extends keyof ShopFormValues>(
    key: K,
    value: ShopFormValues[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImage = (file?: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setField("image", url);
  };

  const addFaq = () => {
    const raw = faqDraft.trim();
    if (!raw) return;
    const [q, ...rest] = raw.split(":");
    const question = q.trim();
    const answer = rest.join(":").trim() || "—";
    const item: ShopFaq = {
      id: `faq-${Date.now()}`,
      question,
      answer,
    };
    setField("faqs", [...form.faqs, item]);
    setFaqDraft("");
  };

  const removeFaq = (id: string) =>
    setField(
      "faqs",
      form.faqs.filter((f) => f.id !== id),
    );

  const toDisplayTime = (t: string) => {
    const [hh, mm] = t.split(":").map(Number);
    const period = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 || 12;
    return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
  };

  const addHours = () => {
    const item: ShopHours = {
      id: `hrs-${Date.now()}`,
      day,
      open: toDisplayTime(openTime),
      close: toDisplayTime(closeTime),
    };
    setField("hours", [...form.hours, item]);
  };

  const removeHours = (id: string) =>
    setField(
      "hours",
      form.hours.filter((h) => h.id !== id),
    );

  const handleSubmit = () => {
    if (!form.name.trim() || !form.location.trim()) return;
    onSubmit(form, shop?.id);
  };

  const title =
    mode === "edit" && shop ? `Edit: ${shop.name}` : "Add New Shop";
  const submitLabel = mode === "edit" ? "Save all changes" : "Add Shop";

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      onExited={onExited}
      widthClass="max-w-[460px]"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
        <h2 className="text-[18px] font-bold text-[#0B1F3A]">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5 space-y-4"
      >
        {/* Image */}
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
              Drag and drop
            </span>
            <span className="relative z-10 h-8 px-3 rounded-lg bg-white border border-gray-200 text-[12px] font-semibold text-gray-700 inline-flex items-center">
              Select Picture
            </span>
          </button>
        </div>

        <div>
          <label className={labelClass}>Shop Name</label>
          <input
            className={fieldClass}
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Makati Central"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Full Address</label>
          <input
            className={fieldClass}
            value={form.location}
            onChange={(e) => setField("location", e.target.value)}
            placeholder="Street, City"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={fieldClass}
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="+63 ..."
          />
        </div>

        <div>
          <label className={labelClass}>About Shop</label>
          <textarea
            value={form.about}
            onChange={(e) => setField("about", e.target.value)}
            rows={3}
            placeholder="Short description..."
            className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors resize-none"
          />
        </div>

        {/* FAQs */}
        <div>
          <label className={labelClass}>FAQs</label>
          <div className="flex gap-2">
            <input
              className={fieldClass}
              value={faqDraft}
              onChange={(e) => setFaqDraft(e.target.value)}
              placeholder="Question: Answer"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFaq();
                }
              }}
            />
            <button
              type="button"
              onClick={addFaq}
              className="h-10 px-4 rounded-lg bg-[#1E90FF] text-white text-[12px] font-semibold shrink-0 hover:bg-[#1878d8] transition-colors"
            >
              Add
            </button>
          </div>
          {form.faqs.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.faqs.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-lg bg-[#E8F3FF] text-[12px] text-[#0B1F3A]"
                >
                  {f.question}: {f.answer}
                  <button
                    type="button"
                    onClick={() => removeFaq(f.id)}
                    className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Operations */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Operations
          </div>
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className={fieldClass}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className={fieldClass}
            />
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className={fieldClass}
            />
            <button
              type="button"
              onClick={addHours}
              className="h-10 px-4 rounded-lg bg-[#1E90FF] text-white text-[12px] font-semibold shrink-0 hover:bg-[#1878d8] transition-colors"
            >
              Add
            </button>
          </div>
          {form.hours.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.hours.map((h) => (
                <span
                  key={h.id}
                  className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-lg bg-[#E8F3FF] text-[12px] text-[#0B1F3A]"
                >
                  {h.day} {h.open} – {h.close}
                  <button
                    type="button"
                    onClick={() => removeHours(h.id)}
                    className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-[#1E90FF]"
                    aria-label="Edit hours"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeHours(h.id)}
                    className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            value={form.status}
            onChange={(e) => setField("status", e.target.value as ShopStatus)}
            className={fieldClass}
          >
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </form>

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
