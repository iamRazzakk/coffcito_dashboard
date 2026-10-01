import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import ShopCard from "./ShopCard";
import ShopTable from "./ShopTable";
import ShopDetails from "./ShopDetails";
import ShopForm from "./ShopForm";
import type { Shop, ShopFormValues } from "./types";
import { shopCreatePayload, shopUpdatePayload, toShop } from "./types";
import {
  useCreateShopMutation,
  useDeleteShopMutation,
  useGetShopByIdQuery,
  useUpdateShopMutation,
} from "@/store/services/shop.api";
import { getApiErrorMessage } from "../../store/http";
import { notify } from "../../lib/notify";

type DrawerMode = "view" | "add" | "edit" | null;

export default function ShopPage() {
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<DrawerMode>(null);
  const activeDrawerRef = useRef<DrawerMode>(null);

  const [createShop, { isLoading: isCreatingShop }] = useCreateShopMutation();
  const [updateShop, { isLoading: isUpdatingShop }] = useUpdateShopMutation();
  const [deleteShop, { isLoading: isDeletingShop }] = useDeleteShopMutation();

  const detailId =
    activeDrawer === "view" || activeDrawer === "edit"
      ? selectedShop?.id
      : undefined;
  const { data: shopDetail } = useGetShopByIdQuery(detailId ?? "", {
    skip: !detailId,
  });

  const detailShop = useMemo(
    () => (shopDetail?.data ? toShop(shopDetail.data) : null),
    [shopDetail],
  );
  const viewShop = detailShop ?? selectedShop;

  const changeDrawer = (drawerMode: DrawerMode) => {
    activeDrawerRef.current = drawerMode;
    setActiveDrawer(drawerMode);
  };

  const closeDrawer = () => changeDrawer(null);

  const handleDetailsExited = () => {
    if (
      activeDrawerRef.current === "edit" ||
      activeDrawerRef.current === "add"
    ) {
      return;
    }
    setSelectedShop(null);
  };

  const handleFormExited = () => {
    if (activeDrawerRef.current === null) setSelectedShop(null);
  };

  const openView = (shop: Shop) => {
    setSelectedShop(shop);
    changeDrawer("view");
  };

  const openEdit = (shop: Shop) => {
    setSelectedShop(shop);
    changeDrawer("edit");
  };

  const openAdd = () => {
    setSelectedShop(null);
    changeDrawer("add");
  };

  const handleSuspend = async (shop: Shop) => {
    const confirmed = await notify.confirm(
      "Suspend this shop?",
      `${shop.name} will be set to Inactive.`,
      { confirmText: "Suspend", cancelText: "Cancel" },
    );
    if (!confirmed) return;

    try {
      await deleteShop(shop.id).unwrap();
      notify.warning("Shop suspended", `${shop.name} is now Inactive.`);
      closeDrawer();
    } catch (error) {
      notify.error("Suspend failed", getApiErrorMessage(error));
    }
  };

  const handleSubmit = async (
    values: ShopFormValues,
    imageFile: File | null,
    shopId?: string,
  ) => {
    if (activeDrawer === "edit" && shopId && detailShop) {
      const data = shopUpdatePayload(detailShop, values);
      if (Object.keys(data).length === 0 && !imageFile) {
        notify.info("No changes", "Update a field or choose a new image.");
        return;
      }

      try {
        await updateShop({ shopId, data, imageFile }).unwrap();
        notify.updated("Shop");
        closeDrawer();
      } catch (error) {
        notify.error("Update failed", getApiErrorMessage(error));
      }
      return;
    }

    try {
      await createShop({
        data: shopCreatePayload(values),
        imageFile,
      }).unwrap();
      notify.created("Shop");
      closeDrawer();
    } catch (error) {
      notify.error("Create failed", getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
            Shops
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage all COFFECITO branch locations
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="h-10 px-4 rounded-lg bg-[#1E90FF] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#1878d8] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Shop
        </button>
      </div>

      <ShopCard />

      <ShopTable onView={openView} onEdit={openEdit} />

      <ShopDetails
        shop={viewShop}
        open={activeDrawer === "view"}
        onClose={closeDrawer}
        onExited={handleDetailsExited}
        onEdit={openEdit}
        onSuspend={handleSuspend}
      />

      <ShopForm
        open={activeDrawer === "add" || activeDrawer === "edit"}
        mode={activeDrawer === "edit" ? "edit" : "add"}
        shop={activeDrawer === "edit" ? detailShop : null}
        submitting={isCreatingShop || isUpdatingShop || isDeletingShop}
        onClose={closeDrawer}
        onExited={handleFormExited}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
