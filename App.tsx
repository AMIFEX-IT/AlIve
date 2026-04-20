import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import MedicalRecords from './components/MedicalRecords';
import RehabCoach from './components/RehabCoach';
import FoodAnalyzer from './components/FoodAnalyzer';
import DoctorDashboard from './components/DoctorDashboard';
import Settings from './components/Settings';
import PatientOnboarding from './components/PatientOnboarding';
import DoctorOnboarding from './components/DoctorOnboarding';
import { UserRole, MOCK_PATIENT, MOCK_DOCTOR, MedicalRecord, AccessLog, PatientProfile, DoctorProfile } from './types';
import { LayoutDashboard, Activity, Apple, LogOut, Stethoscope, Settings as SettingsIcon } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.NONE);
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'DOCTOR_HOME' | 'REHAB' | 'FOOD'>('DASHBOARD');
  const [showSettings, setShowSettings] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  // Use Translation Hook
  const { t } = useLanguage();

  // Profile State - Initialized with default/empty, updated via Onboarding
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(MOCK_PATIENT);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(MOCK_DOCTOR);

  // Global State for Data Persistence
  const [records, setRecords] = useState<MedicalRecord[]>(MOCK_PATIENT.records);
  const [logs, setLogs] = useState<AccessLog[]>([]);

  useEffect(() => {
      if (userRole === UserRole.NONE) return;

      // Handle Role Persistence and View Switching
      if (userRole === UserRole.PATIENT) {
          const isComplete = localStorage.getItem('alive_patient_onboarding_complete') === 'true';
          setOnboardingComplete(isComplete);
          if (isComplete) {
             const saved = localStorage.getItem('alive_patient_profile');
             if (saved) setPatientProfile(JSON.parse(saved));
          }
          setCurrentView('DASHBOARD');
      } else if (userRole === UserRole.DOCTOR) {
          const isComplete = localStorage.getItem('alive_doctor_onboarding_complete') === 'true';
          setOnboardingComplete(isComplete);
          if (isComplete) {
             const saved = localStorage.getItem('alive_doctor_profile');
             if (saved) setDoctorProfile(JSON.parse(saved));
          }
          setCurrentView('DOCTOR_HOME');
      }
  }, [userRole]);

  const handleLogout = () => {
     setUserRole(UserRole.NONE);
     setShowSettings(false);
     setOnboardingComplete(false); // Reset this to re-evaluate on next login
  };

  const handlePatientOnboardingComplete = (profile: PatientProfile) => {
    setPatientProfile(profile);
    setOnboardingComplete(true);
    localStorage.setItem('alive_patient_onboarding_complete', 'true');
    localStorage.setItem('alive_patient_profile', JSON.stringify(profile));
  };

  const handleDoctorOnboardingComplete = (profile: DoctorProfile) => {
    setDoctorProfile(profile);
    setOnboardingComplete(true);
    localStorage.setItem('alive_doctor_onboarding_complete', 'true');
    localStorage.setItem('alive_doctor_profile', JSON.stringify(profile));
  };

  const handleAddRecord = (newRecord: MedicalRecord) => {
    setRecords(prev => [newRecord, ...prev]);
  };

  const handleAddLog = (newLog: AccessLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  if (userRole === UserRole.NONE) {
    return <Login onLogin={setUserRole} />;
  }

  // Onboarding Logic
  if (!onboardingComplete) {
    if (userRole === UserRole.PATIENT) {
      return <PatientOnboarding onComplete={handlePatientOnboardingComplete} />;
    }
    if (userRole === UserRole.DOCTOR) {
      return <DoctorOnboarding onComplete={handleDoctorOnboardingComplete} />;
    }
  }

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view as any)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
        currentView === view 
          ? 'bg-gradient-to-r from-teal-900/30 to-slate-800 text-teal-400 shadow-sm border border-teal-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'text-teal-400' : 'text-slate-500'} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-200">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex z-20 shadow-2xl relative">
        <div className="p-8">
           <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-1 ring-white/10 font-['Dancing_Script']">A</div>
              <h1 className="font-bold text-3xl text-white tracking-tight font-['Dancing_Script']">AlIve</h1>
           </div>

           <div className="space-y-3">
             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-4 mb-2">{t('menu')}</div>
             
             {userRole === UserRole.PATIENT && (
                <NavItem view="DASHBOARD" icon={LayoutDashboard} label={t('medicalProfile')} />
             )}
             
             {userRole === UserRole.DOCTOR && (
                <>
                  <NavItem view="DOCTOR_HOME" icon={LayoutDashboard} label={t('doctorDashboard')} />
                  <NavItem view="DASHBOARD" icon={Stethoscope} label={t('patientRecord')} />
                </>
             )}

             {userRole === UserRole.PATIENT && (
               <>
                 <NavItem view="REHAB" icon={Activity} label={t('rehabCoach')} />
                 <NavItem view="FOOD" icon={Apple} label={t('dietAnalysis')} />
               </>
             )}
           </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800 bg-slate-900/50">
           <button 
             onClick={() => setShowSettings(true)}
             className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-medium"
           >
             <SettingsIcon size={20} />
             <span>{t('settings')}</span>
           </button>

           <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800 rounded-xl border border-slate-700 shadow-inner">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${userRole === UserRole.PATIENT ? 'bg-teal-600' : 'bg-blue-600'}`}>
                 {userRole === UserRole.PATIENT ? patientProfile.name.charAt(0) : doctorProfile.name.charAt(4)}
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold text-white truncate">{userRole === UserRole.PATIENT ? patientProfile.name : doctorProfile.name}</p>
                 <p className="text-xs text-slate-400 font-medium capitalize truncate">{userRole === UserRole.PATIENT ? t('patient') : doctorProfile.specialty}</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 hover:bg-red-900/10 py-3 rounded-xl text-sm font-bold transition-all"
           >
             <LogOut size={18} /> {t('signOut')}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative shadow-inner bg-slate-950">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-10 shrink-0 shadow-lg">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg text-white flex items-center justify-center font-bold font-['Dancing_Script']">A</div>
             <span className="font-bold text-2xl text-white font-['Dancing_Script']">AlIve</span>
           </div>
           <div className="flex items-center gap-4">
             <button onClick={() => setShowSettings(true)} className="text-slate-400 hover:text-white transition-colors">
               <SettingsIcon size={20} />
             </button>
             <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
               <LogOut size={20} />
             </button>
           </div>
        </div>
        
        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-around z-30 px-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
             {userRole === UserRole.DOCTOR ? (
                 <>
                    <button onClick={() => setCurrentView('DOCTOR_HOME')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${currentView === 'DOCTOR_HOME' ? 'text-teal-400 bg-slate-800' : 'text-slate-500'}`}>
                        <LayoutDashboard size={22}/>
                        <span className="text-[10px] font-bold">Home</span>
                    </button>
                    <button onClick={() => setCurrentView('DASHBOARD')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${currentView === 'DASHBOARD' ? 'text-teal-400 bg-slate-800' : 'text-slate-500'}`}>
                        <Stethoscope size={22}/>
                        <span className="text-[10px] font-bold">Patient</span>
                    </button>
                 </>
             ) : (
                 <>
                    <button onClick={() => setCurrentView('DASHBOARD')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${currentView === 'DASHBOARD' ? 'text-teal-400 bg-slate-800' : 'text-slate-500'}`}>
                        <LayoutDashboard size={22}/>
                        <span className="text-[10px] font-bold">Profile</span>
                    </button>
                    <button onClick={() => setCurrentView('REHAB')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${currentView === 'REHAB' ? 'text-teal-400 bg-slate-800' : 'text-slate-500'}`}>
                        <Activity size={22}/>
                        <span className="text-[10px] font-bold">Rehab</span>
                    </button>
                    <button onClick={() => setCurrentView('FOOD')} className={`p-2 rounded-xl flex flex-col items-center gap-1 w-16 ${currentView === 'FOOD' ? 'text-teal-400 bg-slate-800' : 'text-slate-500'}`}>
                        <Apple size={22}/>
                        <span className="text-[10px] font-bold">Diet</span>
                    </button>
                 </>
             )}
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-hidden relative">
           {currentView === 'DOCTOR_HOME' && userRole === UserRole.DOCTOR && (
               <DoctorDashboard 
                  doctorProfile={doctorProfile}
                  patientProfile={patientProfile} // Pass patient data so doctor sees the onboarded patient
                  onViewPatient={() => setCurrentView('DASHBOARD')} 
               />
           )}

           {currentView === 'DASHBOARD' && (
             <MedicalRecords 
                patientProfile={patientProfile}
                isDoctorView={userRole === UserRole.DOCTOR} 
                records={records}
                logs={logs}
                onAddRecord={handleAddRecord}
                onAddLog={handleAddLog}
             />
           )}
           
           {currentView === 'REHAB' && (
             userRole === UserRole.PATIENT ? (
               <RehabCoach onClose={() => setCurrentView('DASHBOARD')} />
             ) : (
                <div className="h-full flex items-center justify-center text-slate-500 bg-slate-950">
                    <p>Rehab Coach is for patients only.</p>
                </div>
             )
           )}

           {currentView === 'FOOD' && <FoodAnalyzer patientProfile={patientProfile} />}
        </div>

        {/* Settings Modal - Global */}
        {showSettings && (
          <Settings onClose={() => setShowSettings(false)} />
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;