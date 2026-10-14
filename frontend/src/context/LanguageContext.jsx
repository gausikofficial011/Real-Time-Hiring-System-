import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    // Common
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Authentication
    email: 'Email Address',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me',
    
    // Dashboard
    totalCandidates: 'Total Candidates',
    invited: 'Invited',
    inProgress: 'In Progress',
    completed: 'Completed',
    selected: 'Selected',
    rejected: 'Rejected',
    addCandidate: 'Add Candidate',
    searchCandidates: 'Search candidates...',
    allStatus: 'All Status',
    
    // Interview
    startInterview: 'Start Interview',
    joinInterview: 'Join Interview',
    endInterview: 'End Interview',
    waitingRoom: 'Waiting Room',
    interviewRoom: 'Interview Room',
    markAsReady: 'Mark as Ready',
    youAreReady: 'You are Ready!',
    getReady: 'Get Ready',
    waitingForInterviewer: 'Waiting for Interviewer',
    
    // Analytics
    emotion: 'Emotion',
    confidence: 'Confidence',
    attention: 'Attention',
    sentiment: 'Sentiment',
    communication: 'Communication',
    skillsAssessment: 'Skills Assessment',
    emotionTimeline: 'Emotion Timeline',
    strengths: 'Strengths',
    weaknesses: 'Areas for Improvement',
    overallScore: 'Overall Score',
    
    // Security
    security: 'Security',
    tabSwitches: 'Tab Switches',
    fullscreen: 'Fullscreen',
    securityAlert: 'Security Alert',
    integrityScore: 'Integrity Score',
    
    // Report
    candidateReport: 'Candidate Report',
    recommendation: 'Recommendation',
    aiReasoning: 'AI Recommendation Reasoning',
    interviewDetails: 'Interview Details',
    downloadReport: 'Download Report',
    
    // Emotions
    happy: 'Happy',
    sad: 'Sad',
    angry: 'Angry',
    fear: 'Fear',
    surprise: 'Surprise',
    neutral: 'Neutral',
    confident: 'Confident',
    nervous: 'Nervous',
    focused: 'Focused',
    
    // Recommendations
    recommendSelected: 'Selected',
    review: 'Review',
    recommendRejected: 'Rejected',
    
    // Messages
    loginSuccessful: 'Login successful',
    loginFailed: 'Login failed',
    candidateCreated: 'Candidate created successfully',
    interviewCreated: 'Interview created successfully',
    interviewStarted: 'Interview started',
    interviewEnded: 'Interview ended',
    markedReady: 'You are marked as ready',
    noReportAvailable: 'No Report Available',
    interviewNotCompleted: 'The interview has not been completed yet'
  },
  
  ta: {
    // Common
    login: 'உள்நுழை',
    logout: 'வெளியேறு',
    dashboard: 'டாஷ்போர்டு',
    submit: 'சமர்ப்பிக்க',
    cancel: 'ரத்துசெய்',
    save: 'சேமி',
    delete: 'நீக்கு',
    edit: 'திருத்து',
    view: 'காண்க',
    back: 'பின்',
    next: 'அடுத்து',
    previous: 'முந்தைய',
    loading: 'ஏற்றுகிறது...',
    error: 'பிழை',
    success: 'வெற்றி',
    
    // Authentication
    email: 'மின்னஞ்சல் முகவரி',
    password: 'கடவுச்சொல்',
    signIn: 'உள்நுழை',
    signUp: 'பதிவுசெய்',
    forgotPassword: 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
    rememberMe: 'என்னை நினைவில் வை',
    
    // Dashboard
    totalCandidates: 'மொத்த விண்ணப்பாளர்கள்',
    invited: 'அழைக்கப்பட்டவர்கள்',
    inProgress: 'நடந்துகொண்டிருக்கும்',
    completed: 'முடிந்தது',
    selected: 'தேர்ந்தெடுக்கப்பட்டவர்கள்',
    rejected: 'நிராகரிக்கப்பட்டவர்கள்',
    addCandidate: 'விண்ணப்பாளரைச் சேர்',
    searchCandidates: 'விண்ணப்பாளர்களைத் தேடு...',
    allStatus: 'அனைத்து நிலைகளும்',
    
    // Interview
    startInterview: 'நேர்காணலைத் தொடங்கு',
    joinInterview: 'நேர்காணலில் சேர்',
    endInterview: 'நேர்காணலை முடி',
    waitingRoom: 'காத்திருப்பு அறை',
    interviewRoom: 'நேர்காணல் அறை',
    markAsReady: 'தயாராக இருப்பதாகக் குறிக்க',
    youAreReady: 'நீங்கள் தயாராக இருக்கிறீர்கள்!',
    getReady: 'தயாராகுங்கள்',
    waitingForInterviewer: 'நேர்காணலாளரைக் காத்திருக்கிறது',
    
    // Analytics
    emotion: 'உணர்ச்சி',
    confidence: 'நம்பிக்கை',
    attention: 'கவனம்',
    sentiment: 'உணர்வு',
    communication: 'தகவல் தொடர்பு',
    skillsAssessment: 'திறன்கள் மதிப்பீடு',
    emotionTimeline: 'உணர்ச்சி காலவரிசை',
    strengths: 'வலுக்கள்',
    weaknesses: 'மேம்பாட்டுக்கான பகுதிகள்',
    overallScore: 'ஒட்டுமொத்த மதிப்பெண்',
    
    // Security
    security: 'பாதுகாப்பு',
    tabSwitches: 'தாவல் மாற்றங்கள்',
    fullscreen: 'முழுத்திரை',
    securityAlert: 'பாதுகாப்பு எச்சரிக்கை',
    integrityScore: 'ஒருமைப்பாடு மதிப்பெண்',
    
    // Report
    candidateReport: 'விண்ணப்பாளர் அறிக்கை',
    recommendation: 'பரிந்துரை',
    aiReasoning: 'AI பரிந்துரை காரணம்',
    interviewDetails: 'நேர்காணல் விவரங்கள்',
    downloadReport: 'அறிக்கையைப் பதிவிறக்கு',
    
    // Emotions
    happy: 'மகிழ்ச்சி',
    sad: 'சோகம்',
    angry: 'கோபம்',
    fear: 'பயம்',
    surprise: 'ஆச்சரியம்',
    neutral: 'நடுநிலை',
    confident: 'நம்பிக்கை',
    nervous: 'பதற்றம்',
    focused: 'கவனம்',
    
    // Recommendations
    recommendSelected: 'தேர்ந்தெடுக்கப்பட்டது',
    review: 'மதிப்பாய்வு',
    recommendRejected: 'நிராகரிக்கப்பட்டது',
    
    // Messages
    loginSuccessful: 'உள்நுழைவு வெற்றிகரமாக நிறைவேறியது',
    loginFailed: 'உள்நுழைவு தோல்வியடைந்தது',
    candidateCreated: 'விண்ணப்பாளர் வெற்றிகரமாக உருவாக்கப்பட்டார்',
    interviewCreated: 'நேர்காணல் வெற்றிகரமாக உருவாக்கப்பட்டது',
    interviewStarted: 'நேர்காணல் தொடங்கியது',
    interviewEnded: 'நேர்காணல் முடிந்தது',
    markedReady: 'நீங்கள் தயாராக இருப்பதாகக் குறிக்கப்பட்டீர்கள்',
    noReportAvailable: 'அறிக்கை இல்லை',
    interviewNotCompleted: 'நேர்காணல் இன்னும் முடிக்கப்படவில்லை'
  },
  
  hi: {
    // Common
    login: 'लॉग इन',
    logout: 'लॉग आउट',
    dashboard: 'डैशबोर्ड',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    view: 'देखें',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    
    // Authentication
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    forgotPassword: 'पासवर्ड भूल गए?',
    rememberMe: 'मुझे याद रखें',
    
    // Dashboard
    totalCandidates: 'कुल उम्मीदवार',
    invited: 'आमंत्रित',
    inProgress: 'प्रगति में',
    completed: 'पूर्ण',
    selected: 'चयनित',
    rejected: 'अस्वीकृत',
    addCandidate: 'उम्मीदवार जोड़ें',
    searchCandidates: 'उम्मीदवार खोजें...',
    allStatus: 'सभी स्थिति',
    
    // Interview
    startInterview: 'साक्षात्कार शुरू करें',
    joinInterview: 'साक्षात्कार में शामिल हों',
    endInterview: 'साक्षात्कार समाप्त करें',
    waitingRoom: 'प्रतीक्षालय',
    interviewRoom: 'साक्षात्कार कक्ष',
    markAsReady: 'तैयार के रूप में चिह्नित करें',
    youAreReady: 'आप तैयार हैं!',
    getReady: 'तैयार हो जाएं',
    waitingForInterviewer: 'साक्षात्कारक की प्रतीक्षा कर रहा है',
    
    // Analytics
    emotion: 'भावना',
    confidence: 'आत्मविश्वास',
    attention: 'ध्यान',
    sentiment: 'भावना',
    communication: 'संचार',
    skillsAssessment: 'कौशल मूल्यांकन',
    emotionTimeline: 'भावना समयरेखा',
    strengths: 'शक्तियां',
    weaknesses: 'सुधार के लिए क्षेत्र',
    overallScore: 'समग्र स्कोर',
    
    // Security
    security: 'सुरक्षा',
    tabSwitches: 'टैब स्विच',
    fullscreen: 'पूर्ण स्क्रीन',
    securityAlert: 'सुरक्षा चेतावनी',
    integrityScore: 'अखंडता स्कोर',
    
    // Report
    candidateReport: 'उम्मीदवार रिपोर्ट',
    recommendation: 'सिफारिश',
    aiReasoning: 'AI सिफारिश कारण',
    interviewDetails: 'साक्षात्कार विवरण',
    downloadReport: 'रिपोर्ट डाउनलोड करें',
    
    // Emotions
    happy: 'खुश',
    sad: 'उदास',
    angry: 'गुस्सा',
    fear: 'भय',
    surprise: 'आश्चर्य',
    neutral: 'तटस्थ',
    confident: 'आत्मविश्वासी',
    nervous: 'नर्वस',
    focused: 'ध्यान केंद्रित',
    
    // Recommendations
    recommendSelected: 'चयनित',
    review: 'समीक्षा',
    recommendRejected: 'अस्वीकृत',
    
    // Messages
    loginSuccessful: 'लॉगिन सफल',
    loginFailed: 'लॉगिन विफल',
    candidateCreated: 'उम्मीदवार सफलतापूर्वक बनाया गया',
    interviewCreated: 'साक्षात्कार सफलतापूर्वक बनाया गया',
    interviewStarted: 'साक्षात्कार शुरू हुआ',
    interviewEnded: 'साक्षात्कार समाप्त हुआ',
    markedReady: 'आप तैयार के रूप में चिह्नित हैं',
    noReportAvailable: 'रिपोर्ट उपलब्ध नहीं',
    interviewNotCompleted: 'साक्षात्कार अभी तक पूरा नहीं हुआ है'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const value = {
    language,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' }
    ]
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
