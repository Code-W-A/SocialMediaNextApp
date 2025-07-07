"use client";

import React from 'react';
import { 
  Button, 
  Card, 
  Typography, 
  Input, 
  Space, 
  Alert, 
  Collapse, 
  Spin,
  Result,
  Divider
} from 'antd';
import { 
  ReloadOutlined, 
  HomeOutlined, 
  SendOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  BugOutlined
} from '@ant-design/icons';
import { logErrorToFirestore, sendErrorEmail, clearBrowserCache } from '@/services/errorLoggingService';
import { useLanguage } from '@/lib/i18n';
import { useUser, useAuth } from '@/hooks/useFirebaseAuth';
import Iconify from './Iconify';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      userMessage: '',
      isSubmitting: false,
      submitStatus: null, // 'success', 'error', null
      showTechnicalDetails: false,
      isClearing: false,
      isRedirecting: false,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for development
    console.error('🚨 [ErrorBoundary] Error caught by boundary:', error);
    console.error('📊 [ErrorBoundary] Error info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Auto-log error to Firestore (without user message initially)
    this.logErrorAutomatically(error, errorInfo);
  }

  logErrorAutomatically = async (error, errorInfo) => {
    try {
      // Get user from context if available
      const user = this.props.user || null;
      
      const result = await logErrorToFirestore(
        error,
        {
          ...errorInfo,
          errorBoundary: 'ErrorBoundary'
        },
        user,
        '', // No user message yet
        'error_boundary'
      );

      if (result.success) {
        this.setState({ errorId: result.errorId });
        console.log('✅ [ErrorBoundary] Error auto-logged with ID:', result.errorId);
      }
    } catch (logError) {
      console.error('❌ [ErrorBoundary] Failed to auto-log error:', logError);
    }
  };

  handleUserMessageChange = (e) => {
    this.setState({ userMessage: e.target.value });
  };

  handleSendReport = async () => {
    const { error, errorInfo, userMessage, errorId } = this.state;
    const { user = null, t } = this.props;

    this.setState({ isSubmitting: true, submitStatus: null });

    try {
      let finalErrorId = errorId;

      // If we don't have an errorId yet, log the error first
      if (!finalErrorId) {
        const logResult = await logErrorToFirestore(
          error,
          {
            ...errorInfo,
            errorBoundary: 'ErrorBoundary'
          },
          user,
          userMessage,
          'error_boundary_manual_report'
        );

        if (logResult.success) {
          finalErrorId = logResult.errorId;
        } else {
          throw new Error('Failed to log error to Firestore');
        }
      }

      // Send email with user message
      if (finalErrorId) {
        const emailResult = await sendErrorEmail(
          finalErrorId,
          {
            message: error.message,
            severity: 'user_reported',
            type: 'error_boundary',
            context: 'error_boundary',
            userId: user?.id,
            userEmail: user?.email,
            userName: user?.firstName && user?.lastName ? 
              `${user.firstName} ${user.lastName}` : 
              user?.username || 'Unknown',
            userMessage: userMessage,
            appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            browserInfo: {
              userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
              url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
              language: typeof window !== 'undefined' ? window.navigator.language : 'Unknown'
            }
          },
          userMessage
        );

        if (!emailResult.success) {
          throw new Error('Failed to send error email');
        }
      }

      this.setState({ submitStatus: 'success' });
      
      // Wait a moment then clear cache and redirect
      setTimeout(() => {
        this.handleClearCacheAndRedirect();
      }, 2000);

    } catch (submitError) {
      console.error('❌ [ErrorBoundary] Failed to send error report:', submitError);
      this.setState({ submitStatus: 'error' });
      
      // Still redirect after error
      setTimeout(() => {
        this.handleClearCacheAndRedirect();
      }, 3000);
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  handleGoToLanding = () => {
    this.handleClearCacheAndRedirect();
  };

  handleClearCacheAndRedirect = async () => {
    const { onRedirectToLanding } = this.props;
    
    this.setState({ isClearing: true });

    try {
      // Clear browser cache
      await clearBrowserCache();
      console.log('✅ [ErrorBoundary] Cache cleared successfully');
    } catch (clearError) {
      console.warn('⚠️ [ErrorBoundary] Failed to clear cache:', clearError);
      // Continue anyway
    }

    this.setState({ isClearing: false, isRedirecting: true });

    // Call the redirect function passed from parent
    if (onRedirectToLanding) {
      setTimeout(() => {
        onRedirectToLanding();
      }, 1000);
    } else {
      // Fallback: hard reload to home
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 1000);
    }
  };

  toggleTechnicalDetails = () => {
    this.setState({ 
      showTechnicalDetails: !this.state.showTechnicalDetails 
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { 
      error, 
      errorInfo, 
      userMessage, 
      isSubmitting, 
      submitStatus, 
      showTechnicalDetails,
      isClearing,
      isRedirecting,
      errorId
    } = this.state;

    const { t } = this.props;

    // Handle loading states
    if (isClearing) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Card style={{ maxWidth: '400px', textAlign: 'center' }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: '16px', color: '#1890ff' }}>
              {t('errorBoundary.clearingCache')}
            </Title>
            <Text type="secondary">
              Please wait while we clean up...
            </Text>
          </Card>
        </div>
      );
    }

    if (isRedirecting) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Card style={{ maxWidth: '400px', textAlign: 'center' }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: '16px', color: '#1890ff' }}>
              {t('errorBoundary.redirecting')}
            </Title>
            <Text type="secondary">
              Taking you back to safety...
            </Text>
          </Card>
        </div>
      );
    }

    return (
      <div style={{ 
        minHeight: '100vh', 
        padding: '20px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card 
          style={{ 
            maxWidth: '600px', 
            width: '100%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            borderRadius: '12px'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px',
              color: '#ff4d4f'
            }}>
              <BugOutlined />
            </div>
            
            <Title level={2} style={{ color: '#ff4d4f', marginBottom: '8px' }}>
              {t('errorBoundary.title')}
            </Title>
            
            <Text style={{ fontSize: '16px', color: '#666' }}>
              {t('errorBoundary.subtitle')}
            </Text>
          </div>

          {/* Description */}
          <Alert
            message={t('errorBoundary.description')}
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          {/* Success/Error Status */}
          {submitStatus === 'success' && (
            <Alert
              message={t('errorBoundary.errorSent')}
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {submitStatus === 'error' && (
            <Alert
              message={t('errorBoundary.errorSendFailed')}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {/* User Message Input */}
          {!submitStatus && (
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                {t('errorBoundary.userMessageLabel')}
              </Text>
              <TextArea
                value={userMessage}
                onChange={this.handleUserMessageChange}
                placeholder={t('errorBoundary.userMessagePlaceholder')}
                rows={3}
                maxLength={500}
                showCount
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Technical Details */}
          <Collapse 
            ghost 
            style={{ marginBottom: '24px' }}
            onChange={() => this.toggleTechnicalDetails()}
          >
            <Panel 
              header={
                <span>
                  <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  {showTechnicalDetails ? 
                    t('errorBoundary.hideTechnicalDetails') : 
                    t('errorBoundary.showTechnicalDetails')
                  }
                </span>
              } 
              key="1"
            >
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
                {errorId && (
                  <Text style={{ display: 'block', marginBottom: '8px' }}>
                    <strong>{t('errorBoundary.errorId')}:</strong> {errorId}
                  </Text>
                )}
                
                <Text style={{ display: 'block', marginBottom: '8px' }}>
                  <strong>{t('errorBoundary.timestamp')}:</strong> {new Date().toLocaleString()}
                </Text>
                
                <Text style={{ display: 'block', marginBottom: '8px' }}>
                  <strong>Error:</strong> {error?.message || 'Unknown error'}
                </Text>
                
                <Text style={{ display: 'block', marginBottom: '8px' }}>
                  <strong>{t('errorBoundary.url')}:</strong> {typeof window !== 'undefined' ? window.location.href : 'Unknown'}
                </Text>
                
                {error?.stack && (
                  <details style={{ marginTop: '12px' }}>
                    <summary style={{ cursor: 'pointer', color: '#1890ff' }}>
                      Stack Trace
                    </summary>
                    <pre style={{ 
                      marginTop: '8px', 
                      fontSize: '11px', 
                      background: '#fff', 
                      padding: '8px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </Panel>
          </Collapse>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={this.handleSendReport}
              loading={isSubmitting}
              disabled={!!submitStatus}
              style={{ 
                flex: '1',
                minWidth: '200px',
                background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
                border: 'none'
              }}
            >
              {isSubmitting ? t('errorBoundary.sendingError') : t('errorBoundary.sendErrorButton')}
            </Button>
            
            <Button
              size="large"
              icon={<HomeOutlined />}
              onClick={this.handleGoToLanding}
              disabled={isSubmitting || isClearing || isRedirecting}
              style={{ 
                flex: '1',
                minWidth: '200px'
              }}
            >
              {t('errorBoundary.goToLandingButton')}
            </Button>
          </div>

          {/* Help Text */}
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            background: '#f0f7ff', 
            borderRadius: '8px',
            border: '1px solid #d6e4ff'
          }}>
            <Text style={{ color: '#1890ff', fontSize: '13px' }}>
              <InfoCircleOutlined style={{ marginRight: '6px' }} />
              {t('errorBoundary.helpText')}
            </Text>
          </div>
        </Card>
      </div>
    );
  }
}

// HOC wrapper to provide hooks data to class component
const ErrorBoundaryWrapper = ({ children, onRedirectToLanding }) => {
  const { t } = useLanguage();
  const { user } = useUser();
  
  return (
    <ErrorBoundary 
      user={user} 
      t={t} 
      onRedirectToLanding={onRedirectToLanding}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWrapper; 