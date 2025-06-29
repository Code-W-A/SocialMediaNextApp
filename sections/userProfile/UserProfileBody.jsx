"use client";
import React from "react";
import css from "@/styles/UserProfileBody.module.css";
import { Card, Typography, Tag, Row, Col, Space, Divider, Image, Avatar, Progress } from "antd";
import Iconify from "@/components/Iconify";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getFullCompatibility, getCompatibilityScoreDetails } from "@/utils/compatibilityHelpers";
import CompatibilityCard from "@/components/CompatibilityCard";

const { Title, Text, Paragraph } = Typography;

const UserProfileBody = ({ 
  userId, 
  userData, 
  currentUser, 
  isLoading,
  showCompatibility = false 
}) => {
  if (isLoading || !userData?.data) {
    return <div>Loading...</div>;
  }

  const user = userData.data;

  if (showCompatibility) {
    // Get compatibility data
    const compatibility = getFullCompatibility(currentUser, user);
    const scoreDetails = getCompatibilityScoreDetails(currentUser, user);
    
    return (
      <div className={css.compatibilityView}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            {/* Always try to show the detailed CompatibilityCard first */}
            <CompatibilityCard 
              currentUser={currentUser} 
              profileUser={user}
            />
            
            {/* Comprehensive compatibility analysis */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Iconify icon="eva:heart-fill" width="20px" style={{ color: '#f093fb' }} />
                    Detailed Compatibility Analysis
                  </div>
                  {scoreDetails && (
                    <div style={{
                      background: `linear-gradient(135deg, ${scoreDetails.color}, ${scoreDetails.color}dd)`,
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}>
                      {scoreDetails.overall}% {scoreDetails.emoji}
                    </div>
                  )}
                </div>
              }
              style={{ marginTop: '24px' }}
            >
              {/* Overall Compatibility Score */}
              {scoreDetails && (
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
              )}

              {/* Astrological Compatibility */}
              {compatibility.astrology && (
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
                    {scoreDetails?.astrology && (
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
                    )}
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

              {/* Numerological Compatibility */}
              {compatibility.numerology && (
                <div style={{ marginBottom: '24px' }}>
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
                    {scoreDetails?.numerology && (
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
                    )}
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

              {/* Basic Information Comparison */}
              <div style={{ marginBottom: '24px' }}>
                <Title level={5} style={{ marginBottom: '16px' }}>
                  <Iconify icon="eva:people-fill" width="20px" style={{ marginRight: '8px', color: '#52c41a' }} />
                  Profile Comparison
                </Title>
                
                <Row gutter={[16, 16]}>
                  {/* Zodiac Signs */}
                  {(currentUser?.questionnaire?.zodiacSign || user?.questionnaire?.zodiacSign) && (
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <Iconify icon="eva:star-fill" width="20px" style={{ color: '#722ed1' }} />
                          <Text strong style={{ marginLeft: '8px' }}>Zodiac Signs</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>You</Text>
                            <Text strong>{currentUser?.questionnaire?.zodiacSign || 'Not set'}</Text>
                          </div>
                          <Iconify icon="eva:heart-outline" width="16px" style={{ color: '#722ed1' }} />
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Them</Text>
                            <Text strong>{user?.questionnaire?.zodiacSign || 'Not set'}</Text>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  )}

                  {/* Relationship Types */}
                  {(currentUser?.questionnaire?.relationshipType || user?.questionnaire?.relationshipType) && (
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <Iconify icon="eva:heart-fill" width="20px" style={{ color: '#f093fb' }} />
                          <Text strong style={{ marginLeft: '8px' }}>Relationship Goals</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>You</Text>
                            <Text strong style={{ fontSize: '11px' }}>{currentUser?.questionnaire?.relationshipType || 'Not set'}</Text>
                          </div>
                          <Iconify icon="eva:heart-outline" width="16px" style={{ color: '#f093fb' }} />
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Them</Text>
                            <Text strong style={{ fontSize: '11px' }}>{user?.questionnaire?.relationshipType || 'Not set'}</Text>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  )}
                </Row>
              </div>

              {/* Show message if no compatibility data available */}
              {!compatibility.astrology && !compatibility.numerology && (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <Iconify icon="eva:star-outline" width="48px" style={{ color: '#ccc', marginBottom: '16px' }} />
                  <Title level={4} type="secondary">Compatibility Analysis</Title>
                  <Text type="secondary">
                    Complete questionnaires are needed for detailed compatibility analysis.
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className={css.profileBody}>
      <Row gutter={[24, 24]}>
        {/* Left Column - Personal Info */}
        <Col xs={24} lg={16}>
          {/* About Section */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Iconify icon="eva:person-fill" width="20px" />
                About {user.firstName || 'User'}
              </div>
            }
            style={{ marginBottom: '24px' }}
          >
            {user.bio ? (
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {user.bio}
              </Paragraph>
            ) : (
              <Text type="secondary" style={{ fontStyle: 'italic' }}>
                No bio available
              </Text>
            )}

            <Divider />

            {/* Basic Information */}
            <div style={{ marginBottom: '20px' }}>
              <Title level={5} style={{ marginBottom: '12px' }}>Basic Information</Title>
              <Row gutter={[16, 12]}>
                {user.age && (
                  <Col xs={12} sm={8}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Iconify icon="eva:calendar-fill" width="16px" style={{ color: '#1890ff' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Age</Text>
                        <Text strong>{user.age} years</Text>
                      </div>
                    </div>
                  </Col>
                )}

                {user.gender && (
                  <Col xs={12} sm={8}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Iconify icon="eva:person-fill" width="16px" style={{ color: '#722ed1' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Gender</Text>
                        <Text strong style={{ textTransform: 'capitalize' }}>{user.gender}</Text>
                      </div>
                    </div>
                  </Col>
                )}

                {user.location && (
                  <Col xs={12} sm={8}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Iconify icon="eva:pin-fill" width="16px" style={{ color: '#52c41a' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Location</Text>
                        <Text strong>{user.location}</Text>
                      </div>
                    </div>
                  </Col>
                )}

                {user.relationshipStatus && (
                  <Col xs={12} sm={8}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Iconify icon="eva:heart-fill" width="16px" style={{ color: '#f5222d' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Status</Text>
                        <Text strong>{user.relationshipStatus}</Text>
                      </div>
                    </div>
                  </Col>
                )}

                {user.website && (
                  <Col xs={12} sm={8}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Iconify icon="eva:globe-fill" width="16px" style={{ color: '#13c2c2' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Website</Text>
                        <a href={user.website} target="_blank" rel="noopener noreferrer">
                          <Text strong style={{ color: '#1890ff' }}>{user.website}</Text>
                        </a>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </div>

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <>
                <Divider />
                <div>
                  <Title level={5} style={{ marginBottom: '12px' }}>
                    <Iconify icon="eva:heart-fill" width="16px" style={{ marginRight: '8px', color: '#ff7875' }} />
                    Interests
                  </Title>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {user.interests.map((interest, index) => (
                      <Tag 
                        key={index}
                        color="blue"
                        style={{
                          padding: '4px 12px',
                          borderRadius: '16px',
                          border: 'none',
                          fontSize: '13px'
                        }}
                      >
                        {interest}
                      </Tag>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Photo Gallery */}
          {user.images && user.images.length > 1 && (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Iconify icon="eva:image-fill" width="20px" />
                  Photos ({user.images.length})
                </div>
              }
              style={{ marginBottom: '24px' }}
            >
              <Row gutter={[12, 12]}>
                {user.images.map((image, index) => (
                  <Col xs={12} sm={8} md={6} key={index}>
                    <div style={{ 
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#f5f5f5'
                    }}>
                      <Image
                        src={image.fileUri}
                        alt={`Photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        preview={{
                          mask: (
                            <div style={{ color: 'white', textAlign: 'center' }}>
                              <Iconify icon="eva:eye-fill" width="20px" />
                              <div style={{ fontSize: '12px', marginTop: '4px' }}>View</div>
                            </div>
                          )
                        }}
                      />
                      {image.isMain && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          Main
                        </div>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </Col>

        {/* Right Column - Compatibility & Stats */}
        <Col xs={24} lg={8}>
          {/* Quick Compatibility */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Iconify icon="eva:heart-fill" width="20px" />
                Compatibility
              </div>
            }
            style={{ marginBottom: '24px' }}
          >
            <CompatibilityCard 
              currentUser={currentUser} 
              profileUser={user}
            />
          </Card>

          {/* Astrological Info */}
          {(user.questionnaire?.zodiacSign || user.questionnaire?.numerologyNumber) && (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Iconify icon="eva:star-fill" width="20px" />
                  Astrological Profile
                </div>
              }
              style={{ marginBottom: '24px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {user.questionnaire?.zodiacSign && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #722ed1, #b37feb)',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', display: 'block' }}>
                        Zodiac Sign
                      </Text>
                      <Text strong style={{ color: 'white', fontSize: '16px' }}>
                        {user.questionnaire.zodiacSign}
                      </Text>
                    </div>
                    <Iconify icon="eva:star-fill" width="24px" style={{ color: 'rgba(255,255,255,0.8)' }} />
                  </div>
                )}

                {user.questionnaire?.numerologyNumber && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', display: 'block' }}>
                        Life Path Number
                      </Text>
                      <Text strong style={{ color: 'white', fontSize: '16px' }}>
                        {user.questionnaire.numerologyNumber}
                      </Text>
                    </div>
                    <Iconify icon="eva:hash-fill" width="24px" style={{ color: 'rgba(255,255,255,0.8)' }} />
                  </div>
                )}
              </Space>
            </Card>
          )}

          {/* Profile Stats */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Iconify icon="eva:bar-chart-fill" width="20px" />
                Profile Stats
              </div>
            }
            style={{ marginBottom: '24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>Profile Completeness</Text>
                  <Text strong>85%</Text>
                </div>
                <Progress 
                  percent={85} 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  showInfo={false}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {user.images?.length || 0}
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Photos</Text>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {user.interests?.length || 0}
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Interests</Text>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {user.questionnaire ? '✓' : '✗'}
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Astro Data</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfileBody; 