"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { firstQuestions, getQuestionById, getNextQuestion } from '../mock/astroQuestions';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Questionnaire = ({ onComplete }) => {
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentMultipleAnswers, setCurrentMultipleAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { user } = useAuth();
  const router = useRouter();

  const currentQuestion = getQuestionById(currentQuestionId);
  const totalQuestions = firstQuestions.length;

  useEffect(() => {
    // Calculează progresul
    const currentIndex = firstQuestions.findIndex(q => q.id === currentQuestionId);
    setProgress(((currentIndex + 1) / totalQuestions) * 100);
  }, [currentQuestionId, totalQuestions]);

  const validateAnswer = (question, answer) => {
    if (question.type === 'input') {
      if (!answer.trim()) return false;
      
      if (question.validation?.type === 'date') {
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = answer.match(dateRegex);
        if (!match) return false;
        
        const [, day, month, year] = match;
        const date = new Date(year, month - 1, day);
        return date.getDate() == day && 
               date.getMonth() == month - 1 && 
               date.getFullYear() == year &&
               date <= new Date();
      }
    }
    
    if (question.type === 'single') {
      return answer && question.options.includes(answer);
    }
    
    if (question.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0 &&
             answer.every(a => question.options.includes(a));
    }
    
    return true;
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    const answer = currentQuestion.type === 'multiple' ? currentMultipleAnswers : currentAnswer;
    
    if (!validateAnswer(currentQuestion, answer)) {
      alert('Te rog să completezi corect răspunsul înainte de a continua.');
      return;
    }

    // Salvează răspunsul
    const newAnswers = {
      ...answers,
      [currentQuestionId]: answer
    };
    setAnswers(newAnswers);

    // Verifică dacă este ultima întrebare
    if (!currentQuestion.next) {
      setIsLoading(true);
      
      try {
        // Procesează răspunsurile pentru a crea profilul utilizatorului
        const profileData = processAnswers(newAnswers);
        
        // Calculate age from birth date
        if (profileData.birthDate) {
          const [day, month, year] = profileData.birthDate.split('/');
          const birthDate = new Date(year, month - 1, day);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          profileData.age = age;
        }

        // Save to Firebase
        if (user?.id) {
          await updateDoc(doc(db, 'Users', user.id), {
            questionnaire: newAnswers,
            ...profileData,
            updatedAt: serverTimestamp()
          });
        }
        
        // Marchează chestionarul ca fiind completat
        localStorage.setItem('questionnaireCompleted', 'true');
        
        setIsLoading(false);
        
        if (onComplete) {
          onComplete(profileData);
        } else {
          router.push('/matches');
        }
      } catch (error) {
        console.error('Error saving questionnaire:', error);
        setIsLoading(false);
        alert('A apărut o eroare la salvarea datelor. Te rog să încerci din nou.');
      }
      return;
    }

    // Navighează la întrebarea următoare
    setCurrentQuestionId(currentQuestion.next);
    setCurrentAnswer('');
    setCurrentMultipleAnswers([]);
  };

  const handlePrevious = () => {
    // Găsește întrebarea anterioară
    const currentIndex = firstQuestions.findIndex(q => q.id === currentQuestionId);
    if (currentIndex > 0) {
      const previousQuestion = firstQuestions[currentIndex - 1];
      setCurrentQuestionId(previousQuestion.id);
      
      // Restaurează răspunsul anterior
      const previousAnswer = answers[previousQuestion.id];
      if (previousQuestion.type === 'multiple') {
        setCurrentMultipleAnswers(previousAnswer || []);
        setCurrentAnswer('');
      } else {
        setCurrentAnswer(previousAnswer || '');
        setCurrentMultipleAnswers([]);
      }
    }
  };

  const processAnswers = (allAnswers) => {
    const profileData = {};
    
    // Procesează răspunsurile pentru a extrage informațiile relevante
    if (allAnswers[1]) profileData.zodiacSign = allAnswers[1];
    if (allAnswers[2]) profileData.birthDate = allAnswers[2];
    if (allAnswers[3]) profileData.relationshipType = allAnswers[3];
    if (allAnswers[4]) profileData.dominantElement = allAnswers[4].split(' - ')[0];
    if (allAnswers[5]) profileData.astrologyImportance = allAnswers[5];
    if (allAnswers[6]) profileData.dateActivities = allAnswers[6];
    
    return profileData;
  };

  const handleSingleChoice = (option) => {
    setCurrentAnswer(option);
  };

  const handleMultipleChoice = (option) => {
    const maxSelections = currentQuestion.maxSelections || currentQuestion.options.length;
    
    if (currentMultipleAnswers.includes(option)) {
      setCurrentMultipleAnswers(prev => prev.filter(item => item !== option));
    } else {
      if (currentMultipleAnswers.length < maxSelections) {
        setCurrentMultipleAnswers(prev => [...prev, option]);
      }
    }
  };

  const handleInputChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chestionar completat!</h2>
          <p>Îți mulțumim pentru răspunsuri. Te redirecționăm...</p>
        </div>
      </div>
    );
  }

  const currentIndex = firstQuestions.findIndex(q => q.id === currentQuestionId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Întrebarea {currentIndex + 1} din {totalQuestions}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {currentQuestion.text}
          </h2>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.type === 'input' && (
              <input
                type="text"
                value={currentAnswer}
                onChange={handleInputChange}
                placeholder={currentQuestion.placeholder}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
                         focus:border-purple-500 dark:focus:border-purple-400 
                         bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                         transition-colors duration-200"
              />
            )}

            {currentQuestion.type === 'single' && (
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSingleChoice(option)}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      currentAnswer === option
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'multiple' && (
              <div className="grid gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {currentQuestion.maxSelections 
                    ? `Poți selecta maximum ${currentQuestion.maxSelections} opțiuni`
                    : 'Poți selecta multiple opțiuni'
                  }
                </p>
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleMultipleChoice(option)}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      currentMultipleAnswers.includes(option)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        currentMultipleAnswers.includes(option)
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {currentMultipleAnswers.includes(option) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        )}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 
                     text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Înapoi
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                     rounded-lg hover:from-purple-600 hover:to-pink-600 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvez...
              </div>
            ) : (
              currentQuestion.next ? 'Continuă' : 'Finalizează'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire; 