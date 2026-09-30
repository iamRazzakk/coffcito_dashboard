import { useCallback, useRef, useState } from "react";
import { Plus } from "lucide-react";
import ProductStats from "./ProductStats";
import ProductGrid from "./ProductGrid";
import ProductDetails from "./ProductDetails";
import ProductForm from "./ProductForm";
import CategoryForm from "./CategoryForm";
import { MOCK_PRODUCTS, DEFAULT_CATEGORIES } from "./mockProducts";
import type { Product, ProductCategory } from "./types";
import type { CreateProductArgs } from "@/store/services/product.api";
import { useCreateProductMutation } from "@/store/services/product.api";
import { getApiErrorMessage } from "../../store/http";
import { notify } from "../../lib/notify";
import { usePageBoot } from "../../lib/usePageLoad";

type DrawerMode = "view" | "add" | "edit" | "category" | null;

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] =
    useState<ProductCategory[]>(DEFAULT_CATEGORIES);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<DrawerMode>(null);
  const activeDrawerRef = useRef<DrawerMode>(null);

  const isBooting = usePageBoot();
  const [createProduct, { isLoading: isCreatingProduct }] =
    useCreateProductMutation();

  const changeDrawer = (drawerMode: DrawerMode) => {
    activeDrawerRef.current = drawerMode;
    setActiveDrawer(drawerMode);
  };

  const closeDrawer = () => changeDrawer(null);

  const handleDetailsExited = useCallback(() => {
    if (
      activeDrawerRef.current === "edit" ||
      activeDrawerRef.current === "add"
    ) {
      return;
    }
    setSelectedProduct(null);
  }, []);

  const handleFormExited = useCallback(() => {
    if (activeDrawerRef.current === null) setSelectedProduct(null);
  }, []);

  const openView = (product: Product) => {
    setSelectedProduct(product);
    changeDrawer("view");
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    changeDrawer("edit");
  };

  const openAdd = () => {
    setSelectedProduct(null);
    changeDrawer("add");
  };

  const openCategory = () => changeDrawer("category");

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

  const handleSubmitProduct = async (
    productArgs: Omit<CreateProductArgs, "imageFile"> & {
      imageFile: File | null;
    },
    productId?: string,
  ) => {
    if (activeDrawer === "edit" && productId) {
      setProducts((current) =>
        current.map((item) =>
          item.id === productId
            ? {
                ...item,
                name: productArgs.productName,
                description: productArgs.description,
                price: productArgs.discountPrice,
                costPrice: productArgs.originalPrice,
                sizes: [
                  { id: "size", label: productArgs.size, priceOffset: 0 },
                ],
              }
            : item,
        ),
      );
      notify.updated("Product");
      closeDrawer();
      return;
    }

    const { imageFile } = productArgs;
    if (!imageFile) {
      notify.error("Image required", "Select a product image.");
      return;
    }

    try {
      await createProduct({ ...productArgs, imageFile }).unwrap();
      notify.created("Product");
      closeDrawer();
    } catch (error) {
      notify.error("Create failed", getApiErrorMessage(error));
    }
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

      <ProductGrid onView={openView} onEdit={openEdit} />

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
        key={
          activeDrawer === "edit"
            ? `edit-${selectedProduct?.id ?? "product"}`
            : "add-product"
        }
        submitting={isCreatingProduct}
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
