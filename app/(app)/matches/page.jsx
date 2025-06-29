"use client";
import React, { useState, useEffect } from "react";
import { Alert, Skeleton, Typography, Card, Button, Avatar, Space, Tag, Row, Col, Modal, message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyCompatibilities } from "@/actions/admin";
import { getAllUsers } from "@/actions/admin";
import { useUser } from "@/hooks/useFirebaseAuth";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getFullCompatibility, areRelationshipTypesCompatible, getCompatibilityScoreDetails } from "@/utils/compatibilityHelpers";
import { createConversation } from "@/actions/chat";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import OnlineStatusIndicator, { OnlineStatusAvatar } from "@/components/OnlineStatusIndicator";
import css from "@/styles/Home.module.css";
import { useLanguage } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/useIsMobile";

const { Title, Text, Paragraph } = Typography;

// Mobile Match Card Component
const MobileMatchCard = ({ user, currentUser, onStartChat }) => {
  const router = useRouter();
  const mainImage = getMainProfileImage(user.images);
  const scoreDetails = getCompatibilityScoreDetails(currentUser, user);
  
  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username || user.email?.split('@')[0] || 'Unknown User';

  const zodiacSign = user.questionnaire?.zodiacSign || '✨';

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '200px',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${mainImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'transform 0.2s ease',
      }}
      onClick={() => router.push(`/profile/${user.id}?person=${displayName}`)}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Compatibility Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: `linear-gradient(135deg, ${scoreDetails.color}, ${scoreDetails.color}dd)`,
        padding: '4px 8px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}>
        <Text style={{ 
          color: 'white', 
          fontSize: '12px', 
          fontWeight: '700',
          margin: 0
        }}>
          {scoreDetails.overall}%
        </Text>
      </div>

      {/* Online Status */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
      }}>
        <OnlineStatusIndicator 
          userId={user.id} 
          showText={false} 
          size="small"
        />
      </div>

      {/* Content */}
      <div style={{ color: 'white' }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '700',
          marginBottom: '4px',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {displayName}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}>
            {zodiacSign}
          </span>
          {user.age && (
            <span style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)'
            }}>
              {user.age}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Desktop Match Card Component (existing card)
const DesktopMatchCard = ({ user, currentUser, onStartChat }) => {
  const router = useRouter();
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const mainImage = getMainProfileImage(user.images);
  const compatibility = getFullCompatibility(currentUser, user);
  const relationshipCompatible = areRelationshipTypesCompatible(currentUser, user);
  const scoreDetails = getCompatibilityScoreDetails(currentUser, user);

  const cardStyle = {
    position: 'relative',
    width: '100%',
    height: 'auto',
    minHeight: '520px',
    maxHeight: '580px',
    borderRadius: '20px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#fff',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
    border: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column'
  };

  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '240px',
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
        
        {/* Compatibility Tags */}
        <div style={tagsStyle}>
          {compatibility.astrology && (
            <div style={tagStyle('#722ed1')}>
              <Iconify icon="eva:star-fill" width="14px" style={{ marginRight: '6px' }} />
              Astro Match
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
                  whiteSpace: 'nowrap'
                }}>
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email?.split('@')[0] || 'Unknown User'}
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
              gap: '4px'
            }}>
              {user.interests.slice(0, 3).map((interest, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(135deg, #f0f0f0, #e8e8e8)',
                    color: '#666',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: '500'
                  }}
                >
                  {interest}
                </div>
              ))}
              {user.interests.length > 3 && (
                <div style={{
                  color: '#999',
                  fontSize: '10px',
                  padding: '2px 4px'
                }}>
                  +{user.interests.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginTop: 'auto'
        }}>
          <Button
            type="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile/${user.id}?person=${user.firstName || user.username}`);
            }}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
              border: 'none',
              borderRadius: '8px',
              height: '32px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Iconify icon="eva:eye-fill" width="14px" style={{ marginRight: '4px' }} />
            View Profile
          </Button>
          
          <Button
            type="default"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onStartChat(user);
            }}
            style={{
              flex: 1,
              borderRadius: '8px',
              height: '32px',
              fontSize: '12px',
              fontWeight: '600',
              border: '1px solid #d9d9d9'
            }}
          >
            <Iconify icon="eva:message-circle-fill" width="14px" style={{ marginRight: '4px' }} />
            Message
          </Button>
        </div>

        {/* Compatibility Details Button */}
        <Button
          type="link"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setShowCompatibility(true);
          }}
          style={{
            padding: '4px 0',
            height: 'auto',
            fontSize: '11px',
            color: '#722ed1',
            fontWeight: '600'
          }}
        >
          <Iconify icon="eva:info-fill" width="12px" style={{ marginRight: '4px' }} />
          Compatibility Details
        </Button>
      </div>

      {/* Compatibility Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Iconify icon="eva:heart-fill" width="20px" style={{ color: '#722ed1' }} />
            <span>Compatibility with {user.firstName || user.username}</span>
          </div>
        }
        open={showCompatibility}
        onCancel={() => setShowCompatibility(false)}
        footer={null}
        width={400}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              background: `linear-gradient(135deg, ${scoreDetails.color}, ${scoreDetails.color}dd)`,
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
            }}>
              <span style={{ 
                color: 'white', 
                fontSize: '24px', 
                fontWeight: '700'
              }}>
                {scoreDetails.overall}%
              </span>
            </div>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>
              {scoreDetails.emoji}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {scoreDetails.description}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {compatibility.astrology && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'linear-gradient(135deg, #722ed1, #9254de)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <Iconify icon="eva:star-fill" width="24px" />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                    Astrological Match
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    Your zodiac signs are compatible
                  </div>
                </div>
              </div>
            )}

            {compatibility.numerology && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <Iconify icon="eva:hash-fill" width="24px" />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                    Numerology Match
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    Your life path numbers align
                  </div>
                </div>
              </div>
            )}

            {relationshipCompatible && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <Iconify icon="eva:heart-fill" width="24px" />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                    Relationship Goals
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    You're looking for similar things
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

const MatchesPage = () => {
  const { user: currentUser } = useUser();
  const { t } = useLanguage();
  const router = useRouter();
  const isMobile = useIsMobile();

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

  // Filter compatible users
  const compatibleUsers = allUsers?.filter(user => 
    compatibleUserIds?.includes(user.id) && user.id !== currentUser?.id
  ) || [];

  const isLoading = loadingCompatibilities || loadingUsers;

  return (
    <div style={{ 
      width: '100%',
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '0',
      paddingBottom: isMobile ? '120px' : '4rem'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: 'none',
        padding: isMobile ? '1rem' : '1.5rem 2rem',
        minHeight: '100%',
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: isMobile ? '1.5rem' : '3rem',
          background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
          borderRadius: isMobile ? '16px' : '24px',
          padding: isMobile ? '1.5rem 1rem' : '2.5rem 2rem',
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
            {!isMobile && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <Iconify icon="eva:heart-fill" width="40px" style={{ color: 'white' }} />
                <Title level={1} style={{ 
                  margin: 0, 
                  color: 'white',
                  fontSize: '2.5rem',
                  fontWeight: '800'
                }}>
                  {t('matches.title')}
                </Title>
              </div>
            )}
            
            {/* Mobile: Only title */}
            {isMobile && (
              <Title level={2} style={{ 
                margin: 0, 
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                {t('matches.title')}
              </Title>
            )}
            
            {!isMobile && (
              <>
                <Text style={{ 
                  fontSize: '18px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  display: 'block',
                  marginBottom: '24px'
                }}>
                  {t('matches.subtitle')}
                </Text>
                
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <Text strong style={{ fontSize: '24px', color: 'white' }}>
                    {compatibleUsers.length}
                  </Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
                    {t('matches.compatibleSoulsFound')}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Row gutter={isMobile ? [12, 16] : [24, 32]} style={{ marginBottom: '3rem' }}>
            {Array(6).fill(0).map((_, i) => (
              <Col xs={12} sm={12} lg={8} key={i}>
                <div style={{
                  height: isMobile ? '200px' : '480px',
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
          <Row gutter={isMobile ? [12, 16] : [24, 32]} style={{ marginBottom: '3rem' }}>
            {compatibleUsers.map((user) => (
              <Col xs={12} sm={12} lg={8} key={user.id}>
                {isMobile ? (
                  <MobileMatchCard
                    user={user}
                    currentUser={currentUser}
                    onStartChat={handleStartChat}
                  />
                ) : (
                  <DesktopMatchCard
                    user={user}
                    currentUser={currentUser}
                    onStartChat={handleStartChat}
                  />
                )}
              </Col>
            ))}
          </Row>
        ) : (
          !isLoading && (
            <div style={{ 
              textAlign: "center", 
              padding: isMobile ? "2rem 1rem" : "4rem 2rem",
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: isMobile ? '16px' : '24px',
              border: '1px solid #dee2e6',
              marginBottom: '3rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ccc, #999)',
                borderRadius: '50%',
                width: isMobile ? '60px' : '100px',
                height: isMobile ? '60px' : '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: `0 auto ${isMobile ? '16px' : '32px'}`
              }}>
                <Iconify icon="eva:heart-outline" width={isMobile ? "32px" : "48px"} style={{ color: 'white' }} />
              </div>
              <Title level={isMobile ? 3 : 2} style={{ marginBottom: '16px', color: '#666' }}>
                No cosmic matches yet
              </Title>
              {!isMobile && (
                <Paragraph style={{ 
                  fontSize: '16px', 
                  maxWidth: '500px', 
                  margin: '0 auto 32px',
                  lineHeight: '1.6',
                  color: '#888'
                }}>
                  Our cosmic compatibility system is working behind the scenes. 
                  Compatibilities are carefully curated by our team based on astrological and numerological analysis.
                </Paragraph>
              )}
              <Button 
                type="primary" 
                size={isMobile ? "middle" : "large"}
                onClick={() => router.push('/home')}
                style={{
                  background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
                  border: 'none',
                  borderRadius: '12px',
                  height: isMobile ? '40px' : '48px',
                  padding: isMobile ? '0 24px' : '0 32px',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '600'
                }}
              >
                <Iconify icon="eva:home-fill" width="20px" style={{ marginRight: '8px' }} />
                Explore App
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