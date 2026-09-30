import { Form, Input, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { AuthBrandLogo } from "./AuthLayout";
import {
  AUTH_ILLUSTRATIONS,
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from "./authStyles";
import { notify } from "../../lib/notify";
import { useLoginMutation } from "../../store/services/auth.api";
import { getApiErrorMessage } from "../../store/http";

interface LoginFormValues {
  phone: string;
}

function toApiPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880")) return `+${digits}`;
  if (digits.startsWith("0")) return `+88${digits}`;
  return `+${digits}`;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();

  const onFinish = async ({ phone }: LoginFormValues) => {
    const normalizedPhone = toApiPhone(phone);
    const redirectPath =
      (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname ?? "/dashboard";

    await login({ phone: normalizedPhone })
      .unwrap()
      .then(() => {
        notify.success("OTP sent", "Enter the code sent to your phone.");
        navigate("/verify-otp", {
          state: { phone: normalizedPhone, purpose: "login", from: redirectPath },
        });
      })
      .catch((err) => {
        notify.error("Request failed", getApiErrorMessage(err));
      });
  };

  return (
    <AuthLayout
      illustration={AUTH_ILLUSTRATIONS.login}
      illustrationAlt="Login illustration"
    >
      <AuthBrandLogo className="mb-8" />

      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#111827] leading-tight">
          Login
        </h1>
        <p className="text-[14px] text-[#9CA3AF] mt-1">
          Enter your phone number to receive an OTP
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label={<span className={authLabelClass}>Phone number</span>}
          name="phone"
          rules={[
            { required: true, message: "Please enter your phone number" },
            {
              pattern: /^[0-9+\s-]{10,15}$/,
              message: "Please enter a valid phone number",
            },
          ]}
          className="mb-6"
          normalize={(value) => String(value ?? "").replace(/[^\d+\s-]/g, "")}
        >
          <Input
            placeholder="01XXXXXXXXX"
            inputMode="tel"
            className={authFieldClass}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className={authPrimaryBtnClass}
          >
            Send OTP
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
}
