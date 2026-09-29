import { useEffect, useRef, useState, type ReactNode } from "react";

const ANIM_MS = 320;

/** Nested drawers share one body lock so unlock never races. */
let bodyLockCount = 0;
let savedOverflow = "";
let savedPadding = "";

function lockBody() {
  if (bodyLockCount === 0) {
    savedOverflow = document.body.style.overflow;
    savedPadding = document.body.style.paddingRight;
    const scrollbar =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }
  }
  bodyLockCount += 1;
}

function unlockBody() {
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount === 0) {
    document.body.style.overflow = savedOverflow;
    document.body.style.paddingRight = savedPadding;
  }
}

interface DrawerShellProps {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  widthClass?: string;
  children: ReactNode;
}

/** Smooth right drawer — no layout jump, no stuck overlay. */
export default function DrawerShell({
  open,
  onClose,
  onExited,
  widthClass = "max-w-[440px]",
  children,
}: DrawerShellProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const wasOpen = useRef(false);
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  useEffect(() => {
    let showFrame = 0;
    let hideTimer = 0;

    if (open) {
      wasOpen.current = true;
      setMounted(true);
      showFrame = window.requestAnimationFrame(() => {
        showFrame = window.requestAnimationFrame(() => setVisible(true));
      });
    } else if (wasOpen.current) {
      // Only animate-out if we actually opened before (skip initial mount)
      setVisible(false);
      hideTimer = window.setTimeout(() => {
        setMounted(false);
        wasOpen.current = false;
        onExitedRef.current?.();
      }, ANIM_MS);
    }

    return () => {
      if (showFrame) window.cancelAnimationFrame(showFrame);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    lockBody();
    return () => unlockBody();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${visible ? "" : "pointer-events-none"}`}
      aria-modal="true"
      role="dialog"
    >
      <button
        type="button"
        aria-label="Close overlay"
        tabIndex={visible ? 0 : -1}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 right-0 h-full w-full ${widthClass} bg-white shadow-2xl flex flex-col will-change-transform transition-transform duration-300 ease-out ${
          visible ? "translate-x-0 pointer-events-auto" : "translate-x-full"
        }`}
      >
        {children}
      </aside>
    </div>
  );
}
