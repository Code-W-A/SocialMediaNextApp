"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Questionnaire from '../../../components/Questionnaire';
import { useAuth } from '../../../context/AuthContext';

export default function QuestionnairePage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verifică dacă utilizatorul a completat deja chestionarul
    const completed = localStorage.getItem('questionnaireCompleted');
    const hasAstroProfile = user?.zodiacSign && user?.relationshipType;
    
    if (completed === 'true' || hasAstroProfile) {
      setIsCompleted(true);
      // Redirecționează la pagina de matches după 2 secunde
      setTimeout(() => {
        router.push('/matches');
      }, 2000);
    }
    
    setIsLoading(false);
  }, [user, router]);

  const handleQuestionnaireComplete = (profileData) => {
    console.log('Chestionar completat:', profileData);
    setIsCompleted(true);
    
    // Redirecționează la pagina de matches
    setTimeout(() => {
      router.push('/matches');
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Profil Completat! ✨
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Felicitări! Ai completat cu succes chestionarul de compatibilitate astrologică. 
            Acum îți putem găsi cele mai potrivite conexiuni bazate pe profilul tău unic.
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              Ce urmează?
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>• Analizăm compatibilitatea ta cu alți utilizatori</li>
              <li>• Calculăm scorurile bazate pe astrologie</li>
              <li>• Îți prezentăm cele mai bune match-uri</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Te redirecționăm către pagina de compatibilități...
          </p>
          
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Questionnaire onComplete={handleQuestionnaireComplete} />
    </div>
  );
} 