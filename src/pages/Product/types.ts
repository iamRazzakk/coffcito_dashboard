export type ProductStatus = "Active" | "Inactive";
export type ProductCategory =
  | "Hot Drinks"
  | "Cold Drinks"
  | "Bakery"
  | "Snacks";

export type ProductFilter = "All" | ProductCategory;

export interface ProductSize {
  id: string;
  label: string;
  priceOffset: number;
}

export interface ProductExtra {
  id: string;
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryId?: string;
  description: string;
  image: string;
  price: number;
  costPrice: number;
  sold: number;
  status: ProductStatus;
  sizes: ProductSize[];
  extras: ProductExtra[];
}

export type ProductFormValues = {
  productName: string;
  categoryId: string;
  size: "S" | "M" | "L";
  description: string;
  discountPrice: number;
  originalPrice: number;
  imagePreview: string;
};

export const CATEGORIES: ProductCategory[] = [
  "Hot Drinks",
  "Cold Drinks",
  "Bakery",
  "Snacks",
];

export const STATUS_STYLES: Record<ProductStatus, string> = {
  Active: "bg-[#1E90FF] text-white",
  Inactive: "bg-gray-500 text-white",
};

export function formatPrice(n: number) {
  return `$${n.toLocaleString()}`;
}

export function formatSold(n: number) {
  return `${n.toLocaleString()} sold`;
}

export function emptyProductForm(): ProductFormValues {
  return {
    productName: "",
    categoryId: "",
    size: "M",
    description: "",
    discountPrice: 0,
    originalPrice: 0,
    imagePreview: "",
  };
}

export function productToForm(product: Product): ProductFormValues {
  const size = product.sizes.find(
    (item) => item.label === "S" || item.label === "M" || item.label === "L",
  );

  return {
    productName: product.name,
    categoryId: product.categoryId ?? "",
    size: size?.label === "S" || size?.label === "L" ? size.label : "M",
    description: product.description,
    discountPrice: product.price,
    originalPrice: product.costPrice,
    imagePreview: product.image,
  };
}
