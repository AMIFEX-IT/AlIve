import React, { useState } from 'react';
import { DoctorProfile, MOCK_DOCTOR } from '../types';
import { User, Building2, Stethoscope, ChevronRight, Award } from 'lucide-react';

interface DoctorOnboardingProps {
  onComplete: (profile: DoctorProfile) => void;
}

const DoctorOnboarding: React.FC<DoctorOnboardingProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    hospital: '',
    licenseNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: DoctorProfile = {
      ...MOCK_DOCTOR,
      name: formData.name ? `Dr. ${formData.name.replace(/^Dr\.\s*/i, '')}` : "Dr. Physician",
      specialty: formData.specialty || "General Practitioner",
      hospital: formData.hospital || "General Hospital",
      licenseNumber: formData.licenseNumber || "UNLICENSED",
      id: `DR-${Math.floor(Math.random() * 10000)}`
    };
    onComplete(newProfile);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
            <Stethoscope size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Doctor Profile Setup</h1>
          <p className="text-slate-400">Verify your credentials to start managing patients.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. David Adeyinka"
              />
            </div>
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Specialty</label>
            <div className="relative">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                required
                value={formData.specialty}
                onChange={e => setFormData({...formData, specialty: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Cardiologist"
              />
            </div>
          </div>

          {/* Hospital */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Hospital / Clinic</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                required
                value={formData.hospital}
                onChange={e => setFormData({...formData, hospital: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Lagos University Teaching Hospital"
              />
            </div>
          </div>

          {/* License */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Medical License Number</label>
            <input 
              type="text"
              required
              value={formData.licenseNumber}
              onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono tracking-widest text-center uppercase"
              placeholder="MD-XXXX-XXXX"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 mt-8 active:scale-95"
          >
            Complete Setup <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorOnboarding;