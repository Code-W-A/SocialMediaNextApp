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
import css from "@/styles/Home.module.css";

const { Title, Text, Paragraph } = Typography;

const MatchCard = ({ user, currentUser, onStartChat }) => {
  const router = useRouter();
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
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
    height: '480px',
    borderRadius: '20px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#fff',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
    border: '1px solid #f0f0f0'
  };

  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '280px',
    overflow: 'hidden'
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
    padding: '18px 16px 14px',
    color: 'white',
    zIndex: 3
  };

  const tagsStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    zIndex: 2
  };

  const tagStyle = (color) => ({
    background: `${color}`,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '600',
    margin: 0,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  });

  const contentStyle = {
    padding: '16px',
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
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
            alignItems: 'flex-end',
            marginBottom: '8px' 
          }}>
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                marginBottom: '2px'
              }}>
                <div style={{ 
                  color: 'white', 
                  fontSize: '20px', 
                  fontWeight: '700',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 2px rgba(0, 0, 0, 1)',
                  margin: 0,
                  lineHeight: '1.2',
                  WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.3)'
                }}>
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email?.split('@')[0] || 'Unknown User'}
                </div>
                {user.age && (
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {user.age}
                  </div>
                )}
              </div>
              
              {user.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Iconify icon="eva:pin-fill" width="12px" style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '13px',
                    margin: 0
                  }}>
                    {user.location}
                  </div>
                </div>
              )}
            </div>
            
            {/* Compatibility Score Badge */}
            <div style={{
              background: `linear-gradient(135deg, ${scoreDetails.color}, ${scoreDetails.color}dd)`,
              padding: '8px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              <Text style={{ 
                color: 'white', 
                fontSize: '16px', 
                fontWeight: '700',
                margin: 0
              }}>
                {scoreDetails.overall}%
              </Text>
              <Text style={{ 
                color: 'white', 
                fontSize: '12px',
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
        {/* User Info & Status */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div>
              <span style={{ fontSize: '18px', color: '#333', fontWeight: '700' }}>
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email?.split('@')[0] || 'Unknown User'}
              </span>
              {user.age && (
                <span style={{ color: '#666', fontSize: '16px', marginLeft: '6px' }}>
                  {user.age}
                </span>
              )}
            </div>
            {user.questionnaire?.relationshipType && (
              <div style={{
                background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {user.questionnaire.relationshipType === 'Relație de lungă durată' ? '💕 Long-term' :
                 user.questionnaire.relationshipType === 'Relație casual' ? '😊 Casual' :
                 user.questionnaire.relationshipType === 'Prietenie' ? '👫 Friends' : 
                 user.questionnaire.relationshipType}
              </div>
            )}
          </div>
          
          {/* Location & Zodiac */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '8px'
          }}>
            {user.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Iconify icon="eva:pin-fill" width="14px" style={{ color: '#999' }} />
                <span style={{ color: '#666', fontSize: '13px' }}>
                  {user.location}
                </span>
              </div>
            )}
            {user.questionnaire?.zodiacSign && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#722ed1', fontSize: '14px', fontWeight: '600' }}>
                  {user.questionnaire.zodiacSign}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              color: '#555',
              fontSize: '14px',
              lineHeight: '1.4',
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
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#999', 
              fontWeight: '600', 
              marginBottom: '6px',
              display: 'block'
            }}>
              INTERESTS
            </div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '6px',
              maxHeight: '48px',
              overflow: 'hidden'
            }}>
              {user.interests.slice(0, 4).map((interest, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f5f5f5',
                    color: '#666',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '500',
                    border: '1px solid #e8e8e8'
                  }}
                >
                  {interest}
                </div>
              ))}
              {user.interests.length > 4 && (
                <div style={{
                  background: '#e6f7ff',
                  color: '#1890ff',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  +{user.interests.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compatibility Info */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <Text style={{ 
              fontSize: '12px', 
              color: '#999', 
              fontWeight: '600'
            }}>
              COMPATIBILITY
            </Text>
            <div style={{
              background: scoreDetails.color,
              color: 'white',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: '700'
            }}>
              {scoreDetails.level}
            </div>
            <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {compatibility.astrology && scoreDetails.astrology > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #722ed115, #722ed108)',
                border: '1px solid #722ed130',
                padding: '8px 10px',
                borderRadius: '8px',
                flex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Iconify icon="eva:star-fill" width="12px" style={{ color: '#722ed1' }} />
                    <Text style={{ fontSize: '11px', fontWeight: '600', color: '#722ed1' }}>
                      Astrology
                    </Text>
                  </div>
                  <Text style={{ fontSize: '12px', fontWeight: '700', color: '#722ed1' }}>
                    {scoreDetails.astrology}%
                  </Text>
                </div>
              </div>
            )}
            {compatibility.numerology && scoreDetails.numerology > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1890ff15, #1890ff08)',
                border: '1px solid #1890ff30',
                padding: '8px 10px',
                borderRadius: '8px',
                flex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Iconify icon="eva:hash-fill" width="12px" style={{ color: '#1890ff' }} />
                    <Text style={{ fontSize: '11px', fontWeight: '600', color: '#1890ff' }}>
                      Numerology
                    </Text>
                  </div>
                  <Text style={{ fontSize: '12px', fontWeight: '700', color: '#1890ff' }}>
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
          gap: isMobile ? '4px' : '8px',
          marginTop: 'auto',
          padding: '0 8px',
          flexWrap: 'wrap'
        }}>
          <Button
            type="default"
            size={isMobile ? "middle" : "large"}
            icon={<Iconify icon="eva:person-fill" width={isMobile ? "14px" : "18px"} />}
            onClick={() => router.push(`/user/${user.id}`)}
            style={{
              flex: 1,
              minWidth: isMobile ? '80px' : '100px',
              height: isMobile ? '40px' : '48px',
              borderRadius: '12px',
              border: '2px solid #f0f0f0',
              fontWeight: '600',
              fontSize: isMobile ? '11px' : '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '3px' : '6px',
              transition: 'all 0.3s ease',
              padding: '0 4px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#722ed1';
              e.target.style.color = '#722ed1';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#f0f0f0';
              e.target.style.color = '';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {isMobile ? 'View' : 'Profile'}
          </Button>
          
          <Button
            type="default"
            size={isMobile ? "middle" : "large"}
            icon={<Iconify icon="eva:star-outline" width={isMobile ? "14px" : "18px"} />}
            onClick={() => setShowCompatibility(true)}
            style={{
              flex: 1,
              minWidth: isMobile ? '80px' : '100px',
              height: isMobile ? '40px' : '48px',
              borderRadius: '12px',
              border: '2px solid #f0f0f0',
              fontWeight: '600',
              fontSize: isMobile ? '11px' : '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '3px' : '6px',
              transition: 'all 0.3s ease',
              padding: '0 4px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.color = 'var(--primary)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#f0f0f0';
              e.target.style.color = '';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {isMobile ? 'Info' : 'Details'}
          </Button>
          
          <Button
            type="primary"
            size={isMobile ? "middle" : "large"}
            icon={<Iconify icon="eva:message-circle-fill" width={isMobile ? "14px" : "18px"} />}
            onClick={() => onStartChat(user)}
            style={{
              flex: isMobile ? 1 : 1.5,
              minWidth: isMobile ? '90px' : '120px',
              height: isMobile ? '40px' : '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
              border: 'none',
              fontWeight: '600',
              fontSize: isMobile ? '11px' : '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '3px' : '6px',
              boxShadow: '0 4px 16px rgba(249, 170, 17, 0.3)',
              transition: 'all 0.3s ease',
              padding: '0 4px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(249, 170, 17, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(249, 170, 17, 0.3)';
            }}
          >
            Message
          </Button>
        </div>
      </div>

      {/* Compatibility Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar src={mainImage} size={40}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Avatar>
              <span>Compatibility with {user.firstName}</span>
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
  const router = useRouter();

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
      padding: '0'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: 'none',
        padding: '1.5rem 2rem',
        minHeight: '100%',
        paddingBottom: '4rem'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '3rem',
          background: 'linear-gradient(135deg, var(--primary), #FFB84D)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
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
                Your Perfect Matches
              </Title>
            </div>
            
            <Text style={{ 
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              display: 'block',
              marginBottom: '24px'
            }}>
              Discover your cosmic connections through astrology and numerology
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
                Compatible souls found
              </Text>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Row gutter={[24, 32]} style={{ marginBottom: '3rem' }}>
            {Array(6).fill(0).map((_, i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <div style={{
                  height: '480px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
              </Col>
            ))}
          </Row>
        )}

        {/* Matches Grid */}
        {!isLoading && compatibleUsers.length > 0 ? (
          <Row gutter={[24, 32]} style={{ marginBottom: '3rem' }}>
            {compatibleUsers.map((user) => (
              <Col xs={24} sm={12} lg={8} key={user.id}>
                <MatchCard
                  user={user}
                  currentUser={currentUser}
                  onStartChat={handleStartChat}
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
                No cosmic matches yet
              </Title>
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