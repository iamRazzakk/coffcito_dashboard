import { useEffect, useState } from "react";
import { notify } from "../../lib/notify";
import { getApiErrorMessage } from "../../store/http";
import type { UserRecord } from "@/store/services/user.api";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/store/services/user.api";
import { resolveImageUrl } from "../../utils/imageUrl";

const fieldClass =
  "w-full h-11 px-3.5 rounded-lg bg-white border border-gray-200 text-[13px] text-[#0B1F3A] outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF]/15 transition-shadow";
const labelClass = "block text-[13px] font-medium text-[#0B1F3A] mb-2";
const PHONE_PATTERN = /^[+]?[1-9]\d{1,14}$/;

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRole(role?: string) {
  if (!role?.trim()) return "—";
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function yesNo(value?: boolean) {
  if (value === undefined) return "—";
  return value ? "Yes" : "No";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-[13px] text-gray-400">{label}</span>
      <span className="text-[13px] font-medium text-[#0B1F3A] text-right">
        {value}
      </span>
    </div>
  );
}

function accountRows(profile: UserRecord) {
  return [
    { label: "Role", value: formatRole(profile.role) },
    { label: "Verified", value: yesNo(profile.isVerified) },
    { label: "Active", value: yesNo(profile.isActive) },
    { label: "Banned", value: yesNo(profile.isBanned) },
    { label: "Joined", value: formatDate(profile.createdAt) },
    { label: "Updated", value: formatDate(profile.updatedAt) },
  ];
}

export default function SettingsPage() {
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    isError: hasProfileError,
    error: profileError,
  } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();

  const profile = profileResponse?.data;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setBirthDate(toDateInput(profile.birthDate));
  }, [profile]);

  const profileImage = resolveImageUrl(profile?.image);
  const profileName = profile?.name?.trim() || "Profile";

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName) {
      notify.error("Name required", "Enter your name.");
      return;
    }
    if (!PHONE_PATTERN.test(trimmedPhone)) {
      notify.error("Invalid phone", "Use a valid phone number, like +8801717171717.");
      return;
    }
    if (!birthDate) {
      notify.error("Birth date required", "Select your birth date.");
      return;
    }

    try {
      await updateProfile({
        name: trimmedName,
        phone: trimmedPhone,
        birthDate: new Date(`${birthDate}T00:00:00.000Z`).toISOString(),
      }).unwrap();
      notify.updated("Profile");
    } catch (updateError) {
      notify.error("Update failed", getApiErrorMessage(updateError));
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
            Settings
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">Your admin account</p>
        </div>
        {profile && (
          <button
            type="button"
            onClick={() => {
              void handleSave();
            }}
            disabled={isUpdatingProfile || isProfileFetching}
            className="h-10 px-5 rounded-lg bg-[#1E90FF] text-white text-[13px] font-semibold hover:bg-[#1878d8] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUpdatingProfile ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {isProfileLoading ? (
        <div className="h-72 rounded-xl bg-white border border-gray-100 animate-pulse" />
      ) : hasProfileError || !profile ? (
        <p className="text-[13px] text-red-500">
          {getApiErrorMessage(profileError, "Could not load profile")}
        </p>
      ) : (
        <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            {profileImage ? (
              <img
                src={profileImage}
                alt=""
                className="w-14 h-14 rounded-full object-cover bg-gray-100 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#1E90FF] text-white text-[16px] font-bold flex items-center justify-center shrink-0">
                {initials(profileName) || "U"}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-[18px] font-bold text-[#0B1F3A] truncate">
                {profileName}
              </h2>
              <p className="text-[13px] text-gray-400 truncate">
                {formatRole(profile.role)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="profile-name">
                Name
              </label>
              <input
                id="profile-name"
                className={fieldClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="profile-phone">
                Phone
              </label>
              <input
                id="profile-phone"
                className={fieldClass}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="max-w-xs">
              <label className={labelClass} htmlFor="profile-birth-date">
                Birth date
              </label>
              <input
                id="profile-birth-date"
                type="date"
                className={fieldClass}
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
              />
            </div>
          </div>

          <div>
            {accountRows(profile).map((row) => (
              <ProfileRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
