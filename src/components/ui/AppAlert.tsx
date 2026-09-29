import { useEffect, useState } from "react";
import { Check, Info, X, AlertTriangle } from "lucide-react";
import {
  closeAlert,
  confirmAlert,
  subscribeAlert,
  type AlertRequest,
  type AlertType,
} from "../../lib/notify";

const THEME: Record<
  AlertType,
  { ring: string; iconBg: string; iconColor: string; btn: string }
> = {
  success: {
    ring: "ring-[#E8F3FF]",
    iconBg: "bg-[#E8F3FF]",
    iconColor: "text-[#1E90FF]",
    btn: "bg-[#1E90FF] hover:bg-[#1878d8]",
  },
  error: {
    ring: "ring-red-100",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    btn: "bg-red-500 hover:bg-red-600",
  },
  warning: {
    ring: "ring-amber-100",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    btn: "bg-amber-500 hover:bg-amber-600",
  },
  info: {
    ring: "ring-[#E8F3FF]",
    iconBg: "bg-[#E8F3FF]",
    iconColor: "text-[#1E90FF]",
    btn: "bg-[#1E90FF] hover:bg-[#1878d8]",
  },
  confirm: {
    ring: "ring-[#E8F3FF]",
    iconBg: "bg-[#E8F3FF]",
    iconColor: "text-[#1E90FF]",
    btn: "bg-[#1E90FF] hover:bg-[#1878d8]",
  },
  delete: {
    ring: "ring-red-100",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    btn: "bg-red-500 hover:bg-red-600",
  },
};

function AlertIcon({ type }: { type: AlertType }) {
  const t = THEME[type];
  const common = `w-16 h-16 rounded-full ${t.iconBg} ${t.iconColor} flex items-center justify-center ring-8 ${t.ring} app-alert-pop`;

  if (type === "success") {
    return (
      <div className={common}>
        <Check className="w-8 h-8" strokeWidth={2.5} />
      </div>
    );
  }
  if (type === "error" || type === "delete") {
    return (
      <div className={common}>
        <X className="w-8 h-8" strokeWidth={2.5} />
      </div>
    );
  }
  if (type === "warning") {
    return (
      <div className={common}>
        <AlertTriangle className="w-8 h-8" strokeWidth={2.5} />
      </div>
    );
  }
  return (
    <div className={common}>
      <Info className="w-8 h-8" strokeWidth={2.5} />
    </div>
  );
}

export default function AppAlert() {
  const [alert, setAlert] = useState<AlertRequest | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeAlert(setAlert), []);

  useEffect(() => {
    if (!alert) {
      setVisible(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => setVisible(true));
    let timer = 0;

    if (alert.timer) {
      timer = window.setTimeout(() => {
        setVisible(false);
        window.setTimeout(() => closeAlert(true), 220);
      }, alert.timer);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
    };
  }, [alert]);

  useEffect(() => {
    if (!alert) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVisible(false);
        window.setTimeout(() => closeAlert(false), 220);
      }
    };
    window.addEventListener("keydown", onKey);

    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [alert]);

  if (!alert) return null;

  const needsConfirm = alert.type === "confirm" || alert.type === "delete";
  const theme = THEME[alert.type];

  const dismiss = (result: boolean) => {
    setVisible(false);
    window.setTimeout(() => {
      if (result) confirmAlert(true);
      else closeAlert(false);
    }, 220);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close alert"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => dismiss(false)}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        className={`relative w-full max-w-[380px] bg-white rounded-2xl shadow-2xl px-6 pt-7 pb-5 text-center transition-all duration-200 ease-out ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 translate-y-3"
        }`}
      >
        {alert.showLogo !== false && (
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="Coffecito"
              className="h-14 w-auto object-contain app-alert-logo"
            />
          </div>
        )}

        <div className="flex justify-center mb-4">
          <AlertIcon type={alert.type} />
        </div>

        <h3 className="text-[18px] font-bold text-[#0B1F3A] leading-snug">
          {alert.title}
        </h3>
        {alert.text ? (
          <p className="mt-2 text-[13px] text-gray-500 leading-relaxed">
            {alert.text}
          </p>
        ) : null}

        <div className={`mt-5 flex ${needsConfirm ? "gap-2" : ""}`}>
          {needsConfirm && (
            <button
              type="button"
              onClick={() => dismiss(false)}
              className="flex-1 h-11 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {alert.cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={() => dismiss(true)}
            className={`${needsConfirm ? "flex-1" : "w-full"} h-11 rounded-xl text-white text-[13px] font-semibold transition-colors ${theme.btn}`}
          >
            {alert.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
