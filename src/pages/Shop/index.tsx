import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import ShopCard from "./ShopCard";
import ShopTable from "./ShopTable";
import ShopDetails from "./ShopDetails";
import ShopForm from "./ShopForm";
import { MOCK_SHOPS } from "./mockShops";
import type { Shop, ShopFilter, ShopFormValues } from "./types";
import { notify } from "../../lib/notify";
import { useActionSkeleton, usePageBoot } from "../../lib/usePageLoad";

const PAGE_SIZE = 5;

type DrawerMode = "view" | "add" | "edit" | null;

export default function ShopPage() {
  const [shops, setShops] = useState<Shop[]>(MOCK_SHOPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShopFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<DrawerMode>(null);
  const activeDrawerRef = useRef<DrawerMode>(null);

  const isBooting = usePageBoot();
  const { isRefreshing, runWithSkeleton } = useActionSkeleton();

  useEffect(() => {
    activeDrawerRef.current = activeDrawer;
  }, [activeDrawer]);

  const closeDrawer = () => setActiveDrawer(null);

  const handleDetailsExited = useCallback(() => {
    if (activeDrawerRef.current === "edit" || activeDrawerRef.current === "add") {
      return;
    }
    setSelectedShop(null);
  }, []);

  const handleFormExited = useCallback(() => {
    if (activeDrawerRef.current === null) setSelectedShop(null);
  }, []);

  const openView = (shop: Shop) => {
    setSelectedShop(shop);
    setActiveDrawer("view");
  };

  const openEdit = (shop: Shop) => {
    setSelectedShop(shop);
    setActiveDrawer("edit");
  };

  const openAdd = () => {
    setSelectedShop(null);
    setActiveDrawer("add");
  };

  const handleSuspend = async (shop: Shop) => {
    const confirmed = await notify.confirm(
      "Suspend this shop?",
      `${shop.name} will be set to Inactive.`,
      { confirmText: "Suspend", cancelText: "Cancel" },
    );
    if (!confirmed) return;

    setShops((prev) =>
      prev.map((item) =>
        item.id === shop.id ? { ...item, status: "Inactive" as const } : item,
      ),
    );
    notify.warning("Shop suspended", `${shop.name} is now Inactive.`);
    closeDrawer();
  };

  const handleSubmit = (values: ShopFormValues, shopId?: string) => {
    if (activeDrawer === "edit" && shopId) {
      setShops((prev) =>
        prev.map((item) =>
          item.id === shopId
            ? { ...item, ...values, image: values.image || item.image }
            : item,
        ),
      );
      notify.updated("Shop");
      closeDrawer();
      return;
    }

    const nextId = `SH-${String(shops.length + 1).padStart(3, "0")}`;
    const createdShop: Shop = {
      id: nextId,
      name: values.name,
      location: values.location,
      phone: values.phone,
      about: values.about,
      image:
        values.image ||
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&auto=format",
      orders: 0,
      revenue: 0,
      status: values.status,
      since: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      faqs: values.faqs,
      hours: values.hours,
    };

    setShops((prev) => [createdShop, ...prev]);
    notify.created("Shop");
    closeDrawer();
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

      <ShopCard shops={shops} loading={isBooting} />

      <ShopTable
        shops={shops}
        search={searchQuery}
        filter={statusFilter}
        page={currentPage}
        pageSize={PAGE_SIZE}
        loading={isBooting || isRefreshing}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        onFilterChange={(nextFilter) => {
          if (nextFilter === statusFilter) return;
          runWithSkeleton(() => {
            setStatusFilter(nextFilter);
            setCurrentPage(1);
          });
        }}
        onPageChange={(nextPage) => {
          if (nextPage === currentPage) return;
          runWithSkeleton(() => setCurrentPage(nextPage));
        }}
        onView={openView}
        onEdit={openEdit}
      />

      <ShopDetails
        shop={selectedShop}
        open={activeDrawer === "view"}
        onClose={closeDrawer}
        onExited={handleDetailsExited}
        onEdit={openEdit}
        onSuspend={handleSuspend}
      />

      <ShopForm
        open={activeDrawer === "add" || activeDrawer === "edit"}
        mode={activeDrawer === "edit" ? "edit" : "add"}
        shop={selectedShop}
        onClose={closeDrawer}
        onExited={handleFormExited}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
