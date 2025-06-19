"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { calculateCompatibilityScore } from "@/mock/astroQuestions";
import { checkOnboardingStatus } from "@/utils/onboardingHelpers";

const dailyHoroscopes = {
  "Berbec": "Astăzi energia ta va fi în creștere! Este o zi perfectă pentru a face primul pas în relații.",
  "Taur": "Stabilitatea pe care o oferi va atrage oamenii potriviți în viața ta. Fii receptiv la noi conexiuni.",
  "Gemeni": "Comunicarea ta naturală va străluci astăzi. Conversațiile profunde pot duce la legături speciale.",
  "Rac": "Intuiția ta va fi puternică astăzi. Ascultă-ți inima când vine vorba de relații.",
  "Leu": "Carisma ta naturală va atrage admiratori. Fii tu însuți și lasă-te descoperit.",
  "Fecioară": "Atenția ta la detalii te va ajuta să observi semnele compatibilității. Fii atent la indicii.",
  "Balanță": "Echilibrul și diplomația ta vor fi apreciate. Este o zi excelentă pentru întâlniri.",
  "Scorpion": "Intensitatea ta emoțională va crea conexiuni profunde. Nu-ți fie frică să te deschizi.",
  "Săgetător": "Spiritul tău aventuros va atrage parteneri compatibili. Explorează noi posibilități.",
  "Capricorn": "Abordarea ta serioasă în relații va fi apreciată de persoanele potrivite.",
  "Vărsător": "Originalitatea ta va străluci astăzi. Fii autentic în toate interacțiunile.",
  "Pești": "Sensibilitatea ta va crea legături emoționale puternice. Urmează-ți inima."
};

const AstroHomeView = () => {
  const [todayMatches, setTodayMatches] = useState(0);
  const [weeklyMatches, setWeeklyMatches] = useState(0);
  const [compatibilityStats, setCompatibilityStats] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Simulează statistici zilnice
    setTodayMatches(Math.floor(Math.random() * 5) + 1);
    setWeeklyMatches(Math.floor(Math.random() * 20) + 5);
    
    // Simulează statistici de compatibilitate
    const stats = [
      { element: "Foc", percentage: 35 },
      { element: "Pământ", percentage: 25 },
      { element: "Aer", percentage: 30 },
      { element: "Apă", percentage: 10 }
    ];
    setCompatibilityStats(stats);
  }, []);

  const handleStartQuestionnaire = () => {
    router.push('/questionnaire');
  };

  const handleViewMatches = () => {
    router.push('/matches');
  };

  const getZodiacEmoji = (sign) => {
    const emojis = {
      "Berbec": "♈", "Taur": "♉", "Gemeni": "♊", "Rac": "♋",
      "Leu": "♌", "Fecioară": "♍", "Balanță": "♎", "Scorpion": "♏",
      "Săgetător": "♐", "Capricorn": "♑", "Vărsător": "♒", "Pești": "♓"
    };
    return emojis[sign] || "⭐";
  };

  const onboardingStatus = checkOnboardingStatus(user);
  
  if (!onboardingStatus.hasQuestionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <div className="text-6xl mb-6">🔮</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Bun venit la AstroMatch!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Pentru a-ți găsi cele mai potrivite conexiuni astrologice, 
              trebuie să completezi mai întâi chestionarul de compatibilitate.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-left">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 dark:text-purple-400">1</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Completează profilul astrologic</span>
              </div>
              <div className="flex items-center text-left">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 dark:text-purple-400">2</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Descoperă compatibilitățile tale</span>
              </div>
              <div className="flex items-center text-left">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 dark:text-purple-400">3</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Conectează-te cu suflete pereche</span>
              </div>
            </div>
            <button
              onClick={handleStartQuestionnaire}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold transform hover:scale-105"
            >
              Începe Chestionarul ✨
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header cu salut personal */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Bună, {user?.firstName || user?.first_name}! {getZodiacEmoji(user?.zodiacSign)}
                </h1>
                <p className="opacity-90">
                  Să descoperim ce-ți rezervă astrele astăzi...
                </p>
              </div>
              <div className="text-4xl">
                {getZodiacEmoji(user?.zodiacSign)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coloana principală */}
          <div className="lg:col-span-2 space-y-6">
            {/* Horoscop zilnic */}
            {user?.zodiacSign && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{getZodiacEmoji(user.zodiacSign)}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Horoscopul zilei pentru {user.zodiacSign}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date().toLocaleDateString('ro-RO', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {dailyHoroscopes[user.zodiacSign]}
                </p>
              </div>
            )}

            {/* Statistici de astăzi */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Activitatea ta astăzi
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {todayMatches}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Noi match-uri</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">
                    {weeklyMatches}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Match-uri săptămâna aceasta</p>
                </div>
              </div>
            </div>

            {/* Acțiuni rapide */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Acțiuni rapide
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleViewMatches}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                  </svg>
                  Vezi Match-urile
                </button>
                <button
                  onClick={() => router.push('/messages')}
                  className="flex items-center justify-center p-4 border-2 border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  Mesajele Mele
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar dreapta */}
          <div className="space-y-6">
            {/* Compatibilitatea mea */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Profilul tău astrologic
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Zodia:</span>
                  <div className="flex items-center">
                    <span className="mr-2">{getZodiacEmoji(user?.zodiacSign)}</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {user?.zodiacSign}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Element:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {user?.dominantElement}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Caut:</span>
                  <span className="font-semibold text-gray-800 dark:text-white text-sm">
                    {user?.relationshipType}
                  </span>
                </div>
              </div>
            </div>

            {/* Compatibilitate cu elementele */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Compatibilitatea cu elementele
              </h3>
              <div className="space-y-3">
                {compatibilityStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.element}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">
                        {stat.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sfaturi astrologice */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl mb-3">💫</div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  Știai că...?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Persoanele cu același element dominant au 75% mai multe șanse să 
                  dezvolte relații de lungă durată bazate pe înțelegere profundă.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstroHomeView; 