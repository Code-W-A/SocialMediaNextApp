"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/lib/i18n';
import { Button, Typography, Space, Row, Col, Carousel } from 'antd';
import { HeartOutlined, MessageOutlined } from '@ant-design/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const { Title, Paragraph, Text } = Typography;

export default function LandingPage() {
  const { isSignedIn, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isSignedIn) {
      router.push('/home');
    }
  }, [loading, isSignedIn, router]);

  if (!mounted || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #fefcf3 0%, #f7f3e7 50%, #f0ebe0 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#2c3e50',
          fontSize: '1.2rem'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        /* Hide scrollbars but keep functionality */
        body {
          overflow-x: hidden;
        }
        
        /* Carousel styles */
        .landing-carousel .ant-carousel .slick-dots {
          bottom: 30px;
        }
        .landing-carousel .ant-carousel .slick-dots li button {
          background: rgba(44, 62, 80, 0.3);
          border-radius: 50%;
          width: 12px;
          height: 12px;
        }
        .landing-carousel .ant-carousel .slick-dots li.slick-active button {
          background: #2c3e50;
          box-shadow: 0 0 10px rgba(44, 62, 80, 0.5);
        }
        
        /* Language switcher mobile optimization */
        @media (max-width: 768px) {
          .ant-select.ant-select-sm {
            min-width: 50px !important;
          }
          .ant-select.ant-select-sm .ant-select-selection-item {
            font-size: 0 !important;
          }
          .ant-select.ant-select-sm .ant-select-selection-item span:first-child {
            font-size: 1.2rem !important;
            margin-right: 0 !important;
          }
          .ant-select-dropdown .ant-select-item-option-content {
            font-size: 0.9rem !important;
          }
        }
        
        /* Mobile responsive styles - PWA optimized */
        @media (max-width: 768px) {
          .slide-content {
            flex-direction: column !important;
            text-align: center !important;
            padding: 60px 20px 100px 20px !important;
            justify-content: center !important;
            min-height: 100vh !important;
          }
          .slide-left-content {
            padding-right: 0 !important;
            padding-top: 0 !important;
            margin-bottom: 30px !important;
            order: 2;
          }
          .slide-right-content {
            order: 1;
            margin-bottom: 20px !important;
          }
          .slide-image-container {
            width: 260px !important;
            height: 260px !important;
            margin: 0 auto !important;
          }
          .slide-title {
            font-size: 1.8rem !important;
            line-height: 1.1 !important;
            margin-bottom: 15px !important;
          }
          .slide-subtitle {
            font-size: 1rem !important;
            margin-bottom: 25px !important;
          }
          .slide-header {
            position: absolute !important;
            top: 15px !important;
            left: 20px !important;
            right: 20px !important;
            z-index: 10 !important;
            flex-wrap: wrap !important;
            justify-content: space-between !important;
          }
          .mobile-header-buttons {
            display: none !important;
          }
          .mobile-logo {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
          }
          .mobile-logo .ant-typography {
            font-size: 1.1rem !important;
          }
          .mobile-logo-icon {
            width: 30px !important;
            height: 30px !important;
            font-size: 14px !important;
          }
          .navigation-buttons {
            bottom: 15px !important;
            padding: 8px 15px !important;
            gap: 8px !important;
          }
          .navigation-buttons div {
            width: 30px !important;
            height: 3px !important;
          }
          .slide-badge {
            font-size: 0.75rem !important;
            padding: 6px 15px !important;
            margin-bottom: 20px !important;
          }
          .slide-buttons {
            flex-direction: column !important;
            gap: 12px !important;
            align-items: center !important;
          }
          .slide-buttons .ant-btn {
            width: 100% !important;
            max-width: 260px !important;
            height: 45px !important;
            font-size: 1rem !important;
          }
          .feature-list {
            display: none !important;
          }
          .decorative-element {
            display: none !important;
          }
        }
        
        /* Very small mobile devices */
        @media (max-width: 480px) {
          .slide-content {
            padding: 50px 15px 90px 15px !important;
          }
          .slide-image-container {
            width: 200px !important;
            height: 200px !important;
          }
          .slide-title {
            font-size: 1.6rem !important;
          }
          .slide-subtitle {
            font-size: 0.9rem !important;
          }
          .slide-buttons .ant-btn {
            max-width: 240px !important;
            height: 42px !important;
            font-size: 0.95rem !important;
          }
        }
        
        /* Tablet responsive */
        @media (min-width: 769px) and (max-width: 1024px) {
          .slide-content {
            padding: 0 40px !important;
          }
          .slide-image-container {
            width: 350px !important;
            height: 350px !important;
          }
          .slide-title {
            font-size: 3rem !important;
          }
          .slide-header {
            left: 40px !important;
            right: 40px !important;
          }
        }
        
        /* Ensure gradient text visibility */
        .gradient-text {
          background: linear-gradient(45deg, #FFD700, #FF6B6B) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          /* Fallback for browsers that don't support gradient text */
          color: #FFD700;
        }
        
        @supports (-webkit-background-clip: text) {
          .gradient-text {
            color: transparent;
          }
        }
      `}</style>
      
      <div style={{ height: '100vh', overflow: 'hidden' }}>
        <Carousel 
          autoplay 
          dots={{ className: 'custom-dots' }}
          autoplaySpeed={5000}
          style={{ height: '100vh' }}
          className="landing-carousel"
          ref={(carousel) => window.landingCarousel = carousel}
        >
          {/* Slide 1 - Connect & Discover */}
          <div>
            <div className="slide-content" style={{
              height: '100vh',
              background: 'linear-gradient(135deg, #fefcf3 0%, #f7f3e7 50%, #f0ebe0 100%)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 60px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div className="slide-header" style={{
                position: 'absolute',
                top: '30px',
                left: '60px',
                right: '60px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <div className="mobile-logo" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="mobile-logo-icon" style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    ✨
                  </div>
                  <Title level={3} style={{ 
                    margin: 0, 
                    color: '#2c3e50',
                    fontWeight: '700'
                  }}>
                    YDestiny
                  </Title>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <LanguageSwitcher size="small" />
                  <Space className="mobile-header-buttons" style={{ flexWrap: 'wrap' }}>
                    <Button 
                      size="large"
                      onClick={() => router.push('/sign-in')}
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#2c3e50',
                        color: '#2c3e50',
                        borderRadius: '25px',
                        fontWeight: '500'
                      }}
                    >
                      {t('landing.signIn')}
                    </Button>
                    <Button 
                      type="primary" 
                      size="large"
                      style={{ 
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        borderColor: 'transparent',
                        color: '#000',
                        fontWeight: '600',
                        borderRadius: '25px',
                        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                      }}
                      onClick={() => router.push('/sign-up')}
                    >
                      {t('landing.signUp')}
                    </Button>
                  </Space>
                </div>
              </div>

              {/* Left Content */}
              <div className="slide-left-content" style={{ 
                flex: '1', 
                paddingRight: '60px',
                zIndex: 2,
                paddingTop: '100px'
              }}>
                <div className="slide-badge" style={{
                  display: 'inline-block',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  color: '#000',
                  padding: '10px 25px',
                  borderRadius: '30px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '35px',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                }}>
                  {t('landing.slide1Badge')}
                </div>
                
                <Title level={1} className="slide-title" style={{ 
                  color: '#2c3e50',
                  fontSize: '4rem',
                  lineHeight: 1.1,
                  marginBottom: '30px',
                  fontWeight: '800'
                }}>
                  {t('landing.slide1Title1')}<br />
                  <span className="gradient-text">
                    {t('landing.slide1Title2')}
                  </span>
                </Title>
                
                <Paragraph className="slide-subtitle" style={{ 
                  fontSize: '1.4rem',
                  color: '#5d6d7e',
                  lineHeight: 1.6,
                  marginBottom: '50px',
                  maxWidth: '500px'
                }}>
                  {t('landing.slide1Description')}
                </Paragraph>
                
                <Space className="slide-buttons" size="large" style={{ flexWrap: 'wrap' }}>
                  <Button 
                    type="primary" 
                    size="large"
                    style={{ 
                      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                      borderColor: 'transparent',
                      color: '#000',
                      height: '60px',
                      fontSize: '1.2rem',
                      padding: '0 40px',
                      borderRadius: '30px',
                      fontWeight: '600',
                      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)'
                    }}
                    onClick={() => router.push('/sign-up')}
                  >
                    {t('landing.slide1Button1')}
                  </Button>
                  <Button 
                    size="large"
                    style={{ 
                      backgroundColor: 'transparent',
                      borderColor: '#2c3e50',
                      color: '#2c3e50',
                      height: '60px',
                      fontSize: '1.1rem',
                      padding: '0 35px',
                      borderRadius: '30px',
                      fontWeight: '500'
                    }}
                    onClick={() => router.push('/sign-in')}
                  >
                    {t('landing.slide1Button2')}
                  </Button>
                </Space>
              </div>
              
              {/* Right Image */}
              <div className="slide-right-content" style={{ 
                flex: '1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div className="slide-image-container" style={{
                  width: '450px',
                  height: '450px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.1)',
                  border: '10px solid rgba(255, 215, 0, 0.15)'
                }}>
                  <img 
                    src="/images/Minimalist digital illustration showing a group of people standing in a circle, holding hands, viewed from above, soft golden light casting long shadows, creamy white background with subtle texture, elegant line work, harmonious and inclusi.jpg"
                    alt="Community Connection"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                
                {/* Decorative Elements */}
                <div className="decorative-element" style={{
                  position: 'absolute',
                  top: '15%',
                  right: '10%',
                  width: '70px',
                  height: '70px',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  animation: 'float 3s ease-in-out infinite',
                  boxShadow: '0 10px 25px rgba(255, 215, 0, 0.3)'
                }}>
                  ✨
                </div>
                
                <div className="decorative-element" style={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '5%',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(45deg, #FF69B4, #FFB6C1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  animation: 'float 3s ease-in-out infinite 1s',
                  boxShadow: '0 10px 25px rgba(255, 105, 180, 0.3)'
                }}>
                  💫
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2 - Build Community */}
          <div>
            <div className="slide-content" style={{
              height: '100vh',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 50%, #e8eaed 100%)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 60px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div className="slide-header" style={{
                position: 'absolute',
                top: '30px',
                left: '60px',
                right: '60px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <div className="mobile-logo" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="mobile-logo-icon" style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    🌟
                  </div>
                  <Title level={3} style={{ 
                    margin: 0, 
                    color: '#2c3e50',
                    fontWeight: '700'
                  }}>
                    YDestiny
                  </Title>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <LanguageSwitcher size="small" />
                  <Space className="mobile-header-buttons" style={{ flexWrap: 'wrap' }}>
                    <Button 
                      size="large"
                      onClick={() => router.push('/sign-in')}
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#2c3e50',
                        color: '#2c3e50',
                        borderRadius: '25px',
                        fontWeight: '500'
                      }}
                    >
                      {t('landing.signIn')}
                    </Button>
                    <Button 
                      type="primary" 
                      size="large"
                      style={{ 
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        borderColor: 'transparent',
                        color: '#000',
                        fontWeight: '600',
                        borderRadius: '25px',
                        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                      }}
                      onClick={() => router.push('/sign-up')}
                    >
                      {t('landing.signUp')}
                    </Button>
                  </Space>
                </div>
              </div>

              {/* Left Content */}
              <div className="slide-left-content" style={{ 
                flex: '1', 
                paddingRight: '60px',
                zIndex: 2,
                paddingTop: '100px'
              }}>
                <div className="slide-badge" style={{
                  display: 'inline-block',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  color: '#000',
                  padding: '10px 25px',
                  borderRadius: '30px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '35px',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                }}>
                  {t('landing.slide2Badge')}
                </div>
                
                <Title level={1} className="slide-title" style={{ 
                  color: '#2c3e50',
                  fontSize: '4rem',
                  lineHeight: 1.1,
                  marginBottom: '30px',
                  fontWeight: '800'
                }}>
                  {t('landing.slide2Title1')}<br />
                  <span style={{ 
                    color: '#FFD700',
                    textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)'
                  }}>
                    {t('landing.slide2Title2')}
                  </span>
                </Title>
                
                <Paragraph className="slide-subtitle" style={{ 
                  fontSize: '1.4rem',
                  color: '#5d6d7e',
                  lineHeight: 1.6,
                  marginBottom: '40px',
                  maxWidth: '500px'
                }}>
                  {t('landing.slide2Description')}
                </Paragraph>
                
                <div className="feature-list" style={{ marginBottom: '50px' }}>
                  <Row gutter={[0, 20]}>
                    <Col span={24}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div className="feature-icon" style={{
                          width: '50px',
                          height: '50px',
                          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 6px 20px rgba(255, 215, 0, 0.3)'
                        }}>
                          <HeartOutlined style={{ color: '#000', fontSize: '20px' }} />
                        </div>
                        <Text className="feature-item" style={{ fontSize: '1.2rem', color: '#2c3e50', fontWeight: '500' }}>
                          {t('landing.slide2Feature1')}
                        </Text>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div className="feature-icon" style={{
                          width: '50px',
                          height: '50px',
                          background: 'linear-gradient(45deg, #FF69B4, #FFB6C1)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 6px 20px rgba(255, 105, 180, 0.3)'
                        }}>
                          <MessageOutlined style={{ color: '#fff', fontSize: '20px' }} />
                        </div>
                        <Text className="feature-item" style={{ fontSize: '1.2rem', color: '#2c3e50', fontWeight: '500' }}>
                          {t('landing.slide2Feature2')}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>
                
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    borderColor: 'transparent',
                    color: '#000',
                    height: '60px',
                    fontSize: '1.2rem',
                    padding: '0 40px',
                    borderRadius: '30px',
                    fontWeight: '600',
                    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)'
                  }}
                  onClick={() => router.push('/sign-up')}
                >
                  {t('landing.slide2Button')}
                </Button>
              </div>
              
              {/* Right Image */}
              <div className="slide-right-content" style={{ 
                flex: '1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div className="slide-image-container" style={{
                  width: '450px',
                  height: '450px',
                  borderRadius: '30px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.1)',
                  border: '10px solid rgba(255, 215, 0, 0.15)',
                  transform: 'rotate(-3deg)'
                }}>
                  <img 
                    src="/images/comunity.jpg"
                    alt="Community Growth"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'rotate(3deg) scale(1.1)'
                    }}
                  />
                </div>
                
                {/* Decorative Elements */}
                <div className="decorative-element" style={{
                  position: 'absolute',
                  top: '10%',
                  right: '15%',
                  width: '75px',
                  height: '75px',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                  animation: 'pulse 2s ease-in-out infinite',
                  boxShadow: '0 10px 25px rgba(255, 215, 0, 0.3)'
                }}>
                  🌟
                </div>
                
                <div className="decorative-element" style={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '10%',
                  width: '70px',
                  height: '70px',
                  background: 'linear-gradient(45deg, #FF69B4, #FFB6C1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  animation: 'float 3s ease-in-out infinite 0.5s',
                  boxShadow: '0 10px 25px rgba(255, 105, 180, 0.3)'
                }}>
                  💖
                </div>
              </div>
            </div>
          </div>
        </Carousel>
        
        {/* Custom Navigation Bars */}
        <div className="navigation-buttons" style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 20,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 20px',
          borderRadius: '25px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div
            onClick={() => window.landingCarousel?.goTo(0)}
            style={{
              width: '40px',
              height: '4px',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.height = '6px';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.height = '4px';
              e.target.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.4)';
            }}
          />
          
          <div
            onClick={() => window.landingCarousel?.goTo(1)}
            style={{
              width: '40px',
              height: '4px',
              background: '#667eea',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.height = '6px';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.height = '4px';
              e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.4)';
            }}
          />
        </div>
        
      </div>
    </>
  );
} 