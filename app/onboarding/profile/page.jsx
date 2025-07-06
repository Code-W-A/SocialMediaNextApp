"use client";
import React, { useState, useEffect } from "react";
import { Button, Typography, Form, Input, Select, message, Progress, Modal } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useFirebaseAuth";
import Iconify from "@/components/Iconify";
import LanguageSelector from "@/components/LanguageSelector";
import css from "@/styles/AuthPages.module.css";
import layoutCss from "@/styles/onboardingLayout.module.css";
import interestCss from "@/styles/InterestCards.module.css";
import { useLanguage } from "@/lib/i18n";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function ProfilePage() {
  console.log('🚀 [COMPONENT] ProfilePage component rendering/mounting');
  
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle logout and redirect to login
  const handleGoBackToLogin = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/sign-in');
      } else {
        console.error('Logout failed:', result.error);
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/sign-in');
    }
  };

  console.log('🚀 [COMPONENT] Initial state - user:', user);
  console.log('🚀 [COMPONENT] Initial state - selectedInterests:', selectedInterests);

    const handleSubmit = async () => {
    setLoading(true);
    try {
      if (selectedInterests.length === 0) {
        message.warning(t('onboarding.pleaseSelectInterest'));
        setLoading(false);
        return;
      }

      console.log('📤 [SUBMIT] Onboarding interests only:', selectedInterests);

      // Simple update - only interests, preserve all existing data
      const updateData = {
        interests: selectedInterests,
        updatedAt: serverTimestamp()
      };

      console.log('📝 [Profile Step] Saving interests only:', updateData);

      await updateDoc(doc(db, 'Users', user.id), updateData);

      // Clear temporary localStorage data since we saved to Firestore
      localStorage.removeItem(`onboarding_profile_${user.id}`);

      message.success("Interests saved successfully! 🎉");
      router.push("/onboarding/questionnaire");
    } catch (error) {
      console.error("Error saving interests:", error);
      message.error("Failed to save interests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simplified onboarding - interests only, no complex debugging needed

  const handleBack = () => {
    console.log('⬅️ [BACK] Back button clicked');
    console.log('⬅️ [BACK] Current interests before leaving:', selectedInterests);
    
    // Force save interests before leaving
    console.log('⬅️ [BACK] Force saving interests before navigation...');
    saveToLocalStorage();
    
    router.push("/onboarding/photos");
  };

  // Load existing profile data from Firestore on component mount
  useEffect(() => {
    console.log('🏗️ [EFFECT] Loading profile data useEffect triggered');
    console.log('🏗️ [EFFECT] User object:', user);
    console.log('🏗️ [EFFECT] User ID:', user?.id);
    
    // WAIT FOR USER TO BE LOADED - don't do anything if user is null
    if (!user || !user.id) {
      console.log('🏗️ [EFFECT] ❌ User not loaded yet, skipping profile load');
      return;
    }
    
    const loadExistingProfile = () => {
      if (user) {
        console.log('🔄 [LOAD] Starting to load profile data for user:', user.id);
        
        // First try to load from localStorage (temporary values during onboarding)
        const tempProfileData = localStorage.getItem(`onboarding_profile_${user.id}`);
        console.log('🔄 [LOAD] localStorage key:', `onboarding_profile_${user.id}`);
        console.log('🔄 [LOAD] Raw localStorage data:', tempProfileData);
        
        let savedValues = {};
        
        if (tempProfileData) {
          try {
            savedValues = JSON.parse(tempProfileData);
            console.log('🔄 [LOAD] Parsed localStorage data:', savedValues);
          } catch (error) {
            console.error('🔄 [LOAD] Error parsing temporary profile data:', error);
          }
        } else {
          console.log('🔄 [LOAD] No localStorage data found');
        }

        console.log('🔄 [LOAD] User Firestore data:');
        console.log('🔄 [LOAD] user.bio:', user.bio);
        console.log('🔄 [LOAD] user.location:', user.location);
        console.log('🔄 [LOAD] user.website:', user.website);
        console.log('🔄 [LOAD] user.relationshipStatus:', user.relationshipStatus);
        console.log('🔄 [LOAD] user.interests:', user.interests);

        // Load interests (try temp data first, then Firestore)
        const tempInterests = savedValues.interests || user.interests;
        console.log('🔄 [LOAD] Interests to set:', tempInterests);
        
        if (tempInterests && Array.isArray(tempInterests)) {
          setSelectedInterests(tempInterests);
          console.log('🔄 [LOAD] ✅ Set interests:', tempInterests);
        } else {
          console.log('🔄 [LOAD] No interests to set - user can select them');
        }

        console.log('🔄 [LOAD] ✅ Profile loading completed');
      } else {
        console.log('🔄 [LOAD] ❌ Cannot load - no user found');
      }
    };

    loadExistingProfile();
  }, [user]);

  // Additional useEffect to trigger when user becomes available
  useEffect(() => {
    console.log('👤 [USER WATCH] User state changed');
    console.log('👤 [USER WATCH] User:', user);
    console.log('👤 [USER WATCH] User ID:', user?.id);
    
    if (user && user.id) {
      console.log('👤 [USER WATCH] ✅ User is now available! Triggering profile load...');
    } else {
      console.log('👤 [USER WATCH] ❌ User still not available');
    }
  }, [user]);

  // Auto-save interests to localStorage
  const saveToLocalStorage = () => {
    if (!user || !user.id) {
      console.log('🔧 [SAVE] ❌ Cannot save - user not loaded yet');
      return;
    }

    const dataToSave = {
      interests: selectedInterests
    };
    
    console.log('🔧 [SAVE] ✅ Attempting to save interests to localStorage:');
    console.log('🔧 [SAVE] User ID:', user.id);
    console.log('🔧 [SAVE] SelectedInterests state:', selectedInterests);
    console.log('🔧 [SAVE] Data to save:', dataToSave);
    console.log('🔧 [SAVE] localStorage key:', `onboarding_profile_${user.id}`);
    
    localStorage.setItem(`onboarding_profile_${user.id}`, JSON.stringify(dataToSave));
    
    // Verify save worked
    const savedData = localStorage.getItem(`onboarding_profile_${user.id}`);
    console.log('🔧 [SAVE] ✅ Verification - data actually saved:', savedData);
  };

  // Save to localStorage whenever interests change
  useEffect(() => {
    console.log('💾 [EFFECT] Interests save useEffect triggered');
    console.log('💾 [EFFECT] Current interests:', selectedInterests);
    console.log('💾 [EFFECT] User ID:', user?.id);
    
    // Don't save if user is not loaded yet
    if (!user || !user.id) {
      console.log('💾 [EFFECT] ❌ User not loaded yet, skipping save');
      return;
    }
    
    // Save if there are interests selected or if localStorage data exists
    if (selectedInterests.length > 0 || localStorage.getItem(`onboarding_profile_${user.id}`)) {
      console.log('💾 [EFFECT] ✅ Has interests - calling saveToLocalStorage');
      saveToLocalStorage();
    } else {
      console.log('💾 [EFFECT] ❌ No interests to save');
    }
  }, [selectedInterests, user?.id]);

  // No form field handlers needed - only interests

  // Onboarding simplified - no location or other complex features needed

  const handleInterestToggle = (interestName) => {
    console.log('🎨 [INTERESTS] Interest toggled:', interestName);
    console.log('🎨 [INTERESTS] Previous interests:', selectedInterests);
    
    setSelectedInterests(prev => {
      let newInterests;
      if (prev.includes(interestName)) {
        // Remove interest
        newInterests = prev.filter(item => item !== interestName);
        console.log('🎨 [INTERESTS] Removing interest, new list:', newInterests);
      } else {
        // Add interest (max 8)
        if (prev.length >= 8) {
          message.warning(t('onboarding.maxInterestsWarning'));
          console.log('🎨 [INTERESTS] Max interests reached, not adding');
          return prev;
        }
        newInterests = [...prev, interestName];
        console.log('🎨 [INTERESTS] Adding interest, new list:', newInterests);
      }
      return newInterests;
    });
  };

  // Location functions removed - handled in profile edit only

  const interestOptions = [
    { name: "Travel", icon: "eva:compass-fill" },
    { name: "Photography", icon: "eva:camera-fill" },
    { name: "Music", icon: "eva:music-fill" },
    { name: "Sports", icon: "eva:activity-fill" },
    { name: "Art", icon: "eva:brush-fill" },
    { name: "Technology", icon: "eva:monitor-fill" },
    { name: "Food", icon: "eva:heart-fill" },
    { name: "Fashion", icon: "eva:shopping-bag-fill" },
    { name: "Books", icon: "eva:book-fill" },
    { name: "Movies", icon: "eva:film-fill" },
    { name: "Gaming", icon: "eva:play-circle-fill" },
    { name: "Fitness", icon: "eva:flash-fill" },
    { name: "Nature", icon: "eva:sun-fill" },
    { name: "Dancing", icon: "eva:radio-fill" },
    { name: "Cooking", icon: "eva:home-fill" },
    { name: "Languages", icon: "eva:message-circle-fill" },
    { name: "Science", icon: "eva:bulb-fill" },
    { name: "History", icon: "eva:archive-fill" }
  ];

  return (
    <div className={layoutCss.singleColumnLayout}>
      {/* Go Back to Login Button */}
      <div style={{ 
        position: 'absolute', 
        top: '1rem', 
        left: '1rem', 
        zIndex: 10 
      }}>
        <Button
          type="text"
          onClick={handleGoBackToLogin}
          icon={<Iconify icon="eva:arrow-back-fill" width="16px" />}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#666',
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ 
            display: isMobile ? 'none' : 'inline' 
          }}>
            {t('onboarding.goBackToLogin')}
          </span>
        </Button>
      </div>

      {/* Language Selector */}
      <div style={{ 
        position: 'absolute', 
        top: '1rem', 
        right: '1rem', 
        zIndex: 10 
      }}>
        <LanguageSelector size="small" showIcon={false} />
      </div>

      {/* Header Section */}
      <div className={layoutCss.headerSection}>
        <Text strong style={{ fontSize: "14px", color: "#666", marginBottom: "8px", display: "block" }}>
          {t('onboarding.profileStep')}
        </Text>
        <Progress 
          percent={66} 
          strokeColor={{
            '0%': 'var(--primary)',
            '100%': 'var(--primary)',
          }}
          trailColor="#f0f0f0"
          style={{ marginBottom: "1rem" }}
        />
        
        <div className={css.authHeader}>
          <Title level={2} className={css.authTitle} style={{ margin: "0 0 0.5rem" }}>
            {t('onboarding.yourInterests')}
          </Title>
          <Text type="secondary" className={css.authSubtitle}>
            {t('onboarding.interestsSubtitle')}
          </Text>
        </div>
      </div>

      {/* Interests Section */}
      <div style={{ padding: "2rem 0" }}>
        <div className={interestCss.interestsContainer}>
          {interestOptions.map(interest => (
            <div
              key={interest.name}
              className={`${interestCss.interestCard} ${
                selectedInterests.includes(interest.name) ? interestCss.selected : ''
              }`}
              onClick={() => handleInterestToggle(interest.name)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Iconify 
                  icon={interest.icon} 
                  width="16px" 
                  color={selectedInterests.includes(interest.name) ? 'white' : '#1890ff'} 
                />
                <p className={interestCss.interestText}>{interest.name}</p>
              </div>
              {selectedInterests.includes(interest.name) && (
                <div className={interestCss.selectedIndicator}>
                  <Iconify icon="eva:checkmark-fill" width="12px" color="white" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className={`${interestCss.counterText} ${
          selectedInterests.length >= 8 ? interestCss.warning : ''
        }`} style={{ textAlign: "center", marginTop: "1rem" }}>
          {t('onboarding.interestsSelected', { count: selectedInterests.length })}
          {selectedInterests.length === 0 && (
            <div style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px" }}>
              {t('onboarding.pleaseSelectInterest')}
            </div>
          )}
        </div>

        <div style={{ 
          background: "#f0f7ff", 
          padding: "1rem", 
          borderRadius: "8px", 
          marginTop: "2rem",
          border: "1px solid #d6e4ff",
          textAlign: "center"
        }}>
          <Text style={{ color: "#1890ff", fontSize: "14px" }}>
            <strong>{t('onboarding.whyInterestsMatter')}</strong> {t('onboarding.interestsExplanation')}
          </Text>
        </div>
      </div>

      {/* Footer Section - spans both columns */}
      <div style={{ 
        gridColumn: "1 / -1", 
        marginTop: "1rem", 
        paddingTop: "1rem", 
        borderTop: "1px solid #f0f0f0" 
      }}>


        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            size="large"
            onClick={handleBack}
            style={{
              height: "48px",
              borderRadius: "12px",
              border: "1.5px solid #e8e8e8",
              fontWeight: "500"
            }}
            icon={<Iconify icon="eva:arrow-back-fill" width="20px" />}
          >
            {t('onboarding.backButton')}
          </Button>
          
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className={css.authButton}
            style={{ flex: 1 }}
            onClick={handleSubmit}
          >
            {loading ? t('onboarding.saving') : t('onboarding.continue')}
          </Button>
        </div>
      </div>


    </div>
  );
} 