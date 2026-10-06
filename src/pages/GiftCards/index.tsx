import { useMemo, useState } from "react";
import { Download, Plus, Search, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import { notify } from "../../lib/notify";
import { useActionSkeleton, usePageBoot } from "../../lib/usePageLoad";
import { exportExcel, todayStamp } from "../../utils/exportExcel";
import CouponsPanel from "./CouponsPanel";

type PageTab = "gift-cards" | "coupons";
type CardStatus = "Available" | "Redeemed" | "Expired";
type StatusFilter = "All" | CardStatus;

type GiftCardRow = {
  id: string;
  code: string;
  value: number;
  balance: number;
  buyerName: string;
  buyerEmail: string;
  recipient: string;
  purchased: string;
  expires: string;
  status: CardStatus;
};

type GenerateForm = {
  value: string;
  quantity: string;
  buyerName: string;
  buyerEmail: string;
  recipient: string;
  expires: string;
  customCode: string;
};

const EMPTY_GENERATE: GenerateForm = {
  value: "500",
  quantity: "1",
  buyerName: "",
  buyerEmail: "",
  recipient: "",
  expires: "Sep 29, 2027",
  customCode: "",
};

const fieldClass =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] outline-none focus:border-[#1E90FF]/40";
const labelClass = "block text-[12px] font-medium text-gray-600 mb-1.5";

const MOCK_CARDS: GiftCardRow[] = [
  {
    id: "GC-1001",
    code: "CF-GIFT-8A2F",
    value: 500,
    balance: 500,
    buyerName: "Maria Santos",
    buyerEmail: "maria@email.com",
    recipient: "Ana Cruz",
    purchased: "Aug 12, 2026",
    expires: "Aug 12, 2027",
    status: "Available",
  },
  {
    id: "GC-1002",
    code: "CF-GIFT-91BK",
    value: 1000,
    balance: 240,
    buyerName: "James Reyes",
    buyerEmail: "james@email.com",
    recipient: "James Reyes",
    purchased: "Jul 28, 2026",
    expires: "Jul 28, 2027",
    status: "Available",
  },
  {
    id: "GC-1003",
    code: "CF-GIFT-33QX",
    value: 250,
    balance: 0,
    buyerName: "Grace Dela Torre",
    buyerEmail: "grace@email.com",
    recipient: "Carlo Navarro",
    purchased: "Jun 02, 2026",
    expires: "Jun 02, 2027",
    status: "Redeemed",
  },
  {
    id: "GC-1004",
    code: "CF-GIFT-77LM",
    value: 750,
    balance: 750,
    buyerName: "Diego Lim",
    buyerEmail: "diego@email.com",
    recipient: "Sofia Mendoza",
    purchased: "May 15, 2026",
    expires: "May 15, 2027",
    status: "Available",
  },
  {
    id: "GC-1005",
    code: "CF-GIFT-12YZ",
    value: 500,
    balance: 0,
    buyerName: "Ana Cruz",
    buyerEmail: "ana.cruz@email.com",
    recipient: "Ana Cruz",
    purchased: "Jan 10, 2025",
    expires: "Jan 10, 2026",
    status: "Expired",
  },
  {
    id: "GC-1006",
    code: "CF-GIFT-55HP",
    value: 1500,
    balance: 820,
    buyerName: "Carlo Navarro",
    buyerEmail: "carlo.n@email.com",
    recipient: "Elena Garcia",
    purchased: "Aug 01, 2026",
    expires: "Aug 01, 2027",
    status: "Available",
  },
  {
    id: "GC-1007",
    code: "CF-GIFT-09TR",
    value: 300,
    balance: 0,
    buyerName: "Sofia Mendoza",
    buyerEmail: "sofia.m@email.com",
    recipient: "Miguel Torres",
    purchased: "Mar 20, 2026",
    expires: "Mar 20, 2027",
    status: "Redeemed",
  },
  {
    id: "GC-1008",
    code: "CF-GIFT-44WN",
    value: 1200,
    balance: 0,
    buyerName: "Elena Garcia",
    buyerEmail: "elena.g@email.com",
    recipient: "Elena Garcia",
    purchased: "Feb 08, 2025",
    expires: "Feb 08, 2026",
    status: "Expired",
  },
];

const STATUS_STYLE: Record<CardStatus, string> = {
  Available: "bg-[#E8F3FF] text-[#1E90FF]",
  Redeemed: "bg-emerald-50 text-emerald-600",
  Expired: "bg-gray-100 text-gray-500",
};

const VALUE_PRESETS = [250, 500, 1000, 1500, 2000];

function peso(n: number) {
  return `₱${n.toLocaleString()}`;
}

function randomCode() {
  return `CF-GIFT-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function GiftCardsPanel() {
  const [cards, setCards] = useState(MOCK_CARDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<GenerateForm>(EMPTY_GENERATE);
  const isBooting = usePageBoot();
  const { isRefreshing, runWithSkeleton } = useActionSkeleton();

  const stats = useMemo(() => {
    const totalIssued = cards.length;
    const redeemed = cards.filter((c) => c.status === "Redeemed").length;
    const outstanding = cards
      .filter((c) => c.status === "Available")
      .reduce((s, c) => s + c.balance, 0);
    const totalValue = cards.reduce((s, c) => s + c.value, 0);
    const rate = totalIssued
      ? Math.round((redeemed / totalIssued) * 100)
      : 0;
    return { totalIssued, redeemed, outstanding, totalValue, rate };
  }, [cards]);

  const filtered = cards.filter((card) => {
    const matchStatus =
      statusFilter === "All" || card.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      card.code.toLowerCase().includes(q) ||
      card.buyerName.toLowerCase().includes(q) ||
      card.buyerEmail.toLowerCase().includes(q) ||
      card.id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const openGenerate = () => {
    setForm(EMPTY_GENERATE);
    setDrawerOpen(true);
  };

  const handleGenerateSubmit = () => {
    const value = Number(form.value) || 0;
    const quantity = Math.min(20, Math.max(1, Number(form.quantity) || 1));
    if (value <= 0) {
      notify.error("Invalid value", "Gift card value must be greater than 0.");
      return;
    }

    const custom = form.customCode.trim().toUpperCase().replace(/\s+/g, "");
    if (custom && quantity > 1) {
      notify.error(
        "Custom code limit",
        "Custom code can only be used when generating 1 card.",
      );
      return;
    }
    if (custom && cards.some((c) => c.code === custom)) {
      notify.error("Duplicate code", `${custom} already exists.`);
      return;
    }

    const buyerName = form.buyerName.trim() || "Admin Generated";
    const buyerEmail = form.buyerEmail.trim() || "admin@coffecito.ph";
    const recipient = form.recipient.trim() || "—";
    const expires = form.expires.trim() || "Sep 29, 2027";
    const purchased = "Sep 29, 2026";

    const created: GiftCardRow[] = Array.from({ length: quantity }, (_, i) => ({
      id: `GC-${1000 + cards.length + i + 1}`,
      code: quantity === 1 && custom ? custom : randomCode(),
      value,
      balance: value,
      buyerName,
      buyerEmail,
      recipient,
      purchased,
      expires,
      status: "Available" as const,
    }));

    setCards((prev) => [...created, ...prev]);
    setDrawerOpen(false);
    setForm(EMPTY_GENERATE);
    notify.created(
      quantity === 1
        ? `Gift card ${created[0].code}`
        : `${quantity} gift cards`,
    );
  };

  const handleExport = async () => {
    if (filtered.length === 0) {
      notify.warning("Nothing to export", "No gift cards match the current filters.");
      return;
    }
    try {
      const fileName = await exportExcel(`coffcito-gift-cards-${todayStamp()}`, [
        {
          name: "Gift Cards",
          rows: [
            ["ID", "Code", "Value (₱)", "Balance (₱)", "Buyer", "Buyer Email", "Recipient", "Purchased", "Expires", "Status"],
            ...filtered.map((card) => [
              card.id,
              card.code,
              card.value,
              card.balance,
              card.buyerName,
              card.buyerEmail,
              card.recipient,
              card.purchased,
              card.expires,
              card.status,
            ]),
          ],
        },
      ]);
      notify.success("Gift cards downloaded", fileName);
    } catch {
      notify.error("Export failed", "Could not create Excel file.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B1F3A] leading-tight">
            Gift Card Codes
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">
            Issue, track and manage all gift card codes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleExport()}
            className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            type="button"
            onClick={openGenerate}
            className="h-10 px-4 rounded-lg bg-[#1E90FF] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#1878d8]"
          >
            <Plus className="w-4 h-4" />
            Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Issued",
            value: String(stats.totalIssued),
            sub: "All time",
            color: "text-[#1E90FF]",
          },
          {
            label: "Redeemed",
            value: String(stats.redeemed),
            sub: `${stats.rate}% redemption rate`,
            color: "text-emerald-600",
          },
          {
            label: "Outstanding Balance",
            value: peso(stats.outstanding),
            sub: "Across active cards",
            color: "text-[#1E90FF]",
          },
          {
            label: "Total Value Issued",
            value: peso(stats.totalValue),
            sub: "Lifetime",
            color: "text-[#1E90FF]",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm h-[108px] flex flex-col justify-center"
          >
            {isBooting ? (
              <>
                <div className="h-7 w-16 rounded bg-gray-200 animate-pulse mb-2" />
                <div className="h-3 w-24 rounded bg-gray-100 animate-pulse mb-1" />
                <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
              </>
            ) : (
              <>
                <div className={`text-[26px] font-bold leading-none ${card.color}`}>
                  {card.value}
                </div>
                <div className="text-[13px] font-semibold text-[#0B1F3A] mt-2">
                  {card.label}
                </div>
                <div className="text-[12px] text-gray-400 mt-0.5">{card.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-[240px] shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or buyer..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] outline-none focus:border-[#1E90FF]/40"
            />
          </div>
          <div className="flex gap-2 flex-wrap sm:justify-end">
            {(["All", "Available", "Redeemed", "Expired"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === statusFilter) return;
                  runWithSkeleton(() => setStatusFilter(key));
                }}
                className={`h-9 px-3.5 rounded-full text-[12px] font-medium ${
                  statusFilter === key
                    ? "bg-[#1E90FF] text-white"
                    : "border border-gray-200 text-gray-600"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1100px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-y border-gray-100 bg-gray-50/60 h-11">
                <th className="px-4 font-medium">ID</th>
                <th className="px-4 font-medium">Code</th>
                <th className="px-4 font-medium">Value</th>
                <th className="px-4 font-medium">Balance</th>
                <th className="px-4 font-medium">Buyer</th>
                <th className="px-4 font-medium">Recipient</th>
                <th className="px-4 font-medium">Purchased</th>
                <th className="px-4 font-medium">Expires</th>
                <th className="px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isBooting || isRefreshing
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="h-[64px] border-b border-gray-50">
                      <td colSpan={9} className="px-4">
                        <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((card) => (
                    <tr
                      key={card.id}
                      className="h-[64px] border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <td className="px-4 text-[13px] font-semibold text-[#1E90FF]">
                        {card.id}
                      </td>
                      <td className="px-4">
                        <span className="inline-flex h-7 px-2.5 rounded-md bg-gray-100 text-[12px] font-mono font-semibold text-[#0B1F3A] items-center">
                          {card.code}
                        </span>
                      </td>
                      <td className="px-4 text-[13px] font-semibold text-[#0B1F3A]">
                        {peso(card.value)}
                      </td>
                      <td
                        className={`px-4 text-[13px] font-semibold ${
                          card.balance > 0 ? "text-emerald-600" : "text-gray-400"
                        }`}
                      >
                        {peso(card.balance)}
                      </td>
                      <td className="px-4">
                        <div className="text-[13px] font-semibold text-[#0B1F3A]">
                          {card.buyerName}
                        </div>
                        <div className="text-[12px] text-gray-400">
                          {card.buyerEmail}
                        </div>
                      </td>
                      <td className="px-4 text-[13px] text-gray-600">
                        {card.recipient}
                      </td>
                      <td className="px-4 text-[12px] text-gray-500">
                        {card.purchased}
                      </td>
                      <td className="px-4 text-[12px] text-gray-500">
                        {card.expires}
                      </td>
                      <td className="px-4">
                        <span
                          className={`inline-flex h-6 px-2.5 rounded-full text-[11px] font-semibold items-center ${STATUS_STYLE[card.status]}`}
                        >
                          {card.status}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <DrawerShell
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onExited={() => setForm(EMPTY_GENERATE)}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-[18px] font-bold text-[#0B1F3A]">
              Generate Gift Card
            </h3>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Set value, buyer details and expiry
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
          <div>
            <label className={labelClass}>Card Value (₱)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {VALUE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, value: String(preset) }))
                  }
                  className={`h-8 px-3 rounded-lg text-[12px] font-semibold border ${
                    form.value === String(preset)
                      ? "bg-[#E8F3FF] border-[#1E90FF] text-[#1E90FF]"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  ₱{preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Quantity</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Expires</label>
              <input
                value={form.expires}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expires: e.target.value }))
                }
                placeholder="e.g. Sep 29, 2027"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Custom Code{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              value={form.customCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, customCode: e.target.value }))
              }
              placeholder="Leave blank to auto-generate"
              className={`${fieldClass} uppercase font-mono`}
            />
          </div>

          <div>
            <label className={labelClass}>Buyer Name</label>
            <input
              value={form.buyerName}
              onChange={(e) =>
                setForm((f) => ({ ...f, buyerName: e.target.value }))
              }
              placeholder="e.g. Maria Santos"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Buyer Email</label>
            <input
              type="email"
              value={form.buyerEmail}
              onChange={(e) =>
                setForm((f) => ({ ...f, buyerEmail: e.target.value }))
              }
              placeholder="e.g. maria@email.com"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Recipient</label>
            <input
              value={form.recipient}
              onChange={(e) =>
                setForm((f) => ({ ...f, recipient: e.target.value }))
              }
              placeholder="e.g. Ana Cruz"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 space-y-2">
          <button
            type="button"
            onClick={handleGenerateSubmit}
            className="w-full h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8]"
          >
            Generate Card
            {Number(form.quantity) > 1 ? `s (${form.quantity})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="w-full h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700"
          >
            Cancel
          </button>
        </div>
      </DrawerShell>
    </div>
  );
}

export default function GiftCardsPage() {
  const [tab, setTab] = useState<PageTab>("gift-cards");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
          Gift Cards & Coupons
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Manage gift cards and promotional coupon codes
        </p>
      </div>

      <div className="flex gap-0 border-b border-gray-200">
        {(
          [
            { key: "gift-cards" as const, label: "Gift Cards" },
            { key: "coupons" as const, label: "Coupons" },
          ] as const
        ).map((item) => (
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

      {tab === "gift-cards" ? <GiftCardsPanel /> : <CouponsPanel />}
    </div>
  );
}
