"use client";
import React, { useState, useEffect } from "react";
import { Button, Typography, Form, Input, Select, message, Progress, Modal } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useFirebaseAuth";
import Iconify from "@/components/Iconify";
import css from "@/styles/AuthPages.module.css";
import layoutCss from "@/styles/onboardingLayout.module.css";
import interestCss from "@/styles/InterestCards.module.css";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Get GPS coordinates from localStorage if they exist
      let gpsCoordinates = null;
      try {
        const storedLocation = localStorage.getItem('userLocation');
        if (storedLocation) {
          gpsCoordinates = JSON.parse(storedLocation);
        }
      } catch (error) {
        console.error("Error parsing GPS coordinates:", error);
      }

      // Update user profile in Firestore
      const updateData = {
        bio: values.bio || '',
        location: values.location || '',
        website: values.website || '',
        interests: selectedInterests,
        relationshipStatus: values.relationshipStatus || '',
        updatedAt: serverTimestamp()
      };

      // Add GPS coordinates if they exist
      if (gpsCoordinates) {
        updateData.gpsCoordinates = gpsCoordinates;
      }

      await updateDoc(doc(db, 'Users', user.id), updateData);

      message.success("Profile updated successfully! 🎉");
      router.push("/onboarding/questionnaire");
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/photos");
  };

  // Load existing profile data from Firestore on component mount
  useEffect(() => {
    const loadExistingProfile = () => {
      if (user) {
        // Set form values if they exist
        form.setFieldsValue({
          bio: user.bio || '',
          location: user.location || '',
          website: user.website || '',
          relationshipStatus: user.relationshipStatus || ''
        });

        // Set interests if they exist
        if (user.interests && Array.isArray(user.interests)) {
          setSelectedInterests(user.interests);
        }

        console.log('Loaded existing profile data');
      }
    };

    if (user) {
      loadExistingProfile();
    }
  }, [user, form]);

  // Check for location on component mount
  useEffect(() => {
    // Check if location was already detected in this session
    const locationStored = localStorage.getItem('locationDetected');
    if (locationStored) {
      setLocationDetected(true);
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      return;
    }

    // Show location dialog after a short delay
    const timer = setTimeout(() => {
      setShowLocationDialog(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleInterestToggle = (interestName) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestName)) {
        // Remove interest
        return prev.filter(item => item !== interestName);
      } else {
        // Add interest (max 8)
        if (prev.length >= 8) {
          message.warning("You can select maximum 8 interests");
          return prev;
        }
        return [...prev, interestName];
      }
    });
  };

  const handleAllowLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const coordinatesObj = { latitude, longitude };
          
          // Store coordinates in localStorage and mark as detected
          localStorage.setItem('userLocation', JSON.stringify(coordinatesObj));
          localStorage.setItem('locationDetected', 'true');
          setLocationDetected(true);
          setShowLocationDialog(false);
          
          // Save coordinates to Firestore immediately
          try {
            await updateDoc(doc(db, 'Users', user.id), {
              gpsCoordinates: coordinatesObj,
              updatedAt: serverTimestamp()
            });
          } catch (firestoreError) {
            console.error("Error saving GPS coordinates to Firestore:", firestoreError);
            // Continue even if Firestore save fails
          }
          
          // Don't auto-fill coordinates - let user add their own city name  
          message.success("Location detected! 📍 You can now add your city name manually.");
        } catch (error) {
          console.error("Error getting location:", error);
          message.error("Could not get location details");
          setShowLocationDialog(false);
        }
      },
      (error) => {
        let errorMessage = "Could not get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        message.error(errorMessage);
        setShowLocationDialog(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSkipLocation = () => {
    localStorage.setItem('locationDetected', 'skipped');
    setShowLocationDialog(false);
  };

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
    <div className={layoutCss.twoColumnLayout}>
      {/* Left Column */}
      <div className={layoutCss.leftColumn}>
        {/* Header Section */}
        <div className={layoutCss.headerSection}>
          <Text strong style={{ fontSize: "14px", color: "#666", marginBottom: "8px", display: "block" }}>
            Step 2 of 3: Tell Us About Yourself
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
              About You 💫
            </Title>
            <Text type="secondary" className={css.authSubtitle}>
              Share a bit about yourself to help others get to know you better
            </Text>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={css.authForm}
          requiredMark={false}
        >
          <Form.Item
            name="bio"
            label="Bio"
            rules={[
              { max: 500, message: "Bio must be less than 500 characters" }
            ]}
          >
            <TextArea
              placeholder="Tell people about yourself... What makes you unique?"
              rows={4}
              showCount
              maxLength={500}
              className={css.authInput}
              style={{ resize: "none" }}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
          >
            <Input
              size="large"
              prefix={<Iconify icon="eva:pin-fill" width="20px" />}
              placeholder="City, Country"
              className={css.authInput}
            />
            {locationDetected && (
              <Text type="secondary" style={{ fontSize: "12px", marginTop: "4px", display: "block", color: "#52c41a" }}>
                <Iconify icon="eva:checkmark-circle-fill" width="14px" style={{ marginRight: "4px" }} />
                Location detected! You can edit the field above.
              </Text>
            )}
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
            rules={[
              { type: "url", message: "Please enter a valid URL" }
            ]}
          >
            <Input
              size="large"
              prefix={<Iconify icon="eva:link-fill" width="20px" />}
              placeholder="https://yourwebsite.com"
              className={css.authInput}
            />
          </Form.Item>
        </Form>
      </div>

      {/* Right Column */}
      <div className={layoutCss.rightColumn}>
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="relationshipStatus"
            label="Relationship Status"
          >
            <Select
              size="large"
              placeholder="Select status"
              className={css.authInput}
              allowClear
            >
              <Option value="single">Single</Option>
              <Option value="in_relationship">In a relationship</Option>
              <Option value="married">Married</Option>
              <Option value="complicated">It's complicated</Option>
              <Option value="prefer_not_to_say">Prefer not to say</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Interests"
          >
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
            }`}>
              {selectedInterests.length}/8 interests selected
            </div>
          </Form.Item>

                  <div style={{ 
          background: "#f0f7ff", 
          padding: "1rem", 
          borderRadius: "8px", 
          marginTop: "1rem",
          border: "1px solid #d6e4ff"
        }}>
          <Text style={{ color: "#1890ff", fontSize: "14px" }}>
            💡 <strong>Complete your profile:</strong> Add at least a bio or location to help others find you. More details = better connections!
          </Text>
        </div>
        </Form>
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
            Back
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
            {loading ? "Saving..." : "Continue to Questions"}
          </Button>
        </div>
      </div>

      {/* Location Permission Dialog */}
      <Modal
        title={null}
        open={showLocationDialog}
        footer={null}
        closable={false}
        centered
        width={400}
        bodyStyle={{ padding: "2rem", textAlign: "center" }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1890ff, #40a9ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem"
          }}>
            <Iconify icon="eva:navigation-2-fill" width="40px" color="white" />
          </div>
          
          <Title level={3} style={{ margin: "0 0 0.5rem" }}>
            Enable Location Access
          </Title>
          
          <Text type="secondary" style={{ fontSize: "15px", lineHeight: "1.5" }}>
            We'd like to detect your location to help you connect with people nearby. 
            Your location is only used to improve your experience and is never shared without your permission.
          </Text>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Button
            size="large"
            onClick={handleSkipLocation}
            style={{
              borderRadius: "8px",
              fontWeight: "500",
              minWidth: "100px"
            }}
          >
            Skip
          </Button>
          
          <Button
            type="primary"
            size="large"
            onClick={handleAllowLocation}
            style={{
              borderRadius: "8px",
              fontWeight: "500",
              minWidth: "120px"
            }}
            icon={<Iconify icon="eva:checkmark-fill" width="16px" />}
          >
            Allow Location
          </Button>
        </div>

        <Text type="secondary" style={{ fontSize: "12px", marginTop: "1rem", display: "block" }}>
          <Iconify icon="eva:shield-fill" width="14px" style={{ marginRight: "4px" }} />
          Your privacy is important to us
        </Text>
      </Modal>
    </div>
  );
} 