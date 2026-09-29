const AUTH_TOKEN_KEY = "demoAuthToken";
const AUTH_USER_KEY = "demoAuthUser";

export const DEMO_CREDENTIALS = {
  email: "admin@gmail.com",
  password: "123123123",
} as const;

export interface DemoAuthUser {
  email: string;
  name: string;
  role: string;
}

const DEMO_USER: DemoAuthUser = {
  email: DEMO_CREDENTIALS.email,
  name: "Admin",
  role: "super_admin",
};

export const isAuthenticated = () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

export const getAuthUser = (): DemoAuthUser | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DemoAuthUser;
  } catch {
    return null;
  }
};

export const loginWithDemoCredentials = (
  email: string,
  password: string,
): DemoAuthUser => {
  if (
    email.trim().toLowerCase() !== DEMO_CREDENTIALS.email ||
    password !== DEMO_CREDENTIALS.password
  ) {
    throw new Error("Invalid email or password. Use the demo credentials.");
  }

  localStorage.setItem(AUTH_TOKEN_KEY, "demo-session-token");
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEMO_USER));
  return DEMO_USER;
};

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};
