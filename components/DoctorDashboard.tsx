import React, { useState, useEffect } from 'react';
import { DoctorProfile, PatientProfile } from '../types';
import { Users, Calendar, Activity, Clock, ShieldAlert, ArrowRight, Bell, BadgeCheck, Timer, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import OCRScanner from './OCRScanner';

interface DoctorDashboardProps {
  doctorProfile: DoctorProfile;
  patientProfile: PatientProfile;
  onViewPatient: () => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctorProfile, patientProfile, onViewPatient }) => {
  const { t } = useLanguage();
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [showOCR, setShowOCR] = useState(false);

  // Initialize/Check session on mount
  useEffect(() => {
      const storedEnd = localStorage.getItem('doctor_session_end_time');
      if (storedEnd) {
          const end = parseInt(storedEnd, 10);
          if (end > Date.now()) {
              setSessionActive(true);
              setSessionEndTime(end);
          } else {
              handleEndSession();
          }
      }
  }, []);

  // Timer Tick
  useEffect(() => {
      if (!sessionActive || !sessionEndTime) return;

      const interval = setInterval(() => {
          const now = Date.now();
          const diff = sessionEndTime - now;

          if (diff <= 0) {
              handleEndSession();
          } else {
              const m = Math.floor(diff / 60000);
              const s = Math.floor((diff % 60000) / 1000);
              setTimeRemaining(`${m}:${s.toString().padStart(2, '0')}`);
          }
      }, 1000);

      return () => clearInterval(interval);
  }, [sessionActive, sessionEndTime]);

  const handleStartSession = () => {
      // Just navigate to the patient view. 
      // The timer will be started there after OTP verification.
      onViewPatient();
  };

  const handleEndSession = () => {
      setSessionActive(false);
      setSessionEndTime(null);
      setTimeRemaining(null);
      localStorage.removeItem('doctor_session_end_time');
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 animate-fadeIn text-slate-200 relative">
      
      {/* Session Timer Banner (Floating) */}
      {sessionActive && timeRemaining && (
          <div className="fixed top-4 right-4 md:right-8 z-50 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-pulse border border-indigo-400">
              <div className="flex items-center gap-2 font-mono font-bold text-lg">
                  <Timer size={18} className="animate-spin-slow" />
                  {timeRemaining}
              </div>
              <button 
                onClick={handleEndSession}
                className="bg-white/20 hover:bg-white/30 p-1 rounded-full transition-colors"
                title="End Session"
              >
                  <LogOut size={14} />
              </button>
          </div>
      )}

      {/* Welcome Header */}
      <div className="flex justify-between items-start mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('welcome')}, {doctorProfile.name}</h1>
          <div className="flex flex-col gap-1">
            <p className="text-slate-400 flex items-center gap-2 text-sm md:text-base">
                <Activity size={16} className="text-teal-400"/>
                {doctorProfile.specialty} at {doctorProfile.hospital}
            </p>
            {doctorProfile.licenseNumber && (
                <p className="text-slate-500 text-xs flex items-center gap-1 font-mono">
                    <BadgeCheck size={12} className="text-blue-500"/>
                    LIC: {doctorProfile.licenseNumber}
                </p>
            )}
          </div>
        </div>
        <div className="bg-slate-800 p-2 rounded-full relative">
            <Bell size={24} className="text-slate-400" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
         <div className="bg-slate-800/50 border border-slate-700 p-5 md:p-6 rounded-2xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Users size={24} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">{doctorProfile.patientsToday || 0}</div>
                    <div className="text-sm text-slate-400">{t('patientsToday')}</div>
                </div>
            </div>
         </div>
         <div className="bg-slate-800/50 border border-slate-700 p-5 md:p-6 rounded-2xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                    <Clock size={24} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">4h 30m</div>
                    <div className="text-sm text-slate-400">{t('upcomingSurgery')}</div>
                </div>
            </div>
         </div>
         <div className="bg-slate-800/50 border border-slate-700 p-5 md:p-6 rounded-2xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Calendar size={24} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">Oct 24</div>
                    <div className="text-sm text-slate-400">{t('scheduleClear')}</div>
                </div>
            </div>
         </div>
      </div>

      {/* Patient List */}
      <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
         <Users size={20} className="text-teal-400"/> {t('assignedPatients')}
      </h2>
      
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
         {/* Table Header */}
         <div className="grid grid-cols-2 md:grid-cols-4 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-800/80">
            <div className="col-span-1">Name / ID</div>
            <div className="hidden md:block col-span-1">Condition</div>
            <div className="hidden md:block col-span-1">Status</div>
            <div className="col-span-1 text-right">Action</div>
         </div>

         {/* Patient Row (Dynamically Displayed) */}
         <div className="grid grid-cols-2 md:grid-cols-4 p-4 items-center hover:bg-slate-800/60 transition-colors border-t border-slate-700">
             <div className="col-span-1">
                 <div className="font-bold text-white text-sm md:text-base">{patientProfile.name}</div>
                 <div className="text-xs text-slate-500">{patientProfile.id}</div>
                 {/* Mobile only info */}
                 <div className="md:hidden flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">
                       {patientProfile.conditions[0]}
                    </span>
                    {sessionActive ? (
                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                            <Clock size={10} /> Active
                        </span>
                    ) : (
                        <ShieldAlert size={10} className="text-amber-400" />
                    )}
                 </div>
             </div>
             <div className="hidden md:block col-span-1">
                 {patientProfile.conditions && patientProfile.conditions.length > 0 ? (
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs border border-blue-500/30">
                        {patientProfile.conditions[0]}
                    </span>
                 ) : (
                    <span className="text-slate-500 text-xs italic">{t('noConditions')}</span>
                 )}
             </div>
             <div className="hidden md:flex col-span-1 items-center gap-2">
                 {sessionActive ? (
                     <>
                        <Clock size={16} className="text-green-400" />
                        <span className="text-sm font-semibold text-green-400">Active Access</span>
                     </>
                 ) : (
                     <>
                        <ShieldAlert size={16} className="text-amber-400" />
                        <span className="text-sm font-semibold text-amber-400">{t('locked')}</span>
                     </>
                 )}
             </div>
             <div className="col-span-1 text-right">
                 {sessionActive ? (
                     <button 
                        onClick={onViewPatient}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold shadow-lg shadow-green-900/20 flex items-center gap-2 ml-auto transition-all hover:scale-105"
                     >
                        View Record <ArrowRight size={16} />
                     </button>
                 ) : (
                     <button 
                        onClick={handleStartSession}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold shadow-lg shadow-teal-900/20 flex items-center gap-2 ml-auto transition-all hover:scale-105"
                     >
                        {t('accessRecords')} <ArrowRight size={16} />
                     </button>
                 )}
             </div>
         </div>
         
         {/* Mock Empty Rows for visual */}
         {[1, 2].map(i => (
             <div key={i} className="grid grid-cols-2 md:grid-cols-4 p-4 items-center border-t border-slate-700 opacity-50">
                <div className="col-span-1">
                    <div className="h-4 w-24 bg-slate-700 rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-16 bg-slate-700/50 rounded"></div>
                </div>
                <div className="hidden md:block col-span-1"><div className="h-6 w-20 bg-slate-700 rounded"></div></div>
                <div className="hidden md:block col-span-1"><div className="h-4 w-12 bg-slate-700 rounded"></div></div>
                <div className="col-span-1 flex justify-end"><div className="h-8 w-24 bg-slate-700 rounded"></div></div>
             </div>
         ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;