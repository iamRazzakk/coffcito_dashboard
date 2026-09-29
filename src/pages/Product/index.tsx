import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import ProductStats from "./ProductStats";
import ProductGrid from "./ProductGrid";
import ProductDetails from "./ProductDetails";
import ProductForm from "./ProductForm";
import CategoryForm from "./CategoryForm";
import { MOCK_PRODUCTS, DEFAULT_CATEGORIES } from "./mockProducts";
import type {
  Product,
  ProductCategory,
  ProductFilter,
  ProductFormValues,
} from "./types";
import { notify } from "../../lib/notify";
import { useActionSkeleton, usePageBoot } from "../../lib/usePageLoad";

const PAGE_SIZE = 10;

type DrawerMode = "view" | "add" | "edit" | "category" | null;

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] =
    useState<ProductCategory[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
    setSelectedProduct(null);
  }, []);

  const handleFormExited = useCallback(() => {
    if (activeDrawerRef.current === null) setSelectedProduct(null);
  }, []);

  const openView = (product: Product) => {
    setSelectedProduct(product);
    setActiveDrawer("view");
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setActiveDrawer("edit");
  };

  const openAdd = () => {
    setSelectedProduct(null);
    setActiveDrawer("add");
  };

  const openCategory = () => setActiveDrawer("category");

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === "Active" ? "Inactive" : "Active";

    if (nextStatus === "Inactive") {
      const confirmed = await notify.confirm(
        "Deactivate product?",
        `${product.name} will be hidden from the active menu.`,
        { confirmText: "Deactivate", cancelText: "Keep active" },
      );
      if (!confirmed) return;
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, status: nextStatus } : item,
      ),
    );
    setSelectedProduct((prev) =>
      prev && prev.id === product.id ? { ...prev, status: nextStatus } : prev,
    );

    if (nextStatus === "Active") {
      notify.success("Activated", `${product.name} is now Active.`);
    } else {
      notify.warning("Deactivated", `${product.name} is now Inactive.`);
    }
  };

  const handleSubmitProduct = (
    values: ProductFormValues,
    productId?: string,
  ) => {
    if (activeDrawer === "edit" && productId) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productId
            ? { ...item, ...values, image: values.image || item.image }
            : item,
        ),
      );
      notify.updated("Product");
      closeDrawer();
      return;
    }

    const createdProduct: Product = {
      id: `PR-${String(products.length + 1).padStart(3, "0")}`,
      name: values.name,
      category: values.category,
      description: values.description,
      image:
        values.image ||
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=450&fit=crop&auto=format",
      price: values.price,
      costPrice: values.costPrice,
      sold: 0,
      status: values.status,
      sizes: values.sizes,
      extras: values.extras,
    };

    setProducts((prev) => [createdProduct, ...prev]);
    notify.created("Product");
    closeDrawer();
  };

  const handleAddCategory = (categoryName: string) => {
    setCategories((prev) => [...prev, categoryName as ProductCategory]);
    notify.created(`Category "${categoryName}"`);
    closeDrawer();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
            Products & Menu
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage your full product catalog across all shops
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCategory}
            className="h-10 px-4 rounded-lg bg-[#1E90FF] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#1878d8] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="h-10 px-4 rounded-lg bg-[#1E90FF] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#1878d8] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <ProductStats products={products} loading={isBooting} />

      <ProductGrid
        products={products}
        categories={categories}
        search={searchQuery}
        filter={categoryFilter}
        page={currentPage}
        pageSize={PAGE_SIZE}
        loading={isBooting || isRefreshing}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        onFilterChange={(nextFilter) => {
          if (nextFilter === categoryFilter) return;
          runWithSkeleton(() => {
            setCategoryFilter(nextFilter);
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

      <ProductDetails
        product={selectedProduct}
        open={activeDrawer === "view"}
        onClose={closeDrawer}
        onExited={handleDetailsExited}
        onEdit={openEdit}
        onToggleStatus={handleToggleStatus}
      />

      <ProductForm
        open={activeDrawer === "add" || activeDrawer === "edit"}
        mode={activeDrawer === "edit" ? "edit" : "add"}
        product={selectedProduct}
        categories={categories}
        onClose={closeDrawer}
        onExited={handleFormExited}
        onSubmit={handleSubmitProduct}
      />

      <CategoryForm
        open={activeDrawer === "category"}
        existing={categories}
        onClose={closeDrawer}
        onSubmit={handleAddCategory}
      />
    </div>
  );
}
