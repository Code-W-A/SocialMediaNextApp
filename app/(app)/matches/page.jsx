"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Alert, Skeleton, Typography, Card, Button, Avatar, Space, Tag, Row, Col, Modal, message, Divider, Tooltip } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyCompatibilities } from "@/actions/admin";
import { getAllUsers } from "@/actions/admin";
import { useUser } from "@/hooks/useFirebaseAuth";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getFullCompatibility, areRelationshipTypesCompatible, getCompatibilityScoreDetails } from "@/utils/compatibilityHelpers";
import { getDisplayName } from "@/utils/profileHelpers";
import { createConversation } from "@/actions/chat";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import OnlineStatusIndicator, { OnlineStatusAvatar } from "@/components/OnlineStatusIndicator";
import PremiumBadge from "@/components/PremiumBadge";
import css from "@/styles/Home.module.css";
import { useLanguage } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { FEATURE_FLAGS, loadFlagsFromEnv } from "@/utils/featureFlags";
import { useNotifications } from "@/hooks/useNotifications";
import { activateBoost } from "@/actions/user";

const { Title, Text, Paragraph } = Typography;

const MatchCard = ({ user, currentUser, onStartChat, isNewCompatibility, enableSuperLike, onSuperLike }) => {
  const router = useRouter();
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
  
  const mainImage = getMainProfileImage(user.images);
  const compatibility = getFullCompatibility(currentUser, user);
  const relationshipCompatible = areRelationshipTypesCompatible(currentUser, user);
  const scoreDetails = getCompatibilityScoreDetails(currentUser, user);

  const cardStyle = {
    position: 'relative',
    width: '100%',
    height: 'auto',
    minHeight: isMobile ? '280px' : '520px',
    maxHeight: isMobile ? '320px' : '580px',
    borderRadius: isMobile ? '16px' : '20px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#fff',
    boxShadow: isNewCompatibility ? '0 8px 30px rgba(99, 102, 241, 0.3)' : '0 8px 30px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
    border: isNewCompatibility ? '2px solid #6366f1' : '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column'
  };

  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    height: isMobile ? '200px' : '240px',
    overflow: 'hidden',
    flexShrink: 0
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center top',
    transition: 'transform 0.6s ease',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)'
  };

  const overlayStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 20%, rgba(0, 0, 0, 0.85) 100%)',
    padding: '12px 14px 10px',
    color: 'white',
    zIndex: 3
  };

  const tagsStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 2
  };

  const tagStyle = (color) => ({
    background: `${color}`,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '3px 8px',
    fontSize: '10px',
    fontWeight: '600',
    margin: 0,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  });

  const contentStyle = {
    padding: '14px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  // Mobile version
  if (isMobile) {
    return (
      <div 
        style={cardStyle}
        onClick={() => router.push(`/profile/${user.id}?person=${getDisplayName(user)}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section - Full height for mobile */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '200px',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <img
            src={mainImage}
            alt={`${user.firstName} ${user.lastName}`}
            style={imageStyle}
          />
          
          {/* New Compatibility Badge */}
          {isNewCompatibility && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '600',
              zIndex: 4,
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '12px' }}>✨</span>
              NEW
            </div>
          )}
          
          {/* Verification Badge */}
          {user.verified && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: isNewCompatibility ? '52px' : '8px',
              background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
            }}>
              <Iconify icon="eva:checkmark-fill" width="12px" style={{ color: 'white' }} />
            </div>
          )}

          {/* Online Status - top left */}
          <div style={{ 
            position: 'absolute',
            top: '8px',
            left: '8px',
            zIndex: 2,
            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))'
          }}>
            <OnlineStatusIndicator 
              userId={user.id} 
              showText={false} 
              size="small"
            />
          </div>
        </div>

        {/* Info Section - Bottom */}
        <div style={{
          padding: '8px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Name, Age, Compatibility */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#333',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email?.split('@')[0] || 'Unknown User'}
                </span>
                <PremiumBadge user={user} size="small" showText={false} showTooltip={false} />
                {user.age && (
                  <span style={{ 
                    color: '#666', 
                    fontSize: '12px',
                    fontWeight: '500',
                    flexShrink: 0
                  }}>
                    {user.age}
                  </span>
                )}
              </div>
            </div>
            
            {/* Compatibility Score */}
            <div style={{
              background: `linear-gradient(135deg, ${scoreDetails.color}, ${scoreDetails.color}dd)`,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700',
              flexShrink: 0
            }}>
              {scoreDetails.overall}%
            </div>
          </div>

          {/* Chat Button - Full width at bottom */}
          <Button
            type="primary"
            block
            icon={<Iconify icon="eva:message-circle-fill" width="16px" />}
            onClick={(e) => {
              e.stopPropagation();
              onStartChat(user);
            }}
            style={{
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            Chat
          </Button>
        </div>

        {/* Compatibility Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <OnlineStatusAvatar userId={user.id} size="medium">
                  <Avatar src={mainImage} size={40}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </Avatar>
                </OnlineStatusAvatar>
                <div>
                  <span>Compatibility with {user.firstName}</span>
                  <div style={{ marginTop: '4px' }}>
                    <OnlineStatusIndicator userId={user.id} showText={true} />
                  </div>
                </div>
              </div>
              <div style={{
                background: `linear-gradient(135deg, ${scoreDetails.color}, ${scoreDetails.color}dd)`,
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Text style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                  {scoreDetails.overall}%
                </Text>
                <Text style={{ color: 'white', fontSize: '14px', margin: 0 }}>
                  {scoreDetails.emoji} {scoreDetails.level}
                </Text>
              </div>
            </div>
          }
          open={showCompatibility}
          onCancel={() => setShowCompatibility(false)}
          footer={null}
          width="90%"
          style={{ maxWidth: '400px' }}
        >
          <div style={{ padding: '16px 0' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f0f2ff, #fafbff)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <Title level={4} style={{ margin: '0 0 8px 0', color: scoreDetails.color }}>
                Overall Compatibility
              </Title>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: scoreDetails.color,
                marginBottom: '8px'
              }}>
                {scoreDetails.overall}%
              </div>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                {scoreDetails.emoji} {scoreDetails.level}
              </Text>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Desktop version
  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div style={imageContainerStyle}>
        <img
          src={mainImage}
          alt={`${user.firstName} ${user.lastName}`}
          style={imageStyle}
        />
        
        {/* NEW Badge and Compatibility Tags */}
        <div style={tagsStyle}>
          {/* New Compatibility Badge */}
          {isNewCompatibility && (
            <div style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '700',
              margin: 0,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ fontSize: '14px' }}>✨</span>
              NEW
            </div>
          )}
          {compatibility.astrology && (
            <div style={tagStyle('#722ed1')}>
              <Iconify icon="eva:star-fill" width="14px" style={{ marginRight: '6px' }} />
              YDestiny
            </div>
          )}
          {compatibility.numerology && (
            <div style={tagStyle('#1890ff')}>
              <Iconify icon="eva:hash-fill" width="14px" style={{ marginRight: '6px' }} />
              Numerology
            </div>
          )}
        </div>

        {/* Verification Badge */}
        {user.verified && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
          }}>
            <Iconify icon="eva:checkmark-fill" width="16px" style={{ color: 'white' }} />
          </div>
        )}

        {/* Name Overlay */}
        <div style={overlayStyle}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                marginBottom: '2px'
              }}>
                <div style={{ 
                  color: 'white', 
                  fontSize: '18px', 
                  fontWeight: '700',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                  margin: 0,
                  lineHeight: '1.1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email?.split('@')[0] || 'Unknown User'}
                  </span>
                  <PremiumBadge 
                    user={user} 
                    size="small" 
                    showText={false} 
                    showTooltip={false}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))' }}
                  />
                </div>
                
                {/* Online Status Indicator */}
                <div style={{ 
                  flexShrink: 0,
                  filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))'
                }}>
                  <OnlineStatusIndicator 
                    userId={user.id} 
                    showText={false} 
                    size="small"
                  />
                </div>
                
                {user.age && (
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '14px',
                    fontWeight: '500',
                    margin: 0,
                    flexShrink: 0
                  }}>
                    {user.age}
                  </div>
                )}
              </div>
              
              {user.location && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '3px',
                  overflow: 'hidden'
                }}>
                  <Iconify icon="eva:pin-fill" width="10px" style={{ color: 'rgba(255, 255, 255, 0.8)', flexShrink: 0 }} />
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '11px',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.location}
                  </div>
                </div>
              )}
            </div>
            
            {/* Compatibility Score Badge */}
            <div style={{
              background: `linear-gradient(135deg, ${scoreDetails.color}, ${scoreDetails.color}dd)`,
              padding: '6px 10px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              flexShrink: 0
            }}>
              <Text style={{ 
                color: 'white', 
                fontSize: '14px', 
                fontWeight: '700',
                margin: 0
              }}>
                {scoreDetails.overall}%
              </Text>
              <Text style={{ 
                color: 'white', 
                fontSize: '10px',
                margin: 0
              }}>
                {scoreDetails.emoji}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={contentStyle}>
        {/* Header Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            flex: 1,
            minWidth: 0
          }}>
            <span style={{ 
              fontSize: '16px', 
              color: '#333', 
              fontWeight: '700',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email?.split('@')[0] || 'Unknown User'}
            </span>
            
            {/* Premium Badge */}
            <PremiumBadge user={user} size="small" showText={false} showTooltip={false} />
            
            {/* Online Status Indicator */}
            <div style={{ flexShrink: 0 }}>
              <OnlineStatusIndicator 
                userId={user.id} 
                showText={false} 
                size="small"
              />
            </div>
            
            {user.age && (
              <span style={{ 
                color: '#666', 
                fontSize: '14px',
                flexShrink: 0
              }}>
                {user.age}
              </span>
            )}
            {user.questionnaire?.zodiacSign && (
              <span style={{ 
                color: '#722ed1', 
                fontSize: '12px', 
                fontWeight: '600',
                flexShrink: 0
              }}>
                {user.questionnaire.zodiacSign}
              </span>
            )}
          </div>
          
          {user.questionnaire?.relationshipType && (
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: '600',
              flexShrink: 0
            }}>
              {user.questionnaire.relationshipType === 'Relație de lungă durată' ? '💕' :
               user.questionnaire.relationshipType === 'Relație casual' ? '😊' :
               user.questionnaire.relationshipType === 'Prietenie' ? '👫' : '💫'}
            </div>
          )}
        </div>
        
        {/* Location */}
        {user.location && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            marginBottom: '8px'
          }}>
            <Iconify icon="eva:pin-fill" width="12px" style={{ color: '#999' }} />
            <span style={{ 
              color: '#666', 
              fontSize: '12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user.location}
            </span>
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ 
              color: '#555',
              fontSize: '13px',
              lineHeight: '1.3',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {user.bio}
            </div>
          </div>
        )}

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ 
              fontSize: '10px', 
              color: '#999', 
              fontWeight: '600', 
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Interests
            </div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '4px',
              maxHeight: '36px',
              overflow: 'hidden'
            }}>
              {user.interests.slice(0, 5).map((interest, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f5f5f5',
                    color: '#666',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '500',
                    border: '1px solid #e8e8e8',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {interest}
                </div>
              ))}
              {user.interests.length > 5 && (
                <div style={{
                  background: '#e6f7ff',
                  color: '#1890ff',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  +{user.interests.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compatibility Info */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '6px',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <Text style={{ 
              fontSize: '10px', 
              color: '#999', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Compatibility
            </Text>
            <div style={{
              background: scoreDetails.color,
              color: 'white',
              padding: '1px 6px',
              borderRadius: '8px',
              fontSize: '9px',
              fontWeight: '700'
            }}>
              {scoreDetails.level}
            </div>
            <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {compatibility.astrology && scoreDetails.astrology > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #722ed115, #722ed108)',
                border: '1px solid #722ed130',
                padding: '6px 8px',
                borderRadius: '6px',
                flex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Iconify icon="eva:star-fill" width="10px" style={{ color: '#722ed1' }} />
                    <Text style={{ fontSize: '9px', fontWeight: '600', color: '#722ed1', margin: 0 }}>
                      Astro
                    </Text>
                  </div>
                  <Text style={{ fontSize: '10px', fontWeight: '700', color: '#722ed1', margin: 0 }}>
                    {scoreDetails.astrology}%
                  </Text>
                </div>
              </div>
            )}
            {compatibility.numerology && scoreDetails.numerology > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1890ff15, #1890ff08)',
                border: '1px solid #1890ff30',
                padding: '6px 8px',
                borderRadius: '6px',
                flex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Iconify icon="eva:hash-fill" width="10px" style={{ color: '#1890ff' }} />
                    <Text style={{ fontSize: '9px', fontWeight: '600', color: '#1890ff', margin: 0 }}>
                      Numero
                    </Text>
                  </div>
                  <Text style={{ fontSize: '10px', fontWeight: '700', color: '#1890ff', margin: 0 }}>
                    {scoreDetails.numerology}%
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '6px',
          marginTop: 'auto'
        }}>
          <Button
            type="default"
            size="small"
            icon={<Iconify icon="eva:person-fill" width="14px" />}
            onClick={() => router.push(`/profile/${user.id}?person=${getDisplayName(user)}`)}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '10px',
              border: '1px solid #e8e8e8',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#722ed1';
              e.currentTarget.style.color = '#722ed1';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e8e8e8';
              e.currentTarget.style.color = '';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Profile
          </Button>
          
          <Button
            type="default"
            size="small"
            icon={<Iconify icon="eva:star-outline" width="14px" />}
            onClick={() => setShowCompatibility(true)}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '10px',
              border: '1px solid #e8e8e8',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e8e8e8';
              e.currentTarget.style.color = '';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Details
          </Button>

          <Button
            type="primary"
            size="small"
            icon={<Iconify icon="eva:message-circle-fill" width="14px" />}
            onClick={() => onStartChat(user)}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
              border: 'none',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            Chat
          </Button>

          {enableSuperLike && (
            <Button
              size="small"
              icon={<Iconify icon="mdi:heart-flash" width="14px" />}
              onClick={(e) => { e.stopPropagation(); onSuperLike?.(user); }}
              style={{
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: 'none',
                fontWeight: '600',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.3s ease',
                color: '#000'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              Super Like
            </Button>
          )}
          

        </div>
      </div>

      {/* Compatibility Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <OnlineStatusAvatar userId={user.id} size="medium">
                <Avatar src={mainImage} size={40}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </Avatar>
              </OnlineStatusAvatar>
              <div>
                <span>Compatibility with {user.firstName}</span>
                <div style={{ marginTop: '4px' }}>
                  <OnlineStatusIndicator userId={user.id} showText={true} />
                </div>
              </div>
            </div>
            <div style={{
              background: `linear-gradient(135deg, ${scoreDetails.color}, ${scoreDetails.color}dd)`,
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Text style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                {scoreDetails.overall}%
              </Text>
              <Text style={{ color: 'white', fontSize: '14px', margin: 0 }}>
                {scoreDetails.emoji} {scoreDetails.level}
              </Text>
            </div>
          </div>
        }
        open={showCompatibility}
        onCancel={() => setShowCompatibility(false)}
        footer={null}
        width={700}
      >
        <div style={{ padding: '16px 0' }}>
          {/* Always show compatibility - remove relationship type check */}
          <>
            {/* Overall Score Section */}
            <div style={{ 
              background: 'linear-gradient(135deg, #f0f2ff, #fafbff)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <Title level={4} style={{ margin: '0 0 8px 0', color: scoreDetails.color }}>
                Overall Compatibility Score
              </Title>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '800', 
                color: scoreDetails.color,
                marginBottom: '8px'
              }}>
                {scoreDetails.overall}%
              </div>
              <Text style={{ fontSize: '16px', color: '#666' }}>
                {scoreDetails.emoji} {scoreDetails.level} Match
              </Text>
            </div>

            {compatibility.astrology && scoreDetails.astrology > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Iconify icon="eva:star-fill" width="20px" style={{ color: '#722ed1' }} />
                    <Title level={5} style={{ margin: 0 }}>
                      Astrological Compatibility
                    </Title>
                  </div>
                  <div style={{
                    background: '#722ed1',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    {scoreDetails.astrology}%
                  </div>
                </div>
                
                <Card size="small" style={{ marginBottom: '12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Iconify icon="eva:heart-fill" width="16px" style={{ color: '#722ed1' }} />
                    <Text strong>Love & Relationships</Text>
                  </div>
                  <Paragraph style={{ marginBottom: 0 }}>
                    {compatibility.astrology.dragoste}
                  </Paragraph>
                </Card>
                
                <Card size="small" style={{ borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Iconify icon="eva:trending-up-fill" width="16px" style={{ color: '#722ed1' }} />
                    <Text strong>Financial Compatibility</Text>
                  </div>
                  <Paragraph style={{ marginBottom: 0 }}>
                    {compatibility.astrology.finante}
                  </Paragraph>
                </Card>
              </div>
            )}

            {compatibility.numerology && scoreDetails.numerology > 0 && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Iconify icon="eva:hash-fill" width="20px" style={{ color: '#1890ff' }} />
                    <Title level={5} style={{ margin: 0 }}>
                      Numerological Compatibility
                    </Title>
                  </div>
                  <div style={{
                    background: '#1890ff',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    {scoreDetails.numerology}%
                  </div>
                </div>
                
                <Card size="small" style={{ marginBottom: '12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Iconify icon="eva:heart-fill" width="16px" style={{ color: '#1890ff' }} />
                    <Text strong>Love & Relationships</Text>
                  </div>
                  <Paragraph style={{ marginBottom: 0 }}>
                    {compatibility.numerology.dragoste}
                  </Paragraph>
                </Card>
                
                <Card size="small" style={{ borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Iconify icon="eva:trending-up-fill" width="16px" style={{ color: '#1890ff' }} />
                    <Text strong>Financial Compatibility</Text>
                  </div>
                  <Paragraph style={{ marginBottom: 0 }}>
                    {compatibility.numerology.finante}
                  </Paragraph>
                </Card>
              </div>
            )}

            {/* Show message if no compatibility data available */}
            {!compatibility.astrology && !compatibility.numerology && (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <Iconify icon="eva:star-outline" width="48px" style={{ color: '#ccc', marginBottom: '16px' }} />
                <Title level={4} type="secondary">Compatibility Analysis</Title>
                <Text type="secondary">
                  Complete your profile questionnaire to see detailed compatibility analysis.
                </Text>
              </div>
            )}
          </>
        </div>
      </Modal>
    </div>
  );
};

const MatchesPage = () => {
  const { user: currentUser } = useUser();
  const { t } = useLanguage();
  const router = useRouter();
  const { isPremium } = useSubscription();
  const flags = loadFlagsFromEnv();
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { newCompatibilities, markCompatibilitiesAsSeen } = useNotifications(currentUser);

  // Check for mobile screen size and iOS
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get user's compatible user IDs
  const { data: compatibleUserIds, isLoading: loadingCompatibilities } = useQuery({
    queryKey: ["myCompatibilities", currentUser?.id],
    queryFn: () => getMyCompatibilities(currentUser?.id),
    enabled: !!currentUser?.id,
  });

  // Get all users to filter compatible ones
  const { data: allUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers,
    enabled: !!compatibleUserIds,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      message.success("Conversation started!");
      router.push(`/messages?conversation=${data.conversationId}`);
    },
    onError: (error) => {
      message.error("Failed to start conversation");
      console.error("Error creating conversation:", error);
    },
  });

  const handleStartChat = async (user) => {
    if (!currentUser?.id || !user?.id) return;
    
    createConversationMutation.mutate({
      user1Id: currentUser.id,
      user2Id: user.id,
    });
  };

  const handleSuperLike = (user) => {
    // Soft-gate: Only allow super-like for premium when flag is on
    if (!flags.PREMIUM_SUPER_LIKES) return; // feature disabled globally
    if (!isPremium) {
      router.push('/premium');
      return;
    }
    message.success(`Super Like sent to ${user.firstName || user.username || 'user'} ✨`);
    // NOTE: For live safety, we only show UI feedback; backend action can be added later
  };

  const handleBoost = async () => {
    // Feature disabled globally
    if (!flags.PREMIUM_BOOST) return;
    if (!isPremium) {
      router.push('/premium');
      return;
    }
    try {
      await activateBoost(currentUser.id, 30);
      message.success('Boost activ pentru 30 minute! 🚀');
    } catch (e) {
      message.error('Nu am putut activa boost-ul. Încearcă din nou.');
    }
  };

  // Filter compatible users and sort with new compatibilities first
  const compatibleUsers = useMemo(() => {
    const filtered = allUsers?.filter(user => 
      compatibleUserIds?.includes(user.id) && user.id !== currentUser?.id
    ) || [];
    
    // Prioritize boosted users (if feature enabled and boost is active)
    const now = Date.now();
    const isBoosted = (u) => {
      if (!flags.PREMIUM_BOOST) return false;
      const until = u?.boostUntil
        ? (u.boostUntil.toDate ? u.boostUntil.toDate().getTime() : new Date(u.boostUntil).getTime())
        : 0;
      return until > now;
    };

    // Sort: boosted first, then new compatibilities
    return filtered.sort((a, b) => {
      const aBoost = isBoosted(a);
      const bBoost = isBoosted(b);
      if (aBoost && !bBoost) return -1;
      if (!aBoost && bBoost) return 1;
      const aIsNew = newCompatibilities.some(newComp => newComp.id === a.id);
      const bIsNew = newCompatibilities.some(newComp => newComp.id === b.id);
      
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      return 0;
    });
  }, [allUsers, compatibleUserIds, currentUser?.id, newCompatibilities]);

  const isLoading = loadingCompatibilities || loadingUsers;

  // Mark compatibilities as seen when user actually views them
  useEffect(() => {
    if (compatibleUsers.length > 0 && newCompatibilities.length > 0) {
      let timer;
      let hasInteracted = false;
      
      // Mark as seen after user interaction or after 10 seconds
      const markAsSeen = () => {
        if (!hasInteracted) {
          hasInteracted = true;
          markCompatibilitiesAsSeen();
        }
      };
      
      // Mark as seen on user interaction
      const handleInteraction = () => {
        clearTimeout(timer);
        markAsSeen();
      };
      
      // Add event listeners for user interaction
      document.addEventListener('click', handleInteraction);
      document.addEventListener('scroll', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
      
      // Fallback: mark as seen after 10 seconds even without interaction
      timer = setTimeout(markAsSeen, 10000);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('scroll', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };
    }
  }, [compatibleUsers.length, newCompatibilities.length, markCompatibilitiesAsSeen]);

  return (
    <div style={{ 
      width: '100%',
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '0'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: 'none',
        padding: isMobile ? '1rem 1rem' : '1.5rem 2rem',
        minHeight: '100%',
        paddingBottom: isMobile && isIOS ? '8rem' : isMobile ? '5rem' : '4rem'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: isMobile ? '1.5rem' : '3rem',
          background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
          borderRadius: isMobile ? '16px' : '24px',
          padding: isMobile ? '1.2rem 1rem' : '2.5rem 2rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '8px' : '16px',
              marginBottom: isMobile ? '8px' : '16px'
            }}>
              <Iconify icon="eva:heart-fill" width={isMobile ? "24px" : "40px"} style={{ color: 'white' }} />
              <Title level={isMobile ? 3 : 1} style={{ 
                margin: 0, 
                color: 'white',
                fontSize: isMobile ? '1.4rem' : '2.5rem',
                fontWeight: '800'
              }}>
                {t('matches.title')}
              </Title>
            </div>
            
            {!isMobile && (
              <Text style={{ 
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.9)',
                display: 'block',
                marginBottom: '24px'
              }}>
                {t('matches.subtitle')}
              </Text>
            )}
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: isMobile ? '8px 16px' : '12px 24px',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <Text strong style={{ fontSize: isMobile ? '16px' : '24px', color: 'white' }}>
                {compatibleUsers.length}
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: isMobile ? '12px' : '16px' }}>
                {t('matches.compatibleSoulsFound')}
              </Text>
              {flags.PREMIUM_WHO_LIKED_YOU_UPSELL && !isPremium && (
                <Tooltip title="Vezi cine te-a apreciat - Premium">
                  <Button
                    size={isMobile ? 'small' : 'middle'}
                    onClick={() => router.push('/premium')}
                    style={{
                      marginLeft: '8px',
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      border: 'none',
                      color: '#000',
                      borderRadius: '999px',
                      fontWeight: 700
                    }}
                    icon={<Iconify icon="mdi:eye" width={isMobile ? '14px' : '18px'} />}
                  >
                    Cine te-a plăcut
                  </Button>
                </Tooltip>
              )}
              {flags.PREMIUM_BOOST && (
                <Button
                  size={isMobile ? 'small' : 'middle'}
                  onClick={handleBoost}
                  style={{
                    marginLeft: '8px',
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    border: 'none',
                    color: '#000',
                    borderRadius: '999px',
                    fontWeight: 700
                  }}
                  icon={<Iconify icon="mdi:rocket-launch" width={isMobile ? '14px' : '18px'} />}
                >
                  Boost
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Row gutter={isMobile ? [12, 16] : [24, 32]} style={{ marginBottom: isMobile ? '1.5rem' : '3rem' }}>
            {Array(6).fill(0).map((_, i) => (
              <Col xs={12} sm={12} lg={8} key={i}>
                <div style={{
                  height: isMobile ? '280px' : '480px',
                  borderRadius: isMobile ? '16px' : '20px',
                  background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
              </Col>
            ))}
          </Row>
        )}

        {/* Matches Grid */}
        {!isLoading && compatibleUsers.length > 0 ? (
          <Row gutter={isMobile ? [12, 16] : [24, 32]} style={{ marginBottom: isMobile ? '1.5rem' : '3rem' }}>
            {compatibleUsers.map((user) => (
              <Col xs={12} sm={12} lg={8} key={user.id}>
                <MatchCard
                  user={user}
                  currentUser={currentUser}
                  onStartChat={handleStartChat}
                  enableSuperLike={flags.PREMIUM_SUPER_LIKES}
                  onSuperLike={handleSuperLike}
                  isNewCompatibility={newCompatibilities.some(newComp => newComp.id === user.id)}
                />
              </Col>
            ))}
          </Row>
        ) : (
          !isLoading && (
            <div style={{ 
              textAlign: "center", 
              padding: "4rem 2rem",
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '24px',
              border: '1px solid #dee2e6',
              marginBottom: '3rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ccc, #999)',
                borderRadius: '50%',
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px'
              }}>
                <Iconify icon="eva:heart-outline" width="48px" style={{ color: 'white' }} />
              </div>
              <Title level={2} style={{ marginBottom: '16px', color: '#666' }}>
                {t('matches.noMatchesYet')}
              </Title>
              <Paragraph style={{ 
                fontSize: '16px', 
                maxWidth: '500px', 
                margin: '0 auto 32px',
                lineHeight: '1.6',
                color: '#888'
              }}>
                {t('matches.noMatchesDescription')}
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={() => router.push('/home')}
                style={{
                  background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
                  border: 'none',
                  borderRadius: '12px',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <Iconify icon="eva:home-fill" width="20px" style={{ marginRight: '8px' }} />
                {t('matches.exploreApp')}
              </Button>
            </div>
          )
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default MatchesPage; 