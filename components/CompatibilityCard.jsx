"use client";
import React from 'react';
import { Card, Typography, Divider, Tag, Space } from 'antd';
import { 
  getFullCompatibility, 
  getZodiacElement, 
  calculateNumerologyNumber,
  areRelationshipTypesCompatible,
  getRelationshipTypeText
} from '@/utils/compatibilityHelpers';
import { areUsersCompatible } from '@/actions/admin';
import { useQuery } from '@tanstack/react-query';
import Iconify from '@/components/Iconify';

const { Title, Text, Paragraph } = Typography;

const CompatibilityCard = ({ currentUser, profileUser }) => {
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

  // Only show if users are manually compatible
  if (!areManuallyCompatible) {
    return null;
  }

  // Check relationship type compatibility
  const areRelationshipTypesCompatibleResult = areRelationshipTypesCompatible(currentUser, profileUser);

  // Don't show compatibility texts if relationship types are incompatible
  if (!areRelationshipTypesCompatibleResult) {
    return null;
  }

  const compatibility = getFullCompatibility(currentUser, profileUser);

  // Don't show if no compatibility data
  if (!compatibility.hasCompatibility) {
    return null;
  }

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
            Compatibilitate Astrală
          </Title>
        </Space>
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
            Tipuri de relație căutate
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
                  Dragoste & Relații
                </Text>
              </Space>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.4' }}>
              {compatibility.astrology.dragoste}
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
                  Finanțe & Colaborare
                </Text>
              </Space>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.4' }}>
              {compatibility.astrology.finante}
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
                  Relația Numerologică
                </Text>
              </Space>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.4' }}>
              {compatibility.numerology.dragoste}
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
                  Aspecte Financiare
                </Text>
              </Space>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.4' }}>
              {compatibility.numerology.finante}
            </Text>
          </div>
        </div>
      )}

      <div style={{ 
        textAlign: 'center', 
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Text style={{ 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: '11px',
          fontStyle: 'italic'
        }}>
          ✨ Compatibilitate bazată pe astrologie și numerologie ✨
        </Text>
      </div>
    </Card>
  );
};

export default CompatibilityCard; 