"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/lib/i18n';
import { Button, Typography, Space, Card, Row, Col, Steps } from 'antd';
import { HeartOutlined, StarOutlined, MessageOutlined, UserOutlined, ThunderboltOutlined, EyeOutlined, CrownOutlined, FireOutlined, GiftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

export default function LandingPage() {
  const { isSignedIn, loading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const totalSlides = 2;
  const autoSlideInterval = 5000; // 5 seconds

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [totalSlides, autoSlideInterval, isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setProgressKey(prev => prev + 1);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgressKey(prev => prev + 1);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgressKey(prev => prev + 1);
  };

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
        background: 'linear-gradient(135deg, #FFEDC9 0%, #FFF8E7 50%, #FFEDC9 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#FF8C00',
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
        body {
          margin: 0;
          overflow-x: hidden;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes starTwinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        
        .highlight {
          background: linear-gradient(135deg, var(--primary), #FFB84D);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .landing-image-desktop {
          width: 100%;
          max-width: 400px;
          height: auto;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.08);
          animation: float 4s ease-in-out infinite;
        }

        .landing-image-mobile {
          width: 100%;
          max-width: 280px;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin: 0 auto 2rem auto;
          display: block;
          animation: float 3s ease-in-out infinite;
        }

        .slide-container {
          position: relative;
          overflow: hidden;
          height: 100vh;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: transform 0.5s ease-in-out;
        }

        .slide.active {
          transform: translateX(0);
        }

        .slide.prev {
          transform: translateX(-100%);
        }

        .slide.next {
          transform: translateX(100%);
        }

        .slide-navigation {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          z-index: 100;
        }

        .slide-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .slide-dot.active {
          background: var(--primary);
          transform: scale(1.2);
          position: relative;
          overflow: hidden;
        }

        .slide-dot.active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: rgba(255, 255, 255, 0.3);
          animation: slideProgress 5s linear;
        }

        @keyframes slideProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .slide-container:hover .slide-dot.active::after {
          animation-play-state: paused;
        }

        .slide-arrows {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 100;
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 0 2rem;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .slide-arrows {
            display: none;
          }
        }

        .slide-arrow {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: all;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .slide-arrow:hover {
          background: white;
          transform: scale(1.1);
        }

        /* Mobile App-like Styles */
        @media (max-width: 768px) {
          body {
            overflow: hidden;
          }
          
          .mobile-app-container {
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          
          .mobile-hero {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 1rem;
            position: relative;
          }
          
          .mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 0;
            z-index: 10;
          }
          
          .mobile-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
            z-index: 10;
          }
          
          .mobile-actions {
            padding: 1rem 0 2rem;
            z-index: 10;
          }
          
          .mobile-title {
            font-size: 2.2rem !important;
            font-weight: 800 !important;
            line-height: 1.2 !important;
            margin-bottom: 1rem !important;
          }
          
          .mobile-subtitle {
            font-size: 1rem !important;
            line-height: 1.5 !important;
            margin-bottom: 2rem !important;
            opacity: 0.8;
          }
          
          .mobile-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }
          
          .mobile-button {
            width: 100% !important;
            height: 50px !important;
            border-radius: 12px !important;
            font-size: 1rem !important;
            font-weight: 600 !important;
          }
          
          .mobile-trust {
            font-size: 0.8rem !important;
            opacity: 0.7;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          
          .desktop-only {
            display: none !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-title {
            font-size: 1.8rem !important;
          }
          
          .mobile-subtitle {
            font-size: 0.9rem !important;
          }
          
          .mobile-hero {
            padding: 0.75rem;
          }
        }
      `}</style>
      
      <div 
        className="slide-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Slide Navigation */}
        <div className="slide-navigation">
          {Array.from({ length: totalSlides }, (_, index) => (
            <div
              key={index}
              className={`slide-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Slide Arrows */}
        <div className="slide-arrows desktop-only">
          <div className="slide-arrow" onClick={prevSlide}>
            ←
          </div>
          <div className="slide-arrow" onClick={nextSlide}>
            →
          </div>
        </div>

        {/* Background Elements */}
      <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          background: 'linear-gradient(135deg, #FFEDC9 0%, #FFF8E7 50%, #FFEDC9 100%)'
      }}>
        <div style={{
          position: 'absolute',
            top: '10%',
            left: '10%',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, var(--primary), rgba(249, 170, 17, 0.3))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            opacity: 0.3,
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
            top: '60%',
            right: '15%',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, #FFB84D, rgba(255, 184, 77, 0.3))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            opacity: 0.3,
            animation: 'float 6s ease-in-out infinite -2s'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: '180px',
            height: '180px',
            background: 'linear-gradient(135deg, var(--primary), rgba(249, 170, 17, 0.2))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            opacity: 0.3,
            animation: 'float 6s ease-in-out infinite -4s'
        }} />
        </div>

        {/* Slide 1: Hero Section */}
        <div className={`slide ${currentSlide === 0 ? 'active' : currentSlide < 0 ? 'prev' : 'next'}`}>
          {/* Desktop Version */}
          <div className="desktop-only" style={{ position: 'relative', zIndex: 1 }}>
            {/* Language Switcher */}
          <div style={{
              position: 'absolute', 
              top: '20px', 
              right: '20px',
              zIndex: 10
            }}>
              <LanguageSwitcher />
            </div>

            {/* Hero Section */}
            <div style={{
              minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
              maxWidth: '1200px',
            margin: '0 auto',
              padding: '0 2rem'
          }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                alignItems: 'center',
                width: '100%'
              }}>
                {/* Hero Text */}
                <div style={{
                  animation: 'slideInLeft 1s ease-out 0.3s both'
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '3rem'
                  }}>
              <div style={{
                width: '50px',
                height: '50px',
                      background: 'linear-gradient(45deg, var(--primary), #FFB84D)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(249, 170, 17, 0.3)'
              }}>
                      <StarOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <Title level={2} style={{ 
                margin: 0, 
                      background: 'linear-gradient(45deg, var(--primary), #FFB84D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                YDestiny
              </Title>
          </div>

                  <Title level={1} style={{ 
                    fontSize: '3.5rem', 
                    fontWeight: '800',
                    lineHeight: '1.1',
                    marginBottom: '1.5rem',
                    color: 'var(--text-color)'
            }}>
                    {language === 'ro' 
                      ? <>Găsește-ți <span className="highlight">{t('landing.heroTitleHighlight')}</span> prin Magia Astrelor</>
                      : <>Find Your <span className="highlight">{t('landing.heroTitleHighlight')}</span> Through the Magic of Stars</>
                    }
            </Title>
            
                  <Paragraph style={{ 
                    fontSize: '1.25rem', 
                    lineHeight: '1.6',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '2.5rem'
            }}>
              {t('landing.heroSubtitle')}
            </Paragraph>
            
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem',
                    marginBottom: '3rem',
                    animation: 'slideInUp 1s ease-out 0.8s both'
                  }}>
              <Button 
                type="primary" 
                size="large"
                style={{ 
                        height: '56px',
                        padding: '0 2rem',
                        borderRadius: '16px',
                        background: 'var(--primary)',
                        border: 'none',
                  fontWeight: '600',
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 24px rgba(249, 170, 17, 0.3)'
                }}
                onClick={() => router.push('/sign-up')}
              >
                {t('landing.startCosmicJourney')}
              </Button>
              <Button 
                size="large"
                style={{ 
                        height: '56px',
                        padding: '0 2rem',
                        borderRadius: '16px',
                        border: '2px solid var(--primary)',
                        background: 'transparent',
                        color: 'var(--primary)',
                        fontWeight: '600',
                        fontSize: '1.1rem'
                }}
                onClick={() => router.push('/sign-in')}
              >
                {t('landing.alreadyHaveAccount')}
              </Button>
                  </div>

                  {/* Trust Indicators */}
            <div style={{ 
              display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    animation: 'fadeIn 1s ease-out 1.2s both'
                  }}>
                    <Text style={{ fontSize: '0.9rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                      {t('landing.trustIndicator')}
                </Text>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {[1,2,3,4,5].map((star, index) => (
                        <StarOutlined 
                          key={star}
                          style={{ 
                            color: 'var(--primary)', 
                            animation: `starTwinkle 2s ease-in-out infinite ${index * 0.2}s` 
                          }} 
                        />
                      ))}
              </div>
            </div>
          </div>

                {/* Hero Visual */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  position: 'relative',
                  animation: 'slideInRight 1s ease-out 0.5s both'
                  }}>
                  <img 
                    src="/images/landing-page.jpg" 
                    alt="YDestiny Landing" 
                    className="landing-image-desktop"
                  />
                  </div>
                  </div>
            </div>
          </div>

          {/* Mobile Version */}
          <div className="mobile-only mobile-app-container">
            <div className="mobile-hero">
              {/* Mobile Header */}
              <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(45deg, var(--primary), #FFB84D)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <StarOutlined style={{ fontSize: '16px', color: '#fff' }} />
                  </div>
                  <Title level={3} style={{ 
                    margin: 0, 
                    background: 'linear-gradient(45deg, var(--primary), #FFB84D)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    YDestiny
                  </Title>
                </div>
                <LanguageSwitcher />
          </div>

              {/* Mobile Content */}
              <div className="mobile-content">
                <img 
                  src="/images/landing-page.jpg" 
                  alt="YDestiny Landing" 
                  className="landing-image-mobile"
                />
                
                <Title className="mobile-title" style={{ 
                  color: 'var(--text-color)'
                }}>
                  {language === 'ro' 
                    ? <>Găsește-ți <span className="highlight">{t('landing.heroTitleHighlight')}</span></>
                    : <>Find Your <span className="highlight">{t('landing.heroTitleHighlight')}</span></>
                  }
            </Title>
            
                <Paragraph className="mobile-subtitle" style={{ 
                  color: 'rgba(0, 0, 0, 0.7)'
                }}>
                  {language === 'ro' 
                    ? "Descoperă conexiuni cosmice autentice prin compatibilitatea astrologică."
                    : "Discover authentic cosmic connections through astrological compatibility."
                  }
                  </Paragraph>
              </div>
              
              {/* Mobile Actions */}
              <div className="mobile-actions">
                <div className="mobile-buttons">
                  <Button 
                    type="primary" 
                    className="mobile-button"
                  style={{ 
                      background: 'var(--primary)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(249, 170, 17, 0.3)'
                  }}
                    onClick={() => router.push('/sign-up')}
                  >
                    {t('landing.startCosmicJourney')}
                  </Button>
                  <Button 
                    className="mobile-button"
                  style={{ 
                      border: '2px solid var(--primary)',
                      background: 'transparent',
                      color: 'var(--primary)'
                  }}
                    onClick={() => router.push('/sign-in')}
                >
                    {t('landing.alreadyHaveAccount')}
                  </Button>
                </div>
                
                <div className="mobile-trust">
                  <Text style={{ fontSize: '0.8rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                    {language === 'ro' ? "10,000+ utilizatori" : "10,000+ users"}
                  </Text>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    {[1,2,3,4,5].map((star) => (
                      <StarOutlined 
                        key={star}
                  style={{ 
                          color: 'var(--primary)', 
                          fontSize: '0.7rem'
                        }} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2: Community Section */}
        <div className={`slide ${currentSlide === 1 ? 'active' : currentSlide < 1 ? 'prev' : 'next'}`}>
          {/* Desktop Version */}
          <div className="desktop-only" style={{ position: 'relative', zIndex: 1 }}>
            {/* Language Switcher */}
                  <div style={{
              position: 'absolute', 
              top: '20px', 
              right: '20px',
              zIndex: 10
            }}>
              <LanguageSwitcher />
          </div>

            {/* Community Section */}
          <div style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
            maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 2rem'
          }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
              alignItems: 'center',
                width: '100%'
              }}>
                {/* Community Text */}
                <div style={{
                  animation: 'slideInLeft 1s ease-out 0.3s both'
            }}>
                  <Title level={1} style={{ 
                    fontSize: '3.5rem', 
                    fontWeight: '800',
                    lineHeight: '1.1',
                    marginBottom: '1.5rem',
                    color: 'var(--text-color)'
            }}>
                    {t('landing.communityTitle')}
            </Title>
            
            <Paragraph style={{ 
                    fontSize: '1.25rem', 
                    lineHeight: '1.6',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '2.5rem'
            }}>
                    {t('landing.communitySubtitle')}
            </Paragraph>

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    animation: 'slideInUp 1s ease-out 0.8s both'
                  }}>
                    <Button 
                      type="primary" 
                      size="large"
                      style={{ 
                        height: '56px',
                        padding: '0 2rem',
                        borderRadius: '16px',
                        background: 'var(--primary)',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 24px rgba(249, 170, 17, 0.3)'
                      }}
                      onClick={() => router.push('/sign-up')}
                    >
                      {t('landing.startCosmicJourney')}
                    </Button>
                  </div>
                </div>
              
                {/* Community Visual */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  animation: 'slideInRight 1s ease-out 0.5s both'
                  }}>
                  <img 
                    src="/images/comunity.jpg" 
                    alt="YDestiny Community" 
                    className="landing-image-desktop"
                  />
                  </div>
                </div>
            </div>
          </div>
              
          {/* Mobile Version */}
          <div className="mobile-only mobile-app-container">
            <div className="mobile-hero">
              {/* Mobile Header */}
              <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(45deg, var(--primary), #FFB84D)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <StarOutlined style={{ fontSize: '16px', color: '#fff' }} />
                  </div>
                  <Title level={3} style={{ 
                    margin: 0,
                    background: 'linear-gradient(45deg, var(--primary), #FFB84D)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    YDestiny
                  </Title>
                </div>
                <LanguageSwitcher />
                </div>

              {/* Mobile Content */}
              <div className="mobile-content">
                <img 
                  src="/images/comunity.jpg" 
                  alt="YDestiny Community" 
                  className="landing-image-mobile"
                />
            
                <Title className="mobile-title" style={{ 
                  color: 'var(--text-color)'
              }}>
                  {t('landing.communityTitle')}
              </Title>
                
                <Paragraph className="mobile-subtitle" style={{ 
                  color: 'rgba(0, 0, 0, 0.7)'
              }}>
                  {t('landing.communitySubtitle')}
              </Paragraph>
              </div>

              {/* Mobile Actions */}
              <div className="mobile-actions">
                <div className="mobile-buttons">
              <Button 
                type="primary" 
                    className="mobile-button"
                style={{ 
                      background: 'var(--primary)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(249, 170, 17, 0.3)'
                }}
                onClick={() => router.push('/sign-up')}
              >
                    {t('landing.startCosmicJourney')}
              </Button>
            </div>
          </div>
                </div>
          </div>
        </div>

      </div>
    </>
  );
} 