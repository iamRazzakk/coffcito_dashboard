import { useState } from "react";
import { ChevronDown, Upload } from "lucide-react";
import { notify } from "../../lib/notify";
import { usePageBoot } from "../../lib/usePageLoad";

type SettingsTab =
  | "general"
  | "admins"
  | "notifications"
  | "payment"
  | "security"
  | "integrations";

const TABS: { key: SettingsTab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "admins", label: "Admin Users" },
  { key: "notifications", label: "Notifications" },
  { key: "payment", label: "Payment & Wallet" },
  { key: "security", label: "Security" },
  { key: "integrations", label: "Integrations" },
];

const fieldClass =
  "w-full h-11 px-3.5 rounded-lg bg-white border border-gray-200 text-[13px] text-[#0B1F3A] outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF]/15 transition-shadow";
const labelClass = "block text-[13px] font-medium text-[#0B1F3A] mb-2";

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <select
          className={`${fieldClass} appearance-none pr-9`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-100 last:border-0">
      <div>
        <div className="text-[13px] font-semibold text-[#0B1F3A]">{label}</div>
        <div className="text-[12px] text-gray-400 mt-0.5">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${
          value ? "bg-[#1E90FF]" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("general");
  const [appName, setAppName] = useState("COFFECITO");
  const [supportEmail, setSupportEmail] = useState("support@coffecito.ph");
  const [timezone, setTimezone] = useState("Asia/Manila (PHT)");
  const [currency, setCurrency] = useState("Philippine Peso (₱)");
  const [language, setLanguage] = useState("English");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [minTopUp, setMinTopUp] = useState("50");
  const [walletEnabled, setWalletEnabled] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const isBooting = usePageBoot(200);

  const handleSave = () => {
    notify.success("Settings saved", "Your preferences were updated.");
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
            Settings
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Configure your COFFECITO admin panel preferences
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="h-10 px-5 rounded-lg bg-[#1E90FF] text-white text-[13px] font-semibold hover:bg-[#1878d8] shadow-sm"
        >
          Save Changes
        </button>
      </div>

      <div className="flex gap-0 overflow-x-auto border-b border-gray-200">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`h-11 px-4 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === item.key
                ? "border-[#1E90FF] text-[#1E90FF]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isBooting ? (
        <div className="space-y-4">
          <div className="h-72 rounded-xl bg-white border border-gray-100 animate-pulse" />
          <div className="h-36 rounded-xl bg-white border border-gray-100 animate-pulse" />
        </div>
      ) : (
        <>
          {tab === "general" && (
            <div className="space-y-4">
              <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-[15px] font-semibold text-[#0B1F3A] mb-5">
                  Application Info
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>App Name</label>
                    <input
                      className={fieldClass}
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Support Email</label>
                    <input
                      className={fieldClass}
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <SelectField
                      label="Timezone"
                      value={timezone}
                      onChange={setTimezone}
                      options={[
                        "Asia/Manila (PHT)",
                        "UTC",
                        "Asia/Singapore (SGT)",
                      ]}
                    />
                    <SelectField
                      label="Default Currency"
                      value={currency}
                      onChange={setCurrency}
                      options={["Philippine Peso (₱)", "US Dollar ($)"]}
                    />
                    <SelectField
                      label="Language"
                      value={language}
                      onChange={setLanguage}
                      options={["English", "Filipino"]}
                    />
                    <SelectField
                      label="Date Format"
                      value={dateFormat}
                      onChange={setDateFormat}
                      options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-[15px] font-semibold text-[#0B1F3A]">
                  Branding
                </h2>
                <p className="text-[12px] text-gray-400 mt-1 mb-4">
                  Customize the look of your admin panel
                </p>

                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#1E90FF]/20 bg-[#E8F3FF]/50 p-4">
                  <div className="w-14 h-14 rounded-xl bg-[#1E90FF] flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src="/logo.png"
                      alt="Coffecito"
                      className="h-10 w-auto object-contain brightness-0 invert"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold text-[#0B1F3A] tracking-wide">
                      COFFECITO
                    </div>
                    <div className="text-[12px] text-gray-500 mt-0.5">
                      Admin Panel v2.1.0
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      notify.info(
                        "Upload ready",
                        "Logo upload can be wired to storage.",
                      )
                    }
                    className="h-10 px-4 rounded-lg border border-[#1E90FF] bg-white text-[#1E90FF] text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#E8F3FF]"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </button>
                </div>
              </section>
            </div>
          )}

          {tab === "admins" && (
            <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h2 className="text-[15px] font-semibold text-[#0B1F3A]">
                  Admin Users
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    notify.info("Invite admin", "Invite flow can be connected later.")
                  }
                  className="h-9 px-3.5 rounded-lg bg-[#1E90FF] text-white text-[12px] font-semibold"
                >
                  + Invite
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  {
                    name: "Alex O'Brien",
                    role: "Super Admin",
                    email: "alex@coffecito.ph",
                    initials: "AO",
                  },
                  {
                    name: "Nina Cruz",
                    role: "Operations",
                    email: "nina@coffecito.ph",
                    initials: "NC",
                  },
                  {
                    name: "Mark Villanueva",
                    role: "Support Lead",
                    email: "mark@coffecito.ph",
                    initials: "MV",
                  },
                ].map((admin) => (
                  <div
                    key={admin.email}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#1E90FF] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                        {admin.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-[#0B1F3A]">
                          {admin.name}
                        </div>
                        <div className="text-[12px] text-gray-400 truncate">
                          {admin.email} · {admin.role}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "notifications" && (
            <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-[15px] font-semibold text-[#0B1F3A] mb-2">
                Notification Preferences
              </h2>
              <p className="text-[12px] text-gray-400 mb-3">
                Choose how admins get alerted about platform activity
              </p>
              <ToggleRow
                label="Email alerts"
                desc="Receive important updates by email"
                value={emailAlerts}
                onChange={setEmailAlerts}
              />
              <ToggleRow
                label="Push alerts"
                desc="Show unread badge in the admin header"
                value={pushAlerts}
                onChange={setPushAlerts}
              />
              <ToggleRow
                label="Order alerts"
                desc="Notify on high-value or failed orders"
                value={orderAlerts}
                onChange={setOrderAlerts}
              />
            </section>
          )}

          {tab === "payment" && (
            <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="text-[15px] font-semibold text-[#0B1F3A]">
                Payment & Wallet
              </h2>
              <ToggleRow
                label="Enable wallet payments"
                desc="Allow customers to pay using wallet balance"
                value={walletEnabled}
                onChange={setWalletEnabled}
              />
              <div className="max-w-xs pt-2">
                <label className={labelClass}>Minimum top-up (₱)</label>
                <input
                  className={fieldClass}
                  value={minTopUp}
                  onChange={(e) => setMinTopUp(e.target.value)}
                />
              </div>
            </section>
          )}

          {tab === "security" && (
            <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="text-[15px] font-semibold text-[#0B1F3A]">Security</h2>
              <ToggleRow
                label="Two-factor authentication"
                desc="Require OTP for admin sign-in"
                value={twoFactor}
                onChange={setTwoFactor}
              />
              <button
                type="button"
                onClick={() =>
                  notify.warning(
                    "Reset sessions?",
                    "All admins will need to sign in again.",
                  )
                }
                className="h-10 px-4 rounded-lg border border-red-200 text-red-500 text-[13px] font-semibold hover:bg-red-50"
              >
                Sign out all sessions
              </button>
            </section>
          )}

          {tab === "integrations" && (
            <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-[15px] font-semibold text-[#0B1F3A] mb-1">
                Integrations
              </h2>
              <p className="text-[12px] text-gray-400 mb-5">
                Connect payment and messaging services
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["GCash", "PayMaya", "Stripe", "Slack Alerts"].map((name) => (
                  <div
                    key={name}
                    className="rounded-xl border border-gray-100 px-4 py-4 flex items-center justify-between bg-gray-50/50"
                  >
                    <div className="text-[13px] font-semibold text-[#0B1F3A]">
                      {name}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        notify.info(
                          name,
                          "Integration setup can be connected later.",
                        )
                      }
                      className="h-8 px-3 rounded-lg border border-[#1E90FF] bg-white text-[#1E90FF] text-[12px] font-semibold"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
