import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import { logout } from "../../auth/session";
import { notify } from "../../lib/notify";
import { useDebouncedCallback } from "../../lib/useDebounce";
import { getApiErrorMessage } from "../../store/http";
import { useGetProfileQuery } from "@/store/services/user.api";
import type { GiftRecord, UpdateGiftArgs } from "@/store/services/gift.api";
import {
  giftDaysLeft,
  giftStatus,
  useCreateGiftMutation,
  useDeleteGiftMutation,
  useGetGiftByIdQuery,
  useGetGiftsQuery,
  useUpdateGiftMutation,
} from "@/store/services/gift.api";
import { resolveImageUrl } from "../../utils/imageUrl";

const ROW_H = "h-[72px]";
const CELL = "px-4 align-middle";
const fieldClass =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors";
const labelClass = "block text-[12px] font-medium text-gray-600 mb-1.5";

const MANAGE_ROLES = new Set(["SUPER_ADMIN", "SHOP_OWNER"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);

type GiftDraft = {
  imageFile: File | null;
  imagePreview: string;
  minPoints: string;
  description: string;
  createDate: string;
  availableDays: string;
  collectLocation: string;
};

function emptyDraft(): GiftDraft {
  return {
    imageFile: null,
    imagePreview: "",
    minPoints: "",
    description: "",
    createDate: "",
    availableDays: "",
    collectLocation: "",
  };
}

function toDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function draftFromGift(gift: GiftRecord): GiftDraft {
  return {
    imageFile: null,
    imagePreview: gift.image,
    minPoints: String(gift.minPoints),
    description: gift.description,
    createDate: toDateInput(gift.createDate),
    availableDays: String(gift.availableDays),
    collectLocation: gift.collectLocation,
  };
}

function readStatus(error: unknown) {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

function isAllowedImage(file: File) {
  if (IMAGE_TYPES.has(file.type)) return true;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.has(extension);
}

function parseNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const number = Number(trimmed);
  if (!Number.isFinite(number)) return null;
  return number;
}

function validateDraft(draft: GiftDraft, editing: boolean) {
  if (!editing && !draft.imageFile) return "Image is required.";
  if (draft.imageFile && !isAllowedImage(draft.imageFile)) {
    return "Image must be a jpeg, jpg, or png file.";
  }
  const minPoints = parseNumber(draft.minPoints);
  if (minPoints === null || minPoints < 0) return "Minimum points must be 0 or more.";
  const availableDays = parseNumber(draft.availableDays);
  if (
    availableDays === null ||
    !Number.isInteger(availableDays) ||
    availableDays < 1
  ) {
    return "Available days must be a whole number of at least 1.";
  }
  if (!draft.description.trim()) return "Description is required.";
  if (!draft.collectLocation.trim()) return "Collect location is required.";
  if (draft.createDate) {
    const date = new Date(`${draft.createDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "Create date must be a real date.";
  }
  return "";
}

export default function GiftsPanel() {
  const navigate = useNavigate();
  const { data: profileResponse, isLoading: profileLoading } = useGetProfileQuery();
  const role = profileResponse?.data?.role?.trim().toUpperCase() ?? "";
  const canManage = MANAGE_ROLES.has(role);
  const roleReady = !profileLoading;

  const [locationInput, setLocationInput] = useState("");
  const [collectLocation, setCollectLocation] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const applyLocation = useDebouncedCallback((value: string) => {
    setCollectLocation(value.trim());
  }, 400);

  const listArgs = canManage
    ? {
        collectLocation: collectLocation || undefined,
        ...(availableOnly ? { available: true as const } : {}),
      }
    : { available: true as const };

  const {
    data: gifts = [],
    isLoading,
    isFetching,
    error: listError,
  } = useGetGiftsQuery(listArgs, { skip: !roleReady });
  const [deleteGift, { isLoading: isDeleting }] = useDeleteGiftMutation();

  useEffect(() => {
    if (!listError) return;
    const status = readStatus(listError);
    if (status === 401) {
      logout();
      notify.error("Logged out", "Please sign in again.");
      navigate("/auth/login", { replace: true });
      return;
    }
    if (status === 403) {
      notify.error("No permission", "You do not have permission to view gifts.");
    }
  }, [listError, navigate]);

  const loading = !roleReady || isLoading || isFetching;
  const listMessage =
    listError && (readStatus(listError) === 400 || readStatus(listError) === 404)
      ? getApiErrorMessage(listError, "Could not load gifts.")
      : "";

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
  };

  const openEdit = (giftId: string) => {
    setEditId(giftId);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditId(null);
  };

  const handleDelete = async (gift: GiftRecord) => {
    const confirmed = await notify.delete(
      "Delete gift?",
      "This gift will be removed permanently.",
    );
    if (!confirmed) return;
    try {
      await deleteGift(gift._id).unwrap();
      notify.deleted("Gift");
      if (detailId === gift._id) setDetailId(null);
    } catch (error) {
      reportGiftError(error, "Delete failed");
    }
  };

  return (
    <div className="space-y-5">
      {canManage ? (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              value={locationInput}
              onChange={(event) => {
                setLocationInput(event.target.value);
                applyLocation(event.target.value);
              }}
              placeholder="Collect location"
              className="h-10 w-full sm:w-[240px] px-3 rounded-lg bg-white border border-gray-200 text-[13px] outline-none focus:border-[#1E90FF]/40"
            />
            <button
              type="button"
              onClick={() => setAvailableOnly((current) => !current)}
              className={`h-10 px-3.5 rounded-lg text-[13px] font-semibold border ${
                availableOnly
                  ? "bg-[#E8F3FF] border-[#1E90FF] text-[#1E90FF]"
                  : "bg-white border-gray-200 text-gray-600"
              }`}
              aria-pressed={availableOnly}
            >
              Available only
            </button>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="h-10 px-4 rounded-lg bg-[#1E90FF] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#1878d8]"
          >
            <Plus className="w-4 h-4" />
            Create gift
          </button>
        </div>
      ) : (
        <p className="text-[13px] text-gray-500">
          Gifts you can collect right now
        </p>
      )}

      {canManage ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-gray-50/60 h-11">
                  <th className="px-4 font-medium">Image</th>
                  <th className="px-4 font-medium">Description</th>
                  <th className="px-4 font-medium">Minimum points</th>
                  <th className="px-4 font-medium">Collect location</th>
                  <th className="px-4 font-medium">Create date</th>
                  <th className="px-4 font-medium">Available days</th>
                  <th className="px-4 font-medium">Status</th>
                  <th className="px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className={`border-b border-gray-50 ${ROW_H}`}>
                      {Array.from({ length: 8 }).map((__, cell) => (
                        <td key={cell} className={CELL}>
                          <Bone className="h-3 w-16" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : listMessage ? (
                  <tr className={ROW_H}>
                    <td colSpan={8} className="px-4 text-center text-[13px] text-red-500">
                      {listMessage}
                    </td>
                  </tr>
                ) : gifts.length === 0 ? (
                  <tr className={ROW_H}>
                    <td colSpan={8} className="px-4 text-center text-[13px] text-gray-400">
                      No gifts found
                    </td>
                  </tr>
                ) : (
                  gifts.map((gift) => {
                    const status = giftStatus(gift);
                    const image = resolveImageUrl(gift.image);
                    return (
                      <tr
                        key={gift._id}
                        className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${ROW_H}`}
                      >
                        <td className={CELL}>
                          {image ? (
                            <img
                              src={image}
                              alt=""
                              className="w-14 h-10 rounded-lg object-cover bg-gray-100"
                            />
                          ) : (
                            <div className="w-14 h-10 rounded-lg bg-gray-100" />
                          )}
                        </td>
                        <td className={`${CELL} text-[13px] text-[#0B1F3A] max-w-[240px]`}>
                          <span className="line-clamp-2">{gift.description}</span>
                        </td>
                        <td className={`${CELL} text-[13px] text-gray-700`}>{gift.minPoints}</td>
                        <td className={`${CELL} text-[13px] text-gray-700`}>
                          {gift.collectLocation}
                        </td>
                        <td className={`${CELL} text-[13px] text-gray-700`}>
                          {formatDate(gift.createDate)}
                        </td>
                        <td className={`${CELL} text-[13px] text-gray-700`}>
                          {gift.availableDays}
                        </td>
                        <td className={CELL}>
                          <span
                            className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${
                              status === "Available"
                                ? "bg-[#E8F3FF] text-[#1E90FF]"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className={CELL}>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailId(gift._id)}
                              className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-semibold hover:bg-gray-50"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(gift._id)}
                              className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-semibold hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => void handleDelete(gift)}
                              className="h-8 px-3 rounded-lg border border-red-200 text-red-500 text-[12px] font-semibold hover:bg-red-50 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <Bone className="h-40 w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Bone className="h-4 w-3/4" />
                  <Bone className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : listMessage ? (
            <p className="text-[13px] text-red-500">{listMessage}</p>
          ) : gifts.length === 0 ? (
            <p className="text-[13px] text-gray-400">No gifts available</p>
          ) : (
            gifts.map((gift) => {
              const image = resolveImageUrl(gift.image);
              const daysLeft = giftDaysLeft(gift);
              return (
                <button
                  key={gift._id}
                  type="button"
                  onClick={() => setDetailId(gift._id)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-left hover:border-[#1E90FF]/40"
                >
                  {image ? (
                    <img src={image} alt="" className="h-40 w-full object-cover bg-gray-100" />
                  ) : (
                    <div className="h-40 w-full bg-gray-100" />
                  )}
                  <div className="p-4 space-y-2">
                    <p className="text-[14px] font-semibold text-[#0B1F3A] line-clamp-2">
                      {gift.description}
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Points needed: {gift.minPoints}
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Collect location: {gift.collectLocation}
                    </p>
                    <p className="text-[12px] font-semibold text-[#1E90FF]">
                      {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {canManage ? (
        <GiftForm open={formOpen} giftId={editId} onClose={closeForm} />
      ) : null}
      <GiftDetail
        giftId={detailId}
        canManage={canManage}
        onClose={() => setDetailId(null)}
        onEdit={(giftId) => {
          setDetailId(null);
          openEdit(giftId);
        }}
        onDelete={(gift) => void handleDelete(gift)}
      />
    </div>
  );
}

function reportGiftError(error: unknown, fallback: string) {
  const status = readStatus(error);
  if (status === 401) {
    logout();
    notify.error("Logged out", "Please sign in again.");
    window.location.assign("/auth/login");
    return;
  }
  if (status === 403) {
    notify.error("No permission", "You do not have permission for this action.");
    return;
  }
  notify.error(fallback, getApiErrorMessage(error, fallback));
}

function GiftForm({
  open,
  giftId,
  onClose,
}: {
  open: boolean;
  giftId: string | null;
  onClose: () => void;
}) {
  const editing = Boolean(giftId);
  const { data: gift, isFetching, error: giftError } = useGetGiftByIdQuery(giftId ?? "", {
    skip: !open || !giftId,
  });
  const [draft, setDraft] = useState<GiftDraft>(emptyDraft);
  const [original, setOriginal] = useState<GiftDraft>(emptyDraft);
  const [error, setError] = useState("");
  const [createGift, { isLoading: isCreating }] = useCreateGiftMutation();
  const [updateGift, { isLoading: isUpdating }] = useUpdateGiftMutation();
  const submitting = isCreating || isUpdating;
  const loadingGift = editing && isFetching && !gift;

  useEffect(() => {
    if (!open) return;
    setError("");
    if (!giftId) {
      const next = emptyDraft();
      setDraft(next);
      setOriginal(next);
      return;
    }
    if (gift && gift._id === giftId) {
      const next = draftFromGift(gift);
      setDraft(next);
      setOriginal(next);
    }
  }, [open, giftId, gift]);

  useEffect(() => {
    if (!giftError || !open) return;
    const status = readStatus(giftError);
    if (status === 404 || status === 400) {
      setError(getApiErrorMessage(giftError, "Gift not found"));
      return;
    }
    reportGiftError(giftError, "Could not load gift");
  }, [giftError, open]);

  const setField = <K extends keyof GiftDraft>(key: K, value: GiftDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleImage = (file: File | null) => {
    setDraft((current) => {
      if (current.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(current.imagePreview);
      }
      return {
        ...current,
        imageFile: file,
        imagePreview: file ? URL.createObjectURL(file) : original.imagePreview,
      };
    });
  };

  const handleSubmit = async () => {
    if (submitting || loadingGift) return;
    const validation = validateDraft(draft, editing);
    if (validation) {
      setError(validation);
      return;
    }
    setError("");

    const minPoints = parseNumber(draft.minPoints) ?? 0;
    const availableDays = parseNumber(draft.availableDays) ?? 1;
    const description = draft.description.trim();
    const collectLocation = draft.collectLocation.trim();
    const createDate = draft.createDate
      ? new Date(`${draft.createDate}T00:00:00`).toISOString()
      : undefined;

    try {
      if (editing && giftId) {
        const changes: Omit<UpdateGiftArgs, "giftId"> = {};
        if (minPoints !== parseNumber(original.minPoints)) changes.minPoints = minPoints;
        if (availableDays !== parseNumber(original.availableDays)) {
          changes.availableDays = availableDays;
        }
        if (description !== original.description.trim()) changes.description = description;
        if (collectLocation !== original.collectLocation.trim()) {
          changes.collectLocation = collectLocation;
        }
        if (draft.createDate !== original.createDate && createDate) {
          changes.createDate = createDate;
        }
        if (draft.imageFile) changes.image = draft.imageFile;
        if (Object.keys(changes).length === 0) {
          setError("Change at least one field before saving.");
          return;
        }
        await updateGift({ giftId, ...changes }).unwrap();
        notify.updated("Gift");
      } else if (draft.imageFile) {
        await createGift({
          image: draft.imageFile,
          minPoints,
          description,
          availableDays,
          collectLocation,
          ...(createDate ? { createDate } : {}),
        }).unwrap();
        notify.created("Gift");
      }
      onClose();
    } catch (submitError) {
      reportGiftError(submitError, editing ? "Update failed" : "Create failed");
    }
  };

  const preview = resolveImageUrl(draft.imagePreview);

  return (
    <DrawerShell open={open} onClose={onClose} widthClass="max-w-[440px]">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B1F3A]">
            {editing ? "Edit gift" : "Create gift"}
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {loadingGift ? "Loading gift..." : "Image, points, and collection details"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
        <div>
          <label className={labelClass}>
            Image {!editing ? <span className="text-red-500">*</span> : null}
          </label>
          {preview ? (
            <img
              src={preview}
              alt=""
              className="mb-2 h-32 w-full rounded-lg object-cover bg-gray-100"
            />
          ) : null}
          <input
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            className="block w-full text-[13px] text-gray-600 file:mr-3 file:h-9 file:px-3 file:rounded-lg file:border-0 file:bg-[#E8F3FF] file:text-[#1E90FF] file:text-[12px] file:font-semibold"
            onChange={(event) => handleImage(event.target.files?.[0] ?? null)}
          />
          {editing ? (
            <p className="text-[11px] text-gray-400 mt-1.5">
              Leave empty to keep the current image.
            </p>
          ) : null}
        </div>

        <div>
          <label className={labelClass}>
            Minimum points <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            className={fieldClass}
            value={draft.minPoints}
            onChange={(event) => setField("minPoints", event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`${fieldClass} h-24 py-2 resize-none`}
            value={draft.description}
            onChange={(event) => setField("description", event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>
            Collect location <span className="text-red-500">*</span>
          </label>
          <input
            className={fieldClass}
            value={draft.collectLocation}
            onChange={(event) => setField("collectLocation", event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              Available days <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              step={1}
              className={fieldClass}
              value={draft.availableDays}
              onChange={(event) => setField("availableDays", event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Create date</label>
            <input
              type="date"
              className={fieldClass}
              value={draft.createDate}
              onChange={(event) => setField("createDate", event.target.value)}
            />
          </div>
        </div>

        {error ? <p className="text-[12px] text-red-500">{error}</p> : null}
      </div>

      <div className="p-5 border-t border-gray-100 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitting || loadingGift}
          className="flex-1 h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8] disabled:opacity-40"
        >
          {submitting ? "Saving..." : editing ? "Save changes" : "Create gift"}
        </button>
      </div>
    </DrawerShell>
  );
}

function GiftDetail({
  giftId,
  canManage,
  onClose,
  onEdit,
  onDelete,
}: {
  giftId: string | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: (giftId: string) => void;
  onDelete: (gift: GiftRecord) => void;
}) {
  const { data: gift, isFetching, error } = useGetGiftByIdQuery(giftId ?? "", {
    skip: !giftId,
  });
  const status = error ? readStatus(error) : undefined;
  const message =
    status === 404
      ? getApiErrorMessage(error, "Gift not found")
      : status === 400
        ? getApiErrorMessage(error, "Could not load gift")
        : status === 403
          ? "You do not have permission to view this gift."
          : status === 401
            ? "Please sign in again."
            : error
              ? getApiErrorMessage(error, "Could not load gift")
              : "";

  useEffect(() => {
    if (status === 401) {
      logout();
      notify.error("Logged out", "Please sign in again.");
      window.location.assign("/auth/login");
    }
  }, [status]);

  const image = gift ? resolveImageUrl(gift.image) : "";
  const availability = gift ? giftStatus(gift) : "Expired";

  return (
    <DrawerShell open={Boolean(giftId)} onClose={onClose} widthClass="max-w-[440px]">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B1F3A]">Gift details</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {isFetching && !gift ? "Loading gift..." : "Collection details"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
        {message ? <p className="text-[13px] text-red-500">{message}</p> : null}
        {gift ? (
          <>
            {image ? (
              <img src={image} alt="" className="h-44 w-full rounded-xl object-cover bg-gray-100" />
            ) : (
              <div className="h-44 w-full rounded-xl bg-gray-100" />
            )}
            <p className="text-[14px] text-[#0B1F3A]">{gift.description}</p>
            <DetailRow label="Points needed" value={String(gift.minPoints)} />
            <DetailRow label="Collect location" value={gift.collectLocation} />
            <DetailRow label="Days left" value={String(giftDaysLeft(gift))} />
            {canManage ? (
              <>
                <DetailRow label="Create date" value={formatDate(gift.createDate)} />
                <DetailRow label="Available days" value={String(gift.availableDays)} />
                <DetailRow label="Status" value={availability} />
              </>
            ) : null}
          </>
        ) : null}
      </div>

      {canManage && gift ? (
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={() => onEdit(gift._id)}
            className="flex-1 h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(gift)}
            className="flex-1 h-11 rounded-xl border border-red-200 text-red-500 text-[14px] font-semibold"
          >
            Delete
          </button>
        </div>
      ) : null}
    </DrawerShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-gray-100">
      <span className="text-[13px] text-gray-400">{label}</span>
      <span className="text-[13px] font-medium text-[#0B1F3A] text-right">{value}</span>
    </div>
  );
}
