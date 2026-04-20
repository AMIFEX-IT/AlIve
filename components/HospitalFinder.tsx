import React, { useState } from 'react';
import { findHospitals } from '../services/geminiService';
import { MapPin, Navigation, Loader2, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const HospitalFinder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, chunks: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await findHospitals(position.coords.latitude, position.coords.longitude);
          setResult(data);
        } catch (err) {
          setError("Failed to fetch hospital data. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="h-full flex flex-col p-8 space-y-6 overflow-y-auto bg-slate-900 text-slate-200">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <MapPin className="text-teal-400" />
          Nearby Care
        </h2>
        <p className="text-slate-400 mb-8 max-w-2xl">
          Find the best rated hospitals and rehabilitation centers near you instantly.
          AlIve checks availability and ratings to ensure you get the best care.
        </p>
        
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 disabled:opacity-50 transition-all shadow-lg shadow-teal-900/20 active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Navigation size={20} />}
          Find Nearest Hospitals
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-xl border border-red-500/20 font-medium">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 animate-fadeIn">
          <h3 className="text-lg font-bold mb-6 text-white border-b border-slate-700 pb-2">Recommended Facilities</h3>
          <div className="prose prose-invert prose-slate max-w-none">
             <ReactMarkdown>{result.text}</ReactMarkdown>
          </div>

          {/* Render Grounding Sources nicely if available */}
          {result.chunks && result.chunks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Sources & Maps</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.chunks.map((chunk: any, i: number) => {
                  if (chunk.web?.uri) {
                    return (
                        <a 
                            key={i} 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-teal-500/50 group"
                        >
                            <div className="bg-slate-800 p-2 rounded-lg shadow-sm group-hover:bg-teal-500/20 group-hover:text-teal-400 transition-colors">
                                <MapPin size={18} className="text-slate-400 group-hover:text-teal-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-300 truncate group-hover:text-white">{chunk.web.title}</span>
                        </a>
                    )
                  }
                   return null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HospitalFinder;
