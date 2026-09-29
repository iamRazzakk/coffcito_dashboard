import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ShopCard from "./ShopCard";
import ShopTable from "./ShopTable";
import ShopDetails from "./ShopDetails";
import ShopForm from "./ShopForm";
import { MOCK_SHOPS } from "./mockShops";
import type { Shop, ShopFilter, ShopFormValues } from "./types";

const PAGE_SIZE = 5;
const SKELETON_MS = 450;
const INITIAL_MS = 700;

type DrawerMode = "view" | "add" | "edit" | null;

export default function ShopPage() {
  const [shops, setShops] = useState<Shop[]>(MOCK_SHOPS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ShopFilter>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Shop | null>(null);
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const drawerRef = useRef<DrawerMode>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    drawerRef.current = drawer;
  }, [drawer]);

  useEffect(() => {
    const t = window.setTimeout(() => setInitialLoading(false), INITIAL_MS);
    return () => window.clearTimeout(t);
  }, []);

  const runTableSkeleton = useCallback((action: () => void) => {
    setTableLoading(true);
    action();
    window.setTimeout(() => setTableLoading(false), SKELETON_MS);
  }, []);

  const closeDrawer = () => setDrawer(null);

  const handleDetailsExited = useCallback(() => {
    // Keep selection when handing off to edit form
    if (drawerRef.current === "edit" || drawerRef.current === "add") return;
    setSelected(null);
  }, []);

  const handleFormExited = useCallback(() => {
    if (drawerRef.current === null) setSelected(null);
  }, []);

  const openView = (shop: Shop) => {
    setSelected(shop);
    setDrawer("view");
  };

  const openEdit = (shop: Shop) => {
    setSelected(shop);
    setDrawer("edit");
  };

  const openAdd = () => {
    setSelected(null);
    setDrawer("add");
  };

  const handleSuspend = (shop: Shop) => {
    setShops((prev) =>
      prev.map((s) =>
        s.id === shop.id ? { ...s, status: "Inactive" as const } : s,
      ),
    );
    toast.success(`${shop.name} suspended`);
    closeDrawer();
  };

  const handleSubmit = (values: ShopFormValues, shopId?: string) => {
    if (drawer === "edit" && shopId) {
      setShops((prev) =>
        prev.map((s) =>
          s.id === shopId
            ? {
                ...s,
                ...values,
                image: values.image || s.image,
              }
            : s,
        ),
      );
      toast.success("Shop updated");
    } else {
      const nextNum = shops.length + 1;
      const newShop: Shop = {
        id: `SH-${String(nextNum).padStart(3, "0")}`,
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
      setShops((prev) => [newShop, ...prev]);
      toast.success("Shop added");
    }
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

      <ShopCard shops={shops} loading={initialLoading} />

      <ShopTable
        shops={shops}
        search={search}
        filter={filter}
        page={page}
        pageSize={PAGE_SIZE}
        loading={initialLoading || tableLoading}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onFilterChange={(next) => {
          if (next === filter) return;
          runTableSkeleton(() => {
            setFilter(next);
            setPage(1);
          });
        }}
        onPageChange={(next) => {
          if (next === page) return;
          runTableSkeleton(() => setPage(next));
        }}
        onView={openView}
        onEdit={openEdit}
      />

      <ShopDetails
        shop={selected}
        open={drawer === "view"}
        onClose={closeDrawer}
        onExited={handleDetailsExited}
        onEdit={openEdit}
        onSuspend={handleSuspend}
      />

      <ShopForm
        open={drawer === "add" || drawer === "edit"}
        mode={drawer === "edit" ? "edit" : "add"}
        shop={selected}
        onClose={closeDrawer}
        onExited={handleFormExited}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
