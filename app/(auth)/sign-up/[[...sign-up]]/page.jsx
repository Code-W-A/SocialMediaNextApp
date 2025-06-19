"use client";
import React, { useState } from "react";
import { Button, Input, Typography, Form, message, Divider, Checkbox, Select } from "antd";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import css from "@/styles/AuthPages.module.css";
import { signUp } from "@/lib/firebaseAuth";

const { Title, Text, Link } = Typography;

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Firebase registration
      const result = await signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        gender: values.gender
      });
      
      if (result.success) {
        message.success("Account created successfully! 🎉");
        router.push("/onboarding");
      } else {
        message.error(result.error || "Registration failed");
      }
    } catch (error) {
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    message.info("Google Sign-Up would be implemented here");
  };

  const handleFacebookSignUp = () => {
    message.info("Facebook Sign-Up would be implemented here");
  };

  return (
    <div className={css.authContainer}>
      <div className={css.authHeader}>
        <Title level={2} className={css.authTitle}>
          Create Account 🚀
        </Title>
        <Text type="secondary" className={css.authSubtitle}>
          Join our community and start sharing your moments
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={css.authForm}
        requiredMark={false}
      >
        <div className={css.signUpContainer}>
          {/* Coloana 1 */}
          <div>
            <div className={css.nameFields}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "Please enter your first name" },
                  { min: 2, message: "First name must be at least 2 characters" }
                ]}
                className={css.halfField}
              >
                <Input
                  size="large"
                  prefix={<Iconify icon="eva:person-fill" width="20px" />}
                  placeholder="First name"
                  className={css.authInput}
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { required: true, message: "Please enter your last name" },
                  { min: 2, message: "Last name must be at least 2 characters" }
                ]}
                className={css.halfField}
              >
                <Input
                  size="large"
                  prefix={<Iconify icon="eva:person-fill" width="20px" />}
                  placeholder="Last name"
                  className={css.authInput}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please enter a username" },
                { min: 3, message: "Username must be at least 3 characters" },
                { max: 20, message: "Username must be less than 20 characters" }
              ]}
            >
              <Input
                size="large"
                prefix={<Iconify icon="eva:at-fill" width="20px" />}
                placeholder="Choose a username"
                className={css.authInput}
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[
                { required: true, message: "Please select your gender" }
              ]}
            >
              <Select
                size="large"
                placeholder="Select your gender"
                className={css.authInput}
              >
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* Coloana 2 */}
          <div>
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
                { min: 8, message: "Password must be at least 8 characters" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Password must contain uppercase, lowercase and number"
                }
              ]}
              hasFeedback
            >
              <Input.Password
                size="large"
                prefix={<Iconify icon="eva:lock-fill" width="20px" />}
                placeholder="Create a strong password"
                className={css.authInput}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password
                size="large"
                prefix={<Iconify icon="eva:lock-fill" width="20px" />}
                placeholder="Confirm your password"
                className={css.authInput}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="terms"
          valuePropName="checked"
          rules={[
            { required: true, message: "Please accept the terms and conditions" }
          ]}
        >
          <Checkbox className={css.termsCheckbox}>
            I agree to the{" "}
            <Link href="/terms" className={css.authLink}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className={css.authLink}>
              Privacy Policy
            </Link>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className={css.authButton}
            block
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </Form.Item>
      </Form>

      <Divider className={css.authDivider}>
        <Text type="secondary">Or sign up with</Text>
      </Divider>

      <div className={css.socialButtons}>
        <Button
          size="large"
          icon={<Iconify icon="eva:google-fill" width="20px" />}
          onClick={handleGoogleSignUp}
          className={css.socialButton}
        >
          Google
        </Button>
        <Button
          size="large"
          icon={<Iconify icon="eva:facebook-fill" width="20px" />}
          onClick={handleFacebookSignUp}
          className={css.socialButton}
        >
          Facebook
        </Button>
      </div>

      <div className={css.authFooter}>
        <Text type="secondary">
          Already have an account?{" "}
          <Link href="/sign-in" className={css.authLink}>
            Sign in here
          </Link>
        </Text>
      </div>
    </div>
  );
}
