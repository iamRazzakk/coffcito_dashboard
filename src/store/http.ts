export type ListArgs = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  type?: string;
  filter?: string;
  range?: string;
  category?: string;
};

export type ListMeta = {
  total?: number;
  page?: number;
  limit?: number;
  unread?: number;
  active?: number;
  inactive?: number;
  maintenance?: number;
  suspended?: number;
  pending?: number;
  completed?: number;
  cancelled?: number;
  open?: number;
  resolved?: number;
  redeemed?: number;
  expired?: number;
  outstanding?: number;
  totalValue?: number;
};

export function cleanParams(args?: object) {
  if (!args) return undefined;
  const params: Record<string, string | number | boolean> = {};

  Object.entries(args).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "All" ||
      value === "all"
    ) {
      return;
    }
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      params[key] = value;
    }
  });

  return params;
}

export function readList<T>(payload: unknown): {
  items: T[];
  total: number;
  meta: ListMeta;
} {
  if (Array.isArray(payload)) {
    return {
      items: payload as T[],
      total: payload.length,
      meta: { total: payload.length },
    };
  }

  if (!payload || typeof payload !== "object") {
    return { items: [], total: 0, meta: {} };
  }

  const body = payload as {
    data?: unknown;
    items?: unknown;
    meta?: ListMeta;
  };
  const meta = body.meta ?? {};
  const bucket = body.data ?? body.items;

  if (Array.isArray(bucket)) {
    return {
      items: bucket as T[],
      total: meta.total ?? bucket.length,
      meta,
    };
  }

  if (bucket && typeof bucket === "object") {
    const nested = bucket as { data?: unknown; items?: unknown; meta?: ListMeta };
    const nestedItems = nested.data ?? nested.items;
    if (Array.isArray(nestedItems)) {
      const nestedMeta = nested.meta ?? meta;
      return {
        items: nestedItems as T[],
        total: nestedMeta.total ?? nestedItems.length,
        meta: nestedMeta,
      };
    }
  }

  return { items: [], total: 0, meta };
}

export function readEntity<T>(payload: unknown): T | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  if ("data" in payload) {
    const data = (payload as { data?: T }).data;
    if (data && typeof data === "object" && !Array.isArray(data)) return data;
  }
  return payload as T;
}

export function getApiErrorMessage(err: unknown, fallback = "Request failed") {
  if (typeof err === "object" && err !== null && "data" in err) {
    const data = (err as { data?: { message?: string } | string }).data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && data.message) return data.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function toMultipartBody(
  fields: Record<string, unknown>,
  file?: File | null,
  fileField = "image",
) {
  const body = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (key === fileField || value === undefined || value === null) return;
    if (typeof value === "string" && value.startsWith("blob:")) return;
    if (typeof value === "object") {
      body.append(key, JSON.stringify(value));
      return;
    }
    body.append(key, String(value));
  });

  if (file) body.append(fileField, file);
  return body;
}
