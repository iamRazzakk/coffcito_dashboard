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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = (values: { email: string }) => {
    notify.success("Code sent!", "Verification code sent to your email.");
    navigate("/verify-otp", { state: { email: values.email } });
  };

  return (
    <AuthLayout
      illustration={`${AUTH_ILLUSTRATIONS.forgot}?v=3`}
      illustrationAlt="Forgot password illustration"
    >
      <AuthBrandLogo className="mb-10" />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="auth-forgot-form"
      >
        <Form.Item
          label={<span className={authLabelClass}>Email</span>}
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
          className="mb-5"
        >
          <Input placeholder="Enter your email" className={authFieldClass} />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            className={authPrimaryBtnClass}
          >
            Send OTP
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
}
