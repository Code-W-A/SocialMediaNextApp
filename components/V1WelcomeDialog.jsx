"use client";

import { Modal, Button, Typography, Space, Card } from 'antd';
import { CrownOutlined, HeartOutlined, GiftOutlined, StarOutlined } from '@ant-design/icons';
import { useLanguage } from '@/lib/i18n';

const { Title, Text, Paragraph } = Typography;

export default function V1WelcomeDialog({ 
  visible, 
  onClose, 
  loading = false,
  userName = "prietene" 
}) {
  const { t } = useLanguage();

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="v1-welcome-modal"
      style={{
        borderRadius: '16px',
      }}
    >
      <div className="text-center py-6">
        {/* Header with crown icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
            <CrownOutlined className="text-4xl text-white" />
          </div>
          
          <Title level={2} className="mb-2 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            🎉 {t('v1.congratulations', { name: userName })}
          </Title>
        </div>

        {/* Main message */}
        <Card className="mb-6 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <Space direction="vertical" size="middle" className="w-full">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-orange-700">
              <GiftOutlined />
              <span>{t('v1.freePremiumAccount')}</span>
              <GiftOutlined />
            </div>
            
            <Paragraph className="text-gray-700 mb-0">
              {t('v1.v1Message')}
            </Paragraph>
          </Space>
        </Card>

        {/* Premium features */}
        <div className="mb-6">
          <Title level={4} className="mb-4 text-gray-800">
            🌟 {t('v1.whatYouGetWithPremium')}
          </Title>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-purple-600 mb-2">
                <HeartOutlined className="text-xl" />
              </div>
              <Text strong className="block text-sm">{t('v1.unlimitedMatches')}</Text>
              <Text className="text-xs text-gray-600">{t('v1.connectWithAnyone')}</Text>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-2">
                <StarOutlined className="text-xl" />
              </div>
              <Text strong className="block text-sm">{t('v1.superLikes')}</Text>
              <Text className="text-xs text-gray-600">{t('v1.fivePerDay')}</Text>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-green-600 mb-2">
                <CrownOutlined className="text-xl" />
              </div>
              <Text strong className="block text-sm">{t('v1.premiumBadge')}</Text>
              <Text className="text-xs text-gray-600">{t('v1.profileStandsOut')}</Text>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-pink-600 mb-2">
                <GiftOutlined className="text-xl" />
              </div>
              <Text strong className="block text-sm">{t('v1.andMuchMore')}</Text>
              <Text className="text-xs text-gray-600">{t('v1.allPremiumFeatures')}</Text>
            </div>
          </div>
        </div>

        {/* Thank you message */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6 border border-pink-200">
          <Paragraph className="mb-2 text-gray-700">
            <strong>{t('v1.thankYou')}</strong>
          </Paragraph>
          <Text className="text-sm text-gray-600">
            {t('v1.continueFinding')}
          </Text>
        </div>

        {/* Support message */}
        <div className="bg-blue-50 rounded-lg p-3 mb-6 border border-blue-200">
          <Text className="text-xs text-blue-700">
            <strong>Notă:</strong> {t('v1.supportNote')}
          </Text>
        </div>

        {/* Action button */}
        <Button 
          type="primary" 
          size="large" 
          onClick={onClose}
          loading={loading}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 border-none hover:from-yellow-600 hover:to-orange-600 h-12 px-8 rounded-lg font-semibold"
        >
          {t('v1.startExploring')}
        </Button>
      </div>

      <style jsx global>{`
        .v1-welcome-modal .ant-modal-content {
          border-radius: 16px;
          overflow: hidden;
        }
        
        .v1-welcome-modal .ant-modal-header {
          border-bottom: none;
          padding: 0;
        }
        
        .v1-welcome-modal .ant-modal-body {
          padding: 0;
        }
      `}</style>
    </Modal>
  );
} 