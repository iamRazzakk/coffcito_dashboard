import type { VerifiedStatus } from "../utils/verifiedStatus";
import type {
  AgeDistributionData,
  ContentType,
  CreateEventRequest,
  CreatePackageRequest,
  DashboardReport,
  Event,
  EventBooking,
  EventBookingDetail,
  GenderDistributionData,
  NewUserActivityData,
  OverviewData,
  Package,
  PlanDistributionData,
  Post,
  ProfileData,
  RecentReport,
  RecentSignupUser,
  RecentSubscription,
  ReportStatus,
  RevenueAnalyticsData,
  Rule,
  SaveRuleRequest,
  Subscription,
  SwipeAnalyticsData,
  UserActivityData,
  UserDetails,
} from "../types/domain";
import { users as legacyUsers } from "./mockData";

const now = new Date().toISOString();
const days = Array.from({ length: 30 }, (_, i) => `D${i + 1}`);

// ─── Overview ───────────────────────────────────────────────────────────────
export const overviewData: OverviewData = {
  totalUser: 128492,
  activeToday: 42109,
  newSignupUser: 1248,
  totalMatchesUser: 2400000,
  openReport: 37,
};

export const userActivityData: UserActivityData[] = days.map((day, i) => ({
  day,
  activeCount: 38000 + Math.round(Math.sin(i / 3) * 2200) + i * 110,
}));

export const newUserActivityData: NewUserActivityData[] = days.map((day, i) => ({
  day,
  newUser: 700 + Math.round(Math.cos(i / 4) * 180) + i * 12,
}));

export const recentSignupUsers: RecentSignupUser[] = legacyUsers
  .slice(0, 10)
  .map((user, i) => ({
    _id: user.id,
    name: user.name,
    email: user.email,
    profile: "",
    status: user.status,
    onboardingComplete: true,
    premiumMembership: user.plan !== "Free",
    verified: user.verifiedStatus === "verified",
    isAdminVerified: user.verifiedStatus === "verified",
    verifiedStatus: user.verifiedStatus ?? undefined,
    isBanned: user.status === "banned",
    createdAt: new Date(Date.now() - (i + 1) * 8 * 60_000).toISOString(),
    updatedAt: now,
  }));

export const recentReportsFeed: RecentReport[] = [
  {
    _id: "r_551",
    postId: "post_1001",
    userId: "u_1000",
    reason: "InappropriatePhoto",
    description: "Flagged profile photo",
    image: [],
    status: "pending",
    createdAt: new Date(Date.now() - 4 * 60_000).toISOString(),
    updatedAt: now,
  },
  {
    _id: "r_550",
    postId: "post_1002",
    userId: "u_1001",
    reason: "Harassment",
    description: "Repeated unwanted messages",
    image: [],
    status: "pending",
    createdAt: new Date(Date.now() - 11 * 60_000).toISOString(),
    updatedAt: now,
  },
  {
    _id: "r_549",
    postId: "post_1003",
    userId: "u_1002",
    reason: "FakeProfile",
    description: "Suspected catfish account",
    image: [],
    status: "pending",
    createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
    updatedAt: now,
  },
];

export const recentSubscriptionsFeed: RecentSubscription[] = [
  {
    _id: "sub_991",
    customerId: "cus_991",
    price: 14.99,
    user: "u_1003",
    package: "pkg_prem",
    trxId: "trx_991",
    subscriptionId: "stripe_sub_991",
    currentPeriodStart: "2026-05-01T00:00:00.000Z",
    currentPeriodEnd: "2026-06-01T00:00:00.000Z",
    remaining: 18,
    status: "active",
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    updatedAt: now,
  },
  {
    _id: "sub_990",
    customerId: "cus_990",
    price: 79,
    user: "u_1004",
    package: "pkg_plus",
    trxId: "trx_990",
    subscriptionId: "stripe_sub_990",
    currentPeriodStart: "2026-04-15T00:00:00.000Z",
    currentPeriodEnd: "2027-04-15T00:00:00.000Z",
    remaining: 220,
    status: "active",
    createdAt: new Date(Date.now() - 13 * 60_000).toISOString(),
    updatedAt: now,
  },
  {
    _id: "sub_989",
    customerId: "cus_989",
    price: 14.99,
    user: "u_1005",
    package: "pkg_prem",
    trxId: "trx_989",
    subscriptionId: "stripe_sub_989",
    currentPeriodStart: "2026-05-01T00:00:00.000Z",
    currentPeriodEnd: "2026-06-01T00:00:00.000Z",
    remaining: 18,
    status: "active",
    createdAt: new Date(Date.now() - 22 * 60_000).toISOString(),
    updatedAt: now,
  },
];

// ─── Users (mutable) ────────────────────────────────────────────────────────
export let demoUsers: UserDetails[] = legacyUsers.map((user, i) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  onboardingComplete: true,
  role: "user",
  status: user.status === "banned" ? "inactive" : "active",
  profile: "",
  isAdminVerified: user.verifiedStatus === "verified",
  verifiedStatus: user.verifiedStatus ?? undefined,
  premiumMembership: user.plan !== "Free",
  isBanned: user.status === "banned",
  verified: user.verifiedStatus === "verified",
  isResetPassword: false,
  accountInformation: { status: true },
  createdAt: `${user.joinDate}T10:00:00.000Z`,
  updatedAt: now,
  DOB: "1995-06-15",
  bio: "Looking for meaningful connections.",
  country: "United States",
  state: "California",
  gender: i % 2 === 0 ? "Women" : "Men",
  occupation: "Designer",
  education: "Bachelor's",
  relationStatus: "Single",
  lookingFor: "Long-term",
  height: 165 + (i % 20),
  weight: 55 + (i % 25),
  documentType: "passport",
  verifyOwnPicture:
    user.verifiedStatus === "pending" || user.verifiedStatus === "verified"
      ? "https://picsum.photos/seed/" + user.id + "/400/400"
      : undefined,
  documentVerified:
    user.verifiedStatus === "pending" || user.verifiedStatus === "verified"
      ? "https://picsum.photos/seed/doc-" + user.id + "/400/400"
      : undefined,
  protectedImages: "https://picsum.photos/seed/p-" + user.id + "/400/400",
}));

export const getUserById = (id: string) =>
  demoUsers.find((user) => user._id === id) ?? null;

export const banUserLocal = (userId: string) => {
  demoUsers = demoUsers.map((user) =>
    user._id === userId
      ? {
          ...user,
          isBanned: !user.isBanned,
          status: !user.isBanned ? "inactive" : "active",
          updatedAt: new Date().toISOString(),
        }
      : user,
  );
  return getUserById(userId);
};

export const updateVerifiedStatusLocal = (
  userId: string,
  verifiedStatus: VerifiedStatus,
) => {
  demoUsers = demoUsers.map((user) =>
    user._id === userId
      ? {
          ...user,
          verifiedStatus,
          isAdminVerified: verifiedStatus === "verified",
          verified: verifiedStatus === "verified",
          updatedAt: new Date().toISOString(),
        }
      : user,
  );
  return getUserById(userId);
};

// ─── Reports (mutable) ──────────────────────────────────────────────────────
export let demoReports: DashboardReport[] = [
  {
    _id: "r_551",
    postId: "post_1001",
    userId: "u_1000",
    reason: "InappropriatePhoto",
    description: "A profile photo flagged by multiple users.",
    image: ["https://picsum.photos/seed/report1/200/200"],
    status: "pending",
    createdAt: "2026-05-06T10:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "r_550",
    postId: "post_1002",
    userId: "u_1001",
    reason: "Harassment",
    description: "User reported repeated unwanted messages.",
    image: [],
    status: "pending",
    createdAt: "2026-05-06T09:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "r_549",
    postId: "post_1003",
    userId: "u_1002",
    reason: "FakeProfile",
    description: "Suspected fake identity photos.",
    image: ["https://picsum.photos/seed/report3/200/200"],
    status: "pending",
    createdAt: "2026-05-05T18:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "r_548",
    postId: "post_1001",
    userId: "u_1003",
    reason: "SpamMessages",
    description: "Promotional spam in DMs.",
    image: [],
    status: "approved",
    createdAt: "2026-05-05T12:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "r_547",
    postId: "post_1002",
    userId: "u_1004",
    reason: "HateSpeech",
    description: "Offensive language in bio.",
    image: [],
    status: "rejected",
    createdAt: "2026-05-04T16:00:00.000Z",
    updatedAt: now,
  },
];

export const updateReportStatusLocal = (
  reportId: string,
  status: ReportStatus,
) => {
  demoReports = demoReports.map((report) =>
    report._id === reportId
      ? { ...report, status, updatedAt: new Date().toISOString() }
      : report,
  );
  return demoReports.find((report) => report._id === reportId) ?? null;
};

export const getReportsPage = (page: number, limit = 10) => {
  const start = (page - 1) * limit;
  const data = demoReports.slice(start, start + limit);
  return {
    data,
    pagination: {
      total: demoReports.length,
      limit,
      page,
      totalPage: Math.max(1, Math.ceil(demoReports.length / limit)),
    },
  };
};

// ─── Posts ──────────────────────────────────────────────────────────────────
export const demoPosts: Post[] = [
  {
    _id: "post_1001",
    description: "Weekend vibes in the city ✨",
    content: [
      "https://picsum.photos/seed/post1001a/800/800",
      "https://picsum.photos/seed/post1001b/800/800",
    ],
    user: {
      _id: "u_1000",
      name: "Maya Chen",
      email: "maya.chen@mail.com",
      profile: "https://picsum.photos/seed/maya/200/200",
    },
    type: "IMAGE",
    likeCount: 128,
    commentCount: 14,
    createdAt: "2026-05-05T14:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "post_1002",
    description: "Coffee date anyone?",
    content: ["https://picsum.photos/seed/post1002/800/800"],
    user: {
      _id: "u_1001",
      name: "Daniel Park",
      email: "daniel.park@mail.com",
    },
    type: "IMAGE",
    likeCount: 64,
    commentCount: 7,
    createdAt: "2026-05-04T11:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "post_1003",
    description: "Travel throwback",
    content: ["https://picsum.photos/seed/post1003/800/800"],
    user: {
      _id: "u_1002",
      name: "Sara Iqbal",
      email: "sara.iqbal@mail.com",
    },
    type: "IMAGE",
    likeCount: 210,
    commentCount: 22,
    createdAt: "2026-05-03T09:00:00.000Z",
    updatedAt: now,
  },
];

export const getPostById = (id: string) =>
  demoPosts.find((post) => post._id === id) ?? null;

// ─── Analytics ──────────────────────────────────────────────────────────────
export const swipeAnalytics: SwipeAnalyticsData[] = days.map((day, i) => ({
  day,
  likes: 4200 + Math.round(Math.sin(i / 2) * 400) + i * 20,
  rejects: 3100 + Math.round(Math.cos(i / 3) * 300) + i * 15,
  matches: 980 + Math.round(Math.sin(i / 4) * 80) + i * 5,
}));

export const monthlyRevenueAnalytics: RevenueAnalyticsData[] = [
  { period: "Nov", subscriptions: 1420 },
  { period: "Dec", subscriptions: 1560 },
  { period: "Jan", subscriptions: 1610 },
  { period: "Feb", subscriptions: 1690 },
  { period: "Mar", subscriptions: 1750 },
  { period: "Apr", subscriptions: 1780 },
  { period: "May", subscriptions: 1847 },
];

export const yearlyRevenueAnalytics: RevenueAnalyticsData[] = [
  { period: "2022", subscriptions: 12400 },
  { period: "2023", subscriptions: 15600 },
  { period: "2024", subscriptions: 18200 },
  { period: "2025", subscriptions: 21400 },
  { period: "2026", subscriptions: 9800 },
];

export const planDistributionAnalytics: PlanDistributionData[] = [
  { name: "Free", value: 96321 },
  { name: "Premium", value: 32174 },
];

export const genderDistributionAnalytics: GenderDistributionData[] = [
  { name: "Women", value: 58200 },
  { name: "Men", value: 54800 },
  { name: "Couple", value: 8200 },
  { name: "Non-binary", value: 4100 },
  { name: "Not specified", value: 3192 },
];

export const ageDistributionAnalytics: AgeDistributionData[] = [
  { range: "18-24", users: 28400 },
  { range: "25-34", users: 51200 },
  { range: "35-44", users: 29800 },
  { range: "45-54", users: 12400 },
  { range: "55+", users: 6692 },
];

// ─── Packages (mutable) ─────────────────────────────────────────────────────
export let demoPackages: Package[] = [
  {
    _id: "pkg_plus",
    title: "Plus",
    price: 7.99,
    duration: "1 month",
    paymentType: "Monthly",
    productId: "prod_plus_monthly",
    priceId: "price_plus_monthly",
    paymentLink: "https://pay.example.com/plus",
    status: "Active",
    user: "admin",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "pkg_prem",
    title: "Premium",
    price: 14.99,
    duration: "1 month",
    paymentType: "Monthly",
    productId: "prod_prem_monthly",
    priceId: "price_prem_monthly",
    paymentLink: "https://pay.example.com/premium",
    status: "Active",
    user: "admin",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "pkg_prem_y",
    title: "Premium Annual",
    price: 129,
    duration: "1 year",
    paymentType: "Yearly",
    productId: "prod_prem_yearly",
    priceId: "price_prem_yearly",
    paymentLink: "https://pay.example.com/premium-year",
    status: "Active",
    user: "admin",
    createdAt: "2026-01-12T00:00:00.000Z",
    updatedAt: now,
  },
];

export const createPackageLocal = (values: CreatePackageRequest): Package => {
  const pkg: Package = {
    ...values,
    _id: `pkg_${Date.now()}`,
    status: "Active",
    user: "admin",
    productId: values.productId || `prod_${Date.now()}`,
    priceId: values.priceId || `price_${Date.now()}`,
    paymentLink: values.paymentLink || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  demoPackages = [pkg, ...demoPackages];
  return pkg;
};

export const updatePackageLocal = (
  packageId: string,
  body: Partial<CreatePackageRequest>,
): Package | null => {
  demoPackages = demoPackages.map((pkg) =>
    pkg._id === packageId
      ? { ...pkg, ...body, updatedAt: new Date().toISOString() }
      : pkg,
  );
  return demoPackages.find((pkg) => pkg._id === packageId) ?? null;
};

// ─── Subscriptions ──────────────────────────────────────────────────────────
export const demoSubscriptions: Subscription[] = Array.from(
  { length: 24 },
  (_, i) => {
    const user = legacyUsers[i % legacyUsers.length];
    return {
      _id: `sub_${980 - i}`,
      customerId: `cus_${980 - i}`,
      price: [7.99, 14.99, 129, 79][i % 4],
      user: { _id: user.id, name: user.name, email: user.email },
      package: demoPackages[i % demoPackages.length]._id,
      trxId: `trx_${980 - i}`,
      subscriptionId: `stripe_sub_${980 - i}`,
      currentPeriodStart: `2026-04-${String((i % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
      currentPeriodEnd: `2026-05-${String((i % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
      remaining: 30 - (i % 25),
      status: ["active", "active", "active", "canceled", "active", "past_due"][
        i % 6
      ],
      createdAt: `2026-05-${String(6 - (i % 6)).padStart(2, "0")}T10:00:00.000Z`,
      updatedAt: now,
    };
  },
);

export const getSubscriptionsPage = (page: number, limit = 10) => {
  const start = (page - 1) * limit;
  return {
    data: demoSubscriptions.slice(start, start + limit),
    pagination: {
      total: demoSubscriptions.length,
      limit,
      page,
      totalPage: Math.max(1, Math.ceil(demoSubscriptions.length / limit)),
    },
  };
};

// ─── Events (mutable) ───────────────────────────────────────────────────────
export let demoEvents: Event[] = [
  {
    _id: "evt_1",
    eventName: "Speed Dating Night",
    type: "social",
    startDate: "2026-06-12",
    endDate: "2026-06-12",
    startTime: "19:00",
    details: "Meet new people in a fun, structured format.",
    visibility: "public",
    price: 25,
    status: "upcoming",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "evt_2",
    eventName: "Coffee Mixer",
    type: "casual",
    startDate: "2026-06-20",
    endDate: "2026-06-20",
    startTime: "10:00",
    details: "Morning coffee networking for singles.",
    visibility: "public",
    price: 15,
    status: "upcoming",
    createdAt: "2026-05-02T00:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "evt_3",
    eventName: "Rooftop Social",
    type: "premium",
    startDate: "2026-05-01",
    endDate: "2026-05-01",
    startTime: "20:00",
    details: "Exclusive rooftop evening for Premium members.",
    visibility: "private",
    price: 49,
    status: "completed",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: now,
  },
];

export const createEventLocal = (values: CreateEventRequest): Event => {
  const event: Event = {
    ...values,
    _id: `evt_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  demoEvents = [event, ...demoEvents];
  return event;
};

export const updateEventLocal = (
  eventId: string,
  body: Partial<CreateEventRequest>,
): Event | null => {
  demoEvents = demoEvents.map((event) =>
    event._id === eventId
      ? { ...event, ...body, updatedAt: new Date().toISOString() }
      : event,
  );
  return demoEvents.find((event) => event._id === eventId) ?? null;
};

export const deleteEventLocal = (eventId: string) => {
  demoEvents = demoEvents.filter((event) => event._id !== eventId);
  demoBookings = demoBookings.filter(
    (booking) => booking.eventId._id !== eventId,
  );
};

// ─── Event bookings (mutable) ───────────────────────────────────────────────
export let demoBookings: EventBooking[] = [
  {
    _id: "bk_1",
    eventId: {
      _id: "evt_1",
      eventName: "Speed Dating Night",
      startDate: "2026-06-12",
      endDate: "2026-06-12",
      details: "Meet new people in a fun, structured format.",
      price: 25,
      status: "upcoming",
    },
    userId: {
      _id: "u_1000",
      name: "Maya Chen",
      email: "maya.chen@mail.com",
    },
    bookingRequest: "pending",
    paymentStatus: "paid",
    paymentDate: "2026-05-10T12:00:00.000Z",
    paymentAmount: 25,
    currency: "USD",
    isDeleted: false,
    createdAt: "2026-05-10T12:00:00.000Z",
    updatedAt: now,
    trxId: "trx_bk_1",
  },
  {
    _id: "bk_2",
    eventId: {
      _id: "evt_1",
      eventName: "Speed Dating Night",
      startDate: "2026-06-12",
      endDate: "2026-06-12",
      details: "Meet new people in a fun, structured format.",
      price: 25,
      status: "upcoming",
    },
    userId: {
      _id: "u_1001",
      name: "Daniel Park",
      email: "daniel.park@mail.com",
    },
    bookingRequest: "accepted",
    paymentStatus: "paid",
    paymentDate: "2026-05-11T09:00:00.000Z",
    paymentAmount: 25,
    currency: "USD",
    isDeleted: false,
    createdAt: "2026-05-11T09:00:00.000Z",
    updatedAt: now,
    trxId: "trx_bk_2",
  },
  {
    _id: "bk_3",
    eventId: {
      _id: "evt_2",
      eventName: "Coffee Mixer",
      startDate: "2026-06-20",
      endDate: "2026-06-20",
      details: "Morning coffee networking for singles.",
      price: 15,
      status: "upcoming",
    },
    userId: {
      _id: "u_1002",
      name: "Sara Iqbal",
      email: "sara.iqbal@mail.com",
    },
    bookingRequest: "pending",
    paymentStatus: "unpaid",
    paymentAmount: 15,
    currency: "USD",
    isDeleted: false,
    createdAt: "2026-05-12T08:00:00.000Z",
    updatedAt: now,
  },
];

export const getBookingsForEvent = (eventId: string) =>
  demoBookings.filter((booking) => booking.eventId._id === eventId);

export const getBookingDetail = (bookingId: string): EventBookingDetail | null => {
  const booking = demoBookings.find((item) => item._id === bookingId);
  if (!booking) return null;
  return {
    ...booking,
    userId: booking.userId._id,
  };
};

export const updateBookingStatusLocal = (
  bookingId: string,
  bookingRequest: "accepted" | "rejected",
) => {
  demoBookings = demoBookings.map((booking) =>
    booking._id === bookingId
      ? { ...booking, bookingRequest, updatedAt: new Date().toISOString() }
      : booking,
  );
  return demoBookings.find((booking) => booking._id === bookingId) ?? null;
};

// ─── Content rules (mutable) ────────────────────────────────────────────────
export let demoRules: Rule[] = [
  {
    _id: "rule_privacy",
    type: "PRIVACY",
    content:
      "<h2>Privacy Policy</h2><p>We respect your privacy and protect your personal data on Coffcito.</p><p>We collect account information, profile details, and usage analytics to improve matching.</p>",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "rule_terms",
    type: "TERMS",
    content:
      "<h2>Terms of Service</h2><p>By using Coffcito you agree to our community guidelines and acceptable use policy.</p><p>Accounts that violate our policies may be suspended or banned.</p>",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: now,
  },
  {
    _id: "rule_about",
    type: "ABOUT",
    content:
      "<h2>About Coffcito</h2><p>Coffcito helps people find meaningful connections through thoughtful matching.</p>",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: now,
  },
];

export const getRuleByType = (type: ContentType) =>
  demoRules.find((rule) => rule.type === type) ?? null;

export const saveRuleLocal = (values: SaveRuleRequest): Rule => {
  const existing = getRuleByType(values.type);
  if (existing) {
    demoRules = demoRules.map((rule) =>
      rule.type === values.type
        ? {
            ...rule,
            content: values.content,
            updatedAt: new Date().toISOString(),
          }
        : rule,
    );
    return getRuleByType(values.type)!;
  }

  const rule: Rule = {
    _id: `rule_${values.type.toLowerCase()}`,
    type: values.type,
    content: values.content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  demoRules = [...demoRules, rule];
  return rule;
};

// ─── Profile (mutable) ──────────────────────────────────────────────────────
export let demoProfile: ProfileData = {
  _id: "admin_1",
  id: "admin_1",
  name: "Admin",
  email: "admin@gmail.com",
  role: "super_admin",
  status: "active",
  profile: "",
  onboardingComplete: true,
  premiumMembership: true,
  isBanned: false,
  verified: true,
  isAdminVerified: true,
  isResetPassword: false,
  accountInformation: { status: true },
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: now,
};

export const updateProfileLocal = (name: string, imagePreview?: string | null) => {
  demoProfile = {
    ...demoProfile,
    name,
    profile: imagePreview || demoProfile.profile,
    updatedAt: new Date().toISOString(),
  };
  return demoProfile;
};
