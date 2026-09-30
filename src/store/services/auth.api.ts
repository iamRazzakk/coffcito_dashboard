import { api } from "../api";

export type AuthTokenResponse = {
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    token?: string;
  };
  accessToken?: string;
  refreshToken?: string;
};

const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<{ message?: string }, { phone: string }>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    forgotPassword: build.mutation<{ message?: string }, { email: string }>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    verifyOtp: build.mutation<
      AuthTokenResponse,
      { phone: string; oneTimeCode: number }
    >({
      query: (data) => ({
        url: "/auth/verify-phone",
        method: "POST",
        body: data,
      }),
    }),
    resendOtp: build.mutation<
      { message?: string },
      { phone?: string; email?: string }
    >({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: build.mutation<
      { message?: string },
      { email?: string; otp?: string; password: string }
    >({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    logoutAll: build.mutation<{ message?: string }, void>({
      query: () => ({
        url: "/auth/logout-all",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
  useLogoutAllMutation,
} = authApi;
