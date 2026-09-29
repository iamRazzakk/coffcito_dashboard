import { Form, Input, Button } from "antd";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthLayout, { AuthBrandLogo } from "./AuthLayout";
import {
  AUTH_ILLUSTRATIONS,
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from "./authStyles";
import { toast } from "sonner";
import { DEMO_CREDENTIALS, loginWithDemoCredentials } from "../../auth/session";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const onFinish = ({ email, password }: LoginFormValues) => {
    try {
      loginWithDemoCredentials(email, password);

      const redirectPath =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? "/dashboard";

      toast.success("Successfully logged in!");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please check your credentials.",
      );
    }
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
          Login to access your account
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{
          email: DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password,
        }}
      >
        <Form.Item
          label={<span className={authLabelClass}>Email</span>}
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
          className="mb-4"
        >
          <Input placeholder="Enter your email" className={authFieldClass} />
        </Form.Item>

        <Form.Item
          label={<span className={authLabelClass}>Password</span>}
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
          className="mb-1"
        >
          <Input.Password
            placeholder="Enter your password"
            className={authFieldClass}
          />
        </Form.Item>

        <div className="flex justify-end mb-6">
          <Link
            to="/forgot-password"
            className="text-[13px] font-medium text-[#EF4444] hover:text-[#DC2626]"
          >
            Forgot Password?
          </Link>
        </div>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            className={authPrimaryBtnClass}
          >
            Sign in
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
}
