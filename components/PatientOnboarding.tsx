import React, { useState } from 'react';
import { PatientProfile, MOCK_PATIENT } from '../types';
import { User, Calendar, Droplet, Dna, Activity, AlertTriangle, ChevronRight, Check } from 'lucide-react';

interface PatientOnboardingProps {
  onComplete: (profile: PatientProfile) => void;
}

const PatientOnboarding: React.FC<PatientOnboardingProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Female',
    bloodGroup: 'O+',
    genotype: 'AA',
    conditionInput: '',
    conditions: [] as string[],
    allergyInput: '',
    allergies: [] as string[],
  });

  const handleAddTag = (type: 'conditions' | 'allergies', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()],
      [type === 'conditions' ? 'conditionInput' : 'allergyInput']: ''
    }));
  };

  const handleRemoveTag = (type: 'conditions' | 'allergies', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: PatientProfile = {
      ...MOCK_PATIENT,
      name: formData.name || "Patient",
      age: parseInt(formData.age) || 0,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      genotype: formData.genotype,
      conditions: formData.conditions,
      allergies: formData.allergies,
      id: `P-${Math.floor(Math.random() * 100000)}` // Generate new ID
    };
    onComplete(newProfile);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-900/50">
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Patient Profile Setup</h1>
          <p className="text-slate-400">Help AlIve personalize your healthcare experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                  placeholder="e.g. Tayo Eze"
                />
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Age</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="number"
                  required
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                  placeholder="e.g. 34"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Gender</label>
              <select 
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none appearance-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group & Genotype */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Blood Group</label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={16} />
                    <select 
                      value={formData.bloodGroup}
                      onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-2 text-white focus:border-teal-500 outline-none appearance-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
               </div>
               <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Genotype</label>
                  <div className="relative">
                    <Dna className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                    <select 
                      value={formData.genotype}
                      onChange={e => setFormData({...formData, genotype: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-2 text-white focus:border-teal-500 outline-none appearance-none"
                    >
                      {['AA', 'AS', 'SS', 'AC', 'SC'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
               </div>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Medical Conditions</label>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 flex flex-wrap gap-2 focus-within:border-teal-500 transition-colors">
              {formData.conditions.map((tag, idx) => (
                <span key={idx} className="bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag('conditions', idx)} className="hover:text-red-400"><AlertTriangle size={12}/></button>
                </span>
              ))}
              <input 
                type="text"
                value={formData.conditionInput}
                onChange={e => setFormData({...formData, conditionInput: e.target.value})}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag('conditions', formData.conditionInput);
                  }
                }}
                className="bg-transparent outline-none text-white flex-1 min-w-[150px] p-2"
                placeholder="Type and press Enter (e.g. Asthma)"
              />
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Allergies</label>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 flex flex-wrap gap-2 focus-within:border-teal-500 transition-colors">
              {formData.allergies.map((tag, idx) => (
                <span key={idx} className="bg-red-900/20 text-red-300 border border-red-500/20 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag('allergies', idx)} className="hover:text-red-400"><AlertTriangle size={12}/></button>
                </span>
              ))}
              <input 
                type="text"
                value={formData.allergyInput}
                onChange={e => setFormData({...formData, allergyInput: e.target.value})}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag('allergies', formData.allergyInput);
                  }
                }}
                className="bg-transparent outline-none text-white flex-1 min-w-[150px] p-2"
                placeholder="Type and press Enter (e.g. Peanuts)"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-900/30 transition-all flex items-center justify-center gap-2 mt-8 active:scale-95"
          >
            Complete Setup <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientOnboarding;