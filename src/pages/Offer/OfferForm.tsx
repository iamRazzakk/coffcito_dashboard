import { useEffect, useRef, useState } from "react";
import { CloudUpload, Plus, Trash2 } from "lucide-react";
import { useGetAllProductsQuery } from "@/store/services/product.api";
import type { ProductRecord } from "@/store/services/product.api";
import type {
  DiscountType,
  OfferRecord,
  OfferTier,
  OfferType,
  OfferWriteFields,
} from "@/store/services/offer.api";
import { OFFER_TYPES } from "@/store/services/offer.api";
import {
  useCreateOfferMutation,
  useUpdateOfferMutation,
} from "@/store/services/offer.api";
import { getApiErrorMessage } from "../../store/http";
import { notify } from "../../lib/notify";
import { resolveImageUrl } from "../../utils/imageUrl";
import {
  ACCESS_TOKEN_KEY,
  getFromLocalStorage,
} from "../../utils/local-storage";

interface OfferFormProps {
  editId?: string | null;
  offer?: OfferRecord;
  loadingOffer?: boolean;
  onCancelEdit: () => void;
  onSaved: () => void;
}

type TierDraft = {
  id: string;
  minAmount: string;
  discountType: "" | DiscountType;
  discountValue: string;
};

type OfferDraft = {
  title: string;
  description: string;
  offerType: "" | OfferType;
  productId: string;
  isActive: boolean;
  buyQuantity: string;
  getQuantity: string;
  percentOff: string;
  maxDiscountAmount: string;
  minAmount: string;
  minQuantity: string;
  discountType: "" | DiscountType;
  discountValue: string;
  tiers: TierDraft[];
  startAt: string;
  endAt: string;
  startTime: string;
  endTime: string;
  days: number[];
  giftProductId: string;
  comboProductIds: string[];
  comboPrice: string;
};

const fieldClass =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors";
const labelClass = "block text-[12px] font-medium text-gray-600 mb-1.5";

const DAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

function rowId() {
  return `tier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyTier(): TierDraft {
  return { id: rowId(), minAmount: "", discountType: "", discountValue: "" };
}

function emptyDraft(): OfferDraft {
  return {
    title: "",
    description: "",
    offerType: "",
    productId: "",
    isActive: true,
    buyQuantity: "",
    getQuantity: "",
    percentOff: "",
    maxDiscountAmount: "",
    minAmount: "",
    minQuantity: "",
    discountType: "",
    discountValue: "",
    tiers: [],
    startAt: "",
    endAt: "",
    startTime: "",
    endTime: "",
    days: [],
    giftProductId: "",
    comboProductIds: [],
    comboPrice: "",
  };
}

function numberText(value?: number) {
  return value === undefined ? "" : String(value);
}

function toDatetimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toTimeInput(value?: string) {
  const match = value?.match(/^(\d{2}:\d{2})/);
  return match?.[1] ?? "";
}

function draftFromOffer(offer: OfferRecord): OfferDraft {
  return {
    ...emptyDraft(),
    title: offer.title,
    description: offer.description,
    offerType: offer.offerType,
    productId: offer.productId,
    isActive: offer.isActive,
    buyQuantity: numberText(offer.buyQuantity),
    getQuantity: numberText(offer.getQuantity),
    percentOff: numberText(offer.percentOff),
    maxDiscountAmount: numberText(offer.maxDiscountAmount),
    minAmount: numberText(offer.minAmount),
    minQuantity: numberText(offer.minQuantity),
    discountType: offer.discountType ?? "",
    discountValue: numberText(offer.discountValue),
    tiers: (offer.tiers ?? []).map((tier) => ({
      id: rowId(),
      minAmount: String(tier.minAmount),
      discountType: tier.discountType,
      discountValue: String(tier.discountValue),
    })),
    startAt: toDatetimeLocal(offer.startAt),
    endAt: toDatetimeLocal(offer.endAt),
    startTime: toTimeInput(offer.startTime),
    endTime: toTimeInput(offer.endTime),
    days: offer.days ?? [],
    giftProductId: offer.giftProductId ?? "",
    comboProductIds: offer.comboProductIds ?? [],
    comboPrice: numberText(offer.comboPrice),
  };
}

function parseNonNegative(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const number = Number(trimmed);
  if (!Number.isFinite(number) || number < 0) return null;
  return number;
}

function parseIntegerMin(value: string, min: number) {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const number = Number(trimmed);
  if (!Number.isInteger(number) || number < min) return null;
  return number;
}

function parsePercent(value: string) {
  const number = parseNonNegative(value);
  if (number === null || number > 100) return null;
  return number;
}

function optionalNumber(value: string) {
  if (!value.trim()) return undefined;
  return parseNonNegative(value) ?? undefined;
}

function readUserIdFromToken() {
  const token = getFromLocalStorage(ACCESS_TOKEN_KEY);
  const segment = token?.split(".")[1];
  if (!segment) return "";

  try {
    const payload = JSON.parse(
      atob(segment.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { id?: unknown };
    return typeof payload.id === "string" ? payload.id.trim() : "";
  } catch {
    return "";
  }
}

function isJpegOrPng(file: File) {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const isJpeg =
    fileType === "image/jpeg" || fileType === "image/jpg" || /\.jpe?g$/.test(fileName);
  const isPng = fileType === "image/png" || fileName.endsWith(".png");
  return isJpeg || isPng;
}

export default function OfferForm({
  editId = null,
  offer,
  loadingOffer = false,
  onCancelEdit,
  onSaved,
}: OfferFormProps) {
  const editing = Boolean(editId);
  const [draft, setDraft] = useState<OfferDraft>(() =>
    offer ? draftFromOffer(offer) : emptyDraft(),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(offer?.image ?? "");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef("");
  const hydratedId = useRef<string | null>(null);
  previewRef.current = imagePreview;
  const shopId = readUserIdFromToken();
  const {
    data: productResponse,
    isFetching: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useGetAllProductsQuery({ page: 1, limit: 100 });
  const products = Array.isArray(productResponse?.data) ? productResponse.data : [];
  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const submitting = isCreating || isUpdating;

  useEffect(() => {
    if (!editId) {
      if (!hydratedId.current) return;
      hydratedId.current = null;
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = "";
      if (previewRef.current.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
      setDraft(emptyDraft());
      setImagePreview("");
      setError("");
      return;
    }
    if (!offer || offer._id !== editId || hydratedId.current === editId) return;
    hydratedId.current = editId;
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setDraft(draftFromOffer(offer));
    setImagePreview(offer.image ?? "");
    setError("");
  }, [editId, offer]);

  const setField = <K extends keyof OfferDraft>(key: K, value: OfferDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const changeOfferType = (offerType: "" | OfferType) => {
    setDraft((current) => ({
      ...current,
      offerType,
      buyQuantity: "",
      getQuantity: "",
      percentOff: "",
      maxDiscountAmount: "",
      minAmount: "",
      minQuantity: "",
      discountType: "",
      discountValue: "",
      tiers: offerType === "SPEND_MORE_SAVE_MORE" ? [emptyTier()] : [],
      startAt: "",
      endAt: "",
      startTime: "",
      endTime: "",
      days: [],
      giftProductId: "",
      comboProductIds: [],
      comboPrice: "",
    }));
  };

  const handleImage = (file?: File | null) => {
    if (!file) return;
    if (!isJpegOrPng(file)) {
      setError("Use a JPEG or PNG image.");
      return;
    }
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleId = (ids: string[], id: string) =>
    ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];

  const buildPayload = (): OfferWriteFields | string => {
    const title = draft.title.trim();
    const description = draft.description.trim();
    if (!title) return "Title is required.";
    if (!description) return "Description is required.";
    if (!shopId) return "Shop could not be read from the login token.";
    if (!draft.offerType) return "Select an offer type.";
    if (!editing && !imageFile) return "Image is required.";
    if (isProductsLoading) return "Products are still loading.";

    const shopProductIds = new Set(products.map((product) => product._id));
    if (!draft.productId || !shopProductIds.has(draft.productId)) {
      return "Select a product.";
    }
    const fields: OfferWriteFields = {
      title,
      description,
      shopId,
      offerType: draft.offerType,
      productId: draft.productId,
      isActive: draft.isActive,
    };

    const percent = () => {
      if (!draft.percentOff.trim()) return "Percent off is required.";
      const value = parsePercent(draft.percentOff);
      if (value === null) return "Percent off must be between 0 and 100.";
      fields.percentOff = value;
      return "";
    };
    const quantities = () => {
      const buyQuantity = parseIntegerMin(draft.buyQuantity, 1);
      const getQuantity = parseIntegerMin(draft.getQuantity, 1);
      if (buyQuantity === null || getQuantity === null) {
        return "Buy quantity and get quantity must be whole numbers of at least 1.";
      }
      fields.buyQuantity = buyQuantity;
      fields.getQuantity = getQuantity;
      return "";
    };
    const schedule = () => {
      const start = new Date(draft.startAt);
      const end = new Date(draft.endAt);
      if (!draft.startAt || !draft.endAt || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return "Start and end must be real dates.";
      }
      if (end.getTime() <= start.getTime()) return "End must be after start.";
      fields.startAt = start.toISOString();
      fields.endAt = end.toISOString();
      return "";
    };

    if (draft.offerType === "BOGO") {
      const message = quantities();
      if (message) return message;
    }

    if (draft.offerType === "BUY_X_GET_PERCENT") {
      const message = quantities() || percent();
      if (message) return message;
    }

    if (
      draft.offerType === "FLAT_PERCENT" ||
      draft.offerType === "FIRST_ORDER"
    ) {
      const message = percent();
      if (message) return message;
    }

    if (draft.offerType === "UP_TO_PERCENT") {
      const message = percent();
      if (message) return message;
      if (!draft.maxDiscountAmount.trim()) return "Maximum discount amount is required.";
      const maxDiscountAmount = parseNonNegative(draft.maxDiscountAmount);
      if (maxDiscountAmount === null) return "Maximum discount amount must be 0 or more.";
      fields.maxDiscountAmount = maxDiscountAmount;
    }

    if (draft.offerType === "MIN_PURCHASE") {
      if (!draft.minAmount.trim()) return "Minimum amount is required.";
      const minAmount = parseNonNegative(draft.minAmount);
      if (minAmount === null) return "Minimum amount must be 0 or more.";
      if (draft.discountType !== "percentage" && draft.discountType !== "fixed") {
        return "Select a discount type.";
      }
      if (!draft.discountValue.trim()) return "Discount value is required.";
      const discountValue =
        draft.discountType === "percentage"
          ? parsePercent(draft.discountValue)
          : parseNonNegative(draft.discountValue);
      if (discountValue === null) {
        return draft.discountType === "percentage"
          ? "Discount value must be between 0 and 100."
          : "Discount value must be 0 or more.";
      }
      fields.minAmount = minAmount;
      fields.discountType = draft.discountType;
      fields.discountValue = discountValue;
    }

    if (draft.offerType === "SPEND_MORE_SAVE_MORE") {
      if (draft.tiers.length === 0) return "Add at least one tier.";
      const tiers: OfferTier[] = [];
      for (const tier of draft.tiers) {
        if (!tier.minAmount.trim()) return "Each tier needs a minimum amount.";
        const minAmount = parseNonNegative(tier.minAmount);
        if (minAmount === null) return "Tier minimum amount must be 0 or more.";
        if (tier.discountType !== "percentage" && tier.discountType !== "fixed") {
          return "Each tier needs a discount type.";
        }
        if (!tier.discountValue.trim()) return "Each tier needs a discount value.";
        const discountValue =
          tier.discountType === "percentage"
            ? parsePercent(tier.discountValue)
            : parseNonNegative(tier.discountValue);
        if (discountValue === null) {
          return tier.discountType === "percentage"
            ? "Tier percent must be between 0 and 100."
            : "Tier discount value must be 0 or more.";
        }
        tiers.push({ minAmount, discountType: tier.discountType, discountValue });
      }
      fields.tiers = tiers;
    }

    if (draft.offerType === "FLASH_SALE" || draft.offerType === "SEASONAL") {
      const message = percent() || schedule();
      if (message) return message;
    }

    if (draft.offerType === "HAPPY_HOUR") {
      const message = percent();
      if (message) return message;
      if (!/^\d{2}:\d{2}$/.test(draft.startTime) || !/^\d{2}:\d{2}$/.test(draft.endTime)) {
        return "Start time and end time must use HH:mm.";
      }
      fields.startTime = draft.startTime;
      fields.endTime = draft.endTime;
      if (draft.days.length) fields.days = [...draft.days].sort((a, b) => a - b);
    }

    if (draft.offerType === "FREE_GIFT") {
      if (!draft.giftProductId || !products.some((product) => product._id === draft.giftProductId)) {
        return "Select a gift product.";
      }
      const minAmount = optionalNumber(draft.minAmount);
      let minQuantity: number | undefined;
      if (draft.minQuantity.trim()) {
        const parsedQuantity = parseIntegerMin(draft.minQuantity, 0);
        if (parsedQuantity === null) {
          return "Minimum quantity must be a whole number of at least 0.";
        }
        minQuantity = parsedQuantity;
      }
      if (draft.minAmount.trim() && minAmount === undefined) {
        return "Minimum amount must be 0 or more.";
      }
      if (minAmount === undefined && minQuantity === undefined) {
        return "Enter a minimum amount, a minimum quantity, or both.";
      }
      fields.giftProductId = draft.giftProductId;
      if (minAmount !== undefined) fields.minAmount = minAmount;
      if (minQuantity !== undefined) fields.minQuantity = minQuantity;
    }

    if (draft.offerType === "COMBO") {
      if (draft.comboProductIds.some((id) => !shopProductIds.has(id))) {
        return "Every combo product must be one of your products.";
      }
      const comboProductIds = draft.comboProductIds;
      if (comboProductIds.length < 2) return "Select at least 2 combo products.";
      if (!draft.comboPrice.trim()) return "Combo price is required.";
      const comboPrice = parseNonNegative(draft.comboPrice);
      if (comboPrice === null) return "Combo price must be 0 or more.";
      fields.comboProductIds = comboProductIds;
      fields.comboPrice = comboPrice;
    }

    return fields;
  };

  const resetCreate = () => {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
    setDraft(emptyDraft());
    setError("");
  };

  const handleSubmit = async () => {
    if (submitting || loadingOffer) return;
    const payload = buildPayload();
    if (typeof payload === "string") {
      setError(payload);
      return;
    }
    setError("");

    try {
      if (editing) {
        if (!offer) {
          setError("This banner is still loading.");
          return;
        }
        await updateOffer({
          offerId: offer._id,
          ...payload,
          imageFile,
        }).unwrap();
        notify.updated("Offer banner");
        onSaved();
        return;
      }

      if (!imageFile) {
        setError("Image is required.");
        return;
      }
      await createOffer({ ...payload, imageFile }).unwrap();
      notify.created("Offer banner");
      resetCreate();
      onSaved();
    } catch (submitError) {
      notify.error(
        editing ? "Update failed" : "Create failed",
        getApiErrorMessage(submitError),
      );
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-[#0B1F3A]">
          {editing ? "Edit offer banner" : "New offer banner"}
        </h2>
        <p className="text-[12px] text-gray-400 mt-0.5">
          {loadingOffer
            ? "Loading banner..."
            : "Only the fields for the selected offer type are saved."}
        </p>
      </div>

      <div className="px-5 py-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
        <div>
          <label className={labelClass}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className={fieldClass}
            value={draft.title}
            onChange={(event) => setField("title", event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={draft.description}
            onChange={(event) => setField("description", event.target.value)}
            rows={3}
            placeholder='Banner caption, for example "১টি কিনলে ১টি ফ্রি"'
            className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors resize-none"
          />
        </div>

        <div>
          <label className={labelClass}>
            Image {!editing ? <span className="text-red-500">*</span> : null}
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
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
            {imagePreview ? (
              <img
                src={resolveImageUrl(imagePreview)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            ) : null}
            <CloudUpload className="w-7 h-7 text-gray-400 relative z-10" />
            <span className="text-[12px] text-gray-500 relative z-10">JPEG or PNG</span>
          </button>
        </div>

        <div>
          <label className={labelClass}>
            Offer type <span className="text-red-500">*</span>
          </label>
          <select
            className={fieldClass}
            value={draft.offerType}
            onChange={(event) => changeOfferType(event.target.value as OfferType | "")}
          >
            <option value="">Select offer type</option>
            {OFFER_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Product <span className="text-red-500">*</span>
          </label>
          <select
            className={fieldClass}
            value={draft.productId}
            onChange={(event) => setField("productId", event.target.value)}
            disabled={isProductsLoading && products.length === 0}
          >
            <option value="">
              {isProductsLoading ? "Loading products..." : "Select product"}
            </option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.productName}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {isProductsError
              ? getApiErrorMessage(productsError, "Products could not be loaded.")
              : products.length === 0 && !isProductsLoading
                ? "No products found."
                : "This offer applies to one product."}
          </p>
        </div>

        {draft.offerType === "BOGO" || draft.offerType === "BUY_X_GET_PERCENT" ? (
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Buy quantity"
              value={draft.buyQuantity}
              min={1}
              onChange={(value) => setField("buyQuantity", value)}
            />
            <NumberField
              label="Get quantity"
              value={draft.getQuantity}
              min={1}
              onChange={(value) => setField("getQuantity", value)}
            />
          </div>
        ) : null}

        {draft.offerType === "BUY_X_GET_PERCENT" ||
        draft.offerType === "FLAT_PERCENT" ||
        draft.offerType === "UP_TO_PERCENT" ||
        draft.offerType === "FIRST_ORDER" ||
        draft.offerType === "FLASH_SALE" ||
        draft.offerType === "HAPPY_HOUR" ||
        draft.offerType === "SEASONAL" ? (
          <NumberField
            label="Percent off"
            value={draft.percentOff}
            min={0}
            max={100}
            onChange={(value) => setField("percentOff", value)}
          />
        ) : null}

        {draft.offerType === "UP_TO_PERCENT" ? (
          <NumberField
            label="Maximum discount amount"
            value={draft.maxDiscountAmount}
            min={0}
            onChange={(value) => setField("maxDiscountAmount", value)}
          />
        ) : null}

        {draft.offerType === "MIN_PURCHASE" ? (
          <div className="space-y-3">
            <NumberField
              label="Minimum amount"
              value={draft.minAmount}
              min={0}
              onChange={(value) => setField("minAmount", value)}
            />
            <DiscountFields
              discountType={draft.discountType}
              discountValue={draft.discountValue}
              onType={(value) => setField("discountType", value)}
              onValue={(value) => setField("discountValue", value)}
            />
          </div>
        ) : null}

        {draft.offerType === "SPEND_MORE_SAVE_MORE" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Tiers
              </div>
              <button
                type="button"
                onClick={() => setField("tiers", [...draft.tiers, emptyTier()])}
                className="h-8 px-2.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-700 inline-flex items-center gap-1 hover:bg-gray-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add tier
              </button>
            </div>
            {draft.tiers.map((tier, index) => (
              <div key={tier.id} className="rounded-xl border border-gray-100 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-gray-500">
                    Tier {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setField(
                        "tiers",
                        draft.tiers.filter((item) => item.id !== tier.id),
                      )
                    }
                    className="h-8 w-8 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 inline-flex items-center justify-center"
                    aria-label={`Remove tier ${index + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <NumberField
                  label="Minimum amount"
                  value={tier.minAmount}
                  min={0}
                  onChange={(value) =>
                    setField(
                      "tiers",
                      draft.tiers.map((item) =>
                        item.id === tier.id ? { ...item, minAmount: value } : item,
                      ),
                    )
                  }
                />
                <DiscountFields
                  discountType={tier.discountType}
                  discountValue={tier.discountValue}
                  onType={(value) =>
                    setField(
                      "tiers",
                      draft.tiers.map((item) =>
                        item.id === tier.id ? { ...item, discountType: value } : item,
                      ),
                    )
                  }
                  onValue={(value) =>
                    setField(
                      "tiers",
                      draft.tiers.map((item) =>
                        item.id === tier.id ? { ...item, discountValue: value } : item,
                      ),
                    )
                  }
                />
              </div>
            ))}
          </div>
        ) : null}

        {draft.offerType === "FLASH_SALE" || draft.offerType === "SEASONAL" ? (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className={labelClass}>
                Start <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className={fieldClass}
                value={draft.startAt}
                onChange={(event) => setField("startAt", event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>
                End <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className={fieldClass}
                value={draft.endAt}
                onChange={(event) => setField("endAt", event.target.value)}
              />
            </div>
          </div>
        ) : null}

        {draft.offerType === "HAPPY_HOUR" ? (
          <div className="space-y-3">
            <p className="text-[12px] text-gray-400">Times use Asia/Dhaka.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Start time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  className={fieldClass}
                  value={draft.startTime}
                  onChange={(event) => setField("startTime", event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>
                  End time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  className={fieldClass}
                  value={draft.endTime}
                  onChange={(event) => setField("endTime", event.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Days</label>
              <div className="flex flex-wrap gap-1.5">
                {DAY_OPTIONS.map((day) => {
                  const active = draft.days.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        setField(
                          "days",
                          active
                            ? draft.days.filter((value) => value !== day.value)
                            : [...draft.days, day.value],
                        )
                      }
                      className={`h-8 px-2.5 rounded-full text-[12px] font-semibold ${
                        active
                          ? "bg-[#1E90FF] text-white"
                          : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Leave empty to apply every day. 0 is Sunday through 6 Saturday.
              </p>
            </div>
          </div>
        ) : null}

        {draft.offerType === "FREE_GIFT" ? (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>
                Gift product <span className="text-red-500">*</span>
              </label>
              <select
                className={fieldClass}
                value={draft.giftProductId}
                onChange={(event) => setField("giftProductId", event.target.value)}
                disabled={isProductsLoading}
              >
                <option value="">
                  {isProductsLoading ? "Loading products..." : "Select gift product"}
                </option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.productName}
                  </option>
                ))}
              </select>
            </div>
            <NumberField
              label="Minimum amount"
              value={draft.minAmount}
              min={0}
              required={false}
              onChange={(value) => setField("minAmount", value)}
            />
            <NumberField
              label="Minimum quantity"
              value={draft.minQuantity}
              min={0}
              required={false}
              onChange={(value) => setField("minQuantity", value)}
            />
            <p className="text-[11px] text-gray-400">
              Enter a minimum amount, a minimum quantity, or both.
            </p>
          </div>
        ) : null}

        {draft.offerType === "COMBO" ? (
          <div className="space-y-3">
            <ProductPicker
              label="Combo products"
              hint="Select at least 2 products."
              products={products}
              selected={draft.comboProductIds}
              disabled={false}
              loading={isProductsLoading}
              onToggle={(id) =>
                setField("comboProductIds", toggleId(draft.comboProductIds, id))
              }
            />
            <NumberField
              label="Combo price"
              value={draft.comboPrice}
              min={0}
              onChange={(value) => setField("comboPrice", value)}
            />
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
          <div>
            <div className="text-[13px] font-medium text-gray-700">Active</div>
            <div className="text-[11px] text-gray-400">
              {draft.isActive ? "Visible" : "Inactive"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setField("isActive", !draft.isActive)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              draft.isActive ? "bg-[#1E90FF]" : "bg-gray-200"
            }`}
            aria-pressed={draft.isActive}
            aria-label="Toggle offer active state"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                draft.isActive ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {error ? <p className="text-[12px] text-red-500">{error}</p> : null}
      </div>

      <div className="p-5 border-t border-gray-100 flex gap-3">
        {editing ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex-1 h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitting || loadingOffer}
          className="flex-1 h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : editing ? "Save changes" : "Add banner"}
        </button>
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  required = true,
  onChange,
}: {
  label: string;
  value: string;
  min?: number;
  max?: number;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        className={fieldClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function DiscountFields({
  discountType,
  discountValue,
  onType,
  onValue,
}: {
  discountType: "" | DiscountType;
  discountValue: string;
  onType: (value: "" | DiscountType) => void;
  onValue: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={labelClass}>
          Discount type <span className="text-red-500">*</span>
        </label>
        <select
          className={fieldClass}
          value={discountType}
          onChange={(event) => onType(event.target.value as "" | DiscountType)}
        >
          <option value="">Select</option>
          <option value="percentage">percentage</option>
          <option value="fixed">fixed</option>
        </select>
      </div>
      <NumberField label="Discount value" value={discountValue} min={0} onChange={onValue} />
    </div>
  );
}

function ProductPicker({
  label,
  hint,
  products,
  selected,
  disabled,
  loading,
  onToggle,
}: {
  label: string;
  hint: string;
  products: ProductRecord[];
  selected: string[];
  disabled: boolean;
  loading: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <p className="text-[11px] text-gray-400 mb-1.5">{hint}</p>
      <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2 space-y-1">
        {disabled ? (
          <p className="text-[12px] text-gray-400 px-1 py-2">Select a shop first.</p>
        ) : loading ? (
          <p className="text-[12px] text-gray-400 px-1 py-2">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-[12px] text-gray-400 px-1 py-2">No products found.</p>
        ) : (
          products.map((product) => (
            <label
              key={product._id}
              className="flex items-center gap-2 px-1 py-1 text-[13px] text-gray-700"
            >
              <input
                type="checkbox"
                checked={selected.includes(product._id)}
                onChange={() => onToggle(product._id)}
              />
              <span className="truncate">{product.productName}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
