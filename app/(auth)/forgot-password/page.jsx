"use client";
import React, { useState } from "react";
import { Button, Input, Typography, Form, message } from "antd";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import css from "@/styles/AuthPages.module.css";
import { resetPassword } from "@/lib/firebaseAuth";
import { useLanguage } from "@/lib/i18n";

const { Title, Text, Link } = Typography;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await resetPassword(values.email);
      
      if (result.success) {
        setEmailSent(true);
        setSentEmail(values.email);
        message.success({
          content: t('auth.resetEmailSent'),
          duration: 4,
          style: {
            marginTop: '10vh',
          },
        });
        form.resetFields();
      } else {
        // Handle specific error messages
        if (result.error.includes('user-not-found') || result.error.includes('No account found')) {
          message.error(t('auth.noAccountFound'));
        } else if (result.error.includes('invalid-email') || result.error.includes('Invalid email')) {
          message.error(t('auth.invalidEmail'));
        } else if (result.error.includes('too-many-requests') || result.error.includes('Too many')) {
          message.error(t('auth.tooManyRequests'));
        } else {
          message.error(result.error || t('auth.resetEmailFailed'));
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      message.error(t('auth.resetEmailFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.push("/sign-in");
  };

  const handleTryAgain = () => {
    setEmailSent(false);
    setSentEmail("");
  };

  if (emailSent) {
    return (
      <div className={css.authContainer}>
        <div className={css.authHeader}>
          <div style={{ 
            width: "80px", 
            height: "80px", 
            background: "linear-gradient(135deg, #52c41a, #73d13d)", 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 1.5rem" 
          }}>
            <Iconify icon="eva:checkmark-fill" width="40px" style={{ color: "white" }} />
          </div>
          <Title level={2} className={css.authTitle}>
            {t('auth.resetEmailSent')}
          </Title>
          <Text type="secondary" className={css.authSubtitle}>
            {t('auth.resetEmailSentDesc')}
          </Text>
          <div style={{ 
            marginTop: "1rem", 
            padding: "12px 16px", 
            background: "#f6ffed", 
            border: "1px solid #b7eb8f", 
            borderRadius: "8px",
            color: "#52c41a",
            fontWeight: "500"
          }}>
            📧 {sentEmail}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "2rem" }}>
          <Button
            size="large"
            onClick={handleTryAgain}
            className={css.socialButton}
            block
            icon={<Iconify icon="eva:email-fill" width="20px" />}
          >
            {t('auth.sendToDifferentEmail')}
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleBackToSignIn}
            className={css.authButton}
            block
            icon={<Iconify icon="eva:arrow-back-fill" width="20px" />}
          >
            {t('auth.backToSignIn')}
          </Button>
        </div>

        <div className={css.authFooter} style={{ marginTop: "2rem" }}>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            {t('auth.didntReceiveEmail')}{" "}
            <Link onClick={handleTryAgain} style={{ color: "var(--primary)" }}>
              {t('auth.tryAgain')}
            </Link>
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={css.authContainer}>
      <div className={css.authHeader}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          background: "linear-gradient(135deg, var(--primary), #ffa940)", 
          borderRadius: "50%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "0 auto 1.5rem" 
        }}>
          <Iconify icon="eva:lock-fill" width="40px" style={{ color: "white" }} />
        </div>
        <Title level={2} className={css.authTitle}>
          {t('auth.forgotPassword')} 🔐
        </Title>
        <Text type="secondary" className={css.authSubtitle}>
          {t('auth.enterEmailToReset')}
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
            placeholder={t('auth.emailAddress')}
            className={css.authInput}
            autoFocus
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: "1rem" }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className={css.authButton}
            block
            icon={<Iconify icon="eva:paper-plane-fill" width="20px" />}
          >
            {loading ? t('auth.sending') : t('auth.sendResetEmail')}
          </Button>
        </Form.Item>
      </Form>

      <div className={css.authFooter}>
        <Text type="secondary">
          {t('auth.rememberPassword')}{" "}
          <Link onClick={handleBackToSignIn} className={css.authLink}>
            {t('auth.backToSignIn')}
          </Link>
        </Text>
      </div>
    </div>
  );
} 