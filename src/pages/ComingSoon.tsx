import { useLocation } from "react-router-dom";

const LABELS: Record<string, string> = {
  "/orders": "Orders",
  "/shops": "Shops",
  "/products": "Products",
  "/gift-cards": "Gift Cards",
  "/wallet": "Wallet & Transactions",
  "/users": "Users",
  "/support": "Support",
  "/reports": "Reports & Analytics",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export default function ComingSoon() {
  const { pathname } = useLocation();
  const title = LABELS[pathname] ?? "This page";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm min-h-[320px] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-[18px] font-semibold text-[#0B1F3A] mb-2">{title}</div>
      <p className="text-[14px] text-gray-500 max-w-sm">
        This section is coming soon. Use Dashboard for the live overview.
      </p>
    </div>
  );
}
