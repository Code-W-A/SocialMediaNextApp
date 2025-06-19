export const firstQuestions = [
  {
    id: 1,
    text: "Care este zodia ta?",
    options: [
      "Berbec",
      "Taur",
      "Gemeni",
      "Rac",
      "Leu",
      "Fecioară",
      "Balanță",
      "Scorpion",
      "Săgetător",
      "Capricorn",
      "Vărsător",
      "Pești",
    ],
    type: "single",
    next: 2,
    matchRequired: true,
    compatibility: true,
  },
  {
    id: 2,
    text: "Care este data ta de naștere? (Format: ZZ/LL/AAAA)",
    type: "input",
    placeholder: "dd/MM/yyyy",
    validation: {
      type: "date",
      format: "dd/MM/yyyy",
    },
    next: 3,
    matchRequired: true,
    compatibility: true,
  },
  {
    id: 3,
    text: "Ce tip de relație cauți?",
    options: [
      "Relație de lungă durată",
      "Relație casual",
      "Prietenie"
    ],
    type: "single",
    next: 4,
    matchRequired: true,
    compatibility: true,
  },

];


// Funcții helper pentru gestionarea chestionarului
export const getAllQuestions = () => {
  return [...firstQuestions];
};

export const getQuestionById = (id) => {
  const allQuestions = getAllQuestions();
  return allQuestions.find(q => q.id === id);
};

export const getNextQuestion = (currentId) => {
  const currentQuestion = getQuestionById(currentId);
  if (currentQuestion && currentQuestion.next) {
    return getQuestionById(currentQuestion.next);
  }
  return null;
};

// Compatibilitate zodiacală
export const zodiacCompatibility = {
  "Berbec": ["Leu", "Săgetător", "Gemeni", "Vărsător"],
  "Taur": ["Fecioară", "Capricorn", "Rac", "Pești"],
  "Gemeni": ["Balanță", "Vărsător", "Berbec", "Leu"],
  "Rac": ["Scorpion", "Pești", "Taur", "Fecioară"],
  "Leu": ["Berbec", "Săgetător", "Gemeni", "Balanță"],
  "Fecioară": ["Taur", "Capricorn", "Rac", "Scorpion"],
  "Balanță": ["Gemeni", "Vărsător", "Leu", "Săgetător"],
  "Scorpion": ["Rac", "Pești", "Fecioară", "Capricorn"],
  "Săgetător": ["Berbec", "Leu", "Balanță", "Vărsător"],
  "Capricorn": ["Taur", "Fecioară", "Scorpion", "Pești"],
  "Vărsător": ["Gemeni", "Balanță", "Berbec", "Săgetător"],
  "Pești": ["Rac", "Scorpion", "Taur", "Capricorn"]
};

export const calculateCompatibilityScore = (user1, user2) => {
  let score = 0;
  let maxScore = 0;

  // Compatibilitate zodiacală (30% din scor)
  if (user1.zodiacSign && user2.zodiacSign) {
    maxScore += 30;
    const compatibleSigns = zodiacCompatibility[user1.zodiacSign] || [];
    if (compatibleSigns.includes(user2.zodiacSign)) {
      score += 30;
    } else if (user1.zodiacSign === user2.zodiacSign) {
      score += 20; // Aceeași zodie, compatibilitate moderată
    }
  }

  // Tipul de relație căutat (25% din scor)
  if (user1.relationshipType && user2.relationshipType) {
    maxScore += 25;
    if (user1.relationshipType === user2.relationshipType) {
      score += 25;
    }
  }

  // Element dominant (20% din scor)
  if (user1.dominantElement && user2.dominantElement) {
    maxScore += 20;
    if (user1.dominantElement === user2.dominantElement) {
      score += 20;
    } else {
      // Compatibilitate între elemente
      const elementCompatibility = {
        "Foc": ["Aer"],
        "Pământ": ["Apă"],
        "Aer": ["Foc"],
        "Apă": ["Pământ"]
      };
      const compatible = elementCompatibility[user1.dominantElement]?.includes(user2.dominantElement);
      if (compatible) {
        score += 15;
      }
    }
  }

  // Alte răspunsuri comune (25% din scor)
  maxScore += 25;
  // Aici poți adăuga logica pentru compararea altor răspunsuri

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}; 