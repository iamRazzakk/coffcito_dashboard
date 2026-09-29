export const resolveMediaUrl = (path: unknown): string => {
  if (!path) {
    return "";
  }

  if (typeof path === "object") {
    const record = path as Record<string, unknown>;
    const nested =
      record.url ?? record.path ?? record.key ?? record.file ?? record.location;

    if (typeof nested === "string") {
      return resolveMediaUrl(nested);
    }

    return "";
  }

  const value = String(path).trim();
  if (!value) {
    return "";
  }

  // Absolute URLs and blob/data URLs are returned as-is.
  if (/^(https?:|blob:|data:)/i.test(value)) {
    return value;
  }

  // Relative paths are returned unchanged (or with a leading slash).
  return value.startsWith("/") ? value : `/${value}`;
};

export const normalizeMediaList = (content: unknown): string[] => {
  if (!content) {
    return [];
  }

  if (typeof content === "string") {
    const resolved = resolveMediaUrl(content);
    return resolved ? [resolved] : [];
  }

  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .flatMap((item) => {
      if (Array.isArray(item)) {
        return normalizeMediaList(item);
      }

      const resolved = resolveMediaUrl(item);
      return resolved ? [resolved] : [];
    })
    .filter(Boolean);
};
