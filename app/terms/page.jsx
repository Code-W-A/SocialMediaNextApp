"use client";
import { Typography, Card, Space, Divider, Button } from 'antd';
import { useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const { Title, Paragraph, Text } = Typography;

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #000000 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{ color: '#FFD700', fontSize: '16px' }}
          >
            Back
          </Button>
          <LanguageSwitcher />
        </div>

        <Card style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 215, 0, 0.3)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <Title level={1} style={{
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '10px'
              }}>
                Terms of Service
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </div>

            <Divider style={{ borderColor: 'rgba(255, 215, 0, 0.3)' }} />

            {/* Introduction */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>1. Acceptance of Terms</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Welcome to YDestiny, a social networking platform that connects people through shared interests, 
                cosmic compatibility, and meaningful conversations. By accessing or using our service, you agree 
                to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do 
                not use our service.
              </Paragraph>
            </div>

            {/* Service Description */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>2. Description of Service</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                YDestiny provides a social platform where users can:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Create profiles and share personal information</li>
                <li>Post content including text, images, and other media</li>
                <li>Connect and communicate with other users</li>
                <li>Access premium features through subscription</li>
                <li>Participate in community discussions and forums</li>
              </ul>
            </div>

            {/* Eligibility */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>3. Eligibility</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                You must be at least 18 years old to use YDestiny. By using our service, you represent and warrant 
                that you have the legal capacity to enter into these Terms and comply with all applicable laws.
              </Paragraph>
            </div>

            {/* User Account */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>4. User Account and Security</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                You are responsible for:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and up-to-date information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </div>

            {/* User Content */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>5. User Content</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                You retain ownership of content you post on YDestiny, but you grant us a worldwide, non-exclusive, 
                royalty-free license to use, display, and distribute your content within our platform. You are 
                solely responsible for your content and must ensure it complies with applicable laws and our 
                community guidelines.
              </Paragraph>
            </div>

            {/* User Conduct */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>6. Prohibited Conduct</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                You agree not to:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Harass, abuse, or harm other users</li>
                <li>Post illegal, harmful, or offensive content</li>
                <li>Spam or engage in commercial solicitation</li>
                <li>Impersonate others or create fake accounts</li>
                <li>Violate intellectual property rights</li>
                <li>Attempt to hack or compromise the platform</li>
              </ul>
            </div>

            {/* Privacy */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>7. Privacy</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                use, and protect your information. By using YDestiny, you consent to the practices described 
                in our Privacy Policy.
              </Paragraph>
            </div>

            {/* Subscriptions */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>8. Premium Subscriptions</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Premium features are available through paid subscriptions. Subscriptions automatically renew 
                unless cancelled. Refunds are subject to our refund policy. We reserve the right to modify 
                subscription terms and pricing with advance notice.
              </Paragraph>
            </div>

            {/* Termination */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>9. Account Termination</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                We may suspend or terminate your account at any time for violations of these Terms or for any 
                other reason. You may delete your account at any time through your account settings. Upon 
                termination, your right to use the service ceases immediately.
              </Paragraph>
            </div>

            {/* Disclaimer */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>10. Disclaimer of Warranties</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                YDestiny is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted 
                or error-free service. We disclaim all warranties, express or implied, including but not limited 
                to merchantability, fitness for a particular purpose, and non-infringement.
              </Paragraph>
            </div>

            {/* Limitation of Liability */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>11. Limitation of Liability</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                To the maximum extent permitted by law, YDestiny shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                or use, arising from your use of the service.
              </Paragraph>
            </div>

            {/* Governing Law */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>12. Governing Law</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                These Terms are governed by and construed in accordance with the laws of Romania. Any disputes 
                arising from these Terms or your use of YDestiny shall be subject to the exclusive jurisdiction 
                of the courts in Romania.
              </Paragraph>
            </div>

            {/* Changes to Terms */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>13. Changes to Terms</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                We reserve the right to modify these Terms at any time. We will notify users of material changes 
                through the platform or via email. Your continued use of YDestiny after changes constitutes 
                acceptance of the new Terms.
              </Paragraph>
            </div>

            {/* Contact */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>14. Contact Information</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                If you have questions about these Terms, please contact us at:
                <br />
                Email: legal@ydestiny.com
                <br />
                Address: Romania
              </Paragraph>
            </div>

            <Divider style={{ borderColor: 'rgba(255, 215, 0, 0.3)' }} />

            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                onClick={() => router.back()}
                style={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  borderColor: 'transparent',
                  color: '#000',
                  borderRadius: '25px'
                }}
              >
                I Understand
              </Button>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
} 