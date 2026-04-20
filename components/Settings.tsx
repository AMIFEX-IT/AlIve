import React, { useState } from 'react';
import { X, Shield, Lock, Fingerprint, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { language, setLanguage, t } = useLanguage();
  const [currentPIN, setCurrentPIN] = useState('');
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(
    localStorage.getItem('alive_biometric_enabled') === 'true'
  );
  
  const [showPINForm, setShowPINForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleToggleBiometric = () => {
    const newState = !biometricEnabled;
    setBiometricEnabled(newState);
    localStorage.setItem('alive_biometric_enabled', String(newState));
    showMessage(newState ? 'Biometric authentication enabled' : 'Biometric authentication disabled', 'success');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as any;
    setLanguage(lang);
    const langName = e.target.options[e.target.selectedIndex].text;
    showMessage(`Language changed to ${langName}`, 'success');
  };

  const handleUpdatePIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPIN.length < 4) {
      showMessage('PIN must be at least 4 digits', 'error');
      return;
    }
    if (newPIN !== confirmPIN) {
      showMessage('New PINs do not match', 'error');
      return;
    }
    // In a real app, validate currentPIN against server
    localStorage.setItem('alive_patient_pin', newPIN);
    showMessage('Security PIN updated successfully', 'success');
    setShowPINForm(false);
    setCurrentPIN('');
    setNewPIN('');
    setConfirmPIN('');
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-2xl">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Shield className="text-teal-400" /> {t('settings')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Language Selection */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{t('language')}</h3>
                <p className="text-slate-400 text-xs">App Interface</p>
              </div>
            </div>
            <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-slate-900 border border-slate-600 text-white text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 outline-none font-medium"
            >
                <option value="en">English</option>
                <option value="yo">Yorùbá</option>
                <option value="ig">Asụsụ Igbo</option>
                <option value="ha">Harshen Hausa</option>
            </select>
          </div>

          {/* Biometrics */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                <Fingerprint size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{t('biometrics')}</h3>
                <p className="text-slate-400 text-xs">FaceID / TouchID</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={biometricEnabled} onChange={handleToggleBiometric} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* PIN Management */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{t('securityPin')}</h3>
                  <p className="text-slate-400 text-xs">Manage access</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPINForm(!showPINForm)}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 uppercase tracking-wider"
              >
                {showPINForm ? t('cancel') : t('update')}
              </button>
            </div>

            {showPINForm && (
              <form onSubmit={handleUpdatePIN} className="space-y-3 pt-3 border-t border-slate-700">
                <input
                  type="password"
                  placeholder="Current PIN"
                  value={currentPIN}
                  onChange={(e) => setCurrentPIN(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:border-teal-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="New PIN"
                  value={newPIN}
                  onChange={(e) => setNewPIN(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:border-teal-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm New PIN"
                  value={confirmPIN}
                  onChange={(e) => setConfirmPIN(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm focus:border-teal-500 outline-none"
                />
                <button 
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                >
                  {t('save')}
                </button>
              </form>
            )}
          </div>

          {/* Feedback Message */}
          {message && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {message.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
              {message.text}
            </div>
          )}

          <div className="text-center">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest">App Version 3.0.1 (NG)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;