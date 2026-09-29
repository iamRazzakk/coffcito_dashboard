import { useCallback, useEffect, useRef, useState } from "react";

/** First paint skeleton — keep short so pages feel snappy */
export const PAGE_BOOT_MS = 320;
/** Filter / pagination skeleton */
export const PAGE_ACTION_MS = 280;

/** Simulates first data fetch; flips `isBooting` off after `ms`. */
export function usePageBoot(ms = PAGE_BOOT_MS) {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timerId = window.setTimeout(() => setIsBooting(false), ms);
    return () => window.clearTimeout(timerId);
  }, [ms]);

  return isBooting;
}

/**
 * Runs an action behind a short table/grid skeleton.
 * Clears any pending timer on unmount.
 */
export function useActionSkeleton(ms = PAGE_ACTION_MS) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const runWithSkeleton = useCallback(
    (action: () => void) => {
      window.clearTimeout(timerRef.current);
      setIsRefreshing(true);
      action();
      timerRef.current = window.setTimeout(() => setIsRefreshing(false), ms);
    },
    [ms],
  );

  return { isRefreshing, runWithSkeleton };
}
