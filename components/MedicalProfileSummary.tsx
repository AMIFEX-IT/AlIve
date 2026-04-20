import React from 'react';
import { PatientProfile } from '../types';
import { Activity, X, FileText, CheckCircle, Hospital } from 'lucide-react';

interface Props {
  patient: PatientProfile;
  onClose: () => void;
}

const MedicalProfileSummary: React.FC<Props> = ({ patient, onClose }) => {
  const stats = {
    total: patient.records.length,
    verified: patient.records.filter(r => r.verified).length,
    hospitals: new Set(patient.records.map(r => r.hospital)).size
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Activity className="text-teal-400" /> Profile Summary
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
              <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold flex flex-col items-center gap-1">
                <FileText size={12}/> Total Records
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
              <div className="text-2xl font-bold text-teal-400 mb-1">{stats.verified}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold flex flex-col items-center gap-1">
                <CheckCircle size={12}/> Verified
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
              <div className="text-2xl font-bold text-blue-400 mb-1">{stats.hospitals}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold flex flex-col items-center gap-1">
                <Hospital size={12}/> Providers
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Known Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {patient.conditions.map(c => (
                <span key={c} className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-medium border border-red-500/20">
                  {c}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Allergies</h3>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map(a => (
                <span key={a} className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/20">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalProfileSummary;