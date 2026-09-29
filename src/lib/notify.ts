export type AlertType = "success" | "error" | "warning" | "info" | "confirm" | "delete";

export interface AlertOptions {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  /** Auto-close delay in ms (toasts only). Confirm/delete wait for user. */
  timer?: number;
  showLogo?: boolean;
}

export interface AlertRequest extends AlertOptions {
  id: string;
  type: AlertType;
  resolve?: (value: boolean) => void;
}

type Listener = (alert: AlertRequest | null) => void;

let current: AlertRequest | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l(current));
}

function uid() {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function show(type: AlertType, options: AlertOptions): Promise<boolean> {
  return new Promise((resolve) => {
    // Close any open alert first
    if (current?.resolve) current.resolve(false);

    const needsConfirm = type === "confirm" || type === "delete";
    current = {
      id: uid(),
      type,
      title: options.title,
      text: options.text,
      confirmText:
        options.confirmText ??
        (type === "delete" ? "Yes, delete" : needsConfirm ? "Confirm" : "OK"),
      cancelText: options.cancelText ?? "Cancel",
      timer: needsConfirm ? undefined : (options.timer ?? 2200),
      showLogo: options.showLogo ?? true,
      resolve: needsConfirm ? resolve : undefined,
    };

    emit();

    if (!needsConfirm) {
      resolve(true);
    }
  });
}

export function subscribeAlert(listener: Listener) {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}

export function closeAlert(result = false) {
  const alert = current;
  current = null;
  emit();
  alert?.resolve?.(result);
}

export function confirmAlert(result = true) {
  closeAlert(result);
}

/** Global SweetAlert-style notifier */
export const notify = {
  success: (title: string, text?: string, opts?: Partial<AlertOptions>) =>
    show("success", { title, text, ...opts }),

  error: (title: string, text?: string, opts?: Partial<AlertOptions>) =>
    show("error", { title, text, ...opts }),

  warning: (title: string, text?: string, opts?: Partial<AlertOptions>) =>
    show("warning", { title, text, ...opts }),

  info: (title: string, text?: string, opts?: Partial<AlertOptions>) =>
    show("info", { title, text, ...opts }),

  /** Confirm dialog — resolves true/false */
  confirm: (title: string, text?: string, opts?: Partial<AlertOptions>) =>
    show("confirm", { title, text, ...opts }),

  /** Delete warning dialog — resolves true if confirmed */
  delete: (title = "Are you sure?", text = "This action cannot be undone.", opts?: Partial<AlertOptions>) =>
    show("delete", { title, text, confirmText: "Yes, delete", ...opts }),

  /** Create success shorthand */
  created: (entity = "Item") =>
    show("success", { title: "Created!", text: `${entity} created successfully.` }),

  /** Update success shorthand */
  updated: (entity = "Item") =>
    show("success", { title: "Updated!", text: `${entity} updated successfully.` }),

  /** Deleted success shorthand (after confirm) */
  deleted: (entity = "Item") =>
    show("success", { title: "Deleted!", text: `${entity} has been deleted.` }),
};
