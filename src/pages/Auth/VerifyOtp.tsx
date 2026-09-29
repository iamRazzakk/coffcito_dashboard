import { useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import AuthLayout, { AuthBrandLogo } from "./AuthLayout";
import {
  AUTH_ILLUSTRATIONS,
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from "./authStyles";
import { notify } from "../../lib/notify";

const RESEND_SECONDS = 30;

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s} sec`;
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  const onFinish = (values: { otp: string }) => {
    if (String(values.otp).replace(/\D/g, "").length !== 6) {
      notify.error("Invalid OTP", "Please enter a valid 6-digit OTP.");
      return;
    }
    notify.success("Verified!", "OTP verified successfully.");
    navigate("/reset-password");
  };

  const resendOtp = () => {
    if (secondsLeft > 0) return;
    notify.info("OTP resent", "A new OTP was sent to your email.");
    setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <AuthLayout
      illustration={AUTH_ILLUSTRATIONS.otp}
      illustrationAlt="OTP verification illustration"
    >
      <AuthBrandLogo className="mb-10" />

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
          normalize={(value) => String(value ?? "").replace(/\D/g, "").slice(0, 6)}
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
      </Form>
    </AuthLayout>
  );
}
