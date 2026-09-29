import { useState } from "react";
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [success, setSuccess] = useState(false);

  const onFinish = () => {
    notify.success("Password reset!", "Your password was updated successfully.");
    setSuccess(true);
  };

  if (success) {
    return (
      <AuthLayout
        illustration={AUTH_ILLUSTRATIONS.reset}
        illustrationAlt="Password reset success illustration"
      >
        <AuthBrandLogo className="mb-10" />

        <div className="flex flex-col items-stretch">
          <p className="text-[18px] font-semibold text-[#374151] text-center mb-8">
            Password reset successfully!
          </p>

          <Button
            type="primary"
            className={authPrimaryBtnClass}
            onClick={() => navigate("/auth/login", { replace: true })}
          >
            Log In
          </Button>

          <p className="text-[13px] text-[#9CA3AF] text-center mt-4">
            Login to start your journey
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      illustration={AUTH_ILLUSTRATIONS.reset}
      illustrationAlt="Reset password illustration"
    >
      <AuthBrandLogo className="mb-10" />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label={<span className={authLabelClass}>Password</span>}
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
          className="mb-4"
        >
          <Input.Password
            placeholder="Enter your password"
            className={authFieldClass}
          />
        </Form.Item>

        <Form.Item
          label={<span className={authLabelClass}>Re-Type Password</span>}
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please re-type your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
          className="mb-6"
        >
          <Input.Password
            placeholder="Enter your password"
            className={authFieldClass}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            className={authPrimaryBtnClass}
          >
            Update
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
}
