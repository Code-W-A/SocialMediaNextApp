"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  ro: {
    common: {
      loading: "Se încarcă...",
      messages: "Mesaje",
      matches: "Match-uri",
      premium: "Premium",
      home: "Acasă",
      profile: "Profil",
      settings: "Setări",
      admin: "Admin",
      search: "Caută",
      cancel: "Anulează",
      save: "Salvează",
      close: "Închide",
      edit: "Editează",
      delete: "Șterge",
      send: "Trimite",
      yes: "Da",
      no: "Nu",
      ok: "OK",
      success: "Succes!",
      error: "A apărut o eroare!",
      logout: "Deconectare"
    },
    nav: {
      home: "Acasă",
      messages: "Mesaje",
      matches: "Match-uri",
      profile: "Profil",
      premium: "Premium",
      settings: "Setări",
      admin: "Admin"
    },
    messages: {
      title: "Mesaje",
      conversations: "Mesaje ({count})",
      compatible: "Compatibili ({count})",
      noConversations: "Încă nu ai conversații",
      noCompatibleUsers: "Nu ai utilizatori compatibili noi.\nVerifică pagina de match-uri!",
      startConversation: "Începe o conversație",
      sendMessage: "Trimite un mesaj către {name} pentru a începe conversația.",
      selectConversation: "Selectează o conversație pentru a începe să trimiți mesaje",
      chooseConversation: "Alege din conversațiile existente sau începe una nouă din match-urile tale",
      loadingConversations: "Se încarcă conversațiile...",
      errorLoadingMessages: "Eroare la încărcarea mesajelor",
      messageCannotBeEmpty: "Mesajul nu poate fi gol",
      messageUpdated: "Mesaj actualizat",
      failedToUpdateMessage: "Nu s-a putut actualiza mesajul",
      searching: "Se caută...",
      noMessagesFound: "Nu s-au găsit mesaje",
      startTypingToSearch: "Începe să scrii pentru a căuta mesaje",
      setOnline: "Setează online",
      setOffline: "Setează offline"
    },
    matches: {
      title: "Match-urile tale perfecte",
      subtitle: "Descoperă conexiunile cosmice prin astrologie și numerologie",
      compatibleSoulsFound: "Suflete compatibile găsite"
    },
    premium: {
      title: "Upgrade la Premium",
      welcomeToPremium: "Bun venit la Premium!",
      subscriptionActivated: "Abonamentul tău Premium a fost activat cu succes. Acum poți să te bucuri de toate funcționalitățile avansate!",
      whatYouCanDoNow: "Ce poți face acum:",
      unlimitedPosts: "Postări nelimitate",
      unlimitedMatches: "Match-uri nelimitate și compatibilitate avansată",
      unlimitedMessages: "Mesaje nelimitate și prioritare",
      superLikes: "5 Super Like-uri pe zi",
      // Success page specific
      yourPremiumBenefits: "Beneficiile tale Premium:",
      exploreMatches: "Explorează Match-urile",
      backToFeed: "Înapoi la Feed",
      emailConfirmation: "Vei primi o confirmare prin email în câteva minute. Dacă ai întrebări, nu ezita să ne contactezi!",
      priorityCompatibility: "Prioritate în Compatibilități",
      priorityCompatibilityDesc: "Primești mai multe compatibilități și apari primul în listele celorlalți utilizatori",
      premiumBadgeFeature: "Insignă Premium", 
      premiumBadgeDesc: "Profilul tău va avea o insignă specială care arată că ești un utilizator premium",
      increasedVisibility: "Vizibilitate Crescută",
      increasedVisibilityDesc: "Profilul tău va fi evidențiat și va apărea mai sus în căutări și liste",
      prioritySupport: "Suport Prioritar",
      prioritySupportDesc: "Acces la suport dedicat cu răspuns rapid la întrebările tale",
      exclusiveFeatures: "Funcții Exclusive",
      exclusiveFeaturesDesc: "Acces timpuriu la funcții noi și experimentale înainte de ceilalți",
      moreMatches: "Mai Multe Potriviri",
      moreMatchesDesc: "Algoritmul nostru îți va oferi mai multe compatibilități relevante",
      // Subscription status related
      subscriptionStatus: "Status Abonament",
      active: "Activ",
      canceled: "Anulat",
      subscriptionCanceled: "Abonament Anulat",
      subscriptionWillEndOn: "Abonamentul tău se va încheia pe:",
      willHaveAccessUntil: "Vei avea acces premium până la această dată.",
      nextPayment: "Următoarea Plată",
      subscriptionRenewsOn: "Abonamentul se reînnoiește pe:",
      monthlyCost: "Costul: 5€/lună",
      manageSubscription: "Gestionează Abonamentul",
      reactivateManageView: "Reactivează, modifică sau vizualizează facturile",
      cancelManageView: "Anulează, modifică sau vizualizează facturile",
      thankYouSupport: "Mulțumim că susții platforma noastră!",
      upgradeError: "A apărut o eroare. Te rugăm să încerci din nou."
    },
    v1: {
      congratulations: "Felicitări, {name}!",
      freePremiumAccount: "Cont Premium Gratuit",
      v1Message: "Având în vedere că ai avut un abonament în prima versiune a YDestiny, am decis să îți oferim acces Premium gratuit ca mulțumire pentru fidelitatea ta! 💝",
      whatYouGetWithPremium: "Ce primești cu Premium:",
      unlimitedMatches: "Matches nelimitate",
      connectWithAnyone: "Conectează-te cu oricine",
      superLikes: "Super Likes",
      fivePerDay: "5 pe zi pentru tine",
      premiumBadge: "Badge Premium",
      profileStandsOut: "Profilul tău se evidențiază",
      andMuchMore: "Și multe altele",
      allPremiumFeatures: "Toate funcțiile premium",
      thankYou: "Mulțumim că ai fost alături de noi!",
      continueFinding: "Continuă să descoperi conexiuni autentice și să găsești dragostea pe YDestiny V2! 💕",
      supportNote: "Dacă nu ai primit Premium gratuit și crezi că ar trebui să îl primești, te rugăm să ne contactezi la support@ydestiny.ro și vom rezolva situația imediat! 📧",
      startExploring: "Începe să explorezi Premium! 🚀"
    },
    posts: {
      publishingOnDestinyPath: "Se publică pe Calea Destinului...",
      destinyPath: "Calea Destinului",
      shareThoughts: "Împărtășește-ți gândurile cu universul ✨"
    },
    onboarding: {
      welcome: "Bun venit la YDestiny! 🎉",
      subtitle: "Completează acești 3 pași pentru a-ți configura profilul și a începe să te conectezi cu oameni minunați",
      progress: "Progres: {completed} din {total} pași completați",
      finalQuestions: "Întrebări finale ✨",
      finalQuestionsSubtitle: "Ajută-ne să creăm profilul tău astrologic perfect",
      updateProfile: "Actualizează-ți profilul ✨",
      updateProfileSubtitle: "Actualizează preferințele astrologice și setările de compatibilitate"
    },
    questionnaire: {
      pleaseCompleteAnswer: "Te rog să completezi corect răspunsul înainte de a continua.",
      saveError: "A apărut o eroare la salvarea datelor. Te rog să încerci din nou.",
      completed: "Chestionar completat!",
      thankYou: "Îți mulțumim pentru răspunsuri. Te redirecționăm...",
      questionOf: "Întrebarea {current} din {total}",
      progress: "{percent}%"
    },
    auth: {
      forgotPassword: "Parolă uitată",
      resetPassword: "Resetează parola",
      enterEmailToReset: "Introdu adresa de email pentru a primi instrucțiunile de resetare a parolei",
      emailAddress: "Adresa de email",
      sendResetEmail: "Trimite email de resetare",
      sending: "Se trimite...",
      resetEmailSent: "Email de resetare trimis cu succes!",
      resetEmailSentDesc: "Verifică-ți inbox-ul și urmează instrucțiunile pentru a-ți reseta parola.",
      backToSignIn: "Înapoi la autentificare",
      noAccountFound: "Nu există cont cu această adresă de email",
      invalidEmail: "Adresă de email invalidă",
      tooManyRequests: "Prea multe încercări. Te rugăm să încerci din nou mai târziu",
      resetEmailFailed: "Nu s-a putut trimite email-ul de resetare. Te rugăm să încerci din nou.",
      pleaseEnterEmail: "Te rugăm să introduci adresa de email",
      pleaseEnterValidEmail: "Te rugăm să introduci o adresă de email validă",
      rememberPassword: "Îți amintești parola?",
      sendToDifferentEmail: "Trimite la alt email",
      didntReceiveEmail: "Nu ai primit email-ul? Verifică folder-ul spam sau",
      tryAgain: "încearcă din nou"
    },
    landing: {
      // Header
      signIn: "Conectează-te",
      signUp: "Înregistrează-te",
      
      // Hero Section
      heroTitle: "Găsește-ți Sufletul Pereche prin Magia Astrelor",
      heroSubtitle: "Descoperă conexiuni cosmice autentice prin compatibilitatea astrologică, tarot și energia universală. Conectează-te cu persoane care rezonează cu sufletul tău.",
      startCosmicJourney: "🚀 Începe Călătoria Cosmică",
      alreadyHaveAccount: "🌙 Am deja cont",
      
      // Features mini
      elementalCompatibility: "Compatibilitate\nElementală",
      tarotGuidance: "Ghidare\nTarot",
      cosmicChat: "Chat\nCosmic",
      spiritualEnergy: "Energie\nSpirituală",
      
      // Features Section
      featuresTitle: "✨ De ce să alegi YDestiny? ✨",
      
      // Feature Cards
      advancedCompatibilityTitle: "Compatibilitate Astrologică Avansată",
      advancedCompatibilityDesc: "Algoritm sofisticat care analizează semnele zodiacale, ascendentul, luna și compatibilitatea elementelor pentru match-uri perfecte",
      
      personalizedTarotTitle: "Ghidare Tarot Personalizată",
      personalizedTarotDesc: "Primește sfaturi și ghidare prin cărțile de tarot pentru relațiile tale și deciziile importante din viață",
      
      spiritualEnergyTitle: "Energie Spirituală",
      spiritualEnergyDesc: "Conectează-te cu persoane care împărtășesc aceeași frecvență spirituală și dorința de evoluție personală",
      
      spiritualCommunityTitle: "Comunitate Spirituală",
      spiritualCommunityDesc: "Alătură-te unei comunități autentice de suflete care cred în puterea universului și a conexiunilor divine",
      
      // How it works
      howItWorksTitle: "🌟 Cum Funcționează YDestiny 🌟",
      
      step1Title: "Creează Profilul Cosmic",
      step1Desc: "Completează informațiile astrologice: data nașterii, ora, locul și preferințele spirituale pentru un profil cosmic complet",
      
      step2Title: "Algoritm de Compatibilitate",
      step2Desc: "Sistemul nostru analizează compatibilitatea bazată pe elemente, planete, case astrologice și energia spirituală",
      
      step3Title: "Match-uri Perfecte",
      step3Desc: "Primești sugestii de persoane cu compatibilitate ridicată bazată pe analiza astrologică completă",
      
      step4Title: "Conectare Spirituală",
      step4Desc: "Începe conversații profunde cu persoane care rezonează cu energia ta și împărtășesc viziunea spirituală",
      
      // V1 Users Section
      v1UsersTitle: "🎁 Ofertă Specială pentru Utilizatorii YDestiny V1 🎁",
      v1UsersSubtitle: "Mulțumim pentru fidelitate! Utilizatorii care au avut abonament în YDestiny V1 beneficiază de:",
      
      freePremiumForever: "Premium GRATUIT pe VIAȚĂ",
      freePremiumDesc: "Acces complet la toate funcționalitățile premium, pentru totdeauna, ca mulțumire pentru susținerea ta",
      
      allPremiumFeatures: "Toate Funcțiile Premium",
      allPremiumFeaturesDesc: "Match-uri nelimitate, mesaje prioritare, Super Likes, analize astrologice avansate și multe altele",
      
      automaticUpgrade: "Upgrade Automat",
      automaticUpgradeDesc: "Contul tău va fi actualizat automat la prima conectare - nu trebuie să faci nimic!",
      
      // Social Proof
      socialProofTitle: "🌟 Mii de Suflete și-au Găsit Perechea 🌟",
      cosmicConnections: "Conexiuni Cosmice Create",
      astralCompatibility: "Compatibilitate Astrală",
      spiritualMarriages: "Căsătorii Spirituale",
      
      // CTA
      ctaTitle: "Universul Te Așteaptă să Îți Găsești Jumătatea",
      ctaSubtitle: "Nu lăsa destinul să aștepte. Începe călătoria ta spirituală către dragoste și descoperă conexiunea ta cosmică perfectă.",
      ctaButton: "🚀 Înregistrează-te GRATUIT Acum! 🌟",
      
      // Slides
      slide1Badge: "✨ YDestiny Experience",
      slide1Title1: "Conectează-te cu",
      slide1Title2: "Sufletul Tău Pereche",
      slide1Description: "Experimentează magia conexiunilor cosmice prin compatibilitatea astrologică avansată și conversații semnificative.",
      slide1Button1: "Începe Călătoria",
      slide1Button2: "Conectează-te",
      
      slide2Badge: "🌟 Comunitate & Creștere",
      slide2Title1: "Construiește-ți",
      slide2Title2: "Cercul Spiritual",
      slide2Description: "Alătură-te unei comunități de suflete cu aceeași viziune în călătoria lor de autodescoperire, creștere și conexiuni autentice.",
      slide2Feature1: "Conexiuni semnificative bazate pe valori comune",
      slide2Feature2: "Conversații profunde care inspiră creșterea",
      slide2Button: "Alătură-te Comunității",
      
      // Footer
      footerTagline: "Conectând suflete prin magia universului ✨",
      footerCopyright: "© 2024 YDestiny. Toate drepturile rezervate. Creat cu 💫 pentru conexiuni cosmice."
    }
  },
  en: {
    common: {
      loading: "Loading...",
      messages: "Messages", 
      matches: "Matches",
      premium: "Premium",
      home: "Home",
      profile: "Profile",
      settings: "Settings",
      admin: "Admin",
      search: "Search",
      cancel: "Cancel",
      save: "Save",
      close: "Close",
      edit: "Edit",
      delete: "Delete",
      send: "Send",
      yes: "Yes",
      no: "No",
      ok: "OK",
      success: "Success!",
      error: "An error occurred!",
      logout: "Logout"
    },
    nav: {
      home: "Home",
      messages: "Messages",
      matches: "Matches",
      profile: "Profile",
      premium: "Premium",
      settings: "Settings",
      admin: "Admin"
    },
    messages: {
      title: "Messages",
      conversations: "Messages ({count})",
      compatible: "Compatible ({count})",
      noConversations: "No conversations yet",
      noCompatibleUsers: "No new compatible users.\nCheck your matches page!",
      startConversation: "Start a conversation",
      sendMessage: "Send a message to {name} to start your conversation.",
      selectConversation: "Select a conversation to start messaging",
      chooseConversation: "Choose from your existing conversations or start a new one from your matches",
      loadingConversations: "Loading conversations...",
      errorLoadingMessages: "Error Loading Messages",
      messageCannotBeEmpty: "Message cannot be empty",
      messageUpdated: "Message updated",
      failedToUpdateMessage: "Failed to update message",
      searching: "Searching...",
      noMessagesFound: "No messages found",
      startTypingToSearch: "Start typing to search messages",
      setOnline: "Set Online",
      setOffline: "Set Offline"
    },
    matches: {
      title: "Your Perfect Matches",
      subtitle: "Discover your cosmic connections through astrology and numerology",
      compatibleSoulsFound: "Compatible souls found"
    },
    premium: {
      title: "Upgrade to Premium",
      welcomeToPremium: "Welcome to Premium!",
      subscriptionActivated: "Your Premium subscription has been successfully activated. Now you can enjoy all the advanced features!",
      whatYouCanDoNow: "What you can do now:",
      unlimitedPosts: "Unlimited posts",
      unlimitedMatches: "Unlimited matches and advanced compatibility",
      unlimitedMessages: "Unlimited and priority messages",
      superLikes: "5 Super Likes per day",
      // Success page specific
      yourPremiumBenefits: "Your Premium Benefits:",
      exploreMatches: "Explore Matches",
      backToFeed: "Back to Feed",
      emailConfirmation: "You will receive a confirmation email in a few minutes. If you have any questions, don't hesitate to contact us!",
      priorityCompatibility: "Priority Compatibility",
      priorityCompatibilityDesc: "Get more matches and appear first in other users' lists",
      premiumBadgeFeature: "Premium Badge", 
      premiumBadgeDesc: "Your profile will have a special badge showing you're a premium user",
      increasedVisibility: "Increased Visibility",
      increasedVisibilityDesc: "Your profile will be highlighted and appear higher in searches and lists",
      prioritySupport: "Priority Support",
      prioritySupportDesc: "Access to dedicated support with quick response to your questions",
      exclusiveFeatures: "Exclusive Features",
      exclusiveFeaturesDesc: "Early access to new and experimental features before others",
      moreMatches: "More Matches",
      moreMatchesDesc: "Our algorithm will provide you with more relevant compatibility matches",
      // Subscription status related
      subscriptionStatus: "Subscription Status",
      active: "Active",
      canceled: "Canceled",
      subscriptionCanceled: "Subscription Canceled",
      subscriptionWillEndOn: "Your subscription will end on:",
      willHaveAccessUntil: "You will have premium access until this date.",
      nextPayment: "Next Payment",
      subscriptionRenewsOn: "Subscription renews on:",
      monthlyCost: "Cost: €5/month",
      manageSubscription: "Manage Subscription",
      reactivateManageView: "Reactivate, modify or view invoices",
      cancelManageView: "Cancel, modify or view invoices",
      thankYouSupport: "Thank you for supporting our platform!",
      upgradeError: "An error occurred. Please try again."
    },
    v1: {
      congratulations: "Congratulations, {name}!",
      freePremiumAccount: "Free Premium Account",
      v1Message: "Since you had a subscription in the first version of YDestiny, we decided to offer you free Premium access as a thank you for your loyalty! 💝",
      whatYouGetWithPremium: "What you get with Premium:",
      unlimitedMatches: "Unlimited matches",
      connectWithAnyone: "Connect with anyone",
      superLikes: "Super Likes",
      fivePerDay: "5 per day for you",
      premiumBadge: "Premium Badge",
      profileStandsOut: "Your profile stands out",
      andMuchMore: "And much more",
      allPremiumFeatures: "All premium features",
      thankYou: "Thank you for being with us!",
      continueFinding: "Continue discovering authentic connections and finding love on YDestiny V2! 💕",
      supportNote: "If you didn't receive free Premium and think you should have, please contact us at support@ydestiny.ro and we'll resolve the situation immediately! 📧",
      startExploring: "Start exploring Premium! 🚀"
    },
    posts: {
      publishingOnDestinyPath: "Publishing on Destiny Path...",
      destinyPath: "Destiny Path",
      shareThoughts: "Share your thoughts with the universe ✨"
    },
    onboarding: {
      welcome: "Welcome to YDestiny! 🎉",
      subtitle: "Complete these 3 steps to set up your profile and start connecting with amazing people",
      progress: "Progress: {completed} of {total} steps completed",
      finalQuestions: "Final Questions ✨",
      finalQuestionsSubtitle: "Help us create your perfect astrological profile",
      updateProfile: "Update Your Profile ✨",
      updateProfileSubtitle: "Update your astrological preferences and compatibility settings"
    },
    questionnaire: {
      pleaseCompleteAnswer: "Please complete the correct answer before continuing.",
      saveError: "An error occurred while saving the data. Please try again.",
      completed: "Survey completed!",
      thankYou: "Thank you for your answers. We'll redirect you...",
      questionOf: "Question {current} of {total}",
      progress: "{percent}%"
    },
    auth: {
      forgotPassword: "Forgot Password",
      resetPassword: "Reset Password",
      enterEmailToReset: "Enter your email address to receive instructions for resetting your password",
      emailAddress: "Email Address",
      sendResetEmail: "Send Reset Email",
      sending: "Sending...",
      resetEmailSent: "Reset Email Sent Successfully!",
      resetEmailSentDesc: "Check your inbox and follow the instructions to reset your password.",
      backToSignIn: "Back to Sign In",
      noAccountFound: "No account found with this email address",
      invalidEmail: "Invalid Email Address",
      tooManyRequests: "Too many attempts. Please try again later",
      resetEmailFailed: "Failed to send reset email. Please try again.",
      pleaseEnterEmail: "Please enter your email address",
      pleaseEnterValidEmail: "Please enter a valid email address",
      rememberPassword: "Remember your password?",
      sendToDifferentEmail: "Send to a different email",
      didntReceiveEmail: "Didn't receive the email? Check your spam folder or",
      tryAgain: "try again"
    },
    landing: {
      // Header
      signIn: "Sign In",
      signUp: "Sign Up",
      
      // Hero Section
      heroTitle: "Find Your Soulmate Through the Magic of Stars",
      heroSubtitle: "Discover authentic cosmic connections through astrological compatibility, tarot, and universal energy. Connect with people who resonate with your soul.",
      startCosmicJourney: "🚀 Start Cosmic Journey",
      alreadyHaveAccount: "🌙 Already have account",
      
      // Features mini
      elementalCompatibility: "Elemental\nCompatibility",
      tarotGuidance: "Tarot\nGuidance",
      cosmicChat: "Cosmic\nChat",
      spiritualEnergy: "Spiritual\nEnergy",
      
      // Features Section
      featuresTitle: "✨ Why Choose YDestiny? ✨",
      
      // Feature Cards
      advancedCompatibilityTitle: "Advanced Astrological Compatibility",
      advancedCompatibilityDesc: "Sophisticated algorithm that analyzes zodiac signs, ascendant, moon, and elemental compatibility for perfect matches",
      
      personalizedTarotTitle: "Personalized Tarot Guidance",
      personalizedTarotDesc: "Receive advice and guidance through tarot cards for your relationships and important life decisions",
      
      spiritualEnergyTitle: "Spiritual Energy",
      spiritualEnergyDesc: "Connect with people who share the same spiritual frequency and desire for personal evolution",
      
      spiritualCommunityTitle: "Spiritual Community",
      spiritualCommunityDesc: "Join an authentic community of souls who believe in the power of the universe and divine connections",
      
      // How it works
      howItWorksTitle: "🌟 How YDestiny Works 🌟",
      
      step1Title: "Create Cosmic Profile",
      step1Desc: "Complete your astrological information: birth date, time, location, and spiritual preferences for a complete cosmic profile",
      
      step2Title: "Compatibility Algorithm",
      step2Desc: "Our system analyzes compatibility based on elements, planets, astrological houses, and spiritual energy",
      
      step3Title: "Perfect Matches",
      step3Desc: "Receive suggestions of people with high compatibility based on complete astrological analysis",
      
      step4Title: "Spiritual Connection",
      step4Desc: "Start deep conversations with people who resonate with your energy and share your spiritual vision",
      
      // V1 Users Section
      v1UsersTitle: "🎁 Special Offer for YDestiny V1 Users 🎁",
      v1UsersSubtitle: "Thank you for your loyalty! Users who had a subscription in YDestiny V1 benefit from:",
      
      freePremiumForever: "FREE Premium for LIFE",
      freePremiumDesc: "Complete access to all premium features, forever, as a thank you for your support",
      
      allPremiumFeatures: "All Premium Features",
      allPremiumFeaturesDesc: "Unlimited matches, priority messages, Super Likes, advanced astrological analysis and much more",
      
      automaticUpgrade: "Automatic Upgrade",
      automaticUpgradeDesc: "Your account will be automatically upgraded on first login - you don't need to do anything!",
      
      // Social Proof
      socialProofTitle: "🌟 Thousands of Souls Found Their Match 🌟",
      cosmicConnections: "Cosmic Connections Created",
      astralCompatibility: "Astral Compatibility",
      spiritualMarriages: "Spiritual Marriages",
      
      // CTA
      ctaTitle: "The Universe Awaits for You to Find Your Other Half",
      ctaSubtitle: "Don't let destiny wait. Start your spiritual journey towards love and discover your perfect cosmic connection.",
      ctaButton: "🚀 Sign Up FREE Now! 🌟",
      
      // Slides
      slide1Badge: "✨ YDestiny Experience",
      slide1Title1: "Connect with",
      slide1Title2: "Your Soulmate",
      slide1Description: "Experience the magic of cosmic connections through advanced astrological compatibility and meaningful conversations.",
      slide1Button1: "Start Your Journey",
      slide1Button2: "Sign In",
      
      slide2Badge: "🌟 Community & Growth",
      slide2Title1: "Build Your",
      slide2Title2: "Spiritual Circle",
      slide2Description: "Join a community of like-minded souls on their journey of self-discovery, growth, and authentic connections.",
      slide2Feature1: "Meaningful connections based on shared values",
      slide2Feature2: "Deep conversations that inspire growth",
      slide2Button: "Join Our Community",
      
      // Footer
      footerTagline: "Connecting souls through the magic of the universe ✨",
      footerCopyright: "© 2024 YDestiny. All rights reserved. Created with 💫 for cosmic connections."
    }
  }
};

const DEFAULT_LANGUAGE = 'ro';
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('ydestiny_language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('ydestiny_language', newLanguage);
    }
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value) {
      value = translations[DEFAULT_LANGUAGE];
      for (const k of keys) {
        value = value?.[k];
      }
    }
    
    if (!value) {
      return key;
    }
    
    let result = value;
    Object.keys(params).forEach(param => {
      result = result.replace(`{${param}}`, params[param]);
    });
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
