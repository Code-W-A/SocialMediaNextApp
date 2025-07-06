"use client";
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Modal, 
  Input, 
  Space, 
  Alert, 
  message, 
  Divider,
  List,
  Spin
} from 'antd';
import { sendPasswordReset, deleteUserAccount } from '@/actions/account';
import { useUser } from '@/hooks/useFirebaseAuth';
import { useRouter } from 'next/navigation';
import Iconify from '@/components/Iconify';
import { useLanguage } from '@/lib/i18n';
import PWAInstallSection from '@/components/PWAInstallSection';

const { Title, Text, Paragraph } = Typography;

const AccountSettings = () => {
  const { user: currentUser, logout } = useUser();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset Password
  const handleResetPassword = async () => {
    if (!currentUser?.email) {
      message.error(t('accountSettings.messages.noEmailFound'));
      return;
    }

    setResetPasswordLoading(true);
    try {
      const result = await sendPasswordReset(currentUser.email);
      
      if (result.success) {
        message.success(t('accountSettings.messages.passwordResetSent'));
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      message.error(t('accountSettings.messages.passwordResetFailed'));
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // Delete Account (complete deletion)
  const handleDeleteAccount = async () => {
    if (!currentUser) {
      message.error(t('accountSettings.messages.noUserLoggedIn'));
      return;
    }

    if (deleteConfirmation !== 'DELETE') {
      message.error(t('accountSettings.messages.pleaseTypeDelete'));
      return;
    }

    if (!currentPassword.trim()) {
      message.error(t('accountSettings.messages.pleaseEnterPassword'));
      return;
    }

    setDeleteAccountLoading(true);
    
    try {
      const result = await deleteUserAccount(currentPassword, currentUser.email);
      
      if (result.success) {
        message.success(t('accountSettings.messages.accountDeletedSuccess'));
        // Logout and redirect
        await logout();
        router.push('/auth/sign-in');
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      message.error(t('accountSettings.messages.accountDeleteFailed'));
    } finally {
      setDeleteAccountLoading(false);
      setDeleteAccountModal(false);
      setDeleteConfirmation('');
      setCurrentPassword('');
    }
  };

  const securityItems = [
    {
      icon: 'eva:lock-fill',
      title: t('accountSettings.changePassword'),
      description: t('accountSettings.changePasswordDesc'),
      action: (
        <Button
          type="primary"
          loading={resetPasswordLoading}
          onClick={handleResetPassword}
          icon={<Iconify icon="eva:email-fill" width="16px" />}
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          {t('accountSettings.sendResetEmail')}
        </Button>
      )
    },
    {
      icon: 'eva:trash-2-fill',
      title: t('accountSettings.deleteAccount'),
      description: t('accountSettings.deleteAccountDesc'),
      danger: true,
      action: (
        <Button
          danger
          onClick={() => setDeleteAccountModal(true)}
          icon={<Iconify icon="eva:trash-2-fill" width="16px" />}
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          {t('accountSettings.deleteAccount')}
        </Button>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Title level={3} style={{ margin: '0 0 0.5rem 0' }}>
          <Iconify icon="eva:settings-fill" width="24px" style={{ marginRight: '8px' }} />
          {t('accountSettings.title')}
        </Title>
        <Text type="secondary">
          {t('accountSettings.subtitle')}
        </Text>
      </div>

      {/* Account Information */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Iconify icon="eva:person-fill" width="20px" />
            {t('accountSettings.accountInformation')}
          </div>
        }
        style={{ marginBottom: '1.5rem' }}
      >
        <List
          dataSource={[
            { label: t('accountSettings.email'), value: currentUser?.email || t('accountSettings.notSet') },
            { label: t('accountSettings.username'), value: currentUser?.username || t('accountSettings.notSet') },
            { label: t('accountSettings.accountId'), value: currentUser?.id || t('accountSettings.notAvailable') }
          ]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.label}
                description={item.value}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Security Settings */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Iconify icon="eva:shield-fill" width="20px" />
            {t('accountSettings.securityPrivacy')}
          </div>
        }
        style={{ marginBottom: '1.5rem' }}
      >
        <List
          dataSource={securityItems}
          renderItem={(item) => (
            <List.Item
              actions={isMobile ? [] : [item.action]}
              style={{ 
                borderColor: item.danger ? '#ff4d4f' : undefined,
                backgroundColor: item.danger ? '#fff2f0' : undefined,
                borderRadius: item.danger ? '8px' : undefined,
                padding: item.danger ? '16px' : undefined,
                marginBottom: item.danger ? '8px' : undefined,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center'
              }}
            >
              <List.Item.Meta
                avatar={
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: item.danger ? '#ff4d4f' : '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Iconify 
                      icon={item.icon} 
                      width="20px" 
                      color="white" 
                    />
                  </div>
                }
                title={
                  <Text strong style={{ color: item.danger ? '#ff4d4f' : undefined }}>
                    {item.title}
                  </Text>
                }
                description={
                  <div>
                    <div style={{ marginBottom: isMobile ? '12px' : '0' }}>
                      {item.description}
                    </div>
                    {isMobile && (
                      <div style={{ marginTop: '12px' }}>
                        {item.action}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* PWA Install Section */}
      <PWAInstallSection />

      {/* Delete Account Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4f' }}>
            <Iconify icon="eva:alert-triangle-fill" width="24px" />
            {t('accountSettings.deleteAccountModal.title')}
          </div>
        }
        open={deleteAccountModal}
        onCancel={() => {
          setDeleteAccountModal(false);
          setDeleteConfirmation('');
          setCurrentPassword('');
        }}
        footer={null}
        width={isMobile ? '90%' : 500}
        centered
      >
        <div style={{ padding: '1rem 0' }}>
          <Alert
            message={t('accountSettings.deleteAccountModal.warning')}
            description={t('accountSettings.deleteAccountModal.warningDesc')}
            type="error"
            showIcon
            style={{ marginBottom: '1.5rem' }}
          />

          <div style={{ marginBottom: '1.5rem' }}>
            <Title level={5} style={{ color: '#ff4d4f', marginBottom: '0.5rem' }}>
              {t('accountSettings.deleteAccountModal.whatWillBeDeleted')}
            </Title>
            <ul style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
              <li>{t('accountSettings.deleteAccountModal.profileAndInfo')}</li>
              <li>{t('accountSettings.deleteAccountModal.photosMedia')}</li>
              <li>{t('accountSettings.deleteAccountModal.postsComments')}</li>
              <li>{t('accountSettings.deleteAccountModal.authData')}</li>
              <li>{t('accountSettings.deleteAccountModal.connections')}</li>
              <li>{t('accountSettings.deleteAccountModal.messages')}</li>
              <li>{t('accountSettings.deleteAccountModal.notifications')}</li>
            </ul>
            
            <Alert
              message={t('accountSettings.deleteAccountModal.recoveryWarning')}
              description={t('accountSettings.deleteAccountModal.recoveryWarningDesc')}
              type="warning"
              showIcon
              style={{ marginTop: '1rem' }}
            />
          </div>

          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>{t('accountSettings.deleteAccountModal.enterCurrentPassword')}</Text>
              <Input.Password
                placeholder={t('accountSettings.deleteAccountModal.currentPasswordPlaceholder')}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ marginTop: '8px' }}
              />
            </div>

            <div>
              <Text strong>{t('accountSettings.deleteAccountModal.typeDeleteConfirm')}</Text>
              <Input
                placeholder={t('accountSettings.deleteAccountModal.typeDeletePlaceholder')}
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                style={{ marginTop: '8px' }}
              />
            </div>
          </Space>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginTop: '2rem',
            justifyContent: 'flex-end',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <Button
              onClick={() => {
                setDeleteAccountModal(false);
                setDeleteConfirmation('');
                setCurrentPassword('');
              }}
              disabled={deleteAccountLoading}
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              {t('accountSettings.deleteAccountModal.cancel')}
            </Button>
            <Button
              danger
              type="primary"
              loading={deleteAccountLoading}
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || !currentPassword.trim()}
              icon={<Iconify icon="eva:trash-2-fill" width="16px" />}
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              {t('accountSettings.deleteAccountModal.deleteAccountPermanently')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountSettings; 