export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

export const setToLocalStorage = (key: string, value: string) => {
  if (typeof window === "undefined" || !key) return;
  localStorage.setItem(key, value);
};

export const getFromLocalStorage = (key: string) => {
  if (typeof window === "undefined" || !key) return null;
  return localStorage.getItem(key);
};
