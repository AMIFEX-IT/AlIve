import React from 'react';
import { AccessLog } from '../types';
import { ShieldCheck, Clock, X, User } from 'lucide-react';

interface AccessLogsProps {
  logs: AccessLog[];
  onClose: () => void;
}

const AccessLogs: React.FC<AccessLogsProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-2xl">
          <h2 className="text-white font-bold flex items-center gap-2">
            <ShieldCheck className="text-teal-400" /> Access Logs
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No access history found.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <User size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{log.doctorName}</p>
                  <p className="text-slate-400 text-xs">{log.action}</p>
                  <div className="flex items-center gap-1 mt-2 text-slate-500 text-[10px]">
                    <Clock size={10} />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessLogs;
