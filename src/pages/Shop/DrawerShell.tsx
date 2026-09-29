import { useEffect, useState, type ReactNode } from "react";

const ANIM_MS = 320;

interface DrawerShellProps {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  widthClass?: string;
  children: ReactNode;
}

/** Smooth right drawer — no layout jump (scrollbar compensated). */
export default function DrawerShell({
  open,
  onClose,
  onExited,
  widthClass = "max-w-[440px]",
  children,
}: DrawerShellProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showFrame = 0;
    let hideTimer = 0;

    if (open) {
      setMounted(true);
      showFrame = window.requestAnimationFrame(() => {
        showFrame = window.requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      hideTimer = window.setTimeout(() => {
        setMounted(false);
        onExited?.();
      }, ANIM_MS);
    }

    return () => {
      if (showFrame) window.cancelAnimationFrame(showFrame);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted) return;

    const scrollbar =
      window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      <button
        type="button"
        aria-label="Close overlay"
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 right-0 h-full w-full ${widthClass} bg-white shadow-2xl flex flex-col will-change-transform transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {children}
      </aside>
    </div>
  );
}
