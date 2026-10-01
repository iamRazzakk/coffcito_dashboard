import type { ShopPayload, ShopRecord } from "@/store/services/shop.api";
import { resolveImageUrl } from "../../utils/imageUrl";

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

export function formatClock(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

export function formatSince(createdAt?: string) {
  if (!createdAt) return "—";
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return createdAt;
  return createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SHOP_STATUSES: ShopStatus[] = ["Active", "Inactive", "Maintenance"];

function isShopStatus(value: unknown): value is ShopStatus {
  return SHOP_STATUSES.includes(value as ShopStatus);
}

export function toShop(record: ShopRecord): Shop {
  return {
    id: record._id,
    name: record.name ?? "",
    location: record.location ?? "",
    phone: record.phone ?? "",
    about: record.about ?? "",
    image: resolveImageUrl(record.image),
    orders: record.orders ?? 0,
    revenue: record.revenue ?? 0,
    status: isShopStatus(record.status) ? record.status : "Active",
    since: formatSince(record.createdAt),
    faqs: (record.faqs ?? []).map((faq, index) => ({
      id: faq._id || `faq-${index}`,
      question: faq.question ?? "",
      answer: faq.answer ?? "",
    })),
    hours: (record.hours ?? []).map((hour, index) => ({
      id: hour._id || `hrs-${index}`,
      day: hour.day,
      open: hour.open,
      close: hour.close,
    })),
  };
}

function isShopDay(day: string): day is (typeof DAYS)[number] {
  return (DAYS as readonly string[]).includes(day);
}

export function shopCreatePayload(values: ShopFormValues): ShopPayload & {
  name: string;
  location: string;
} {
  const payload: ShopPayload & { name: string; location: string } = {
    name: values.name.trim(),
    location: values.location.trim(),
    status: values.status,
  };
  const phone = values.phone.trim();
  const about = values.about.trim();
  const faqs = faqPayload(values);
  const hours = hoursPayload(values);
  if (phone) payload.phone = phone;
  if (about) payload.about = about;
  if (faqs.length) payload.faqs = faqs;
  if (hours.length) payload.hours = hours;
  return payload;
}

export function shopUpdatePayload(shop: Shop, values: ShopFormValues): ShopPayload {
  const next = {
    name: values.name.trim(),
    location: values.location.trim(),
    phone: values.phone.trim(),
    about: values.about.trim(),
    status: values.status,
    faqs: faqPayload(values),
    hours: hoursPayload(values),
  };
  const currentFaqs = shop.faqs.map((faq) => ({
    question: faq.question.trim(),
    answer: faq.answer.trim(),
  }));
  const currentHours = shop.hours
    .filter((hour) => isShopDay(hour.day))
    .map((hour) => ({
      day: hour.day,
      open: hour.open,
      close: hour.close,
    }));
  const payload: ShopPayload = {};

  if (next.name !== shop.name.trim()) payload.name = next.name;
  if (next.location !== shop.location.trim()) payload.location = next.location;
  if (next.phone !== shop.phone.trim()) payload.phone = next.phone;
  if (next.about !== shop.about.trim()) payload.about = next.about;
  if (next.status !== shop.status) payload.status = next.status;
  if (JSON.stringify(next.faqs) !== JSON.stringify(currentFaqs)) {
    payload.faqs = next.faqs;
  }
  if (JSON.stringify(next.hours) !== JSON.stringify(currentHours)) {
    payload.hours = next.hours;
  }

  return payload;
}

function faqPayload(values: ShopFormValues) {
  return values.faqs
    .map((faq) => ({
      question: faq.question.trim(),
      answer: faq.answer.trim(),
    }))
    .filter((faq) => faq.question && faq.answer);
}

function hoursPayload(values: ShopFormValues) {
  return values.hours
    .filter((hour) => isShopDay(hour.day) && hour.open && hour.close)
    .map((hour) => ({
      day: hour.day as (typeof DAYS)[number],
      open: hour.open,
      close: hour.close,
    }));
}

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
