import compatibilityData from '@/data/compatibilityData';

// Maparea zodiilor la elemente
const zodiacToElement = {
  "Berbec": "Foc",
  "Leu": "Foc", 
  "Săgetător": "Foc",
  "Taur": "Pământ",
  "Fecioară": "Pământ",
  "Capricorn": "Pământ",
  "Gemeni": "Aer",
  "Balanță": "Aer",
  "Vărsător": "Aer",
  "Rac": "Apă",
  "Scorpion": "Apă",
  "Pești": "Apă"
};

// Calculează numărul numerologic dintr-o dată de naștere
export const calculateNumerologyNumber = (birthDate) => {
  if (!birthDate) return null;
  
  try {
    // Extrage doar ziua și luna (ignoră anul pentru a fi mai relevant)
    const [day, month] = birthDate.split('/').map(num => parseInt(num));
    
    // Sumă cifrele
    let sum = day + month;
    
    // Reduce la o singură cifră (1-9)
    while (sum > 9) {
      const digits = sum.toString().split('').map(d => parseInt(d));
      sum = digits.reduce((acc, digit) => acc + digit, 0);
    }
    
    return sum;
  } catch (error) {
    console.error("Error calculating numerology number:", error);
    return null;
  }
};

// Obține elementul zodiacal
export const getZodiacElement = (zodiacSign) => {
  return zodiacToElement[zodiacSign] || null;
};

// Generează cheia pentru compatibilitatea astrologică
const getAstrologyKey = (element1, element2) => {
  // Sortează alfabetic pentru consistență
  const elements = [element1, element2].sort();
  return `${elements[0]}-${elements[1]}`;
};

// Generează cheia pentru compatibilitatea numerologică
const getNumerologyKey = (num1, num2) => {
  // Sortează pentru consistență
  const numbers = [num1, num2].sort((a, b) => a - b);
  return `${numbers[0]}-${numbers[1]}`;
};

// Obține textul de compatibilitate astrologică
export const getAstrologyCompatibility = (user1, user2) => {
  if (!user1?.questionnaire?.zodiacSign || !user2?.questionnaire?.zodiacSign) {
    console.log('Missing zodiac signs:', { 
      user1: user1?.questionnaire?.zodiacSign, 
      user2: user2?.questionnaire?.zodiacSign 
    });
    return null;
  }
  
  const element1 = getZodiacElement(user1.questionnaire.zodiacSign);
  const element2 = getZodiacElement(user2.questionnaire.zodiacSign);
  
  if (!element1 || !element2) {
    console.log('Missing elements:', { element1, element2 });
    return null;
  }
  
  const key = getAstrologyKey(element1, element2);
  const compatibility = compatibilityData.astrology[key];
  
  console.log('Astrology compatibility lookup:', {
    zodiac1: user1.questionnaire.zodiacSign,
    zodiac2: user2.questionnaire.zodiacSign,
    element1,
    element2,
    key,
    found: !!compatibility,
    compatibility
  });
  
  return compatibility || null;
};

// Obține textul de compatibilitate numerologică
export const getNumerologyCompatibility = (user1, user2) => {
  if (!user1?.questionnaire?.birthDate || !user2?.questionnaire?.birthDate) {
    console.log('Missing birth dates:', { 
      user1: user1?.questionnaire?.birthDate, 
      user2: user2?.questionnaire?.birthDate 
    });
    return null;
  }
  
  const num1 = calculateNumerologyNumber(user1.questionnaire.birthDate);
  const num2 = calculateNumerologyNumber(user2.questionnaire.birthDate);
  
  if (!num1 || !num2) {
    console.log('Missing numerology numbers:', { num1, num2 });
    return null;
  }
  
  const key = getNumerologyKey(num1, num2);
  const compatibility = compatibilityData.numerology[key];
  
  console.log('Numerology compatibility lookup:', {
    birthDate1: user1.questionnaire.birthDate,
    birthDate2: user2.questionnaire.birthDate,
    num1,
    num2,
    key,
    found: !!compatibility,
    compatibility
  });
  
  return compatibility || null;
};

// Obține toate compatibilitățile pentru doi utilizatori
export const getFullCompatibility = (user1, user2) => {
  console.log('=== Getting Full Compatibility ===');
  console.log('User1 data:', {
    id: user1?.id,
    zodiac: user1?.questionnaire?.zodiacSign,
    birthDate: user1?.questionnaire?.birthDate,
    relationshipType: user1?.questionnaire?.relationshipType
  });
  console.log('User2 data:', {
    id: user2?.id,
    zodiac: user2?.questionnaire?.zodiacSign,
    birthDate: user2?.questionnaire?.birthDate,
    relationshipType: user2?.questionnaire?.relationshipType
  });
  
  const astrology = getAstrologyCompatibility(user1, user2);
  const numerology = getNumerologyCompatibility(user1, user2);
  
  const result = {
    astrology,
    numerology,
    hasCompatibility: !!(astrology || numerology)
  };
  
  console.log('Full compatibility result:', result);
  console.log('=== End Full Compatibility ===');
  
  return result;
};

// Verifică dacă doi utilizatori sunt compatibili (pentru sistemul existent)
export const areUsersAstrologicallyCompatible = (user1, user2) => {
  const compatibility = getFullCompatibility(user1, user2);
  return compatibility.hasCompatibility;
};

// Verifică compatibilitatea tipurilor de relație
export const areRelationshipTypesCompatible = (user1, user2) => {
  const relationType1 = user1?.questionnaire?.relationshipType;
  const relationType2 = user2?.questionnaire?.relationshipType;
  
  // If either user doesn't have relationship type data, they're not compatible
  if (!relationType1 || !relationType2) {
    return false;
  }
  
  // Define compatible relationship types
  const romanticTypes = ["Relație de lungă durată", "Relație casual"];
  const friendshipType = "Prietenie";
  
  // Both users want romantic relationships (long-term or casual) - COMPATIBLE
  if (romanticTypes.includes(relationType1) && romanticTypes.includes(relationType2)) {
    return true;
  }
  
  // Both users want friendship - COMPATIBLE
  if (relationType1 === friendshipType && relationType2 === friendshipType) {
    return true;
  }
  
  // One wants friendship, other wants romantic - NOT COMPATIBLE
  if ((relationType1 === friendshipType && romanticTypes.includes(relationType2)) ||
      (romanticTypes.includes(relationType1) && relationType2 === friendshipType)) {
    return false;
  }
  
  return false;
};

// Obține textul pentru tipul de relație
export const getRelationshipTypeText = (relationshipType) => {
  const typeTexts = {
    "Relație de lungă durată": "💕 Căutare relație serioasă",
    "Relație casual": "🌟 Relație relaxată", 
    "Prietenie": "🤝 Căutare prietenie"
  };
  return typeTexts[relationshipType] || relationshipType;
};

// Debug function pentru testarea compatibilității tipurilor de relație
export const debugRelationshipCompatibility = () => {
  const testCases = [
    {
      user1: { questionnaire: { relationshipType: "Relație de lungă durată" } },
      user2: { questionnaire: { relationshipType: "Relație casual" } },
      expected: true,
      description: "Long-term + Casual = COMPATIBLE"
    },
    {
      user1: { questionnaire: { relationshipType: "Relație de lungă durată" } },
      user2: { questionnaire: { relationshipType: "Prietenie" } },
      expected: false,
      description: "Long-term + Friendship = NOT COMPATIBLE"
    },
    {
      user1: { questionnaire: { relationshipType: "Relație casual" } },
      user2: { questionnaire: { relationshipType: "Prietenie" } },
      expected: false,
      description: "Casual + Friendship = NOT COMPATIBLE"
    },
    {
      user1: { questionnaire: { relationshipType: "Prietenie" } },
      user2: { questionnaire: { relationshipType: "Prietenie" } },
      expected: true,
      description: "Friendship + Friendship = COMPATIBLE"
    },
    {
      user1: { questionnaire: { relationshipType: "Relație de lungă durată" } },
      user2: { questionnaire: { relationshipType: "Relație de lungă durată" } },
      expected: true,
      description: "Long-term + Long-term = COMPATIBLE"
    }
  ];

  console.log("=== Testing Relationship Type Compatibility ===");
  testCases.forEach((testCase, index) => {
    const result = areRelationshipTypesCompatible(testCase.user1, testCase.user2);
    const status = result === testCase.expected ? "✅ PASS" : "❌ FAIL";
    console.log(`Test ${index + 1}: ${status} - ${testCase.description}`);
    console.log(`  Result: ${result}, Expected: ${testCase.expected}`);
  });
  console.log("=== End Test ===");
};

// Zodiac element compatibility scores
const elementCompatibilityScores = {
  // Fire elements (Foc)
  'Foc-Foc': 85,       // Berbec-Berbec, Leu-Leu, Săgetător-Săgetător
  'Foc-Aer': 90,       // Foc + Aer = very compatible
  'Foc-Pământ': 60,    // Foc + Pământ = moderate
  'Foc-Apă': 45,       // Foc + Apă = challenging
  
  // Air elements (Aer)
  'Aer-Aer': 80,       // Gemeni-Gemeni, Balanță-Balanță, Vărsător-Vărsător
  'Aer-Foc': 90,       // Aer + Foc = very compatible
  'Aer-Pământ': 55,    // Aer + Pământ = moderate
  'Aer-Apă': 65,       // Aer + Apă = moderate+
  
  // Earth elements (Pământ)
  'Pământ-Pământ': 85, // Taur-Taur, Fecioară-Fecioară, Capricorn-Capricorn
  'Pământ-Apă': 75,    // Pământ + Apă = good
  'Pământ-Foc': 60,    // Pământ + Foc = moderate
  'Pământ-Aer': 55,    // Pământ + Aer = moderate
  
  // Water elements (Apă)
  'Apă-Apă': 80,       // Rac-Rac, Scorpion-Scorpion, Pești-Pești
  'Apă-Pământ': 75,    // Apă + Pământ = good
  'Apă-Aer': 65,       // Apă + Aer = moderate+
  'Apă-Foc': 45        // Apă + Foc = challenging
};

// Numerology compatibility scores (based on life path numbers)
const numerologyCompatibilityScores = {
  // Number 1 compatibilities
  '1-1': 75, '1-2': 70, '1-3': 85, '1-4': 60, '1-5': 80,
  '1-6': 65, '1-7': 55, '1-8': 90, '1-9': 75,
  
  // Number 2 compatibilities
  '2-2': 80, '2-3': 75, '2-4': 85, '2-5': 60, '2-6': 90,
  '2-7': 70, '2-8': 65, '2-9': 75,
  
  // Number 3 compatibilities
  '3-3': 85, '3-4': 55, '3-5': 90, '3-6': 80, '3-7': 70,
  '3-8': 60, '3-9': 95,
  
  // Number 4 compatibilities
  '4-4': 80, '4-5': 50, '4-6': 85, '4-7': 75, '4-8': 90,
  '4-9': 60,
  
  // Number 5 compatibilities
  '5-5': 85, '5-6': 65, '5-7': 80, '5-8': 70, '5-9': 75,
  
  // Number 6 compatibilities
  '6-6': 90, '6-7': 65, '6-8': 80, '6-9': 85,
  
  // Number 7 compatibilities
  '7-7': 75, '7-8': 60, '7-9': 70,
  
  // Number 8 compatibilities
  '8-8': 85, '8-9': 65,
  
  // Number 9 compatibilities
  '9-9': 80
};

// Calculate astrology compatibility score
export const calculateAstrologyScore = (user1, user2) => {
  const zodiac1 = user1?.questionnaire?.zodiacSign;
  const zodiac2 = user2?.questionnaire?.zodiacSign;
  
  if (!zodiac1 || !zodiac2) return 0;
  
  const element1 = getZodiacElement(zodiac1);
  const element2 = getZodiacElement(zodiac2);
  
  if (!element1 || !element2) return 0;
  
  const elementPair = `${element1}-${element2}`;
  const reversePair = `${element2}-${element1}`;
  
  return elementCompatibilityScores[elementPair] || 
         elementCompatibilityScores[reversePair] || 50;
};

// Calculate numerology compatibility score
export const calculateNumerologyScore = (user1, user2) => {
  const num1 = calculateNumerologyNumber(user1?.questionnaire?.birthDate);
  const num2 = calculateNumerologyNumber(user2?.questionnaire?.birthDate);
  
  if (!num1 || !num2) return 0;
  
  const numPair = `${num1}-${num2}`;
  const reversePair = `${num2}-${num1}`;
  
  return numerologyCompatibilityScores[numPair] || 
         numerologyCompatibilityScores[reversePair] || 50;
};

// Calculate overall compatibility score
export const calculateOverallCompatibilityScore = (user1, user2) => {
  const astrologyScore = calculateAstrologyScore(user1, user2);
  const numerologyScore = calculateNumerologyScore(user1, user2);
  
  // If we have both scores, average them with slight weight to astrology
  if (astrologyScore > 0 && numerologyScore > 0) {
    return Math.round((astrologyScore * 0.6 + numerologyScore * 0.4));
  }
  
  // If we only have one score, use it
  if (astrologyScore > 0) return astrologyScore;
  if (numerologyScore > 0) return numerologyScore;
  
  // Default score if no data
  return 50;
};

// Get compatibility level text based on score
export const getCompatibilityLevel = (score) => {
  if (score >= 90) return { level: 'Exceptional', color: '#52c41a', emoji: '💫' };
  if (score >= 80) return { level: 'Excellent', color: '#722ed1', emoji: '⭐' };
  if (score >= 70) return { level: 'Very Good', color: '#1890ff', emoji: '✨' };
  if (score >= 60) return { level: 'Good', color: '#13c2c2', emoji: '💙' };
  if (score >= 50) return { level: 'Moderate', color: '#faad14', emoji: '💛' };
  return { level: 'Challenging', color: '#ff7875', emoji: '💔' };
};

// Get compatibility score with details
export const getCompatibilityScoreDetails = (user1, user2) => {
  const astrologyScore = calculateAstrologyScore(user1, user2);
  const numerologyScore = calculateNumerologyScore(user1, user2);
  const overallScore = calculateOverallCompatibilityScore(user1, user2);
  const level = getCompatibilityLevel(overallScore);
  
  return {
    overall: overallScore,
    astrology: astrologyScore,
    numerology: numerologyScore,
    level: level.level,
    color: level.color,
    emoji: level.emoji
  };
}; 