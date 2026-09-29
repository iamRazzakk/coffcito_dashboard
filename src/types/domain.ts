import type { VerifiedStatus } from "../utils/verifiedStatus";

// ─── Overview / Dashboard ───────────────────────────────────────────────────
export interface OverviewData {
  totalUser: number;
  activeToday: number;
  newSignupUser: number;
  totalMatchesUser: number;
  openReport: number;
}

export interface UserActivityData {
  day: string;
  activeCount: number;
}

export interface NewUserActivityData {
  day: string;
  newUser: number;
}

export interface RecentSignupUser {
  _id: string;
  name: string;
  email: string;
  profile: string;
  status: string;
  onboardingComplete: boolean;
  premiumMembership: boolean;
  verified: boolean;
  isAdminVerified: boolean;
  verifiedStatus?: VerifiedStatus;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecentReport {
  _id: string;
  postId: string;
  userId: string;
  reason: string;
  description: string;
  image: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentSubscription {
  _id: string;
  customerId: string;
  price: number;
  user: string;
  package: string;
  trxId: string;
  subscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  remaining: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Users ──────────────────────────────────────────────────────────────────
export interface UserDetails {
  _id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
  role: string;
  status: string;
  profile: string;
  isAdminVerified: boolean;
  verifiedStatus?: VerifiedStatus;
  premiumMembership: boolean;
  isBanned: boolean;
  verified: boolean;
  isResetPassword: boolean;
  accountInformation: { status: boolean };
  createdAt: string;
  updatedAt: string;
  DOB?: string;
  bio?: string;
  country?: string;
  displayName?: string;
  education?: string;
  gender?: string;
  height?: number;
  livingWith?: string;
  lookingFor?: string;
  nationality?: string;
  occupation?: string;
  relationStatus?: string;
  state?: string;
  weight?: number;
  zidCode?: number;
  protectedImages?: string;
  documentType?: string;
  documentVerified?: string;
  verifyOwnPicture?: string;
  phone?: string;
}

// ─── Reports / Moderation ───────────────────────────────────────────────────
export interface DashboardReport {
  _id: string;
  postId: string;
  userId: string;
  reason: string;
  description: string;
  image: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportStatus = "pending" | "approved" | "rejected";

// ─── Posts ──────────────────────────────────────────────────────────────────
export type PostType = "IMAGE" | "VIDEO";

export interface PostAuthor {
  _id: string;
  name: string;
  email?: string;
  profile?: string;
}

export interface Post {
  _id: string;
  description: string;
  content: string[];
  user: string | PostAuthor;
  type: PostType;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export const getPostUserId = (user: Post["user"]) =>
  typeof user === "string" ? user : user._id;

export const getPostAuthor = (user: Post["user"]): PostAuthor | null => {
  if (typeof user === "string") {
    return { _id: user, name: "User" };
  }
  return user;
};

// ─── Analytics ──────────────────────────────────────────────────────────────
export interface SwipeAnalyticsData {
  day: string;
  likes: number;
  rejects: number;
  matches: number;
}

export interface RevenueAnalyticsData {
  period: string;
  subscriptions: number;
}

export interface PlanDistributionData {
  name: string;
  value: number;
}

export interface GenderDistributionData {
  name: string;
  value: number;
}

export interface AgeDistributionData {
  range: string;
  users: number;
}

// ─── Packages ───────────────────────────────────────────────────────────────
export const PACKAGE_DURATIONS = [
  "1 month",
  "3 months",
  "6 months",
  "1 year",
] as const;

export const PACKAGE_PAYMENT_TYPES = ["Monthly", "Yearly"] as const;
export const PACKAGE_STATUSES = ["Active", "Delete"] as const;

export type PackageDuration = (typeof PACKAGE_DURATIONS)[number];
export type PackagePaymentType = (typeof PACKAGE_PAYMENT_TYPES)[number];
export type PackageStatus = (typeof PACKAGE_STATUSES)[number];

export interface PackagePayload {
  title: string;
  price: number;
  duration: PackageDuration;
  paymentType: PackagePaymentType;
  productId: string;
  priceId: string;
  paymentLink: string;
  status: PackageStatus;
}

export type CreatePackageRequest = Omit<PackagePayload, "status">;

export interface Package extends PackagePayload {
  _id: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Subscriptions ──────────────────────────────────────────────────────────
export interface SubscriptionUser {
  _id: string;
  name: string;
  email: string;
}

export interface Subscription {
  _id: string;
  customerId: string;
  price: number;
  user: SubscriptionUser;
  package: string;
  trxId: string;
  subscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  remaining: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Events ─────────────────────────────────────────────────────────────────
export const EVENT_VISIBILITY = ["public", "private"] as const;
export const EVENT_STATUSES = ["upcoming", "completed", "cancelled"] as const;

export type EventVisibility = (typeof EVENT_VISIBILITY)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface CreateEventRequest {
  eventName: string;
  type: string;
  startDate: string;
  endDate: string;
  startTime: string;
  details: string;
  visibility: EventVisibility;
  price: number;
  status: EventStatus;
}

export interface Event extends CreateEventRequest {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingRequestStatus = "pending" | "accepted" | "rejected";
export type PaymentStatus = "paid" | "unpaid" | "refunded" | "failed";

export interface EventBookingEvent {
  _id: string;
  eventName: string;
  startDate: string;
  endDate: string;
  details: string;
  price: number;
  status?: string;
  eventOwner?: string;
}

export interface EventBookingUser {
  _id: string;
  name: string;
  email: string;
  profile?: string;
}

export interface EventBooking {
  _id: string;
  eventId: EventBookingEvent;
  userId: EventBookingUser;
  bookingRequest: BookingRequestStatus;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  paymentAmount: number;
  currency: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  checkoutSessionId?: string;
  trxId?: string;
}

export interface EventBookingDetail {
  _id: string;
  eventId: EventBookingEvent;
  userId: string;
  bookingRequest: BookingRequestStatus;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  paymentAmount: number;
  currency: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  checkoutSessionId?: string;
  trxId?: string;
}

export const toEntityId = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.$oid === "string") return record.$oid;
    if ("_id" in record) return toEntityId(record._id);
  }
  return null;
};

// ─── Content / Rules ────────────────────────────────────────────────────────
export const CONTENT_TYPES = {
  PRIVACY: "PRIVACY",
  TERMS: "TERMS",
  ABOUT: "ABOUT",
} as const;

export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];

export interface Rule {
  _id: string;
  type: ContentType;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveRuleRequest {
  type: ContentType;
  content: string;
}

// ─── Profile ────────────────────────────────────────────────────────────────
export interface ProfileData {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  profile: string;
  onboardingComplete: boolean;
  premiumMembership: boolean;
  isBanned: boolean;
  verified: boolean;
  isAdminVerified: boolean;
  isResetPassword: boolean;
  accountInformation: { status: boolean };
  createdAt: string;
  updatedAt: string;
}
