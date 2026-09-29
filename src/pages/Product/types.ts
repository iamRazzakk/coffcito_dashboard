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
  name: string;
  category: ProductCategory;
  description: string;
  image: string;
  price: number;
  costPrice: number;
  status: ProductStatus;
  sizes: ProductSize[];
  extras: ProductExtra[];
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

export function emptyProductForm(
  category: ProductCategory = "Hot Drinks",
): ProductFormValues {
  return {
    name: "",
    category,
    description: "",
    image: "",
    price: 0,
    costPrice: 0,
    status: "Active",
    sizes: [
      { id: "s1", label: "S", priceOffset: 0 },
      { id: "s2", label: "M", priceOffset: 10 },
      { id: "s3", label: "L", priceOffset: 20 },
    ],
    extras: [],
  };
}

export function productToForm(p: Product): ProductFormValues {
  return {
    name: p.name,
    category: p.category,
    description: p.description,
    image: p.image,
    price: p.price,
    costPrice: p.costPrice,
    status: p.status,
    sizes: p.sizes.map((s) => ({ ...s })),
    extras: p.extras.map((e) => ({ ...e })),
  };
}
