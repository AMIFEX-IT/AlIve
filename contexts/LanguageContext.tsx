import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'en' | 'yo' | 'ig' | 'ha';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    menu: 'Menu',
    medicalProfile: 'Medical Profile',
    doctorDashboard: 'My Dashboard',
    patientRecord: 'Patient Record',
    rehabCoach: 'Rehab AI Coach',
    dietAnalysis: 'Diet Analysis',
    settings: 'Settings',
    signOut: 'Sign Out',
    welcome: 'Welcome',
    patient: 'Patient',
    doctor: 'Doctor',
    patientsToday: 'Patients Today',
    upcomingSurgery: 'Upcoming Surgery',
    scheduleClear: 'Schedule Clear',
    biometrics: 'Biometrics',
    language: 'Language',
    securityPin: 'Security PIN',
    update: 'Update',
    cancel: 'Cancel',
    save: 'Save',
    accessLogs: 'Access Logs',
    summary: 'Summary',
    generateToken: 'Generate Token',
    dietTitle: 'Dietary Analysis',
    dietDesc: 'Upload a meal photo to check safety against your medical profile.',
    analyzeBtn: 'Analyze Meal Safety',
    uploadHint: 'Drag & Drop or Click to Upload',
    // New keys
    doctorAccess: 'Doctor Access',
    viewLogs: 'View Logs',
    medicalHistory: 'Medical History',
    searchPlaceholder: 'Search by diagnosis, hospital...',
    scanRecord: 'Add Record (Scan)',
    assignedPatients: 'Assigned Patients',
    accessRecords: 'Access Records',
    selectPortal: 'Select your portal',
    patientPortal: 'Patient Portal',
    doctorPortal: 'Doctor Portal',
    phoneNumber: 'Phone Number',
    sendOtp: 'Send One-Time Password',
    verifyLogin: 'Verify & Login',
    locked: 'Locked',
    doctorAccessMode: 'Doctor Access Mode',
    securePatientView: 'Secure Patient View',
    years: 'Years',
    authenticateAccess: 'Authenticate Access',
    secureGateway: 'SECURE GATEWAY',
    changeNumber: 'Change Number',
    enterCode: 'Enter Verification Code',
    secureLogin: 'Secure HIPAA Compliant Login',
    accessGranted: 'ACCESS GRANTED',
    noConditions: 'No conditions',
    diet: 'Diet',
  },
  yo: {
    menu: 'Akojọ aṣayan',
    medicalProfile: 'Profaili Iṣoogun',
    doctorDashboard: 'Dasibodu Mi',
    patientRecord: 'Igbasilẹ Alaisan',
    rehabCoach: 'Olukọni Rehab',
    dietAnalysis: 'Itupalẹ Ounjẹ',
    settings: 'Eto',
    signOut: 'Jade',
    welcome: 'Kaabo',
    patient: 'Alaisan',
    doctor: 'Dokita',
    patientsToday: 'Awọn Alaisan Oni',
    upcomingSurgery: 'Iṣẹ abẹ ti n bọ',
    scheduleClear: 'Iṣeto ko si',
    biometrics: 'Idanimọ Biometric',
    language: 'Ede',
    securityPin: 'PIN Aabo',
    update: 'Ṣe imudojuiwọn',
    cancel: 'Fagilee',
    save: 'Fipamọ',
    accessLogs: 'Awọn akọọlẹ Wiwọle',
    summary: 'Akopọ',
    generateToken: 'Ṣẹda Tokini',
    dietTitle: 'Itupalẹ Ounjẹ',
    dietDesc: 'Ṣe igbasilẹ fọto ounjẹ lati ṣayẹwo aabo fun ilera rẹ.',
    analyzeBtn: 'Ṣayẹwo Aabo Ounjẹ',
    uploadHint: 'Fa tabi Tẹ lati Ṣe igbasilẹ',
    // New keys
    doctorAccess: 'Wiwọle Dokita',
    viewLogs: 'Wo Awọn Akọọlẹ',
    medicalHistory: 'Itan Iṣoogun',
    searchPlaceholder: 'Wa nipasẹ ayẹwo, ile-iwosan...',
    scanRecord: 'Ṣafikun Igbasilẹ (Ṣayẹwo)',
    assignedPatients: 'Awọn Alaisan ti a yan',
    accessRecords: 'Wọle si Awọn Igbasilẹ',
    selectPortal: 'Yan ẹnu-ọna rẹ',
    patientPortal: 'Ẹnu-ọna Alaisan',
    doctorPortal: 'Ẹnu-ọna Dokita',
    phoneNumber: 'Nọmba foonu',
    sendOtp: 'Fi Ọrọigbaniwọle Igba Kan ranṣẹ',
    verifyLogin: 'Daju & Wọle',
    locked: 'Titiipa',
    doctorAccessMode: 'Ipo Wiwọle Dokita',
    securePatientView: 'Wiwo Alaisan to ni aabo',
    years: 'Ọdun',
    authenticateAccess: 'Wiwọle Ijeri',
    secureGateway: 'Ẹnu-ọna Aabo',
    changeNumber: 'Yi Nọmba pada',
    enterCode: 'Tẹ koodu Ijeri sii',
    secureLogin: 'Wiwọle Ibamu HIPAA to ni aabo',
    accessGranted: 'WIWỌLE GBA',
    noConditions: 'Ko si awọn ipo',
    diet: 'Ounjẹ',
  },
  ig: {
    menu: 'Menu',
    medicalProfile: 'Profaili Ahụike',
    doctorDashboard: 'Dashboard M',
    patientRecord: 'Ndekọ Onye Ọrịa',
    rehabCoach: 'Onye Nkuzi Rehab',
    dietAnalysis: 'Nnyocha Nri',
    settings: 'Ntọala',
    signOut: 'Pụọ',
    welcome: 'Nnọọ',
    patient: 'Onye Ọrịa',
    doctor: 'Dọkịta',
    patientsToday: 'Ndị Ọrịa Taa',
    upcomingSurgery: 'Ịwa Ahụ Na-abịa',
    scheduleClear: 'Usoro Doro Anya',
    biometrics: 'Biometrics',
    language: 'Asụsụ',
    securityPin: 'PIN Nchekwa',
    update: 'Melite',
    cancel: 'Kagbuo',
    save: 'Chekwaa',
    accessLogs: 'Ndekọ Nweta',
    summary: 'Nchịkọta',
    generateToken: 'Mepụta Token',
    dietTitle: 'Nnyocha Nri',
    dietDesc: 'Bugo foto nri iji lelee nchekwa ya maka ahụike gị.',
    analyzeBtn: 'Nyochaa Nchekwa Nri',
    uploadHint: 'Dọrọ ma ọ bụ Pịa ka ibugo',
    // New keys
    doctorAccess: 'Ohere Dọkịta',
    viewLogs: 'Lelee Ndekọ',
    medicalHistory: 'Akụkọ Ahụike',
    searchPlaceholder: 'Chọọ site na nyocha, ụlọ ọgwụ...',
    scanRecord: 'Tinye Ndekọ (Nyochaa)',
    assignedPatients: 'Ndị Ọrịa Ekenyere',
    accessRecords: 'Nweta Ndekọ',
    selectPortal: 'Họrọ ọnụ ụzọ gị',
    patientPortal: 'Ọnụ Ụzọ Onye Ọrịa',
    doctorPortal: 'Ọnụ Ụzọ Dọkịta',
    phoneNumber: 'Nọmba ekwentị',
    sendOtp: 'Ziga Okwuntughe Otu Oge',
    verifyLogin: 'Nyochaa & Banye',
    locked: 'Akpọchiri',
    doctorAccessMode: 'Ọnọdụ Nweta Dọkịta',
    securePatientView: 'Echiche Onye Ọrịa echekwara',
    years: 'Afọ',
    authenticateAccess: 'Nyochaa Nweta',
    secureGateway: 'Ebe Nchekwa',
    changeNumber: 'Gbanwee Nọmba',
    enterCode: 'Tinye Koodu Nyocha',
    secureLogin: 'Nbanye HIPAA echekwara',
    accessGranted: 'ENYERE OHÈRE',
    noConditions: 'Enweghị ọnọdụ',
    diet: 'Nri',
  },
  ha: {
    menu: 'Menu',
    medicalProfile: 'Bayanin Kiwon Lafiya',
    doctorDashboard: 'Dashboard Dina',
    patientRecord: 'Rikodin Mara lafiya',
    rehabCoach: 'Kocin Rehab',
    dietAnalysis: 'Binciken Abinci',
    settings: 'Saituna',
    signOut: 'Fita',
    welcome: 'Barka da zuwa',
    patient: 'Mara lafiya',
    doctor: 'Likita',
    patientsToday: 'Marasa lafiya na Yau',
    upcomingSurgery: 'Aikin Tiyata na Gaba',
    scheduleClear: 'Jadawalin yana sarari',
    biometrics: 'Biometrics',
    language: 'Harshe',
    securityPin: 'PIN na Tsaro',
    update: 'Sabuntawa',
    cancel: 'Soke',
    save: 'Ajiye',
    accessLogs: 'Rajistan Shiga',
    summary: 'Takaitawa',
    generateToken: 'Samar da Token',
    dietTitle: 'Binciken Abinci',
    dietDesc: 'Loda hoton abinci don duba lafiyarsa ga jikinka.',
    analyzeBtn: 'Bincika Lafiyar Abinci',
    uploadHint: 'Jawo ko Dannawa don Lodawa',
    // New keys
    doctorAccess: 'Damar Likita',
    viewLogs: 'Duba Rajista',
    medicalHistory: 'Tarihin Likita',
    searchPlaceholder: 'Bincika ta hanyar ganewar asali, asibiti...',
    scanRecord: 'Ƙara Rikodi (Skan)',
    assignedPatients: 'Marasa lafiya da aka sanya',
    accessRecords: 'Samun Rikodi',
    selectPortal: 'Zaɓi tashar ku',
    patientPortal: 'Tashar Mara lafiya',
    doctorPortal: 'Tashar Likita',
    phoneNumber: 'Lambar waya',
    sendOtp: 'Aika Kalmar Sirri ta Lokaci ɗaya',
    verifyLogin: 'Tabbatar & Shiga',
    locked: 'A kulle',
    doctorAccessMode: 'Yanayin Samun Likita',
    securePatientView: 'Amintaccen Duban Mara lafiya',
    years: 'Shekaru',
    authenticateAccess: 'Tabbatar da Shiga',
    secureGateway: 'Amintaccen Kofa',
    changeNumber: 'Canza Lamba',
    enterCode: 'Shigar da Lambar Tabbatarwa',
    secureLogin: 'Amintaccen Shiga HIPAA',
    accessGranted: 'AN BADA DAMA',
    noConditions: 'Babu yanayi',
    diet: 'Abinci',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('alive_app_language') as Language;
    if (storedLang && translations[storedLang]) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('alive_app_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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