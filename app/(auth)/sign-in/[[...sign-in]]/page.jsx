"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, Typography, Form, message } from "antd";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import css from "@/styles/AuthPages.module.css";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/lib/i18n";

const { Title, Text, Link } = Typography;

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { signIn, isSignedIn, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  // Redirect when user becomes authenticated
  useEffect(() => {
    if (isSignedIn && !authLoading) {
      router.push("/home");
    }
  }, [isSignedIn, authLoading, router]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Use authentication from context
      const result = await signIn({
        email: values.email,
        password: values.password
      });
      
      if (result.success) {
        message.success(t('auth.welcomeBack'));
        // Don't manually redirect here - let useEffect handle it
        // after auth state updates
      } else {
        // Translate Firebase error codes
        let errorMessage = t('auth.signInFailed');
        
        switch (result.code) {
          case 'auth/user-not-found':
            errorMessage = t('auth.userNotFound');
            break;
          case 'auth/wrong-password':
            errorMessage = t('auth.wrongPassword');
            break;
          case 'auth/invalid-email':
            errorMessage = t('auth.invalidEmail');
            break;
          case 'auth/too-many-requests':
            errorMessage = t('auth.tooManyRequests');
            break;
          default:
            errorMessage = result.error || t('auth.signInFailed');
        }
        
        message.error(errorMessage);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      message.error(t('auth.signInFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.authContainer}>
      <div className={css.authHeader}>
        <Title level={2} className={css.authTitle}>
          {t('auth.welcomeBack')}
        </Title>
        <Text type="secondary" className={css.authSubtitle}>
          {t('auth.signInToAccount')}
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
          label={t('auth.emailAddress')}
          rules={[
            { required: true, message: t('auth.pleaseEnterEmail') },
            { type: "email", message: t('auth.pleaseEnterValidEmail') }
          ]}
        >
          <Input
            size="large"
            prefix={<Iconify icon="eva:email-fill" width="20px" />}
            placeholder={t('auth.enterEmail')}
            className={css.authInput}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={t('auth.password')}
          rules={[
            { required: true, message: t('auth.pleaseEnterPassword') },
            { min: 6, message: t('auth.passwordMinLengthSignIn') }
          ]}
        >
          <Input.Password
            size="large"
            prefix={<Iconify icon="eva:lock-fill" width="20px" />}
            placeholder={t('auth.pleaseEnterPassword')}
            className={css.authInput}
          />
        </Form.Item>

        <div className={css.authOptions}>
          <Text>
            <Link href="/forgot-password" className={css.forgotLink}>
              {t('auth.forgotPassword')}?
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
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </Form.Item>
      </Form>

      <div className={css.authFooter}>
        <Text type="secondary">
          {t('auth.dontHaveAccount')}{" "}
          <Link href="/sign-up" className={css.authLink}>
            {t('auth.signUpHere')}
          </Link>
        </Text>
      </div>
    </div>
  );
}
