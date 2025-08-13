"use client";
import React from 'react';
import { Card, Typography, Divider, Tag, Space, Progress, Tooltip } from 'antd';
import { 
  getFullCompatibility, 
  getZodiacElement, 
  calculateNumerologyNumber,
  areRelationshipTypesCompatible,
  getRelationshipTypeText,
  getCompatibilityScoreDetails,
  getDerivedCompatibilityAspects,
  getNumerologyGeneralText,
  getAstrologyGeneralText
} from '@/utils/compatibilityHelpers';
import { areUsersCompatible } from '@/actions/admin';
import { useQuery } from '@tanstack/react-query';
import Iconify from '@/components/Iconify';
import { useLanguage } from '@/lib/i18n';

const { Title, Text, Paragraph } = Typography;

const CompatibilityCard = ({ currentUser, profileUser }) => {
  const { t } = useLanguage();
  // Check if users are manually compatible (admin setting)
  const { data: areManuallyCompatible } = useQuery({
    queryKey: ['compatibility', currentUser?.id, profileUser?.id],
    queryFn: () => areUsersCompatible(currentUser?.id, profileUser?.id),
    enabled: !!(currentUser?.id && profileUser?.id && currentUser.id !== profileUser.id),
  });

  // Don't show on own profile
  if (!currentUser || !profileUser || currentUser.id === profileUser.id) {
    return null;
  }

  const compatibility = getFullCompatibility(currentUser, profileUser);
  const scoreDetails = getCompatibilityScoreDetails(currentUser, profileUser);

  const getLevelKey = () => {
    const s = scoreDetails.overall || 0;
    if (s >= 90) return 'levelExceptional';
    if (s >= 80) return 'levelExcellent';
    if (s >= 70) return 'levelVeryGood';
    if (s >= 60) return 'levelGood';
    if (s >= 50) return 'levelModerate';
    return 'levelChallenging';
  };

  // Show compatibility card if there's any compatibility data available
  if (!compatibility.hasCompatibility) {
    return null;
  }

  // Check relationship type compatibility
  const areRelationshipTypesCompatibleResult = areRelationshipTypesCompatible(currentUser, profileUser);

  const currentZodiac = currentUser?.questionnaire?.zodiacSign;
  const profileZodiac = profileUser?.questionnaire?.zodiacSign;
  const currentElement = currentZodiac ? getZodiacElement(currentZodiac) : null;
  const profileElement = profileZodiac ? getZodiacElement(profileZodiac) : null;

  const currentNumerology = currentUser?.questionnaire?.birthDate ? 
    calculateNumerologyNumber(currentUser.questionnaire.birthDate) : null;
  const profileNumerology = profileUser?.questionnaire?.birthDate ? 
    calculateNumerologyNumber(profileUser.questionnaire.birthDate) : null;

  const getZodiacEmoji = (sign) => {
    const emojis = {
      "Berbec": "♈", "Taur": "♉", "Gemeni": "♊", "Rac": "♋",
      "Leu": "♌", "Fecioară": "♍", "Balanță": "♎", "Scorpion": "♏",
      "Săgetător": "♐", "Capricorn": "♑", "Vărsător": "♒", "Pești": "♓"
    };
    return emojis[sign] || "⭐";
  };

  const getElementColor = (element) => {
    const colors = {
      "Foc": "#ff4d4f",
      "Pământ": "#52c41a", 
      "Aer": "#1890ff",
      "Apă": "#722ed1"
    };
    return colors[element] || "#666";
  };

  const derived = getDerivedCompatibilityAspects(currentUser, profileUser);

  return (
    <Card
      size="small"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '16px',
        color: 'white'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Space align="center" size="small">
          <Iconify icon="ph:heart-fill" width="20px" color="#fff" />
          <Title level={5} style={{ color: 'white', margin: 0 }}>
            {t('compatibility.astralCompatibilityTitle')}
          </Title>
        </Space>
      </div>

      {/* Overall compatibility score */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <Progress
            type="circle"
            percent={Math.max(0, Math.min(100, scoreDetails.overall || 0))}
            width={78}
            strokeColor={scoreDetails.color}
            format={(p) => `${p}%`}
          />
          <div style={{ marginTop: 6, color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span>{scoreDetails.emoji}</span>
            <span>{scoreDetails.overall}%</span>
            <Tag color={scoreDetails.color} style={{ marginLeft: 6, border: 'none' }}>
              {t(`compatibility.${getLevelKey()}`)}
            </Tag>
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Space size={6} align="center">
              <Iconify icon="ph:sun-fill" width="14px" color="#ffd666" />
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{t('compatibility.astrology')}</Text>
            </Space>
            <Text style={{ color: 'white', fontSize: 12 }}>{scoreDetails.astrology}%</Text>
          </div>
          <Progress
            percent={Math.max(0, Math.min(100, scoreDetails.astrology || 0))}
            strokeColor="#ffd666"
            showInfo={false}
          />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Space size={6} align="center">
              <Iconify icon="ph:infinity-bold" width="14px" color="#73d13d" />
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{t('compatibility.numerology')}</Text>
            </Space>
            <Text style={{ color: 'white', fontSize: 12 }}>{scoreDetails.numerology}%</Text>
          </div>
          <Progress
            percent={Math.max(0, Math.min(100, scoreDetails.numerology || 0))}
            strokeColor="#73d13d"
            showInfo={false}
          />
        </div>
      </div>

      {/* Relationship Types Display */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '12px', 
        padding: '12px',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
            {t('compatibility.relationshipTypesSought')}
          </Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <Text style={{ color: 'white', fontSize: '12px' }}>
            {getRelationshipTypeText(currentUser?.questionnaire?.relationshipType)}
          </Text>
          <Iconify icon="ph:equals-bold" width="12px" color="#fff" />
          <Text style={{ color: 'white', fontSize: '12px' }}>
            {getRelationshipTypeText(profileUser?.questionnaire?.relationshipType)}
          </Text>
        </div>
      </div>

      {/* Zodiac Compatibility */}
      {compatibility.astrology && (
        <div style={{ marginBottom: '16px' }}>
          {/* Astrology general description for the viewed user's sign */}
          {profileZodiac && (
            <div style={{ 
              background: 'rgba(255,255,255,0.12)', 
              borderRadius: '12px', 
              padding: '12px',
              marginBottom: '8px'
            }}>
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Iconify icon="ph:sun-fill" width="14px" color="#ffd666" />
                <Text strong style={{ color: 'white', fontSize: '13px' }}>
                  {t('compatibility.astrologyGeneral')}
                </Text>
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.4' }}>
                {getAstrologyGeneralText(profileZodiac)}
              </Text>
            </div>
          )}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '12px'
          }}>
            {currentZodiac && (
              <Tag 
                color={getElementColor(currentElement)}
                style={{ 
                  fontSize: '16px', 
                  padding: '4px 8px',
                  border: 'none'
                }}
              >
                {getZodiacEmoji(currentZodiac)} {currentElement}
              </Tag>
            )}
            <Iconify icon="ph:heart-fill" width="16px" color="#ff69b4" />
            {profileZodiac && (
              <Tag 
                color={getElementColor(profileElement)}
                style={{ 
                  fontSize: '16px', 
                  padding: '4px 8px',
                  border: 'none'
                }}
              >
                {getZodiacEmoji(profileZodiac)} {profileElement}
              </Tag>
            )}
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            borderRadius: '12px', 
            padding: '12px',
            marginBottom: '8px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <Space align="center" size="small">
                <Iconify icon="ph:heart-fill" width="14px" color="#ff69b4" />
                <Text strong style={{ color: 'white', fontSize: '13px' }}>
                  {t('compatibility.loveAndRelationships')}
                </Text>
              </Space>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.4' }}>
              {compatibility.astrology.loveText || compatibility.astrology.dragoste}
            </Text>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            borderRadius: '12px', 
            padding: '12px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <Space align="center" size="small">
                <Iconify icon="ph:coins-fill" width="14px" color="#52c41a" />
                <Text strong style={{ color: 'white', fontSize: '13px' }}>
                  {t('compatibility.financeAndCollaboration')}
                </Text>
              </Space>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.4' }}>
              {compatibility.astrology.financeText || compatibility.astrology.finante}
            </Text>
          </div>
        </div>
      )}

      {/* Numerology Compatibility */}
      {compatibility.numerology && (
        <div>
          <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '16px 0 12px 0' }} />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '12px'
          }}>
            {currentNumerology && (
              <Tag 
                color="gold"
                style={{ 
                  fontSize: '16px', 
                  padding: '4px 8px',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                {currentNumerology}
              </Tag>
            )}
            <Iconify icon="ph:infinity-bold" width="16px" color="#ffd700" />
            {profileNumerology && (
              <Tag 
                color="gold"
                style={{ 
                  fontSize: '16px', 
                  padding: '4px 8px',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                {profileNumerology}
              </Tag>
            )}
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            borderRadius: '12px', 
            padding: '12px',
            marginBottom: '8px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <Space align="center" size="small">
                <Iconify icon="ph:heart-fill" width="14px" color="#ff69b4" />
                <Text strong style={{ color: 'white', fontSize: '13px' }}>
                  {t('compatibility.numerologyRelationship')}
                </Text>
              </Space>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.4' }}>
              {compatibility.numerology.loveText || compatibility.numerology.dragoste}
            </Text>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            borderRadius: '12px', 
            padding: '12px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <Space align="center" size="small">
                <Iconify icon="ph:coins-fill" width="14px" color="#52c41a" />
                <Text strong style={{ color: 'white', fontSize: '13px' }}>
                  {t('compatibility.financialAspects')}
                </Text>
              </Space>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.4' }}>
              {compatibility.numerology.financeText || compatibility.numerology.finante}
            </Text>
          </div>

          {/* Numerology General Description (for either user's Life Path) */}
          {(currentNumerology || profileNumerology) && (
            <div style={{ 
              background: 'rgba(255,255,255,0.12)', 
              borderRadius: '12px', 
              padding: '12px',
              marginTop: '8px'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <Space align="center" size="small">
                  <Iconify icon="ph:book-fill" width="14px" color="#ffd666" />
                  <Text strong style={{ color: 'white', fontSize: '13px' }}>
                    {t('compatibility.numerologyRelationship')}
                  </Text>
                </Space>
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.4' }}>
                {getNumerologyGeneralText(currentNumerology) || getNumerologyGeneralText(profileNumerology)}
              </Text>
            </div>
          )}
        </div>
      )}

      {/* Derived Aspects: Friendship, Spirituality, Activities */}
      <div style={{ marginTop: '16px' }}>
        <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10 }}>
            <Space size={6} align="center" style={{ marginBottom: 6 }}>
              <Iconify icon="ph:handshake-fill" width="14px" color="#69c0ff" />
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 12 }}>{t('compatibility.friendship')}</Text>
            </Space>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{derived.friendshipText}</Text>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10 }}>
            <Space size={6} align="center" style={{ marginBottom: 6 }}>
              <Iconify icon="ph:sparkle-fill" width="14px" color="#b37feb" />
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 12 }}>{t('compatibility.spirituality')}</Text>
            </Space>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{derived.spiritualityText}</Text>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10 }}>
            <Space size={6} align="center" style={{ marginBottom: 6 }}>
              <Iconify icon="ph:smiley-fill" width="14px" color="#ffd666" />
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 12 }}>{t('compatibility.activities')}</Text>
            </Space>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{derived.activitiesText}</Text>
          </div>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontStyle: 'italic' }}>
          {t('compatibility.basedOnAstrologyAndNumerology')}
        </Text>
      </div>
    </Card>
  );
};

export default CompatibilityCard; 