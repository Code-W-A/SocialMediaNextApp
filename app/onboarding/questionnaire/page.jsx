"use client";
import React, { useState, useEffect } from "react";
import { Button, Typography, Form, Input, Radio, message, Progress } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useFirebaseAuth";
import Iconify from "@/components/Iconify";
import css from "@/styles/AuthPages.module.css";
import layoutCss from "@/styles/onboardingLayout.module.css";
import zodiacCss from "@/styles/zodiacCardsResponsive.module.css";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { firstQuestions } from "@/mock/astroQuestions";

const { Title, Text } = Typography;

export default function QuestionnairePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  // Load existing questionnaire data from Firestore on component mount
  useEffect(() => {
    const loadExistingQuestionnaire = () => {
      if (user?.questionnaire) {
        setAnswers({
          zodiacSign: user.questionnaire.zodiacSign || '',
          birthDate: user.questionnaire.birthDate || '',
          relationshipType: user.questionnaire.relationshipType || ''
        });

        console.log('Loaded existing questionnaire data');
      }
    };

    if (user) {
      loadExistingQuestionnaire();
    }
  }, [user]);

  const zodiacCards = [
    { sign: "Berbec", icon: "♈", dates: "21 Mar - 19 Apr" },
    { sign: "Taur", icon: "♉", dates: "20 Apr - 20 May" },
    { sign: "Gemeni", icon: "♊", dates: "21 May - 20 Jun" },
    { sign: "Rac", icon: "♋", dates: "21 Jun - 22 Jul" },
    { sign: "Leu", icon: "♌", dates: "23 Jul - 22 Aug" },
    { sign: "Fecioară", icon: "♍", dates: "23 Aug - 22 Sep" },
    { sign: "Balanță", icon: "♎", dates: "23 Sep - 22 Oct" },
    { sign: "Scorpion", icon: "♏", dates: "23 Oct - 21 Nov" },
    { sign: "Săgetător", icon: "♐", dates: "22 Nov - 21 Dec" },
    { sign: "Capricorn", icon: "♑", dates: "22 Dec - 19 Jan" },
    { sign: "Vărsător", icon: "♒", dates: "20 Jan - 18 Feb" },
    { sign: "Pești", icon: "♓", dates: "19 Feb - 20 Mar" }
  ];

  const handleNext = () => {
    const currentQuestion = firstQuestions[currentStep];
    const currentAnswer = answers[getFieldName(currentStep)];

    if (!currentAnswer) {
      message.warning("Please answer this question to continue");
      return;
    }

    // Validate birth date format if it's the date question
    if (currentStep === 1) {
      const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!datePattern.test(currentAnswer)) {
        message.error("Please enter date in DD/MM/YYYY format");
        return;
      }
    }

    if (currentStep < firstQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // Check if user is editing (has previous questionnaire data)
      const isEditing = user?.questionnaire && Object.keys(user.questionnaire).length > 0;
      
      if (isEditing) {
        router.push("/profile/" + user.id); // Return to profile if editing
      } else {
        router.push("/onboarding/profile"); // Continue with onboarding flow
      }
    }
  };

  const calculateAge = (birthDate) => {
    try {
      // Parse DD/MM/YYYY format
      const [day, month, year] = birthDate.split('/').map(num => parseInt(num));
      const birthDateObj = new Date(year, month - 1, day); // month is 0-indexed
      const today = new Date();
      
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      
      // Adjust if birthday hasn't occurred this year yet
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error("Error calculating age:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const calculatedAge = calculateAge(answers.birthDate);
      
      await updateDoc(doc(db, 'Users', user.id), {
        questionnaire: {
          zodiacSign: answers.zodiacSign,
          birthDate: answers.birthDate,
          relationshipType: answers.relationshipType,
          completedAt: new Date().toISOString()
        },
        age: calculatedAge,
        onboardingCompleted: true,
        updatedAt: serverTimestamp()
      });

      // Check if user is editing (has previous questionnaire data)
      const isEditing = user?.questionnaire && Object.keys(user.questionnaire).length > 0;
      
      if (isEditing) {
        message.success("Questionnaire updated successfully! 🎉");
        router.push("/profile/" + user.id); // Return to profile
      } else {
        message.success("Questionnaire completed! Welcome to YDestiny! 🎉");
        router.push("/onboarding/complete"); // Continue with onboarding
      }
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      message.error("Failed to save answers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFieldName = (step) => {
    const fieldNames = ['zodiacSign', 'birthDate', 'relationshipType'];
    return fieldNames[step];
  };

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [getFieldName(currentStep)]: value
    }));
  };

  const formatDateInput = (value) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Apply formatting based on length
    if (numericValue.length <= 2) {
      return numericValue;
    } else if (numericValue.length <= 4) {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`;
    } else if (numericValue.length <= 8) {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}/${numericValue.slice(4, 8)}`;
    } else {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}/${numericValue.slice(4, 8)}`;
    }
  };

  const handleDateChange = (e) => {
    const inputValue = e.target.value;
    const formattedValue = formatDateInput(inputValue);
    handleAnswerChange(formattedValue);
  };

  const renderCurrentQuestion = () => {
    const question = firstQuestions[currentStep];
    const fieldName = getFieldName(currentStep);
    const currentAnswer = answers[fieldName];

    switch (currentStep) {
      case 0: // Zodiac Sign
        return (
          <div style={{ textAlign: "center" }}>
            <Title level={3} style={{ marginBottom: "2rem", color: "#333" }}>
              {question.text}
            </Title>
            
            <div className={zodiacCss.zodiacContainer}>
              {zodiacCards.map(zodiac => (
                <div
                  key={zodiac.sign}
                  onClick={() => handleAnswerChange(zodiac.sign)}
                  className={`${zodiacCss.zodiacCard} ${currentAnswer === zodiac.sign ? zodiacCss.selected : ''}`}
                >
                  <div className={zodiacCss.zodiacIcon}>
                    {zodiac.icon}
                  </div>
                  <div className={zodiacCss.zodiacInfo}>
                    <div className={zodiacCss.zodiacName}>
                      {zodiac.sign}
                    </div>
                    <div className={zodiacCss.zodiacDates}>
                      {zodiac.dates}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 1: // Birth Date
        return (
          <div style={{ textAlign: "center", maxWidth: "400px", margin: "0 auto" }}>
            <Title level={3} style={{ marginBottom: "1rem", color: "#333" }}>
              {question.text}
            </Title>
            
            <Text type="secondary" style={{ display: "block", marginBottom: "2rem", fontSize: "15px" }}>
              Avem nevoie de data exactă pentru a calcula compatibilitatea astrologică
            </Text>

            <Input
              size="large"
              placeholder={question.placeholder}
              value={currentAnswer || ''}
              onChange={handleDateChange}
              prefix={<Iconify icon="eva:calendar-fill" width="20px" />}
              maxLength={10}
              style={{
                fontSize: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                textAlign: "center"
              }}
            />
            
            <Text type="secondary" style={{ 
              display: "block", 
              marginTop: "12px", 
              fontSize: "13px" 
            }}>
              Format: ZZ/LL/AAAA (ex: 15/03/1995)
            </Text>
          </div>
        );

      case 2: // Relationship Type
        return (
          <div style={{ textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
            <Title level={3} style={{ marginBottom: "1rem", color: "#333" }}>
              {question.text}
            </Title>
            
            <Text type="secondary" style={{ display: "block", marginBottom: "2rem", fontSize: "15px" }}>
              Alege tipul de conexiune pe care o cauți
            </Text>

            <Radio.Group 
              value={currentAnswer} 
              onChange={(e) => handleAnswerChange(e.target.value)}
              style={{ width: "100%" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {question.options.map(option => (
                  <Radio 
                    key={option} 
                    value={option}
                    style={{
                      padding: "16px 20px",
                      border: `2px solid ${currentAnswer === option ? '#1890ff' : '#e8e8e8'}`,
                      borderRadius: "8px",
                      background: currentAnswer === option ? '#f0f7ff' : '#ffffff',
                      margin: 0,
                      width: "100%",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ 
                      fontSize: "15px", 
                      fontWeight: currentAnswer === option ? "500" : "normal",
                      color: currentAnswer === option ? '#1890ff' : '#333'
                    }}>
                      {option}
                    </span>
                  </Radio>
                ))}
              </div>
            </Radio.Group>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={layoutCss.singleColumnLayout}>
      {/* Header Section */}
      <div className={layoutCss.headerSection}>
        <Text strong style={{ fontSize: "14px", color: "#666", marginBottom: "8px", display: "block" }}>
          {user?.questionnaire && Object.keys(user.questionnaire).length > 0 
            ? `Editing Questionnaire: Question ${currentStep + 1}/3`
            : `Step 3 of 3: Final Questions (${currentStep + 1}/3)`
          }
        </Text>
        <Progress 
          percent={Math.round(((currentStep + 1) / 3) * 100)} 
          strokeColor={{
            '0%': 'var(--primary)',
            '100%': 'var(--primary)',
          }}
          trailColor="#f0f0f0"
          style={{ marginBottom: "1rem" }}
        />
        
        <div className={css.authHeader} style={{ textAlign: "center" }}>
          <Title level={2} className={css.authTitle} style={{ margin: "0 0 0.5rem" }}>
            {user?.questionnaire && Object.keys(user.questionnaire).length > 0 
              ? "Update Your Profile ✨"
              : "Final Questions ✨"
            }
          </Title>
          <Text type="secondary" className={css.authSubtitle}>
            {user?.questionnaire && Object.keys(user.questionnaire).length > 0 
              ? "Update your astrological preferences and compatibility settings"
              : "Help us create your perfect astrological profile"
            }
          </Text>
        </div>
      </div>

      {/* Content Section */}
      <div className={layoutCss.contentSection} style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        minHeight: "400px"
      }}>
        {renderCurrentQuestion()}
      </div>

      {/* Footer Section */}
      <div className={layoutCss.footerSection}>
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
            {currentStep === 0 ? "Back" : "Previous"}
          </Button>
          
          <Button
            type="primary"
            size="large"
            onClick={handleNext}
            loading={loading}
            className={css.authButton}
            style={{ flex: 1 }}
            disabled={!answers[getFieldName(currentStep)]}
          >
            {loading ? (user?.questionnaire && Object.keys(user.questionnaire).length > 0 ? "Updating..." : "Completing...") : 
             currentStep === firstQuestions.length - 1 ? 
             (user?.questionnaire && Object.keys(user.questionnaire).length > 0 ? "Update Profile 🎉" : "Complete Setup 🎉") : 
             "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
} 