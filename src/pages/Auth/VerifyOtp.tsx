import { useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { AuthBrandLogo } from "./AuthLayout";
import {
  AUTH_ILLUSTRATIONS,
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from "./authStyles";
import { notify } from "../../lib/notify";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "../../store/services/auth.api";
import { getApiErrorMessage } from "../../store/http";
import { readAuthTokens, saveAuthTokens } from "../../auth/session";

const RESEND_SECONDS = 30;

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s} sec`;
}

type OtpLocationState = {
  phone?: string;
  purpose?: "login" | "reset";
  from?: string;
};

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const otpState = (location.state as OtpLocationState | null) ?? {};
  const phone = otpState.phone;
  const [form] = Form.useForm();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtpRequest] = useResendOtpMutation();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  const onFinish = async (values: { otp: string }) => {
    const oneTimeCode = Number(values.otp);
    if (!phone || !Number.isFinite(oneTimeCode)) {
      notify.error("Invalid OTP", "Please enter a valid 6-digit OTP.");
      return;
    }

    await verifyOtp({ phone, oneTimeCode })
      .unwrap()
      .then((res) => {
        const { accessToken, refreshToken } = readAuthTokens(res);
        if (!accessToken) {
          notify.error("Login failed", "Access token was not returned.");
          return;
        }
        saveAuthTokens(accessToken, refreshToken);
        notify.success(
          "Welcome back!",
          res.message || "Phone verify successfully",
        );
        navigate(otpState.from || "/dashboard", { replace: true });
      })
      .catch((err) => {
        notify.error("Invalid OTP", getApiErrorMessage(err));
      });
  };

  const resendOtp = () => {
    if (secondsLeft > 0 || !phone) return;
    void resendOtpRequest({ phone })
      .unwrap()
      .then(() => {
        notify.info("OTP resent", "A new OTP was sent to your phone.");
        setSecondsLeft(RESEND_SECONDS);
      })
      .catch((err) => {
        notify.error("Request failed", getApiErrorMessage(err));
      });
  };

  return (
    <AuthLayout
      illustration={AUTH_ILLUSTRATIONS.otp}
      illustrationAlt="OTP verification illustration"
    >
      <AuthBrandLogo className="mb-8" />

      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#111827] leading-tight">
          Verify OTP
        </h1>
        <p className="text-[14px] text-[#9CA3AF] mt-1">
          {`Enter the code sent to ${phone || "your phone"}`}
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label={<span className={authLabelClass}>OTP</span>}
          name="otp"
          rules={[
            { required: true, message: "Please enter the OTP" },
            {
              pattern: /^\d{6}$/,
              message: "OTP must be 6 digits",
            },
          ]}
          className="mb-6"
          normalize={(value) =>
            String(value ?? "")
              .replace(/\D/g, "")
              .slice(0, 6)
          }
        >
          <Input
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            inputMode="numeric"
            className={authFieldClass}
          />
        </Form.Item>

        <Form.Item className="mb-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className={authPrimaryBtnClass}
          >
            Submit
          </Button>
        </Form.Item>

        <div className="flex items-center justify-center gap-2 text-[13px]">
          <span className="text-[#9CA3AF]">{formatTimer(secondsLeft)}</span>
          <button
            type="button"
            onClick={resendOtp}
            disabled={secondsLeft > 0}
            className={`font-medium ${
              secondsLeft > 0
                ? "text-[#FCA5A5] cursor-not-allowed"
                : "text-[#EF4444] hover:text-[#DC2626]"
            }`}
          >
            Send again!
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/auth/login"
            className="text-[13px] font-medium text-[#1E90FF] hover:text-[#1878d8]"
          >
            Change phone number
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
}
