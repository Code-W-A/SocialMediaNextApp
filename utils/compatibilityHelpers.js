import baseCompatibilityData from '@/data/compatibilityData';
import compatibilityDataRO from '@/data/compatibilityData.ro';
import compatibilityDataEN from '@/data/compatibilityData.en';

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
// Map RO <-> EN zodiac names for general texts lookup
const ZODIAC_RO_TO_EN = {
  "Berbec": "Aries",
  "Taur": "Taurus",
  "Gemeni": "Gemini",
  "Rac": "Cancer",
  "Leu": "Leo",
  "Fecioară": "Virgo",
  "Balanță": "Libra",
  "Scorpion": "Scorpio",
  "Săgetător": "Sagittarius",
  "Capricorn": "Capricorn",
  "Vărsător": "Aquarius",
  "Pești": "Pisces"
};


// Calculează numărul numerologic dintr-o dată de naștere
export const calculateNumerologyNumber = (birthDate) => {
  if (!birthDate) return null;
  try {
    // Expect formats like DD/MM/YYYY or YYYY-MM-DD; extract all digits
    const digits = (birthDate.match(/\d/g) || []).map(d => parseInt(d, 10));
    if (digits.length === 0) return null;
    let sum = digits.reduce((acc, d) => acc + d, 0);
    // Reduce to single digit 1-9 (ignoring master numbers for simplicity)
    while (sum > 9) {
      sum = sum.toString().split('').reduce((acc, ch) => acc + parseInt(ch, 10), 0);
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

// Map element names RO <-> EN for cross-dataset lookup
const ELEMENT_RO_TO_EN = {
  'Foc': 'Fire',
  'Pământ': 'Earth',
  'Aer': 'Air',
  'Apă': 'Water'
};

const getLanguageCode = () => {
  try {
    if (typeof window !== 'undefined') {
      const lang = localStorage.getItem('ydestiny_language');
      return (lang === 'en' || lang === 'ro') ? lang : 'ro';
    }
  } catch (e) {}
  return 'ro';
};

const getLocalizedCompatibilityData = () => {
  const lang = getLanguageCode();
  // Prefer localized datasets; fallback to baseCompatibilityData
  const localized = lang === 'en' ? compatibilityDataEN : compatibilityDataRO;
  return localized || baseCompatibilityData || {};
};

const normalizeAstroSection = (section) => {
  if (!section) return null;
  return {
    loveText: section.dragoste || section.love || '',
    financeText: section.finante || section.finance || '',
    score: section.scor || section.score || undefined
  };
};

// Generate fallback numerology texts when dataset lacks detailed descriptions
const generateNumerologyFallback = (num1, num2, lang) => {
  // Base traits
  const TRAITS = {
    ro: {
      1: 'inițiativă, lider, acțiune',
      2: 'echilibru, parteneriat, empatie',
      3: 'creativitate, comunicare, bucurie',
      4: 'stabilitate, disciplină, structură',
      5: 'libertate, aventură, schimbare',
      6: 'familie, grijă, responsabilitate',
      7: 'introspecție, analiză, spiritualitate',
      8: 'putere, ambiție, rezultate',
      9: 'idealism, altruism, compasiune'
    },
    en: {
      1: 'initiative, leader, action',
      2: 'balance, partnership, empathy',
      3: 'creativity, communication, joy',
      4: 'stability, discipline, structure',
      5: 'freedom, adventure, change',
      6: 'family, care, responsibility',
      7: 'introspection, analysis, spirituality',
      8: 'power, ambition, results',
      9: 'idealism, altruism, compassion'
    }
  };
  const L = lang === 'en' ? 'en' : 'ro';
  const tA = TRAITS[L][num1];
  const tB = TRAITS[L][num2];

  const isEven = (n) => n % 2 === 0;
  const parityCombo = isEven(num1) === isEven(num2) ? (isEven(num1) ? 'even-even' : 'odd-odd') : 'mixed';

  // Love text
  let loveText;
  if (L === 'ro') {
    if (parityCombo === 'mixed') {
      loveText = `O relație complementară: ${tA} + ${tB}. Împreună găsiți echilibru între nevoia de siguranță și dorința de explorare.`;
    } else if (parityCombo === 'even-even') {
      loveText = `Relație armonioasă și stabilă: ${tA} și ${tB}. Aveți ritm comun, dar e util să păstrați dinamismul.`;
    } else {
      loveText = `Relație energică și dinamică: ${tA} și ${tB}. Aveți scânteie, dar atenție la impulsivitate și orgoliu.`;
    }
  } else {
    if (parityCombo === 'mixed') {
      loveText = `A complementary relationship: ${tA} + ${tB}. You balance safety needs with the desire for exploration.`;
    } else if (parityCombo === 'even-even') {
      loveText = `Harmonious and stable: ${tA} and ${tB}. Shared rhythm, but keep some spontaneity alive.`;
    } else {
      loveText = `Energetic and dynamic: ${tA} and ${tB}. Great spark; watch impulsivity and ego clashes.`;
    }
  }

  // Finance text
  let financeText;
  if (L === 'ro') {
    if (num1 === 4 || num2 === 4 || num1 === 8 || num2 === 8) {
      financeText = 'Abordare solidă a finanțelor: strategie clară, obiective pe termen lung, risc calculat.';
    } else if (num1 === 5 || num2 === 5 || num1 === 3 || num2 === 3) {
      financeText = 'Tendință spre cheltuieli pentru experiențe și creativitate. Un buget comun vă ajută să evitați excesele.';
    } else if (num1 === 9 || num2 === 9) {
      financeText = 'Perspectivă idealistă asupra banilor. E util să setați împreună obiective practice și să urmăriți progresul.';
    } else {
      financeText = 'Echilibru între prudență și inițiativă. Stabiliți reguli simple: fond de urgență + obiective comune.';
    }
  } else {
    if (num1 === 4 || num2 === 4 || num1 === 8 || num2 === 8) {
      financeText = 'Solid financial approach: clear strategy, long-term goals, calculated risk.';
    } else if (num1 === 5 || num2 === 5 || num1 === 3 || num2 === 3) {
      financeText = 'A tendency to spend on experiences and creativity. A joint budget helps avoid excess.';
    } else if (num1 === 9 || num2 === 9) {
      financeText = 'Idealistic view of money. Set practical goals together and track progress.';
    } else {
      financeText = 'Balanced prudence and initiative. Simple rules: emergency fund + shared goals.';
    }
  }

  return { loveText, financeText };
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
  const sign1 = user1.questionnaire.zodiacSign;
  const sign2 = user2.questionnaire.zodiacSign;
  
  if (!element1 || !element2) {
    console.log('Missing elements:', { element1, element2 });
    return null;
  }
  
  const keyRO = getAstrologyKey(element1, element2);
  const keyEN = getAstrologyKey(ELEMENT_RO_TO_EN[element1] || element1, ELEMENT_RO_TO_EN[element2] || element2);
  const signKeyRO = `${sign1}-${sign2}`;
  const signKeyROReverse = `${sign2}-${sign1}`;

  const localized = getLocalizedCompatibilityData();
  const section =
    // Prefer specific sign pair
    localized?.astrology?.signs?.[signKeyRO] ||
    localized?.astrology?.signs?.[signKeyROReverse] ||
    // Fallback to elements pair
    localized?.astrology?.[keyRO] ||
    localized?.astrology?.elements?.[keyRO] ||
    localized?.astrology?.elements?.[keyEN] ||
    baseCompatibilityData?.astrology?.[keyRO] ||
    baseCompatibilityData?.astrology?.elements?.[keyRO] || null;
  const compatibility = normalizeAstroSection(section);
  
  console.log('Astrology compatibility lookup:', {
    zodiac1: user1.questionnaire.zodiacSign,
    zodiac2: user2.questionnaire.zodiacSign,
    element1,
    element2,
    keyRO,
    signKeyRO,
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
  const localized = getLocalizedCompatibilityData();
  const section = localized?.numerology?.[key] || baseCompatibilityData?.numerology?.[key] || null;
  let compatibility = null;
  if (section) {
    compatibility = { loveText: section.dragoste || section.love || '', financeText: section.finante || section.finance || '', score: section.scor || section.score };
  } else {
    const lang = getLanguageCode();
    const fallbackTexts = generateNumerologyFallback(num1, num2, lang);
    const numPair = `${num1}-${num2}`;
    const reversePair = `${num2}-${num1}`;
    const score = numerologyCompatibilityScores[numPair] || numerologyCompatibilityScores[reversePair] || 50;
    compatibility = { loveText: fallbackTexts.loveText, financeText: fallbackTexts.financeText, score };
  }
  
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

  // Prefer dataset score if available
  const key = getNumerologyKey(num1, num2);
  const localized = getLocalizedCompatibilityData();
  const section = localized?.numerology?.[key] || baseCompatibilityData?.numerology?.[key];
  const datasetScore = section?.scor || section?.score;
  if (typeof datasetScore === 'number') {
    return datasetScore;
  }

  // Fallback to static table
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

// Derived aspects (Friendship, Spirituality, Activities) based on simple heuristics
export const getDerivedCompatibilityAspects = (user1, user2) => {
  const lang = getLanguageCode();
  const L = lang === 'en' ? 'en' : 'ro';
  const zodiac1 = user1?.questionnaire?.zodiacSign;
  const zodiac2 = user2?.questionnaire?.zodiacSign;
  const e1 = zodiac1 ? getZodiacElement(zodiac1) : null;
  const e2 = zodiac2 ? getZodiacElement(zodiac2) : null;
  const n1 = calculateNumerologyNumber(user1?.questionnaire?.birthDate);
  const n2 = calculateNumerologyNumber(user2?.questionnaire?.birthDate);

  const isFireOrAir = (el) => el === 'Foc' || el === 'Aer';
  const isWaterOrEarth = (el) => el === 'Apă' || el === 'Pământ';

  // Friendship
  let friendshipText;
  // Prefer explicit pair-specific texts from dataset if available
  try {
    const localized = getLocalizedCompatibilityData();
    const signKey = zodiac1 && zodiac2 ? `${zodiac1}-${zodiac2}` : null;
    const reverseKey = zodiac1 && zodiac2 ? `${zodiac2}-${zodiac1}` : null;
    const pairSection = (signKey && (localized?.astrology?.signs?.[signKey] || localized?.astrology?.signs?.[reverseKey])) || null;
    if (pairSection) {
      if (L === 'ro') {
        if (pairSection.prietenie) friendshipText = pairSection.prietenie;
      } else {
        if (pairSection.friendship) friendshipText = pairSection.friendship;
      }
    }
  } catch (_) {
    // ignore and fallback to heuristics
  }
  if (L === 'ro') {
    if (!friendshipText && e1 && e2 && (isFireOrAir(e1) && isFireOrAir(e2))) {
      friendshipText = 'Prietenie dinamică, socială și plină de idei. Activități comune ușor de găsit.';
    } else if (!friendshipText && e1 && e2 && (isWaterOrEarth(e1) && isWaterOrEarth(e2))) {
      friendshipText = 'Prietenie stabilă și loială, axată pe sprijin și siguranță emoțională.';
    } else if (!friendshipText) {
      friendshipText = 'Complementaritate utilă: combinați energie cu stabilitate pentru a vă potrivi ritmurile.';
    }
  } else {
    if (!friendshipText && e1 && e2 && (isFireOrAir(e1) && isFireOrAir(e2))) {
      friendshipText = 'Dynamic, social friendship full of ideas. Easy to find common activities.';
    } else if (!friendshipText && e1 && e2 && (isWaterOrEarth(e1) && isWaterOrEarth(e2))) {
      friendshipText = 'Stable, loyal friendship focused on support and emotional safety.';
    } else if (!friendshipText) {
      friendshipText = 'Helpful complementarity: blend energy with stability to match rhythms.';
    }
  }

  // Spirituality
  let spiritualityText;
  try {
    const localized = getLocalizedCompatibilityData();
    const signKey = zodiac1 && zodiac2 ? `${zodiac1}-${zodiac2}` : null;
    const reverseKey = zodiac1 && zodiac2 ? `${zodiac2}-${zodiac1}` : null;
    const pairSection = (signKey && (localized?.astrology?.signs?.[signKey] || localized?.astrology?.signs?.[reverseKey])) || null;
    if (pairSection) {
      if (L === 'ro') {
        if (pairSection.spiritualitate) spiritualityText = pairSection.spiritualitate;
      } else {
        if (pairSection.spirituality) spiritualityText = pairSection.spirituality;
      }
    }
  } catch (_) {}
  const spiritualNums = [7, 9];
  const hasSpiritualNum = spiritualNums.includes(n1 || 0) || spiritualNums.includes(n2 || 0);
  const waterHeavy = (e1 === 'Apă') || (e2 === 'Apă');
  if (L === 'ro') {
    if (!spiritualityText && (hasSpiritualNum || waterHeavy)) {
      spiritualityText = 'Conexiune spirituală profundă, cu empatie și introspecție. Dialoguri care vindecă.';
    } else if (!spiritualityText) {
      spiritualityText = 'Abordare echilibrată: curiozitate și deschidere către sens. Găsiți ritualuri simple comune.';
    }
  } else {
    if (!spiritualityText && (hasSpiritualNum || waterHeavy)) {
      spiritualityText = 'Deep spiritual connection with empathy and introspection. Conversations that heal.';
    } else if (!spiritualityText) {
      spiritualityText = 'Balanced approach: curiosity and openness to meaning. Find simple shared rituals.';
    }
  }

  // Activities / Pleasures
  let activitiesText;
  try {
    const localized = getLocalizedCompatibilityData();
    const signKey = zodiac1 && zodiac2 ? `${zodiac1}-${zodiac2}` : null;
    const reverseKey = zodiac1 && zodiac2 ? `${zodiac2}-${zodiac1}` : null;
    const pairSection = (signKey && (localized?.astrology?.signs?.[signKey] || localized?.astrology?.signs?.[reverseKey])) || null;
    if (pairSection) {
      if (L === 'ro') {
        if (pairSection.activitati) activitiesText = pairSection.activitati;
      } else {
        if (pairSection.activities) activitiesText = pairSection.activities;
      }
    }
  } catch (_) {}
  const activeNums = [1, 3, 5];
  const structuredNums = [4, 6, 8];
  const activePair = activeNums.includes(n1 || 0) || activeNums.includes(n2 || 0) || (e1 && isFireOrAir(e1)) || (e2 && isFireOrAir(e2));
  const structuredPair = structuredNums.includes(n1 || 0) || structuredNums.includes(n2 || 0) || (e1 && isWaterOrEarth(e1)) || (e2 && isWaterOrEarth(e2));
  if (L === 'ro') {
    if (!activitiesText && activePair && structuredPair) {
      activitiesText = 'Îmbinare reușită între aventură (călătorii, evenimente) și plăceri calme (cină acasă, natură).';
    } else if (!activitiesText && activePair) {
      activitiesText = 'Activități dinamice: sport, călătorii scurte, evenimente sociale, explorări urbane.';
    } else if (!activitiesText) {
      activitiesText = 'Plăceri liniștite: gătit împreună, seri de film, natură, ateliere creative.';
    }
  } else {
    if (!activitiesText && activePair && structuredPair) {
      activitiesText = 'Great blend of adventure (travel, events) and calm pleasures (home dinners, nature).';
    } else if (!activitiesText && activePair) {
      activitiesText = 'Dynamic activities: sports, short trips, social events, urban explorations.';
    } else if (!activitiesText) {
      activitiesText = 'Quiet pleasures: cooking together, movie nights, nature, creative workshops.';
    }
  }

  return { friendshipText, spiritualityText, activitiesText };
};

// Get numerology general description for a Life Path number (localized)
export const getNumerologyGeneralText = (lifePathNumber) => {
  if (!lifePathNumber) return '';
  const localized = getLocalizedCompatibilityData();
  const key = String(lifePathNumber);
  return (
    localized?.numerologyGeneral?.[key] ||
    baseCompatibilityData?.numerologyGeneral?.[key] ||
    ''
  );
};

// Get astrology general description for a zodiac sign (localized)
export const getAstrologyGeneralText = (zodiacSign) => {
  if (!zodiacSign) return '';
  const localized = getLocalizedCompatibilityData();
  const lang = getLanguageCode();
  // In RO dataset, keys are RO (e.g., "Berbec"); in EN dataset, keys are EN (e.g., "Aries")
  const key = lang === 'en' ? (ZODIAC_RO_TO_EN[zodiacSign] || zodiacSign) : zodiacSign;
  return (
    localized?.astrology?.general?.[key] ||
    baseCompatibilityData?.astrology?.general?.[key] ||
    ''
  );
};