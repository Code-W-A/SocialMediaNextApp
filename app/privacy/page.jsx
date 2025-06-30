"use client";
import { Typography, Card, Space, Divider, Button } from 'antd';
import { useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const { Title, Paragraph, Text } = Typography;

export default function PrivacyPolicy() {
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
                Privacy Policy
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </div>

            <Divider style={{ borderColor: 'rgba(255, 215, 0, 0.3)' }} />

            {/* Introduction */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>1. Introduction</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                At YDestiny, we respect your privacy and are committed to protecting your personal data. This Privacy 
                Policy explains how we collect, use, share, and safeguard your information when you use our social 
                networking platform. We are committed to complying with the General Data Protection Regulation (GDPR) 
                and other applicable privacy laws.
              </Paragraph>
            </div>

            {/* Information We Collect */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>2. Information We Collect</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                We collect the following types of information:
              </Paragraph>
              
              <Title level={4} style={{ color: '#FFA500', fontSize: '1.1rem' }}>2.1 Personal Information</Title>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Name, email address, and contact information</li>
                <li>Profile information including photos, bio, and interests</li>
                <li>Account credentials and authentication data</li>
                <li>Premium subscription and payment information</li>
              </ul>

              <Title level={4} style={{ color: '#FFA500', fontSize: '1.1rem' }}>2.2 Content and Communications</Title>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Posts, comments, messages, and other content you create</li>
                <li>Photos, videos, and other media you upload</li>
                <li>Communications with other users and with us</li>
              </ul>

              <Title level={4} style={{ color: '#FFA500', fontSize: '1.1rem' }}>2.3 Usage Information</Title>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage patterns and interaction data</li>
                <li>Log files and analytics data</li>
                <li>Location data (if you enable location services)</li>
              </ul>
            </div>

            {/* How We Use Information */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>3. How We Use Your Information</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                We use your information for the following purposes:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Providing and maintaining our services</li>
                <li>Personalizing your experience and content recommendations</li>
                <li>Facilitating connections between users</li>
                <li>Processing payments and managing subscriptions</li>
                <li>Communicating with you about our services</li>
                <li>Ensuring platform security and preventing abuse</li>
                <li>Analyzing usage to improve our services</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>4. How We Share Your Information</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                We may share your information in the following circumstances:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li><strong>With Other Users:</strong> Profile information and content you choose to make public</li>
                <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to sharing</li>
              </ul>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                We do not sell your personal information to third parties for their marketing purposes.
              </Paragraph>
            </div>

            {/* Data Security */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>5. Data Security</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                We implement appropriate technical and organizational measures to protect your personal data:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>6. Your Rights (GDPR)</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Under GDPR and other privacy laws, you have the following rights:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Restriction:</strong> Request limitation of processing</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for processing</li>
              </ul>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                To exercise these rights, please contact us at privacy@ydestiny.com
              </Paragraph>
            </div>

            {/* Cookies */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>7. Cookies and Tracking</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                We use cookies and similar technologies to:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Remember your preferences and login status</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content and features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                You can control cookies through your browser settings, but some features may not function properly 
                if cookies are disabled.
              </Paragraph>
            </div>

            {/* Third-Party Services */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>8. Third-Party Services</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Our platform may integrate with third-party services such as:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Payment processors for premium subscriptions</li>
                <li>Analytics services to understand usage patterns</li>
                <li>Cloud storage providers for data hosting</li>
                <li>Communication services for notifications</li>
              </ul>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                These services have their own privacy policies, and we encourage you to review them.
              </Paragraph>
            </div>

            {/* International Transfers */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>9. International Data Transfers</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Your data may be transferred to and processed in countries other than your own. We ensure adequate 
                protection through:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Standard contractual clauses approved by the European Commission</li>
                <li>Adequacy decisions by data protection authorities</li>
                <li>Other appropriate safeguards as required by law</li>
              </ul>
            </div>

            {/* Data Retention */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>10. Data Retention</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                We retain your personal data only as long as necessary for the purposes outlined in this policy:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Account data: Until you delete your account</li>
                <li>Content: As long as you maintain your account</li>
                <li>Usage data: Up to 2 years for analytics purposes</li>
                <li>Legal compliance: As required by applicable laws</li>
              </ul>
            </div>

            {/* Children's Privacy */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>11. Children&apos;s Privacy</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                YDestiny is not intended for users under 18 years of age. We do not knowingly collect personal 
                information from children under 18. If we discover that we have collected information from a child 
                under 18, we will delete it immediately.
              </Paragraph>
            </div>

            {/* Changes to Policy */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>12. Changes to This Policy</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                We may update this Privacy Policy from time to time. We will notify you of material changes by:
              </Paragraph>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '20px' }}>
                <li>Posting the updated policy on our platform</li>
                <li>Sending you an email notification</li>
                <li>Displaying a prominent notice on our website</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <Title level={3} style={{ color: '#FFD700' }}>13. Contact Us</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                If you have questions about this Privacy Policy or want to exercise your rights, please contact us at:
                <br /><br />
                <strong>Data Protection Officer:</strong><br />
                Email: privacy@ydestiny.com<br />
                Email: dpo@ydestiny.com<br />
                Address: Romania<br /><br />
                
                <strong>EU Representative (if applicable):</strong><br />
                Email: eu-representative@ydestiny.com
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