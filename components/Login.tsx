import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { ArrowRight, User, Stethoscope, ChevronLeft, Phone, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'ROLE' | 'PHONE' | 'OTP'>('ROLE');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.NONE);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('PHONE');
    setError('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 5) { // Relaxed validation for demo
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    setDemoOtpHint(null);

    try {
      const result = await authService.sendOtp(phoneNumber, selectedRole);
      setStep('OTP');
      setResendTimer(30);
      if (result.demoCode) {
        setDemoOtpHint(result.demoCode);
      }
    } catch (err: any) {
      console.error("Failed to send OTP:", err);
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyOtp(phoneNumber, enteredOtp);
      onLogin(selectedRole);
    } catch (err: any) {
       console.error("Verification failed:", err);
       setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative z-10 border border-slate-800 transition-all duration-300">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-blue-700 text-white font-bold text-3xl mb-4 shadow-xl shadow-blue-900/30 transform rotate-3 ring-4 ring-slate-900/50 font-['Dancing_Script']">
            A
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight font-['Dancing_Script']">AlIve</h1>
          <p className="text-slate-400 mt-1 font-medium text-sm">Unified. Intelligent. Secure.</p>
        </div>

        {step === 'ROLE' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-center text-slate-300 font-semibold mb-6">{t('selectPortal')}</h2>
            
            <button
              onClick={() => handleRoleSelect(UserRole.PATIENT)}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-500/50 p-4 rounded-xl flex items-center gap-4 group transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/20"
            >
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <User size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold group-hover:text-teal-400 transition-colors">{t('patientPortal')}</h3>
                <p className="text-xs text-slate-500">Access medical records & rehab tools</p>
              </div>
              <ArrowRight className="ml-auto text-slate-600 group-hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" size={20} />
            </button>

            <button
              onClick={() => handleRoleSelect(UserRole.DOCTOR)}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 p-4 rounded-xl flex items-center gap-4 group transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20"
            >
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Stethoscope size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{t('doctorPortal')}</h3>
                <p className="text-xs text-slate-500">Manage patients & clinical data</p>
              </div>
              <ArrowRight className="ml-auto text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" size={20} />
            </button>
          </div>
        )}

        {step === 'PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-6 animate-fadeIn">
            <button 
              type="button" 
              onClick={() => setStep('ROLE')}
              className="text-slate-500 hover:text-white flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-2 transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>

            <div className={`p-3 rounded-lg border flex items-center gap-3 mb-6 ${selectedRole === UserRole.PATIENT ? 'bg-teal-900/20 border-teal-500/30 text-teal-300' : 'bg-blue-900/20 border-blue-500/30 text-blue-300'}`}>
               {selectedRole === UserRole.PATIENT ? <User size={18} /> : <Stethoscope size={18} />}
               <span className="font-bold text-sm">{selectedRole === UserRole.PATIENT ? t('patient') : t('doctor')} Secure Login</span>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-slate-500 ml-1 tracking-wider block mb-2">{t('phoneNumber')}</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={20} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[+\d\s-]*$/.test(val)) {
                        setPhoneNumber(val);
                    }
                  }}
                  placeholder="e.g. +234 900 000 0000"
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-medium text-slate-200 placeholder:text-slate-600 shadow-inner text-lg tracking-wide"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-4 ${selectedRole === UserRole.PATIENT ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-900/40' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/40'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <>{t('sendOtp')} <ArrowRight size={20} /></>}
            </button>
          </form>
        )}

        {step === 'OTP' && (
          <div className="space-y-6 animate-fadeIn">
            <button 
              type="button" 
              onClick={() => setStep('PHONE')}
              className="text-slate-500 hover:text-white flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-2 transition-colors"
            >
              <ChevronLeft size={14} /> {t('changeNumber')}
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <ShieldCheck className="text-teal-400" size={32} />
              </div>
              <h3 className="text-white font-bold text-lg">{t('enterCode')}</h3>
              <p className="text-slate-400 text-sm mt-1">Sent to {phoneNumber}</p>
              {demoOtpHint && (
                <div className="mt-2 bg-teal-500/10 text-teal-300 p-2 rounded text-xs font-mono inline-block border border-teal-500/30">
                  Demo Code: {demoOtpHint}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-12 h-14 bg-slate-950 border border-slate-700 rounded-lg text-center text-2xl font-bold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs text-center font-bold border border-red-500/20">
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-900/40 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>{t('verifyLogin')} <KeyRound size={20} /></>}
            </button>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-slate-500 text-xs">Resend code in {resendTimer}s</p>
              ) : (
                <button onClick={(e) => handleSendOtp(e)} className="text-teal-400 text-xs font-bold hover:underline">
                  Resend Verification Code
                </button>
              )}
            </div>
          </div>
        )}

      </div>
      
      <div className="mt-8 flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-widest opacity-60">
        <ShieldCheck size={14} />
        {t('secureLogin')}
      </div>
    </div>
  );
};

export default Login;