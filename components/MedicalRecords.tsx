import React, { useState, useEffect, useRef } from 'react';
import { PatientProfile, MedicalRecord, AccessLog } from '../types';
import OCRScanner from './OCRScanner';
import AccessLogs from './AccessLogs';
import MedicalProfileSummary from './MedicalProfileSummary';
import { Activity, ShieldCheck, Lock, Unlock, RefreshCw, Scan, Fingerprint, Plus, ClipboardList, Search, X, Eye, EyeOff, Droplet, Dna, Clock, ShieldAlert, Timer, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MedicalRecordsProps {
  patientProfile: PatientProfile;
  isDoctorView?: boolean;
  records: MedicalRecord[];
  onAddRecord: (record: MedicalRecord) => void;
  logs: AccessLog[];
  onAddLog: (log: AccessLog) => void;
}

const MedicalRecords: React.FC<MedicalRecordsProps> = ({ 
    patientProfile,
    isDoctorView = false,
    records,
    onAddRecord,
    logs,
    onAddLog
}) => {
  const { t } = useLanguage();
  const [accessGranted, setAccessGranted] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [error, setError] = useState('');
  const [verificationState, setVerificationState] = useState<'IDLE' | 'SCANNING' | 'VERIFYING' | 'SUCCESS'>('IDLE');
  const [activeSessionTime, setActiveSessionTime] = useState<string | null>(null);
  
  // Timers
  const hideTimerRef = useRef<number | null>(null);
  const expireTimerRef = useRef<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  
  // UI Toggles
  const [showOCR, setShowOCR] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Initialize access if session is already active (e.g., refresh)
  useEffect(() => {
      if (isDoctorView) {
          const storedEnd = localStorage.getItem('doctor_session_end_time');
          if (storedEnd && parseInt(storedEnd, 10) > Date.now()) {
              setAccessGranted(true);
          }
      }
  }, [isDoctorView]);

  useEffect(() => {
    // Generate/Load OTP for patient view
    if (!isDoctorView) {
      const stored = localStorage.getItem('alive_active_otp');
      if (stored) {
          setGeneratedOtp(stored);
          setIsOtpVisible(false); 
      }
    }

    // Poll for active doctor session time (Shared by Patient and Doctor view)
    const interval = setInterval(() => {
        const storedEnd = localStorage.getItem('doctor_session_end_time');
        if (storedEnd) {
            const end = parseInt(storedEnd, 10);
            const diff = end - Date.now();
            if (diff > 0) {
                const m = Math.floor(diff / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setActiveSessionTime(`${m}:${s.toString().padStart(2, '0')}`);
            } else {
                // Time Expired
                setActiveSessionTime(null);
                localStorage.removeItem('doctor_session_end_time');
                
                // If in doctor view, revoke access
                if (isDoctorView && accessGranted) {
                    setAccessGranted(false);
                    // Could alert here or just let UI update
                }
            }
        } else {
            setActiveSessionTime(null);
            if (isDoctorView && accessGranted) {
                // Session key removed (maybe manual end), revoke access
                setAccessGranted(false);
            }
        }
    }, 1000);

    return () => {
        clearInterval(interval);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    }
  }, [isDoctorView, accessGranted]);

  const generateOtp = () => {
    // Clear existing timers
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setIsOtpVisible(true);
    localStorage.setItem('alive_active_otp', code);

    // Hide from screen after 5 seconds
    hideTimerRef.current = window.setTimeout(() => {
        setIsOtpVisible(false);
    }, 5000);

    // Expire completely after 16 seconds (5s visible + 11s hidden)
    expireTimerRef.current = window.setTimeout(() => {
        setGeneratedOtp(null);
        localStorage.removeItem('alive_active_otp');
    }, 16000);
  };

  const handleVerifyStart = () => {
      setVerificationState('SCANNING');
      setTimeout(() => {
          setVerificationState('VERIFYING');
          verifyOtp();
      }, 2000);
  }

  const verifyOtp = () => {
    const activeOtp = localStorage.getItem('alive_active_otp');
    setTimeout(() => {
        if (otpInput === activeOtp || otpInput === '1234') {
          setVerificationState('SUCCESS');
          
          // Start Session Timer (20 mins)
          const endTime = Date.now() + 20 * 60 * 1000;
          localStorage.setItem('doctor_session_end_time', endTime.toString());

          // Add Access Log
          const newLog: AccessLog = {
            id: Date.now().toString(),
            doctorName: "Dr. Access", // In real app, this comes from auth context
            timestamp: Date.now(),
            action: "Accessed Patient Record"
          };
          onAddLog(newLog);
          
          setTimeout(() => {
              setAccessGranted(true);
              setVerificationState('IDLE');
          }, 1000);
        } else {
          setVerificationState('IDLE');
          setError('Verification Failed: Invalid Token');
        }
    }, 1500);
  };

  const handleEndSession = () => {
      localStorage.removeItem('doctor_session_end_time');
      setAccessGranted(false);
      setActiveSessionTime(null);
  };

  const handleAddRecordInternal = (newRecord: MedicalRecord) => {
    onAddRecord(newRecord);
    // Log the action if doctor added it
    if (isDoctorView) {
        const newLog: AccessLog = {
            id: Date.now().toString(),
            doctorName: "Dr. Access",
            timestamp: Date.now(),
            action: `Added Record via OCR: ${newRecord.diagnosis}`
        };
        onAddLog(newLog);
    }
  };

  // Filter records based on search term
  const filteredRecords = records.filter(record => 
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isDoctorView && !accessGranted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 md:p-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-slate-950"></div>

        <div className="bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-3xl shadow-2xl max-w-md w-full text-center relative z-10 backdrop-blur-xl mx-4">
          
          {verificationState === 'IDLE' && (
              <>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-slate-700 shadow-inner">
                    <Lock size={28} className="text-red-500 md:w-8 md:h-8" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-wide">{t('secureGateway')}</h2>
                <p className="text-slate-400 mb-6 md:mb-8 text-sm">
                    Restricted Access to Patient Record: <span className="text-teal-400 font-mono">{patientProfile.id}</span>
                </p>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block font-bold">One-Time Password</label>
                        <input
                        type="text"
                        maxLength={4}
                        placeholder="_ _ _ _"
                        value={otpInput}
                        onChange={(e) => { setOtpInput(e.target.value); setError(''); }}
                        className="w-full text-center text-3xl md:text-4xl tracking-[0.5em] font-mono py-3 md:py-4 bg-slate-950 border border-slate-700 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-teal-400 transition-colors placeholder:text-slate-800"
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded flex items-center justify-center gap-2">
                             <ShieldCheck size={14}/> {error}
                        </div>
                    )}
                    
                    <button
                        onClick={handleVerifyStart}
                        disabled={otpInput.length < 4}
                        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg shadow-teal-900/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <Fingerprint size={20} /> {t('authenticateAccess')}
                    </button>
                    <p className="text-[10px] text-slate-600 font-mono">ENCRYPTION: AES-256 // DEMO CODE: 1234</p>
                </div>
              </>
          )}

          {verificationState === 'SCANNING' && (
              <div className="py-12 flex flex-col items-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8">
                      <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                      <div className="absolute inset-0 border-t-4 border-teal-500 rounded-full animate-spin"></div>
                      <Scan size={40} className="absolute inset-0 m-auto text-teal-500 animate-pulse md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-teal-400 font-mono text-base md:text-lg animate-pulse">BIOMETRIC HANDSHAKE...</h3>
              </div>
          )}

          {verificationState === 'VERIFYING' && (
              <div className="py-12 flex flex-col items-center">
                  <div className="w-full bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
                      <div className="h-full bg-blue-500 animate-[progress_2s_ease-in-out_infinite] w-full origin-left transform scale-x-0"></div>
                  </div>
                  <h3 className="text-blue-400 font-mono text-base md:text-lg">DECRYPTING RECORD...</h3>
                  <div className="text-xs text-slate-500 font-mono mt-2">Verifying Signature Key...</div>
              </div>
          )}

          {verificationState === 'SUCCESS' && (
              <div className="py-12 flex flex-col items-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50">
                      <Unlock size={40} className="text-green-500 md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-white font-bold text-lg md:text-xl">{t('accessGranted')}</h3>
              </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fadeIn text-slate-300 relative">
      
      {/* Session Timer Banner (Doctor View) */}
      {isDoctorView && activeSessionTime && (
          <div className="fixed top-4 right-4 md:right-8 z-50 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-pulse border border-indigo-400">
              <div className="flex items-center gap-2 font-mono font-bold text-lg">
                  <Timer size={18} className="animate-spin-slow" />
                  {activeSessionTime}
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

      {/* Active Session Banner for Patient */}
      {!isDoctorView && activeSessionTime && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between mb-4 shadow-inner">
              <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 p-2 rounded-full animate-pulse">
                      <ShieldAlert size={20} className="text-red-400" />
                  </div>
                  <div>
                      <h3 className="text-white font-bold text-sm">Doctor Access Active</h3>
                      <p className="text-red-300/80 text-xs">Your records are currently being viewed.</p>
                  </div>
              </div>
              <div className="font-mono font-bold text-xl text-white bg-red-500/20 px-3 py-1 rounded border border-red-500/20">
                  {activeSessionTime}
              </div>
          </div>
      )}

      {/* Patient Header Card */}
      <div className={`rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-white/10 ${isDoctorView ? 'bg-gradient-to-br from-blue-900 to-slate-900' : 'bg-gradient-to-br from-teal-800 to-slate-900'}`}>
         <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Activity size={150} className="md:w-[200px] md:h-[200px]" />
         </div>
         <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
               <div className="w-full">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight truncate">{patientProfile.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                     <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${isDoctorView ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' : 'bg-teal-500/20 border-teal-500/30 text-teal-300'}`}>
                        {isDoctorView ? <Unlock size={12} /> : <ShieldCheck size={12} />}
                        {isDoctorView ? t('doctorAccessMode') : t('securePatientView')}
                     </span>
                     {patientProfile.bloodGroup && (
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                            <Droplet size={10} fill="currentColor" /> {patientProfile.bloodGroup}
                        </span>
                     )}
                     {patientProfile.genotype && (
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <Dna size={12} /> {patientProfile.genotype}
                        </span>
                     )}
                  </div>
               </div>
               <div className="text-left lg:text-right w-full lg:w-auto flex flex-row lg:flex-col justify-between lg:justify-start items-center lg:items-end border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0 mt-2 lg:mt-0">
                  <p className="text-2xl md:text-3xl font-bold text-white">{patientProfile.age} <span className="text-sm font-normal text-slate-400">{t('years')}</span></p>
                  <div className="text-right">
                    <p className="text-sm text-teal-400 font-medium">{patientProfile.gender}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">ID: {patientProfile.id}</p>
                  </div>
               </div>
            </div>

            <div className="mt-6 md:mt-8 flex flex-wrap gap-2 md:gap-3">
               {patientProfile.conditions.map(c => (
                  <span key={c} className="bg-white/5 hover:bg-white/10 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium border border-white/10 shadow-sm text-slate-200 transition-colors cursor-default">
                     {c}
                  </span>
               ))}
               {patientProfile.allergies.length > 0 && patientProfile.allergies.map(a => (
                  <span key={a} className="bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium border border-amber-500/20 shadow-sm text-amber-200 transition-colors cursor-default">
                     Allergy: {a}
                  </span>
               ))}
            </div>
         </div>
      </div>

      {/* Action Bar */}
      {!isDoctorView ? (
        // Patient Actions
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
           <div className="bg-slate-800/50 border border-slate-700 p-5 md:p-6 rounded-2xl flex items-center justify-between backdrop-blur-sm lg:col-span-1">
              <div>
                 <h3 className="font-bold text-white text-sm md:text-base">{t('doctorAccess')}</h3>
                 <p className="text-[10px] md:text-xs text-slate-500 mt-1">{t('generateToken')}</p>
              </div>
              {generatedOtp ? (
                 <div className="flex items-center gap-2">
                    <span className={`text-xl md:text-2xl font-mono font-bold tracking-wider transition-all ${isOtpVisible ? 'text-teal-400' : 'text-slate-600'}`}>
                        {isOtpVisible ? generatedOtp : '• • • •'}
                    </span>
                    <button onClick={generateOtp} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors" title="Regenerate">
                       <RefreshCw size={14} />
                    </button>
                 </div>
              ) : (
                <button 
                  onClick={generateOtp}
                  className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-xs shadow-lg shadow-teal-900/20 transition-all active:scale-95"
                >
                  Generate
                </button>
              )}
           </div>
           
           <button onClick={() => setShowLogs(true)} className="bg-slate-800/50 border border-slate-700 p-5 md:p-6 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-slate-300 font-bold group hover:text-white hover:border-slate-600 text-sm md:text-base">
              <ClipboardList size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
              {t('viewLogs')}
           </button>

           <button onClick={() => setShowSummary(true)} className="bg-slate-800/50 border border-slate-700 p-5 md:p-6 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-slate-300 font-bold group hover:text-white hover:border-slate-600 text-sm md:text-base sm:col-span-2 lg:col-span-1">
              <Activity size={20} className="text-purple-500 group-hover:scale-110 transition-transform" />
              {t('summary')}
           </button>
        </div>
      ) : (
        // Doctor Actions
        <div className="flex justify-end">
            <button 
              onClick={() => setShowOCR(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold shadow-lg shadow-teal-900/20 flex items-center gap-2 transition-all active:scale-95 text-sm md:text-base"
            >
              <Plus size={20} /> {t('scanRecord')}
            </button>
        </div>
      )}

      {/* Search & Timeline */}
      <div className="mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-3">
            <Activity className="text-teal-500" />
            {t('medicalHistory')}
            </h3>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-10 py-2.5 md:py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all text-sm md:text-base"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-2 md:ml-4 space-y-8 md:space-y-10 pb-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
             <div key={record.id} className="relative pl-8 md:pl-10 group animate-fadeIn">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-4 border-slate-700 group-hover:border-teal-500 transition-colors shadow-lg"></div>
                
                <div className="bg-slate-800/40 p-5 md:p-6 rounded-2xl border border-slate-700/50 hover:border-teal-500/30 hover:bg-slate-800/60 transition-all duration-300 shadow-lg">
                   <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 border ${
                            record.type === 'Surgery' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            record.type === 'Rehab' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                           {record.type}
                        </span>
                        <h4 className="font-bold text-base md:text-lg text-white">{record.diagnosis}</h4>
                      </div>
                      <div className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 whitespace-nowrap">
                        {record.date}
                      </div>
                   </div>
                   
                   <p className="text-slate-400 text-sm leading-relaxed mb-5 border-l-2 border-slate-700 pl-4">
                      {record.details}
                   </p>
                   
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                      {record.hospital}
                   </div>
                </div>
             </div>
          ))
          ) : (
              <div className="pl-10 text-slate-500 italic">{t('noRecordsFound')} "{searchTerm}"</div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showOCR && (
        <OCRScanner onClose={() => setShowOCR(false)} onSave={handleAddRecordInternal} />
      )}
      {showLogs && (
        <AccessLogs logs={logs} onClose={() => setShowLogs(false)} />
      )}
      {showSummary && (
        <MedicalProfileSummary patient={{...patientProfile, records: records}} onClose={() => setShowSummary(false)} />
      )}
    </div>
  );
};

export default MedicalRecords;