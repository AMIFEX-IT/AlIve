import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Loader2, FileText, RefreshCw, AlertTriangle, Building, Calendar, Activity, Sparkles, ScanEye } from 'lucide-react';
import { MedicalRecord } from '../types';
import { parseMedicalRecord } from '../services/geminiService';

interface OCRScannerProps {
  onClose: () => void;
  onSave: (record: MedicalRecord) => void;
}

const OCRScanner: React.FC<OCRScannerProps> = ({ onClose, onSave }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  
  // Enhanced state to hold specific medical fields
  const [extractedData, setExtractedData] = useState<{ 
    title: string; 
    hospital: string;
    date: string;
    details: string; 
    rawText: string 
  } | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      stopCamera();
      processImage(dataUrl);
    }
  };

  const processImage = async (imageUrl: string) => {
    setProcessing(true);
    setStatus('Sending to AI Medical Scanner...');

    try {
      // Remove data URL prefix to get raw base64
      const base64Data = imageUrl.split(',')[1];
      
      setStatus('Gemini 2.5 Flash: Analyzing Document...');
      const aiData = await parseMedicalRecord(base64Data);

      if (aiData) {
         setExtractedData({
            title: aiData.diagnosis || "Scanned Document",
            hospital: aiData.hospital || "Unknown Facility",
            date: aiData.date || new Date().toISOString().split('T')[0],
            details: aiData.summary || "No details extracted.",
            rawText: aiData.fullText || "No text content."
         });
      } else {
         throw new Error("AI Analysis returned empty result");
      }

    } catch (error) {
      console.error("AI Scan Error:", error);
      setStatus("Failed to analyze document. Please try again.");
      setExtractedData(null); // Ensure we don't show stale data
      // Optional: Add a retry mechanism or manual entry fallback here
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = () => {
    if (extractedData) {
      const newRecord: MedicalRecord = {
        id: `AI-OCR-${Date.now()}`,
        date: extractedData.date,
        hospital: extractedData.hospital,
        diagnosis: extractedData.title,
        details: extractedData.details,
        type: 'Lab', // Could also be inferred by AI in the future
        verified: false,
        ocrText: extractedData.rawText
      };
      onSave(newRecord);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-white font-bold flex items-center gap-2">
            <ScanEye className="text-teal-400" /> AI Medical Scanner
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-black min-h-[400px]">
          {!image ? (
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-slate-700">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-48 border-2 border-teal-500/50 rounded-lg box-border"></div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <button 
                  onClick={captureImage}
                  className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 hover:scale-105 transition-transform"
                />
              </div>
              <div className="absolute top-4 left-0 right-0 text-center text-white/70 text-sm bg-black/40 py-1">
                Align document within the box
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6">
              <div className="relative">
                <img src={image} alt="Scanned Doc" className="w-full h-48 object-cover rounded-lg border border-slate-700 opacity-80" />
                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                   Captured
                </div>
              </div>
              
              {processing ? (
                <div className="text-center py-8">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                     <svg className="animate-spin w-full h-full text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                        <Sparkles size={16} />
                     </div>
                  </div>
                  <p className="text-teal-400 font-mono animate-pulse uppercase text-sm">{status}</p>
                </div>
              ) : extractedData ? (
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2 text-teal-400">
                        <Sparkles size={20} />
                        <span className="font-bold text-sm uppercase tracking-wider">AI Extracted Data</span>
                     </div>
                     <span className="text-[10px] text-amber-400 flex items-center gap-1 bg-amber-900/20 px-2 py-1 rounded border border-amber-500/20">
                        <AlertTriangle size={10} /> Review before saving
                     </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1">
                          <Activity size={12}/> Diagnosis / Title
                        </label>
                        <input 
                          type="text" 
                          value={extractedData.title}
                          onChange={(e) => setExtractedData({...extractedData, title: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded mt-1 font-medium text-sm"
                        />
                      </div>
                      <div>
                         <label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1">
                          <Calendar size={12}/> Date
                        </label>
                        <input 
                          type="date" 
                          value={extractedData.date}
                          onChange={(e) => setExtractedData({...extractedData, date: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded mt-1 font-medium text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1">
                        <Building size={12}/> Hospital / Facility
                      </label>
                      <input 
                        type="text" 
                        value={extractedData.hospital}
                        onChange={(e) => setExtractedData({...extractedData, hospital: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded mt-1 font-medium text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1">
                        <FileText size={12}/> Summary / Details
                      </label>
                      <textarea 
                        value={extractedData.details}
                        onChange={(e) => setExtractedData({...extractedData, details: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-300 p-3 rounded mt-1 h-24 font-mono text-xs leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => { setImage(null); startCamera(); setExtractedData(null); }}
                      className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-bold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={18} /> Retake
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> Save Record
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-900/20 p-6 rounded-xl border border-red-500/20 text-center">
                   <p className="text-red-400 mb-4">Could not analyze document.</p>
                   <button 
                      onClick={() => { setImage(null); startCamera(); }}
                      className="bg-slate-700 text-white px-4 py-2 rounded-lg"
                   >
                     Try Again
                   </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRScanner;