import React, { useState, useRef } from 'react';
import { analyzeFood } from '../services/geminiService';
import { PatientProfile } from '../types';
import { Camera, CheckCircle, AlertTriangle, XCircle, Loader2, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FoodAnalyzerProps {
    patientProfile: PatientProfile;
}

const FoodAnalyzer: React.FC<FoodAnalyzerProps> = ({ patientProfile }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null); // Reset previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      // Use dynamic patient data
      const conditions = patientProfile.conditions.join(', ') || 'None';
      const allergies = patientProfile.allergies.join(', ') || 'None';
      const patientContext = `Gender: ${patientProfile.gender}. Age: ${patientProfile.age}. Conditions: ${conditions}. Allergies: ${allergies}.`;
      
      const result = await analyzeFood(base64Data, patientContext);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSuitabilityColor = (status: string) => {
      switch(status?.toLowerCase()) {
          case 'safe': return 'text-green-400 bg-green-900/20 border-green-500/20';
          case 'caution': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/20';
          case 'avoid': return 'text-red-400 bg-red-900/20 border-red-500/20';
          default: return 'text-slate-400 bg-slate-800 border-slate-700';
      }
  };

  const getSuitabilityIcon = (status: string) => {
      switch(status?.toLowerCase()) {
          case 'safe': return <CheckCircle size={20} />;
          case 'caution': return <AlertTriangle size={20} />;
          case 'avoid': return <XCircle size={20} />;
          default: return <Info size={20} />;
      }
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-slate-950 text-slate-200">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{t('dietTitle')}</h1>
        <p className="text-slate-400 mb-6 md:mb-8 text-sm md:text-base">{t('dietDesc')}</p>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 md:p-8 text-center bg-slate-900 hover:bg-slate-800/50 transition-colors relative overflow-hidden group">
           
           {!image ? (
               <>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="text-teal-500" size={24} />
                </div>
                <p className="text-slate-300 font-medium mb-2 text-sm md:text-base">{t('uploadHint')}</p>
                <p className="text-xs text-slate-500">Supports JPG, PNG</p>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
               </>
           ) : (
               <div className="relative">
                   <img src={image} alt="Meal" className="max-h-48 md:max-h-64 mx-auto rounded-lg shadow-lg" />
                   <button 
                     onClick={() => { setImage(null); setAnalysis(null); }}
                     className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white hover:bg-red-500 transition-colors"
                   >
                       <XCircle size={20} />
                   </button>
               </div>
           )}
        </div>

        {/* Action Button */}
        {image && !analysis && (
            <button 
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full mt-6 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg shadow-teal-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
            >
                {loading ? <Loader2 className="animate-spin" /> : t('analyzeBtn')}
            </button>
        )}

        {/* Results */}
        {analysis && (
            <div className="mt-8 space-y-6 animate-fadeIn">
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${getSuitabilityColor(analysis.suitability)}`}>
                    {getSuitabilityIcon(analysis.suitability)}
                    <div>
                        <h3 className="font-bold uppercase text-sm tracking-wide">{analysis.suitability}</h3>
                        <p className="text-xs opacity-80">
                            Based on your profile ({patientProfile.conditions.length > 0 ? patientProfile.conditions[0] : 'General Health'})
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-white">Nutritional Info</h3>
                            <p className="text-slate-400 text-xs md:text-sm">Estimated per serving</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xl md:text-2xl font-bold text-teal-400">{analysis.calories}</div>
                            <div className="text-[10px] md:text-xs text-slate-500 uppercase font-bold">Calories</div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-800 p-3 rounded-lg text-sm text-slate-300 mb-4">
                        {analysis.macros}
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-2 text-sm flex items-center gap-2">
                            <Info size={16} className="text-blue-400" /> AI Advice
                        </h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {analysis.advice}
                        </p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default FoodAnalyzer;