export type VerifiedStatus = "pending" | "verified" | "rejected";

export const VERIFIED_STATUS_LABELS: Record<VerifiedStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

export const VERIFIED_STATUS_STYLES: Record<VerifiedStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  verified: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export const resolveVerifiedStatus = (user: {
  verifiedStatus?: VerifiedStatus;
  isAdminVerified?: boolean;
}): VerifiedStatus | null => {
  if (user.verifiedStatus) return user.verifiedStatus;
  if (user.isAdminVerified) return "verified";
  return null;
};

export const formatVerifiedStatusLabel = (status: VerifiedStatus | null) =>
  status ? VERIFIED_STATUS_LABELS[status] : "Not submitted";
