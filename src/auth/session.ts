import {
  ACCESS_TOKEN_KEY,
  getFromLocalStorage,
  REFRESH_TOKEN_KEY,
  setToLocalStorage,
} from "../utils/local-storage";

export const isAuthenticated = () =>
  Boolean(getFromLocalStorage(ACCESS_TOKEN_KEY));

export const saveAuthTokens = (accessToken: string, refreshToken?: string) => {
  setToLocalStorage(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) setToLocalStorage(REFRESH_TOKEN_KEY, refreshToken);
};

export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export function readAuthTokens(payload: unknown) {
  const source = unwrapTokenPayload(payload);
  const accessToken = readString(source, ["accessToken", "access_token", "token"]);
  const refreshToken = readString(source, ["refreshToken", "refresh_token"]);
  return { accessToken, refreshToken };
}

function unwrapTokenPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const body = payload as Record<string, unknown>;
  const data = body.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const nested = data as Record<string, unknown>;
    if (nested.data && typeof nested.data === "object" && !Array.isArray(nested.data)) {
      return nested.data as Record<string, unknown>;
    }
    return nested;
  }
  return body;
}

function readString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}
