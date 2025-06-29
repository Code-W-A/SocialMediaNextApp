"use client";
import React, { useState } from "react";
import { Button, Input, Typography, Form, message, Divider } from "antd";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import css from "@/styles/AuthPages.module.css";
import { signIn } from "@/lib/firebaseAuth";

const { Title, Text, Link } = Typography;

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Firebase authentication
      const result = await signIn(values.email, values.password);
      
      if (result.success) {
        message.success("Welcome back! 🎉");
        router.push("/home");
      } else {
        message.error(result.error || "Invalid credentials");
      }
    } catch (error) {
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    message.info("Google Sign-In would be implemented here");
  };

  const handleFacebookSignIn = () => {
    message.info("Facebook Sign-In would be implemented here");
  };

  return (
    <div className={css.authContainer}>
      <div className={css.authHeader}>
        <Title level={2} className={css.authTitle}>
          Welcome Back! 👋
        </Title>
        <Text type="secondary" className={css.authSubtitle}>
          Sign in to your account to continue
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={css.authForm}
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" }
          ]}
        >
          <Input
            size="large"
            prefix={<Iconify icon="eva:email-fill" width="20px" />}
            placeholder="Enter your email"
            className={css.authInput}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 6, message: "Password must be at least 6 characters" }
          ]}
        >
          <Input.Password
            size="large"
            prefix={<Iconify icon="eva:lock-fill" width="20px" />}
            placeholder="Enter your password"
            className={css.authInput}
          />
        </Form.Item>

        <div className={css.authOptions}>
          <Text>
            <Link href="/forgot-password" className={css.forgotLink}>
              Forgot password?
            </Link>
          </Text>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className={css.authButton}
            block
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Form.Item>
      </Form>

      <Divider className={css.authDivider}>
        <Text type="secondary">Or continue with</Text>
      </Divider>

      <div className={css.socialButtons}>
        <Button
          size="large"
          icon={<Iconify icon="eva:google-fill" width="20px" />}
          onClick={handleGoogleSignIn}
          className={css.socialButton}
        >
          Google
        </Button>
        <Button
          size="large"
          icon={<Iconify icon="eva:facebook-fill" width="20px" />}
          onClick={handleFacebookSignIn}
          className={css.socialButton}
        >
          Facebook
        </Button>
      </div>

      <div className={css.authFooter}>
        <Text type="secondary">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className={css.authLink}>
            Sign up here
          </Link>
        </Text>
      </div>
    </div>
  );
}
