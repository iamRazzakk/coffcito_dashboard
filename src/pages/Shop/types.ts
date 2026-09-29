export type ShopStatus = "Active" | "Inactive" | "Maintenance";
export type ShopFilter = "All" | "Active" | "Inactive";

export interface ShopFaq {
  id: string;
  question: string;
  answer: string;
}

export interface ShopHours {
  id: string;
  day: string;
  open: string;
  close: string;
}

export interface Shop {
  id: string;
  name: string;
  location: string;
  phone: string;
  about: string;
  image: string;
  orders: number;
  revenue: number;
  status: ShopStatus;
  since: string;
  faqs: ShopFaq[];
  hours: ShopHours[];
}

export type ShopFormValues = {
  name: string;
  location: string;
  phone: string;
  about: string;
  image: string;
  status: ShopStatus;
  faqs: ShopFaq[];
  hours: ShopHours[];
};

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const STATUS_STYLES: Record<ShopStatus, string> = {
  Active: "bg-blue-50 text-[#1E90FF]",
  Inactive: "bg-red-50 text-red-500",
  Maintenance: "bg-amber-50 text-amber-600",
};

export function formatRevenue(n: number) {
  return `$${n.toLocaleString()}`;
}

export function formatOrders(n: number) {
  return n.toLocaleString();
}

export function emptyShopForm(): ShopFormValues {
  return {
    name: "",
    location: "",
    phone: "",
    about: "",
    image: "",
    status: "Active",
    faqs: [],
    hours: [],
  };
}

export function shopToForm(shop: Shop): ShopFormValues {
  return {
    name: shop.name,
    location: shop.location,
    phone: shop.phone,
    about: shop.about,
    image: shop.image,
    status: shop.status,
    faqs: shop.faqs.map((f) => ({ ...f })),
    hours: shop.hours.map((h) => ({ ...h })),
  };
}
