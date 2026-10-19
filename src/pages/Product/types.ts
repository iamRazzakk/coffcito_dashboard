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
  /** Selling price: discount when set, otherwise original. */
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  costPrice?: number;
  taxPercentage?: number;
  point?: number;
  shopName?: string;
  sold: number;
  status: ProductStatus;
  sizes: ProductSize[];
  extras: ProductExtra[];
}

export type ProductFormSize = {
  id: string;
  name: "S" | "M" | "L";
  additionalPrice: string;
};

export type ProductFormExtra = {
  id: string;
  name: string;
  additionalPrice: string;
};

export type ProductFormValues = {
  productName: string;
  categoryId: string;
  description: string;
  originalPrice: string;
  discountPrice: string;
  costPrice: string;
  sizes: ProductFormSize[];
  extras: ProductFormExtra[];
  taxPercentage: string;
  point: string;
  status: boolean;
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
    description: "",
    originalPrice: "",
    discountPrice: "",
    costPrice: "",
    sizes: [],
    extras: [],
    taxPercentage: "",
    point: "",
    status: true,
    imagePreview: "",
  };
}

export function productToForm(product: Product): ProductFormValues {
  const seenSizes = new Set<string>();

  return {
    productName: product.name,
    categoryId: product.categoryId ?? "",
    description: product.description,
    originalPrice: String(product.originalPrice ?? product.price),
    discountPrice:
      product.discountPrice == null ? "" : String(product.discountPrice),
    costPrice: product.costPrice == null ? "" : String(product.costPrice),
    sizes: product.sizes.flatMap((item) => {
      if (item.label !== "S" && item.label !== "M" && item.label !== "L") {
        return [];
      }
      if (seenSizes.has(item.label)) return [];
      seenSizes.add(item.label);
      return [
        {
          id: item.id,
          name: item.label,
          additionalPrice: String(item.priceOffset),
        },
      ];
    }),
    extras: product.extras.map((item) => ({
      id: item.id,
      name: item.label,
      additionalPrice: String(item.price),
    })),
    taxPercentage:
      product.taxPercentage == null ? "" : String(product.taxPercentage),
    point: product.point == null ? "" : String(product.point),
    status: product.status !== "Inactive",
    imagePreview: product.image,
  };
}
