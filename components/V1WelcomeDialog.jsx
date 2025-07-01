"use client";

import React, { useState } from 'react';
import { Modal, Button, Typography, Card, Divider, Space } from 'antd';
import { HeartFilled, CrownOutlined, RocketFilled, CustomerServiceOutlined, StarFilled } from '@ant-design/icons';
import Iconify from './Iconify';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { updateUserProfile } from '@/actions/user';
import { useLanguage } from '@/lib/i18n';
import styles from '@/styles/V1WelcomeDialog.module.css';

const { Title, Text, Paragraph } = Typography;

const V1WelcomeDialog = ({ open, visible, onClose, onConfirm, user }) => {
  const [isActivating, setIsActivating] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Premium features - SYNCHRONIZED WITH /premium PAGE - LOCALIZED
  const premiumFeatures = [
    {
      icon: <HeartFilled style={{ fontSize: '20px', color: '#ff4d4f' }} />,
      title: t('premium.priorityCompatibility'),
      description: t('premium.priorityCompatibilityDesc'),
    },
    {
      icon: <CrownOutlined style={{ fontSize: '20px', color: '#FFD700' }} />,
      title: t('premium.premiumBadgeFeature'),
      description: t('premium.premiumBadgeDesc'),
    },
    {
      icon: <RocketFilled style={{ fontSize: '20px', color: '#722ed1' }} />,
      title: t('premium.increasedVisibility'),
      description: t('premium.increasedVisibilityDesc'),
    },
    {
      icon: <CustomerServiceOutlined style={{ fontSize: '20px', color: '#52c41a' }} />,
      title: t('premium.prioritySupport'),
      description: t('premium.prioritySupportDesc'),
    },
    {
      icon: <StarFilled style={{ fontSize: '20px', color: '#faad14' }} />,
      title: t('premium.exclusiveFeatures'),
      description: t('premium.exclusiveFeaturesDesc'),
    },
    {
      icon: <Iconify icon="eva:heart-fill" width="20px" style={{ color: '#eb2f96' }} />,
      title: t('premium.moreMatches'),
      description: t('premium.moreMatchesDesc'),
    },
  ];

  const handleClose = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  const activatePremiumMutation = useMutation({
    mutationFn: () => updateUserProfile({ 
      id: user.id,
      v1WelcomeShown: true,
      freePremiumGranted: true 
    }),
    onSuccess: () => {
      toast.success('🎉 Premium activat cu succes!');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      handleClose();
    },
    onError: (error) => {
      console.error('Error activating V1 premium:', error);
      toast.error('Eroare la activarea Premium. Încearcă din nou.');
    },
    onSettled: () => {
      setIsActivating(false);
    }
  });

  const handleActivatePremium = () => {
    setIsActivating(true);
    activatePremiumMutation.mutate();
  };

  return (
    <Modal
      open={open || visible}
      onCancel={handleClose}
      footer={null}
      width={500}
      centered
      style={{ padding: 0 }}
      className={styles.v1Dialog}
      closeIcon={false}
      maskClosable={false}
    >
      <div className={styles.dialogContent}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <CrownOutlined className={styles.crownIcon} />
          </div>
          
          <Title level={2} className={styles.title}>
            {t('v1.congratulations')}
          </Title>
          
                     <Title level={3} className={styles.subtitle}>
             {t('v1.freePremiumAccount')}
           </Title>
         </div>

        <Card className={styles.messageCard}>
          <Text className={styles.messageText}>
            {t('v1.v1Message')}
          </Text>
        </Card>

        <Divider className={styles.divider} />

        {/* Premium Features */}
        <div className={styles.featuresSection}>
          <Title level={4} className={styles.featuresTitle}>
            {t('v1.whatYouGetWithPremium')}
          </Title>

                     <div className={styles.featuresList}>
             {premiumFeatures.map((feature, index) => (
               <div
                 key={index}
                 className={styles.featureItem}
               >
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>
                <div className={styles.featureContent}>
                  <Text strong className={styles.featureTitle}>
                    {feature.title}
                  </Text>
                  <Text className={styles.featureDescription}>
                    {feature.description}
                  </Text>
                                 </div>
               </div>
             ))}
          </div>
        </div>

        <Divider className={styles.divider} />

        <div className={styles.footerSection}>
          <Text className={styles.thankYouText}>
            {t('v1.thankYou')}
          </Text>
          
          <Text className={styles.continueText}>
            {t('v1.continueFinding')}
          </Text>

          <Button
            type="primary"
            size="large"
            loading={isActivating}
            onClick={handleActivatePremium}
            className={styles.activateButton}
          >
            {t('v1.activatePremium')}
          </Button>

          <Text className={styles.supportNote}>
            {t('v1.supportNote', { email: 'support@ydestiny.ro' })}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default V1WelcomeDialog; 