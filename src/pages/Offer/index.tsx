import { useState } from "react";
import type { OfferType } from "@/store/services/offer.api";
import {
  OFFER_TYPES,
  offerTypeLabel,
  useDeactivateOfferMutation,
  useGetOfferByIdQuery,
  useGetOffersQuery,
} from "@/store/services/offer.api";
import { getApiErrorMessage } from "../../store/http";
import { notify } from "../../lib/notify";
import { resolveImageUrl } from "../../utils/imageUrl";
import OfferForm from "./OfferForm";

const ROW_H = "h-[72px]";
const CELL = "px-4 align-middle";

type ActiveFilter = "" | "true" | "false";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

export default function OfferPage() {
  const [offerType, setOfferType] = useState<"" | OfferType>("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("");
  const [editId, setEditId] = useState<string | null>(null);

  const {
    data: offers = [],
    isLoading,
    isFetching,
  } = useGetOffersQuery({
    offerType: offerType || undefined,
    isActive: activeFilter === "" ? undefined : activeFilter === "true",
  });
  const { data: offer, isFetching: isOfferLoading } = useGetOfferByIdQuery(
    editId ?? "",
    { skip: !editId },
  );
  const [deactivateOffer, { isLoading: isDeactivating }] =
    useDeactivateOfferMutation();
  const loading = isLoading || isFetching;

  const handleDeactivate = async (offerId: string, title: string) => {
    const confirmed = await notify.confirm(
      "Deactivate this banner?",
      `${title} will stay in the list and show as inactive.`,
      { confirmText: "Deactivate", cancelText: "Keep active" },
    );
    if (!confirmed) return;
    try {
      await deactivateOffer(offerId).unwrap();
      notify.warning("Deactivated", `${title} is now inactive.`);
    } catch (error) {
      notify.error("Deactivate failed", getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
          Offer Banners
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Create shop banners and turn them off without removing them
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-5 items-start">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden order-2 xl:order-1">
          <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
            <select
              value={offerType}
              onChange={(event) =>
                setOfferType(event.target.value as "" | OfferType)
              }
              className="h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 outline-none focus:border-[#1E90FF]/40"
            >
              <option value="">All offer types</option>
              {OFFER_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={activeFilter}
              onChange={(event) =>
                setActiveFilter(event.target.value as ActiveFilter)
              }
              className="h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 outline-none focus:border-[#1E90FF]/40"
            >
              <option value="">Active and inactive</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[860px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-y border-gray-100 bg-gray-50/60 h-11">
                  <th className="px-4 font-medium">Banner</th>
                  <th className="px-4 font-medium">Offer type</th>
                  <th className="px-4 font-medium">Shop</th>
                  <th className="px-4 font-medium">Status</th>
                  <th className="px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-50 ${ROW_H}`}
                    >
                      <td className={CELL}>
                        <div className="flex items-center gap-3">
                          <Bone className="w-14 h-10 rounded-lg" />
                          <div className="space-y-1.5">
                            <Bone className="h-3 w-28" />
                            <Bone className="h-3 w-40" />
                          </div>
                        </div>
                      </td>
                      <td className={CELL}>
                        <Bone className="h-3 w-32" />
                      </td>
                      <td className={CELL}>
                        <Bone className="h-3 w-24" />
                      </td>
                      <td className={CELL}>
                        <Bone className="h-6 w-16 rounded-full" />
                      </td>
                      <td className={CELL}>
                        <Bone className="h-8 w-28 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : offers.length === 0 ? (
                  <tr className={ROW_H}>
                    <td
                      colSpan={5}
                      className="px-4 text-center text-[13px] text-gray-400"
                    >
                      No offer banners found
                    </td>
                  </tr>
                ) : (
                  offers.map((item) => {
                    const image = resolveImageUrl(item.image);
                    return (
                      <tr
                        key={item._id}
                        className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${ROW_H}`}
                      >
                        <td className={CELL}>
                          <div className="flex items-center gap-3 min-w-0">
                            {image ? (
                              <img
                                src={image}
                                alt=""
                                className="w-14 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-10 rounded-lg bg-gray-100 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="text-[13px] font-semibold text-[#0B1F3A] truncate">
                                {item.title || "Untitled"}
                              </div>
                              <div className="text-[12px] text-gray-400 truncate">
                                {item.description || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`${CELL} text-[12px] text-gray-600`}>
                          {offerTypeLabel(item.offerType)}
                        </td>
                        <td className={`${CELL} text-[13px] text-gray-700`}>
                          {item.shopName || "—"}
                        </td>
                        <td className={CELL}>
                          <span
                            className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${
                              item.isActive
                                ? "bg-[#E8F3FF] text-[#1E90FF]"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className={CELL}>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditId(item._id)}
                              className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-semibold hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={!item.isActive || isDeactivating}
                              onClick={() =>
                                void handleDeactivate(item._id, item.title)
                              }
                              className="h-8 px-3 rounded-lg border border-red-200 text-red-500 text-[12px] font-semibold hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Deactivate
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

        <div className="order-1 xl:order-2 xl:sticky xl:top-20">
          <OfferForm
            editId={editId}
            offer={offer}
            loadingOffer={Boolean(editId) && isOfferLoading && !offer}
            onCancelEdit={() => setEditId(null)}
            onSaved={() => setEditId(null)}
          />
        </div>
      </div>
    </div>
  );
}
