"use client";
import React, { useState } from "react";
import { Button, Input, Typography, Form, message, Checkbox, Select } from "antd";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import css from "@/styles/AuthPages.module.css";
import { signUp } from "@/lib/firebaseAuth";
import { useLanguage } from "@/lib/i18n";

const { Title, Text, Link } = Typography;

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { t } = useLanguage();

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
        message.success(t('auth.accountCreatedSuccess'));
        router.push("/onboarding");
      } else {
        message.error(result.error || t('auth.registrationFailed'));
      }
    } catch (error) {
      message.error(t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.authContainer}>
      <div className={css.authHeader}>
        <Title level={2} className={css.authTitle}>
          {t('auth.createAccount')}
        </Title>
        <Text type="secondary" className={css.authSubtitle}>
          {t('auth.joinCommunity')}
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
                label={t('auth.firstName')}
                rules={[
                  { required: true, message: t('auth.pleaseEnterFirstName') },
                  { min: 2, message: t('auth.firstNameMinLength') }
                ]}
                className={css.halfField}
              >
                <Input
                  size="large"
                  prefix={<Iconify icon="eva:person-fill" width="20px" />}
                  placeholder={t('auth.firstName')}
                  className={css.authInput}
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                label={t('auth.lastName')}
                rules={[
                  { required: true, message: t('auth.pleaseEnterLastName') },
                  { min: 2, message: t('auth.lastNameMinLength') }
                ]}
                className={css.halfField}
              >
                <Input
                  size="large"
                  prefix={<Iconify icon="eva:person-fill" width="20px" />}
                  placeholder={t('auth.lastName')}
                  className={css.authInput}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="username"
              label={t('auth.username')}
              rules={[
                { required: true, message: t('auth.pleaseEnterUsername') },
                { min: 3, message: t('auth.usernameMinLength') },
                { max: 20, message: t('auth.usernameMaxLength') }
              ]}
            >
              <Input
                size="large"
                prefix={<Iconify icon="eva:at-fill" width="20px" />}
                placeholder={t('auth.chooseUsername')}
                className={css.authInput}
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label={t('auth.gender')}
              rules={[
                { required: true, message: t('auth.pleaseSelectGender') }
              ]}
            >
              <Select
                size="large"
                placeholder={t('auth.selectGender')}
                className={css.authInput}
              >
                <Select.Option value="male">{t('auth.male')}</Select.Option>
                <Select.Option value="female">{t('auth.female')}</Select.Option>
                <Select.Option value="other">{t('auth.other')}</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* Coloana 2 */}
          <div>
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
                { min: 8, message: t('auth.passwordMinLength') },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: t('auth.passwordPattern')
                }
              ]}
              hasFeedback
            >
              <Input.Password
                size="large"
                prefix={<Iconify icon="eva:lock-fill" width="20px" />}
                placeholder={t('auth.createStrongPassword')}
                className={css.authInput}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              dependencies={['password']}
              rules={[
                { required: true, message: t('auth.pleaseConfirmPassword') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('auth.passwordsDoNotMatch')));
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password
                size="large"
                prefix={<Iconify icon="eva:lock-fill" width="20px" />}
                placeholder={t('auth.confirmYourPassword')}
                className={css.authInput}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="terms"
          valuePropName="checked"
          rules={[
            { required: true, message: t('auth.pleaseAcceptTerms') }
          ]}
        >
          <Checkbox className={css.termsCheckbox}>
            {t('auth.agreeToTerms')}{" "}
            <Link href="/terms" className={css.authLink}>
              {t('auth.termsOfService')}
            </Link>{" "}
            {t('auth.and')}{" "}
            <Link href="/privacy" className={css.authLink}>
              {t('auth.privacyPolicy')}
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
            {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
          </Button>
        </Form.Item>
      </Form>

      <div className={css.authFooter}>
        <Text type="secondary">
          {t('auth.alreadyHaveAccount')}{" "}
          <Link href="/sign-in" className={css.authLink}>
            {t('auth.signInHere')}
          </Link>
        </Text>
      </div>
    </div>
  );
}
