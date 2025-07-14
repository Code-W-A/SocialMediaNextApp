import React, { useState, useEffect } from 'react';
import { notification, Button, Avatar } from 'antd';
import Iconify from './Iconify';
import { getMainProfileImage } from '@/utils/imageHelpers';
import { getDisplayName } from '@/utils/profileHelpers';
import { useLanguage } from '@/lib/i18n';
import css from '@/styles/notifications.module.css';

const NotificationPopup = ({ 
  user, 
  unreadMessagesCount, 
  newCompatibilitiesCount,
  onMarkCompatibilitiesAsSeen 
}) => {
  const { t } = useLanguage();
  const [lastNotificationCount, setLastNotificationCount] = useState({
    messages: 0,
    compatibilities: 0
  });

  // Helper function to play notification sound
  const playNotificationSound = (type = 'message') => {
    try {
      // Create audio context for notification sounds
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different notification types
      if (type === 'message') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      } else if (type === 'compatibility') {
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
      }

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio notification not available:', error);
    }
  };

  // Custom notification component for messages
  const MessageNotification = ({ count, onClose }) => (
    <div className={css.messageNotification} style={{
      padding: '16px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      minWidth: '320px',
      maxWidth: '400px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div className={css.iconContainer} style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <Iconify icon="eva:message-circle-fill" width="24px" style={{ color: 'white' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            color: 'white', 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '600' 
          }}>
            💬 {t('messages.newMessagesReceived')}
          </h4>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            margin: 0, 
            fontSize: '14px' 
          }}>
            {t('messages.youHave')} {count} {t('messages.newMessage')}{count > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <Button
          type="primary"
          size="small"
          className={css.notificationButton}
          onClick={() => {
            onClose();
            window.location.href = '/messages';
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            borderRadius: '6px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)'
          }}
        >
          📧 {t('messages.viewMessages')}
        </Button>
        <Button
          type="text"
          size="small"
          className={css.notificationButton}
          onClick={onClose}
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '6px'
          }}
        >
          ✕
        </Button>
      </div>
    </div>
  );

  // Custom notification component for compatibility matches
  const CompatibilityNotification = ({ count, onClose }) => (
    <div className={css.compatibilityNotification} style={{
      padding: '16px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      color: 'white',
      boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      minWidth: '320px',
      maxWidth: '400px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div className={css.iconContainer} style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <Iconify icon="eva:heart-fill" width="24px" style={{ color: 'white' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            color: 'white', 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '600' 
          }}>
            💕 {t('matches.newCompatibilityFound')}
          </h4>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            margin: 0, 
            fontSize: '14px' 
          }}>
            {t('matches.youHave')} {count} {t('matches.newCompatibility')}{count > 1 ? 'ies' : 'y'}!
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <Button
          type="primary"
          size="small"
          className={css.notificationButton}
          onClick={() => {
            onMarkCompatibilitiesAsSeen();
            onClose();
            window.location.href = '/matches';
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            borderRadius: '6px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)'
          }}
        >
          💖 {t('matches.viewMatches')}
        </Button>
        <Button
          type="text"
          size="small"
          className={css.notificationButton}
          onClick={onClose}
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '6px'
          }}
        >
          ✕
        </Button>
      </div>
    </div>
  );

  // Show notification for new unread messages
  useEffect(() => {
    if (unreadMessagesCount > lastNotificationCount.messages && lastNotificationCount.messages > 0) {
      const newMessagesCount = unreadMessagesCount - lastNotificationCount.messages;
      
      // Play notification sound
      playNotificationSound('message');
      
      notification.open({
        message: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Iconify icon="eva:message-circle-fill" width="20px" style={{ color: '#667eea' }} />
            <span style={{ fontWeight: '600', fontSize: '16px' }}>
              💬 {t('messages.newMessagesReceived')}
            </span>
          </div>
        ),
        description: (
          <div style={{ marginLeft: '28px' }}>
            <p style={{ margin: '4px 0 12px 0', color: '#666' }}>
              {t('messages.youHave')} {newMessagesCount} {t('messages.newMessage')}{newMessagesCount > 1 ? 's' : ''}
            </p>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                notification.destroy();
                window.location.href = '/messages';
              }}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              📧 {t('messages.viewMessages')}
            </Button>
          </div>
        ),
        placement: 'topRight',
        duration: 6,
        style: {
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
          border: '1px solid #e8e8e8'
        }
      });
    }
    
    setLastNotificationCount(prev => ({ ...prev, messages: unreadMessagesCount }));
  }, [unreadMessagesCount, lastNotificationCount.messages, t]);

  // Show notification for new compatibilities
  useEffect(() => {
    if (newCompatibilitiesCount > lastNotificationCount.compatibilities && lastNotificationCount.compatibilities >= 0) {
      const newCompatCount = newCompatibilitiesCount - lastNotificationCount.compatibilities;
      
      if (newCompatCount > 0) {
        // Play notification sound
        playNotificationSound('compatibility');
        
        notification.open({
          message: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Iconify icon="eva:heart-fill" width="20px" style={{ color: '#ff6b6b' }} />
              <span style={{ fontWeight: '600', fontSize: '16px' }}>
                💕 {t('notifications.newCompatibilityFound')}
              </span>
            </div>
          ),
          description: (
            <div style={{ marginLeft: '28px' }}>
              <p style={{ margin: '4px 0 12px 0', color: '#666' }}>
                {t('messages.youHave')} {newCompatCount} {newCompatCount > 1 ? 'compatibilități noi' : 'compatibilitate nouă'}!
              </p>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  onMarkCompatibilitiesAsSeen();
                  notification.destroy();
                  window.location.href = '/matches';
                }}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500'
                }}
              >
                💖 {t('matches.viewMatches')}
              </Button>
            </div>
          ),
          placement: 'topRight',
          duration: 8,
          style: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(255, 107, 107, 0.2)',
            border: '1px solid #e8e8e8'
          }
        });
      }
    }
    
    setLastNotificationCount(prev => ({ ...prev, compatibilities: newCompatibilitiesCount }));
  }, [newCompatibilitiesCount, lastNotificationCount.compatibilities, onMarkCompatibilitiesAsSeen, t]);

  return null; // This component doesn't render anything directly
};

export default NotificationPopup; 