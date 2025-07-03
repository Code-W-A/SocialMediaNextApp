"use client";
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Card, Space, Row, Col } from "antd";
import { useLanguage } from "@/lib/i18n";
import Iconify from "@/components/Iconify";
import { useUser } from "@/hooks/useFirebaseAuth";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ContactPage = () => {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection hook
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'contact',
          to: values.email,
          data: {
            name: values.name,
            email: values.email,
            subject: values.subject,
            message: values.message,
          },
          language: language,
        }),
      });

      if (response.ok) {
        message.success(t('contact.messageSent'));
        form.resetFields();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error(t('contact.messageError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: isMobile ? '1rem 0.5rem' : '2rem 1rem',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? '2rem' : '3rem',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
            borderRadius: '50%',
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 30px rgba(114, 46, 209, 0.3)',
          }}>
            <Iconify icon="eva:email-fill" width={isMobile ? "30px" : "40px"} style={{ color: 'white' }} />
          </div>
          
          <Title level={1} style={{
            background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px',
            fontSize: isMobile ? '24px' : '32px',
          }}>
            {t('contact.title')}
          </Title>
          
          <Paragraph style={{
            fontSize: isMobile ? '16px' : '18px',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            padding: isMobile ? '0 1rem' : '0',
          }}>
            {t('contact.subtitle')}
          </Paragraph>
        </div>

        <Row gutter={isMobile ? [16, 24] : [32, 32]}>
          {/* Contact Form */}
          <Col xs={24} lg={14}>
            <Card
              style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Title level={3} style={{ 
                marginBottom: isMobile ? '18px' : '24px',
                fontSize: isMobile ? '18px' : '22px'
              }}>
                {t('contact.sendMessage')}
              </Title>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
                  email: user?.email || '',
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label={t('contact.form.name')}
                      rules={[{ required: true, message: t('contact.form.nameRequired') }]}
                    >
                      <Input
                        size="large"
                        placeholder={t('contact.form.namePlaceholder')}
                        prefix={<Iconify icon="eva:person-fill" width="18px" />}
                        style={{ borderRadius: '12px' }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label={t('contact.form.email')}
                      rules={[
                        { required: true, message: t('contact.form.emailRequired') },
                        { type: 'email', message: t('contact.form.emailInvalid') }
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder={t('contact.form.emailPlaceholder')}
                        prefix={<Iconify icon="eva:email-fill" width="18px" />}
                        style={{ borderRadius: '12px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="subject"
                  label={t('contact.form.subject')}
                  rules={[{ required: true, message: t('contact.form.subjectRequired') }]}
                >
                  <Input
                    size="large"
                    placeholder={t('contact.form.subjectPlaceholder')}
                    prefix={<Iconify icon="eva:edit-fill" width="18px" />}
                    style={{ borderRadius: '12px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="message"
                  label={t('contact.form.message')}
                  rules={[{ required: true, message: t('contact.form.messageRequired') }]}
                >
                  <TextArea
                    rows={6}
                    placeholder={t('contact.form.messagePlaceholder')}
                    style={{ borderRadius: '12px' }}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                    }}
                    icon={<Iconify icon="eva:paper-plane-fill" width="20px" />}
                  >
                    {t('contact.form.sendButton')}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Contact Info */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* WhatsApp Card */}
              <Card
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: isMobile ? '50px' : '60px',
                    height: isMobile ? '50px' : '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Iconify icon="ic:baseline-whatsapp" width={isMobile ? "28px" : "32px"} style={{ color: 'white' }} />
                  </div>
                  
                  <Title level={4} style={{ 
                    color: 'white', 
                    marginBottom: '8px',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {t('contact.whatsapp.quickSupport')}
                  </Title>
                  
                  <Text style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: isMobile ? '13px' : '14px', 
                    display: 'block', 
                    marginBottom: isMobile ? '16px' : '20px' 
                  }}>
                    {t('contact.whatsapp.schedule')}
                  </Text>
                  
                  <Button
                    size={isMobile ? "middle" : "large"}
                    block
                    onClick={() => window.open('https://wa.me/40750282034', '_blank')}
                    style={{
                      height: isMobile ? '44px' : '48px',
                      borderRadius: '12px',
                      background: 'white',
                      border: 'none',
                      color: '#25D366',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    icon={<Iconify icon="ic:baseline-whatsapp" width={isMobile ? "18px" : "20px"} />}
                  >
                    {t('contact.whatsapp.button')}
                  </Button>
                </div>
              </Card>

              {/* V1 Premium Users Card */}
              <Card
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                  background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  opacity: 0.3,
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: isMobile ? '40px' : '50px',
                    height: isMobile ? '40px' : '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: isMobile ? '12px' : '16px',
                  }}>
                    <Iconify icon="eva:star-fill" width={isMobile ? "20px" : "24px"} style={{ color: 'white' }} />
                  </div>
                  
                  <Title level={4} style={{ 
                    color: 'white', 
                    marginBottom: isMobile ? '8px' : '12px', 
                    fontSize: isMobile ? '16px' : '18px' 
                  }}>
                    {t('contact.v1Premium.title')}
                  </Title>
                  
                  <Paragraph style={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    fontSize: isMobile ? '13px' : '14px', 
                    marginBottom: isMobile ? '16px' : '20px',
                    lineHeight: '1.5'
                  }}>
                    {t('contact.v1Premium.description')}
                  </Paragraph>
                  
                  <Button
                    size={isMobile ? "middle" : "large"}
                    block
                    onClick={() => {
                      // Pre-populate the form with V1 Premium subject
                      form.setFieldsValue({
                        subject: form.getFieldValue('subject') || 'Premium V1 Account - Free Premium Request'
                      });
                      // Scroll to form
                      document.querySelector('.ant-form').scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }}
                    style={{
                      height: isMobile ? '40px' : '44px',
                      borderRadius: '12px',
                      background: 'white',
                      border: 'none',
                      color: '#FF6B35',
                      fontSize: isMobile ? '13px' : '15px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    icon={<Iconify icon="eva:email-fill" width={isMobile ? "16px" : "18px"} />}
                  >
                    {t('contact.v1Premium.button')}
                  </Button>
                </div>
              </Card>

              <Card
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Title level={4} style={{ 
                  marginBottom: isMobile ? '16px' : '20px',
                  fontSize: isMobile ? '16px' : '18px'
                }}>
                  {t('contact.info.title')}
                </Title>
                
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Iconify icon="eva:email-fill" width="20px" style={{ color: 'white' }} />
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>Email</Text>
                      <div style={{ fontWeight: '600' }}>contact@ydestiny.com</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Iconify icon="eva:clock-fill" width="20px" style={{ color: 'white' }} />
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>{t('contact.info.responseTime')}</Text>
                      <div style={{ fontWeight: '600' }}>{t('contact.info.responseTimeValue')}</div>
                    </div>
                  </div>
                </Space>
              </Card>

              <Card
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                  background: 'linear-gradient(135deg, #f8f9ff, #f0f2ff)',
                }}
              >
                <Title level={4} style={{ 
                  marginBottom: isMobile ? '12px' : '16px',
                  fontSize: isMobile ? '16px' : '18px'
                }}>
                  {t('contact.faq.title')}
                </Title>
                
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ color: 'var(--primary)' }}>
                      {t('contact.faq.question1')}
                    </Text>
                    <Paragraph style={{ marginBottom: '12px', marginTop: '4px' }}>
                      {t('contact.faq.answer1')}
                    </Paragraph>
                  </div>
                  
                  <div>
                    <Text strong style={{ color: 'var(--primary)' }}>
                      {t('contact.faq.question2')}
                    </Text>
                    <Paragraph style={{ marginBottom: 0, marginTop: '4px' }}>
                      {t('contact.faq.answer2')}
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ContactPage; 