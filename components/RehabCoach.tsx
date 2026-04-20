import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { REHAB_SYSTEM_INSTRUCTION, REHAB_EXERCISES, Exercise } from '../types';
import { Video, Mic, ArrowLeft, Play, Pause, CheckCircle2, AlertCircle, Loader2, Timer, Award, Share2, Box, Split, Activity, X, Film, Maximize2, Minimize2, ChevronUp } from 'lucide-react';

interface RehabCoachProps {
  onClose: () => void;
}

const RehabCoach: React.FC<RehabCoachProps> = ({ onClose }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Feedback State
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'good' | 'bad' | 'neutral', message: string }>({ type: 'neutral', message: 'Align your body to start' });
  const [formScore, setFormScore] = useState(100);
  const [completed, setCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showRefVideo, setShowRefVideo] = useState(false); // Default hidden on mobile to save space
  const [isRefPlaying, setIsRefPlaying] = useState(true);

  // --- Gemini Live Logic ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const referenceVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const currentSessionRef = useRef<any>(null);
  const targetRepsRef = useRef<number>(0); // Ref to avoid stale closures in callbacks

  // Tool Definition for Gemini to update the UI
  const updateStatsTool: FunctionDeclaration = {
    name: 'update_exercise_stats',
    description: 'Call this function immediately when a rep is completed or to provide form feedback.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reps: {
          type: Type.NUMBER,
          description: 'The CURRENT TOTAL number of reps completed. Increment this by 1 for each new rep.',
        },
        feedback_text: {
          type: Type.STRING,
          description: 'Short feedback (2-5 words). E.g., "Good squat", "Lower", "Chest up".',
        },
        feedback_type: {
          type: Type.STRING,
          enum: ['good', 'bad', 'neutral'],
          description: 'Sentiment: good (correct form), bad (needs correction), neutral (info).',
        },
        form_score: {
            type: Type.NUMBER,
            description: 'Form quality 0-100. Deduct for mistakes.',
        }
      },
      required: ['reps', 'feedback_text', 'feedback_type', 'form_score'],
    },
  };

  useEffect(() => {
    // Ensure reference video plays when exercise is selected
    if (selectedExercise && referenceVideoRef.current && sessionActive) {
        referenceVideoRef.current.play()
            .then(() => setIsRefPlaying(true))
            .catch(e => console.log("Auto-play error:", e));
    }
  }, [selectedExercise, sessionActive]);

  const toggleRefPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (referenceVideoRef.current) {
        if (referenceVideoRef.current.paused) {
            referenceVideoRef.current.play();
            setIsRefPlaying(true);
        } else {
            referenceVideoRef.current.pause();
            setIsRefPlaying(false);
        }
    }
  };

  const startSession = async () => {
    if (!selectedExercise) return;
    if (!process.env.API_KEY) {
        setError("API Key is missing.");
        return;
    }

    setConnecting(true);
    setCompleted(false);
    setRepCount(0);
    setFormScore(100);
    setFeedback({ type: 'neutral', message: 'Initializing Coach...' });
    setShowSummary(false);
    targetRepsRef.current = selectedExercise.targetReps;
    
    try {
      // 1. Get User Media first to ensure permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }, 
        video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: 'user' 
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // 2. Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });

      // Important: Resume contexts as they might be suspended by browser policy
      if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();

      // 3. Connect to Gemini Live
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const instruction = `${REHAB_SYSTEM_INSTRUCTION}
      
      CURRENT EXERCISE: "${selectedExercise.name}"
      
      REP DEFINITION (STRICT):
      ${selectedExercise.repDefinition}
      
      GOLD STANDARD FORM:
      ${selectedExercise.perfectFormCue}
      
      SESSION GOAL:
      - Target: ${selectedExercise.targetReps} reps.
      - Start count at: 0.
      
      PROTOCOL:
      1. Watch movement.
      2. When Rep Definition is met -> Call 'update_exercise_stats' with reps + 1.
      3. If form error -> Call 'update_exercise_stats' with current reps (no change) and feedback.
      4. Congratulate when ${selectedExercise.targetReps} reached.`;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            setConnecting(false);
            setSessionActive(true);
            setFeedback({ type: 'neutral', message: 'Coach Connected. Start Moving!' });
            
            if (referenceVideoRef.current) {
                referenceVideoRef.current.play().then(() => setIsRefPlaying(true)).catch(() => {});
            }
            
            // Audio Input Streaming
            if (inputAudioContextRef.current && stream) {
              const source = inputAudioContextRef.current.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                 const inputData = e.inputBuffer.getChannelData(0);
                 const l = inputData.length;
                 const int16 = new Int16Array(l);
                 for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                 const bytes = new Uint8Array(int16.buffer);
                 let binary = '';
                 for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                 const b64 = btoa(binary);

                 sessionPromiseRef.current?.then(session => {
                    session.sendRealtimeInput({ media: { data: b64, mimeType: 'audio/pcm;rate=16000' } });
                 });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current.destination);
            }

            // Video Frame Streaming (optimized to 280px width @ ~3 FPS)
            if (canvasRef.current && videoRef.current) {
               const ctx = canvasRef.current.getContext('2d');
               frameIntervalRef.current = window.setInterval(() => {
                 if (videoRef.current && videoRef.current.readyState >= 2 && sessionActive) {
                   // 280px provides enough detail for limb detection while keeping payload small
                   const targetWidth = 280;
                   const aspectRatio = videoRef.current.videoHeight / videoRef.current.videoWidth;
                   canvasRef.current!.width = targetWidth;
                   canvasRef.current!.height = targetWidth * aspectRatio;
                   
                   ctx?.drawImage(videoRef.current, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
                   
                   // Use lower quality (0.5) to speed up transmission
                   const base64 = canvasRef.current!.toDataURL('image/jpeg', 0.5).split(',')[1];
                   
                   sessionPromiseRef.current?.then(session => {
                      session.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } });
                   });
                 }
               }, 330); // 330ms = ~3 FPS
            }
          },
          onmessage: async (message: LiveServerMessage) => {
             // 1. Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
             if (base64Audio && outputAudioContextRef.current) {
               const ctx = outputAudioContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const binaryString = atob(base64Audio);
               const len = binaryString.length;
               const bytes = new Uint8Array(len);
               for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
               const dataInt16 = new Int16Array(bytes.buffer);
               const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
               const channelData = buffer.getChannelData(0);
               for (let i = 0; i < buffer.length; i++) channelData[i] = dataInt16[i] / 32768.0;

               const source = ctx.createBufferSource();
               source.buffer = buffer;
               source.connect(ctx.destination);
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += buffer.duration;
             }

             // 2. Handle Tool Calls
             if (message.toolCall) {
                const functionCalls = message.toolCall.functionCalls;
                if (functionCalls.length > 0) {
                    const call = functionCalls[0];
                    if (call.name === 'update_exercise_stats') {
                        const args = call.args as any;
                        const newReps = typeof args.reps === 'number' ? Math.round(args.reps) : 0;
                        
                        setRepCount(newReps);
                        setFeedback({
                            type: args.feedback_type || 'neutral',
                            message: args.feedback_text || 'Good!'
                        });
                        setFormScore(args.form_score || 100);

                        // Check Completion Logic
                        if (newReps >= targetRepsRef.current) {
                            setTimeout(() => {
                                handleFinishExercise();
                            }, 4000); // Allow AI to finish congrats
                        }

                        sessionPromiseRef.current?.then(session => {
                            session.sendToolResponse({
                                functionResponses: [{
                                    id: call.id,
                                    name: call.name,
                                    response: { result: `UI updated. Current Count: ${newReps}. Continue monitoring.` }
                                }]
                            });
                        });
                    }
                }
             }
          },
          onclose: () => {
              console.log("Connection closed");
              setSessionActive(false);
          },
          onerror: (err) => {
             console.error("Gemini Live Error:", err);
             setError("Connection disrupted. Please retry.");
             stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: instruction,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          tools: [{ functionDeclarations: [updateStatsTool] }]
        }
      });
      sessionPromiseRef.current.then(s => currentSessionRef.current = s);

    } catch (err) {
      console.error(err);
      setError("Failed to access camera/mic. Please allow permissions.");
      setConnecting(false);
    }
  };

  const stopSession = () => {
    // 1. Stop Media Streams
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    
    // 2. Close Audio Contexts
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close().catch(console.error);
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close().catch(console.error);
        outputAudioContextRef.current = null;
    }
    
    // 3. Stop Reference Video
    if (referenceVideoRef.current) {
        referenceVideoRef.current.pause();
        setIsRefPlaying(false);
    }

    // 4. Clear Loop
    if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
    }

    // 5. Close AI Session
    if (currentSessionRef.current) {
        // Wrap in try/catch as closing a closed session might throw
        try { currentSessionRef.current.close(); } catch(e) {}
        currentSessionRef.current = null;
    }
    
    setSessionActive(false);
    setConnecting(false);
  };

  const handleFinishExercise = () => {
      stopSession();
      setCompleted(true);
      setShowSummary(true);
  };
  
  useEffect(() => {
     return () => stopSession();
  }, []);


  // --- View: Exercise List ---
  if (!selectedExercise) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-8 bg-slate-900 text-slate-200">
         <div className="flex items-center gap-4 mb-6 md:mb-8">
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
               <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-white">Recovery Plan</h1>
         </div>

         <div className="bg-teal-900/30 border border-teal-500/30 p-4 md:p-6 rounded-2xl mb-6 flex items-start gap-4 backdrop-blur-sm">
            <div className="bg-teal-500/20 p-3 rounded-full text-teal-400 shrink-0">
               <Award size={24} />
            </div>
            <div>
               <h3 className="font-bold text-teal-200 text-base md:text-lg">Daily Goal: ACL Stability</h3>
               <p className="text-teal-200/70 text-xs md:text-sm mt-1">
                  Complete these exercises. The AI Coach will count your reps and correct your form.
               </p>
            </div>
         </div>

         <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {REHAB_EXERCISES.map((ex) => (
               <div key={ex.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg hover:border-teal-500/50 hover:bg-slate-800/80 transition-all flex flex-col cursor-pointer group"
                    onClick={() => setSelectedExercise(ex)}>
                  <div className={`h-32 ${ex.videoColor} rounded-xl mb-4 flex items-center justify-center relative overflow-hidden bg-opacity-80`}>
                     <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                        <Play fill="currentColor" />
                     </div>
                  </div>
                  <h3 className="font-bold text-white text-lg">{ex.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-400 mt-2 mb-4">
                     <span className="flex items-center gap-1"><Timer size={14}/> {ex.durationStr}</span>
                     <span className="flex items-center gap-1"><CheckCircle2 size={14}/> {ex.targetReps} Reps</span>
                  </div>
                  <button className="mt-auto w-full bg-slate-900 group-hover:bg-teal-600 group-hover:text-white text-slate-400 font-bold py-3 rounded-xl transition-colors border border-slate-700 group-hover:border-teal-500">
                     Start Session
                  </button>
               </div>
            ))}
         </div>
      </div>
    );
  }

  // --- View: Session Summary ---
  if (showSummary && selectedExercise) {
      return (
          <div className="h-full flex items-center justify-center p-4 md:p-8 bg-slate-950 animate-fadeIn">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={32} className="text-green-500 md:w-10 md:h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Great Job!</h2>
                  <p className="text-slate-400 mb-8">{selectedExercise.name} Completed</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-800 p-4 rounded-xl">
                          <div className="text-3xl font-bold text-white">{repCount}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Reps</div>
                      </div>
                      <div className="bg-slate-800 p-4 rounded-xl">
                          <div className={`text-3xl font-bold ${formScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>{formScore}%</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Form Score</div>
                      </div>
                  </div>

                  <button 
                    onClick={() => { setSelectedExercise(null); setShowSummary(false); }}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-teal-900/20"
                  >
                      Back to Exercises
                  </button>
              </div>
          </div>
      );
  }

  // --- View: Active Session (Responsive) ---
  return (
    <div className="h-full flex flex-col bg-black text-white relative overflow-hidden">
      
      {/* 1. Transparent Header (Compact) */}
      <div className="absolute top-0 left-0 right-0 z-50 p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between pointer-events-none">
           <div className="flex items-center gap-2 pointer-events-auto">
              <button onClick={() => { stopSession(); setSelectedExercise(null); }} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/5">
                 <ArrowLeft size={18} />
              </button>
              <div className="flex flex-col">
                  <h2 className="font-bold text-white text-sm md:text-base drop-shadow-md leading-none">{selectedExercise.name}</h2>
                  <span className="text-[10px] text-white/70">{selectedExercise.targetReps} Reps Goal</span>
              </div>
           </div>

           <div className="flex items-center gap-2 pointer-events-auto">
                {/* Live Status Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 backdrop-blur-md rounded-full border transition-colors ${sessionActive ? 'bg-red-500/20 border-red-500/30' : 'bg-black/40 border-white/10'}`}>
                   {connecting ? (
                       <>
                         <Loader2 size={12} className="animate-spin text-teal-400"/>
                         <span className="text-[10px] font-bold text-teal-400 tracking-wider">INIT...</span>
                       </>
                   ) : sessionActive ? (
                       <>
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                         <span className="text-[10px] font-bold text-red-400 tracking-wider">LIVE AI</span>
                       </>
                   ) : (
                       <span className="text-[10px] font-bold text-slate-400 tracking-wider">READY</span>
                   )}
                </div>

                {!sessionActive && !connecting ? (
                    <button 
                        onClick={startSession}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-1.5 rounded-full font-bold text-xs shadow-lg shadow-teal-500/20 transition-transform active:scale-95"
                    >
                        START
                    </button>
                ) : (
                    <button 
                        onClick={handleFinishExercise}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full font-bold text-xs border border-white/10 backdrop-blur-md"
                    >
                        END
                    </button>
                )}
           </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 relative flex flex-col md:flex-row">
         
         {/* Live Camera Feed (Fullscreen on mobile) */}
         <div className="relative flex-1 bg-gray-900 overflow-hidden flex items-center justify-center">
             {/* Fallback pattern if video is loading */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 to-black z-0"></div>
             
             <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover z-10 mirror-mode" 
                autoPlay 
                playsInline 
                muted 
             />
             <canvas ref={canvasRef} className="hidden" />
             
             {/* Center Guidance/Feedback Overlay (Large & Prominent) */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 px-6">
                 {/* Only show prompt if active */}
                 {sessionActive && (
                     <div className={`
                        transition-all duration-500 transform
                        ${feedback.type === 'neutral' ? 'scale-100 opacity-90' : 'scale-110 opacity-100'}
                        ${feedback.type === 'good' ? 'bg-green-500/20 border-green-500/50 animate-pulse-subtle' : feedback.type === 'bad' ? 'bg-red-500/20 border-red-500/50 animate-shake' : 'bg-black/40 border-white/10'}
                        backdrop-blur-md border rounded-3xl p-6 text-center max-w-sm w-full
                     `}>
                         <div className="text-sm font-bold uppercase tracking-widest text-white/70 mb-2">AI Coach says:</div>
                         <h3 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-lg">
                             {feedback.message}
                         </h3>
                         {feedback.type === 'good' && (
                             <div className="mt-2 text-green-400 flex items-center justify-center gap-1 font-bold">
                                 <CheckCircle2 size={20} /> Perfect Form
                             </div>
                         )}
                     </div>
                 )}
             </div>

             {/* Bottom Stats Overlay (Enhanced for Mobile Visibility) */}
             <div className="absolute bottom-0 left-0 right-0 z-30 w-full p-4 pb-8 md:p-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none">
                 <div className="flex items-end justify-between max-w-7xl mx-auto w-full">
                     
                     {/* Rep Counter */}
                     <div className="flex flex-col">
                         <span className="text-[10px] md:text-xs text-white/70 font-bold uppercase tracking-widest mb-1 shadow-black drop-shadow-sm">Repetitions</span>
                         <div className="flex items-baseline gap-1 drop-shadow-md">
                             <span className="text-6xl md:text-8xl font-black text-white leading-none tracking-tight">{repCount}</span>
                             <span className="text-xl md:text-4xl text-white/50 font-medium">/ {selectedExercise.targetReps}</span>
                         </div>
                     </div>

                     {/* Form Score Bar */}
                     <div className="flex flex-col items-end w-32 md:w-64 pb-1">
                         <div className="flex items-center gap-2 mb-2 drop-shadow-md">
                             <Activity size={16} className={formScore > 80 ? 'text-green-400' : 'text-yellow-400'} />
                             <span className={`text-sm md:text-lg font-bold ${formScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                 {formScore}% Form
                             </span>
                         </div>
                         <div className="w-full h-2 md:h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                             <div 
                                className={`h-full rounded-full transition-all duration-500 ${formScore > 80 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : formScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                style={{ width: `${formScore}%` }}
                             ></div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>

         {/* Reference Video (Floating Pill on Mobile, Sidebar on Desktop) */}
         <div className={`
            absolute md:relative top-16 md:top-0 right-4 md:right-0 z-40 
            transition-all duration-300 ease-in-out
            ${showRefVideo ? 'w-48 md:w-80 aspect-video md:h-full' : 'w-12 h-12 md:w-0 md:hidden'}
         `}>
             {showRefVideo ? (
                 <div className="w-full h-full bg-slate-900 rounded-xl md:rounded-none overflow-hidden shadow-2xl border border-white/10 md:border-l md:border-t-0 md:border-slate-800 flex flex-col relative group">
                     {/* Close/Minimize Button */}
                     <button 
                        onClick={() => setShowRefVideo(false)} 
                        className="absolute top-2 right-2 z-50 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full backdrop-blur-md"
                     >
                         <Minimize2 size={14} />
                     </button>
                     
                     <div className="bg-black/80 p-2 text-center text-[10px] font-bold text-white/70 uppercase tracking-widest pointer-events-none absolute top-0 left-0 right-0 z-10">
                         Gold Standard
                     </div>
                     
                     {/* Video Container with Click-to-Play/Pause */}
                     <div 
                        className="relative w-full h-full group cursor-pointer"
                        onClick={toggleRefPlayback}
                     >
                         <video 
                             ref={referenceVideoRef}
                             src={selectedExercise.referenceVideoUrl}
                             loop
                             playsInline
                             muted
                             className="w-full h-full object-cover opacity-90"
                             onPlay={() => setIsRefPlaying(true)}
                             onPause={() => setIsRefPlaying(false)}
                         />
                         
                         {/* Play/Pause Overlay */}
                         <div className={`
                            absolute inset-0 flex items-center justify-center transition-all duration-300
                            ${isRefPlaying ? 'opacity-0 group-hover:opacity-100 bg-black/30' : 'opacity-100 bg-black/50'}
                         `}>
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-lg transform transition-transform group-hover:scale-110">
                                {isRefPlaying ? (
                                    <Pause size={24} className="text-white fill-white" />
                                ) : (
                                    <Play size={24} className="text-white fill-white ml-1" />
                                )}
                            </div>
                         </div>
                     </div>
                 </div>
             ) : (
                 <button 
                    onClick={() => setShowRefVideo(true)}
                    className="w-12 h-12 bg-slate-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-teal-400 shadow-lg border border-white/10 hover:scale-105 transition-transform"
                 >
                     <Film size={20} />
                 </button>
             )}
         </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 z-50 animate-bounce cursor-pointer" onClick={() => setError(null)}>
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
            <X size={16}/>
        </div>
      )}

      <style>{`
        .mirror-mode {
            transform: scaleX(-1);
        }
        @keyframes pulse-subtle {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        .animate-pulse-subtle {
            animation: pulse-subtle 2s infinite;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default RehabCoach;