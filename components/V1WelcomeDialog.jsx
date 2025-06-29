"use client";

import { Modal, Button, Typography, Space, Card, Row, Col } from 'antd';
import { CrownOutlined, HeartOutlined, GiftOutlined, StarOutlined, ThunderboltOutlined, EyeOutlined, MessageOutlined, FireOutlined } from '@ant-design/icons';
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
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(3deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); }
          50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.4); }
        }
        
        .v1-welcome-modal .ant-modal-content {
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          border: 2px solid rgba(255, 215, 0, 0.3);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
          max-height: 95vh;
          margin: 0;
        }
        
        .v1-welcome-modal .ant-modal-header {
          border-bottom: none;
          padding: 0;
          background: transparent;
        }
        
        .v1-welcome-modal .ant-modal-body {
          padding: 0;
          background: transparent;
          max-height: 95vh;
          overflow-y: auto;
        }
        
        .v1-welcome-modal .ant-modal-close {
          color: rgba(255, 255, 255, 0.6);
          top: 15px;
          right: 15px;
          z-index: 10;
        }
        
        .v1-welcome-modal .ant-modal-close:hover {
          color: #FFD700;
        }
        
        .premium-feature-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 15px 10px;
          text-align: center;
          transition: all 0.3s ease;
          animation: slideUp 0.6s ease-out;
          position: relative;
          overflow: hidden;
          height: 100%;
        }
        
        .premium-feature-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 215, 0, 0.4);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.15);
        }
        
        .premium-feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
          transition: left 0.5s;
        }
        
        .premium-feature-card:hover::before {
          left: 100%;
        }
        
        .crown-container {
          position: relative;
          display: inline-block;
        }
        
        .floating-stars {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
        }
        
        .floating-stars span {
          animation: float 3s ease-in-out infinite;
          font-size: 16px;
        }
        
        .floating-stars span:nth-child(1) { animation-delay: 0s; }
        .floating-stars span:nth-child(2) { animation-delay: 0.5s; }
        .floating-stars span:nth-child(3) { animation-delay: 1s; }
        
        .gradient-text {
          background: linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .cosmic-background {
          position: relative;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 105, 180, 0.05));
          border-radius: 15px;
          padding: 20px 15px;
          border: 2px solid rgba(255, 215, 0, 0.2);
          backdrop-filter: blur(10px);
          animation: glow 3s ease-in-out infinite;
        }
        
        .cosmic-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 105, 180, 0.1) 0%, transparent 50%);
          border-radius: 15px;
          z-index: -1;
        }
        
        .support-note {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          padding: 12px;
          backdrop-filter: blur(10px);
        }
        
        .thank-you-section {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1));
          border: 1px solid rgba(236, 72, 153, 0.3);
          border-radius: 12px;
          padding: 15px;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .thank-you-section::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%);
          animation: float 8s linear infinite;
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .v1-welcome-modal {
            padding: 10px !important;
          }
          
          .v1-welcome-modal .ant-modal-content {
            margin: 0 !important;
            max-height: 95vh !important;
            width: 100% !important;
            border-radius: 15px !important;
          }
          
          .floating-stars span {
            font-size: 14px !important;
          }
          
          .premium-feature-card {
            padding: 12px 8px !important;
          }
          
          .cosmic-background {
            padding: 15px 12px !important;
          }
          
          .thank-you-section {
            padding: 12px !important;
          }
          
          .support-note {
            padding: 10px !important;
          }
        }
        
        @media (max-width: 480px) {
          .v1-welcome-modal {
            padding: 5px !important;
          }
          
          .floating-stars {
            gap: 8px !important;
          }
          
          .floating-stars span {
            font-size: 12px !important;
          }
        }
        
        @media (max-height: 700px) {
          .premium-feature-card {
            padding: 10px 8px !important;
          }
        }
        
        @media (max-height: 600px) {
          .cosmic-background {
            padding: 12px 10px !important;
          }
          
          .thank-you-section {
            padding: 10px !important;
          }
        }
      `}</style>

      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width="95%"
        style={{ maxWidth: '600px', top: '2.5vh' }}
        centered={false}
        className="v1-welcome-modal"
        destroyOnHidden
      >
        <div style={{ 
          padding: '20px 15px 25px 15px',
          color: '#fff',
          position: 'relative'
        }}>
          {/* Floating background stars */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(1px 1px at 20px 30px, rgba(255,215,0,0.6), transparent),
              radial-gradient(1px 1px at 40px 70px, rgba(255,105,180,0.4), transparent),
              radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.6), transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(76,205,196,0.4), transparent)
            `,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px 80px',
            animation: 'twinkle 4s linear infinite',
            pointerEvents: 'none',
            opacity: 0.7
          }} />

          {/* Header with animated crown */}
          <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
            <div className="crown-container" style={{ marginBottom: '15px' }}>
              <div className="floating-stars">
                <span>✨</span>
                <span>🌟</span>
                <span>💫</span>
              </div>
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
                animation: 'pulse 2s ease-in-out infinite',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                <CrownOutlined style={{ fontSize: '28px', color: '#000' }} />
              </div>
            </div>
            
            <Title level={3} className="gradient-text" style={{ 
              fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
              marginBottom: '8px',
              textAlign: 'center',
              lineHeight: 1.2
            }}>
              🎉 {t('v1.congratulations', { name: userName })}
            </Title>
            
            <div style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              color: '#FFD700',
              fontWeight: '600',
              marginBottom: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <GiftOutlined />
              <span>{t('v1.freePremiumAccount')}</span>
              <GiftOutlined />
            </div>
          </div>

          {/* Main message */}
          <div className="cosmic-background" style={{ marginBottom: '20px', position: 'relative', zIndex: 1 }}>
            <Paragraph style={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 'clamp(13px, 3vw, 15px)',
              lineHeight: '1.5',
              textAlign: 'center',
              margin: 0
            }}>
              {t('v1.v1Message')} 💝
            </Paragraph>
          </div>

          {/* Premium features */}
          <div style={{ marginBottom: '20px', position: 'relative', zIndex: 1 }}>
            <Title level={5} style={{ 
              color: '#FFD700',
              textAlign: 'center',
              marginBottom: '15px',
              fontSize: 'clamp(16px, 3.5vw, 18px)'
            }}>
              🌟 {t('v1.whatYouGetWithPremium')}
            </Title>
            
            <Row gutter={[10, 10]}>
              <Col xs={12} sm={12} md={6}>
                <div className="premium-feature-card">
                  <div style={{
                    width: '35px',
                    height: '35px',
                    background: 'linear-gradient(45deg, #FF69B4, #FF1493)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto',
                    boxShadow: '0 3px 10px rgba(255, 105, 180, 0.3)'
                  }}>
                    <HeartOutlined style={{ fontSize: '16px', color: '#fff' }} />
                  </div>
                  <Text strong style={{ display: 'block', color: '#fff', fontSize: 'clamp(11px, 2.5vw, 13px)', marginBottom: '3px' }}>
                    {t('v1.unlimitedMatches')}
                  </Text>
                  <Text style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.3 }}>
                    {t('v1.connectWithAnyone')}
                  </Text>
                </div>
              </Col>
              
              <Col xs={12} sm={12} md={6}>
                <div className="premium-feature-card">
                  <div style={{
                    width: '35px',
                    height: '35px',
                    background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto',
                    boxShadow: '0 3px 10px rgba(76, 205, 196, 0.3)'
                  }}>
                    <ThunderboltOutlined style={{ fontSize: '16px', color: '#fff' }} />
                  </div>
                  <Text strong style={{ display: 'block', color: '#fff', fontSize: 'clamp(11px, 2.5vw, 13px)', marginBottom: '3px' }}>
                    {t('v1.superLikes')}
                  </Text>
                  <Text style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.3 }}>
                    {t('v1.fivePerDay')}
                  </Text>
                </div>
              </Col>
              
              <Col xs={12} sm={12} md={6}>
                <div className="premium-feature-card">
                  <div style={{
                    width: '35px',
                    height: '35px',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto',
                    boxShadow: '0 3px 10px rgba(255, 215, 0, 0.3)'
                  }}>
                    <CrownOutlined style={{ fontSize: '16px', color: '#000' }} />
                  </div>
                  <Text strong style={{ display: 'block', color: '#fff', fontSize: 'clamp(11px, 2.5vw, 13px)', marginBottom: '3px' }}>
                    {t('v1.premiumBadge')}
                  </Text>
                  <Text style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.3 }}>
                    {t('v1.profileStandsOut')}
                  </Text>
                </div>
              </Col>
              
              <Col xs={12} sm={12} md={6}>
                <div className="premium-feature-card">
                  <div style={{
                    width: '35px',
                    height: '35px',
                    background: 'linear-gradient(45deg, #9C27B0, #673AB7)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto',
                    boxShadow: '0 3px 10px rgba(156, 39, 176, 0.3)'
                  }}>
                    <StarOutlined style={{ fontSize: '16px', color: '#fff' }} />
                  </div>
                  <Text strong style={{ display: 'block', color: '#fff', fontSize: 'clamp(11px, 2.5vw, 13px)', marginBottom: '3px' }}>
                    {t('v1.andMuchMore')}
                  </Text>
                  <Text style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.3 }}>
                    {t('v1.allPremiumFeatures')}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>

          {/* Thank you message */}
          <div className="thank-you-section" style={{ marginBottom: '15px', position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Paragraph style={{ 
                marginBottom: '5px',
                color: '#fff',
                fontSize: 'clamp(13px, 3vw, 15px)',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                <HeartOutlined style={{ marginRight: '6px', color: '#FF69B4' }} />
                {t('v1.thankYou')}
                <HeartOutlined style={{ marginLeft: '6px', color: '#FF69B4' }} />
              </Paragraph>
              <Text style={{ 
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'block',
                textAlign: 'center'
              }}>
                {t('v1.continueFinding')} 💕
              </Text>
            </div>
          </div>

          {/* Support message */}
          <div className="support-note" style={{ marginBottom: '20px', position: 'relative', zIndex: 1 }}>
            <Text style={{ 
              fontSize: 'clamp(10px, 2.2vw, 12px)',
              color: 'rgba(59, 130, 246, 0.9)',
              display: 'block',
              textAlign: 'center',
              lineHeight: 1.4
            }}>
              <strong>📧 Notă:</strong> {t('v1.supportNote')}
            </Text>
          </div>

          {/* Action button */}
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Button 
              type="primary" 
              size="large" 
              onClick={onClose}
              loading={loading}
              style={{
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                borderColor: 'transparent',
                color: '#000',
                height: 'clamp(40px, 8vw, 45px)',
                fontSize: 'clamp(13px, 3vw, 15px)',
                padding: '0 clamp(25px, 6vw, 35px)',
                borderRadius: '22px',
                fontWeight: '700',
                boxShadow: '0 6px 20px rgba(255, 215, 0, 0.3)',
                animation: 'pulse 2s ease-in-out infinite',
                width: '100%',
                maxWidth: '280px'
              }}
            >
              {t('v1.startExploring')} ✨
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
} 