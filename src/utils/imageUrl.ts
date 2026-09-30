export function resolveImageUrl(imagePath?: string | null) {
  const trimmedPath = imagePath?.trim() ?? "";
  if (!trimmedPath) return "";
  if (trimmedPath.startsWith("blob:") || trimmedPath.startsWith("data:")) {
    return trimmedPath;
  }

  if (/^https?:\/\//i.test(trimmedPath)) {
    try {
      const imageUrl = new URL(trimmedPath);
      if (imageUrl.pathname.startsWith("/image/")) return imageUrl.pathname;
    } catch {
      return trimmedPath;
    }
    return trimmedPath;
  }

  return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
}
