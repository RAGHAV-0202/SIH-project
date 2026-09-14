import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { transcribeAndSynthesizeVoice, transcribeAudioFile } from '../services/api';
import {
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Volume2,
  VolumeX,
  Lock,
  Plus,
  ArrowLeft,
  Loader2,
  Send,
  HelpCircle,
} from 'lucide-react';

const SUGGESTIONS = {
  destination: [
    { label: 'Chandigarh (Rock Garden & Rose Garden)', value: 'Chandigarh' },
    { label: 'Rishikesh (River yoga & rafting)', value: 'Rishikesh' },
    { label: 'Coorg (Coffee estate & spice trails)', value: 'Coorg' },
    { label: 'Spiti Valley (High mountain passes)', value: 'Spiti Valley' },
    { label: 'Goa (Beaches & coastal culture)', value: 'Goa' },
  ],
  duration_travelers: [
    { label: '2 days, 2 travelers', value: '2 days for 2 people' },
    { label: '3 days, 3 friends', value: '3 days for 3 people' },
    { label: '4 days, couple', value: '4 days for 2 people' },
    { label: '5 days, solo explorer', value: '5 days solo' },
  ],
  budget: [
    { label: '₹15,000 budget', value: '15000 rs' },
    { label: '₹25,000 budget', value: '25000 rs' },
    { label: '₹35,000 budget', value: '35000 rs' },
    { label: '₹50,000 budget', value: '50000 rs' },
  ],
};

export default function VoiceIntake() {
  const navigate = useNavigate();
  const location = useLocation();

  // Clean conversational intake state — NO PRE-FILLED MOCK DATA
  const [transcription, setTranscription] = useState(location.state?.prompt || '');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [languageMode, setLanguageMode] = useState('EN'); // 'EN' | 'HI'
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');

  // Extracted Constraints State (Clean slate unless explicitly passed in navigation)
  const [destination, setDestination] = useState(location.state?.destination || null);
  const [destinationSub, setDestinationSub] = useState(destination ? 'Selected destination' : null);
  const [budget, setBudget] = useState(location.state?.budget || null);
  const [days, setDays] = useState(location.state?.days || null);
  const [people, setPeople] = useState(location.state?.people || null);
  const [travelStyle, setTravelStyle] = useState(null);
  const [lodgingMode, setLodgingMode] = useState('homestay');

  // Dynamic Assistant Question
  const [assistantQuestion, setAssistantQuestion] = useState(
    languageMode === 'HI'
      ? 'नमस्ते! आप कहाँ घूमना चाहते हैं?'
      : 'Where would you like to explore? Tell me your dream destination!'
  );

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Web Speech Synthesis (Assistant asks questions out loud)
  const speakQuestion = (text, onEndCallback = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }
    if (isAudioMuted) {
      if (onEndCallback) {
        setTimeout(onEndCallback, 2500);
      }
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageMode === 'HI' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEndCallback) onEndCallback();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        if (onEndCallback) onEndCallback();
      };
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    }
  };

  // Speak initial question on load (unless muted)
  useEffect(() => {
    const timer = setTimeout(() => {
      speakQuestion(assistantQuestion);
    }, 600);
    return () => clearTimeout(timer);
  }, [languageMode]);

  // Initialize Web Speech Recognition as real-time feedback assistant
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = languageMode === 'HI' ? 'hi-IN' : 'en-IN';

      recog.onresult = (event) => {
        let liveTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          liveTranscript += event.results[i][0].transcript;
        }
        if (liveTranscript.trim()) {
          setTranscription(liveTranscript.trim());
        }
      };

      recog.onerror = (err) => {
        console.warn('Speech recognition warning:', err);
      };

      recognitionRef.current = recog;
    }
  }, [languageMode]);

  // Start recording using MediaRecorder for high-accuracy Groq Whisper transcription
  const startRecording = async () => {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        if (audioBlob.size > 1000) {
          setRecordingStatus('Transcribing with Groq Whisper...');
          setIsProcessing(true);
          try {
            const whisperRes = await transcribeAudioFile(audioBlob, languageMode.toLowerCase());
            if (whisperRes && whisperRes.success && whisperRes.text && whisperRes.text.trim()) {
              const transcribedText = whisperRes.text.trim();
              setTranscription(transcribedText);
              await handleProcessAnswer(transcribedText);
            } else if (transcription && transcription.trim()) {
              // Fallback to interim transcript if available
              await handleProcessAnswer(transcription.trim());
            }
          } catch (err) {
            console.warn('Whisper transcription error:', err);
            if (transcription && transcription.trim()) {
              await handleProcessAnswer(transcription.trim());
            }
          } finally {
            setIsProcessing(false);
            setRecordingStatus('');
          }
        } else if (transcription && transcription.trim()) {
          await handleProcessAnswer(transcription.trim());
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsListening(true);
      setRecordingStatus('Listening with Groq Voice...');

      // Also start live browser speech recognition if supported for visual text feedback
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = languageMode === 'HI' ? 'hi-IN' : 'en-IN';
          recognitionRef.current.start();
        } catch (e) {
          // Already running or ignored
        }
      }
    } catch (err) {
      console.warn('Microphone permission or access error:', err);
      setIsListening(false);
      setRecordingStatus('Microphone access denied or unavailable');
    }
  };

  const stopRecording = () => {
    setIsListening(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Process User Answer via AI Assistant with Groq Multi-Model Fallback
  const handleProcessAnswer = async (inputOverride) => {
    const textToSubmit = inputOverride || transcription;
    if (!textToSubmit || !textToSubmit.trim()) return;

    setIsProcessing(true);
    try {
      const currentPlan = {
        destination,
        days,
        people,
        budget,
        lodgingMode,
        vibe: travelStyle,
      };

      const result = await transcribeAndSynthesizeVoice(textToSubmit, languageMode, currentPlan);

      if (result && result.success && result.data) {
        const data = result.data;
        if (data.destination) {
          setDestination(data.destination);
          setDestinationSub(data.vibe || 'Verified travel sector');
        }
        if (data.days) setDays(data.days);
        if (data.people) setPeople(data.people);
        if (data.budget) setBudget(data.budget);
        if (data.lodgingMode) setLodgingMode(data.lodgingMode);
        if (data.vibe) setTravelStyle(data.vibe);

        if (result.nextQuestion) {
          setAssistantQuestion(result.nextQuestion);

          // Check if all details are now complete
          const allComplete = Boolean(
            (data.destination || destination) &&
            (data.days || days) &&
            (data.people || people) &&
            (data.budget || budget)
          );

          if (allComplete || result.isReady) {
            // Confirmation reached: Speak thank you & confirmation, then automatically transition to planning
            speakQuestion(result.nextQuestion, () => {
              const finalDest = data.destination || destination;
              const finalDays = data.days || days;
              const finalPeople = data.people || people;
              const finalBudget = data.budget || budget;
              const finalLodging = data.lodgingMode || lodgingMode || 'homestay';
              const constructedPrompt = `${finalDays} days in ${finalDest} for ${finalPeople} travelers under ₹${Number(finalBudget).toLocaleString('en-IN')}`;

              setTimeout(() => {
                navigate('/planning', {
                  state: {
                    prompt: constructedPrompt,
                    destination: finalDest,
                    budget: finalBudget,
                    days: finalDays,
                    people: finalPeople,
                    lodgingMode: finalLodging,
                    autoRun: true,
                  },
                });
              }, 800);
            });
          } else {
            speakQuestion(result.nextQuestion);
          }
        }
      }
    } catch (err) {
      console.warn('Interactive question processing fallback:', err);
    } finally {
      setIsProcessing(false);
      setTranscription('');
    }
  };

  const isReady = Boolean(destination && days && people && budget);
  const completedCount = [destination, days, people, budget].filter(Boolean).length;

  const handleCreateItinerary = () => {
    if (!isReady) {
      // Prompt user for remaining details
      const missing = [];
      if (!destination) missing.push('destination');
      if (!days) missing.push('duration (days)');
      if (!people) missing.push('travelers count');
      if (!budget) missing.push('budget');
      const msg = `Please provide your ${missing.join(', ')} before creating itinerary.`;
      setAssistantQuestion(msg);
      speakQuestion(msg);
      return;
    }

    const constructedPrompt = `${days} days in ${destination} for ${people} travelers under ₹${budget.toLocaleString('en-IN')}`;
    navigate('/planning', {
      state: {
        prompt: constructedPrompt,
        destination,
        budget,
        days,
        people,
        lodgingMode,
        autoRun: true,
      },
    });
  };

  // Determine which suggestions to show based on what is missing
  const currentSuggestions = !destination
    ? SUGGESTIONS.destination
    : !days || !people
    ? SUGGESTIONS.duration_travelers
    : !budget
    ? SUGGESTIONS.budget
    : [
        { label: 'Build my custom itinerary', value: 'Ready to build itinerary' },
        { label: 'Prefer luxury boutique hotels', value: 'boutique hotels' },
        { label: 'Prefer village homestays', value: 'village homestays' },
      ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#292524] antialiased selection:bg-amber-100 selection:text-[#C2410C] flex flex-col font-['Geist']">
      <Navbar />

      <main className="flex-1 flex flex-col justify-between max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Return & Ambient Status Bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/planning"
            className="group inline-flex items-center text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Planner Workspace
          </Link>

          {/* Controls: Audio Toggle & Language Support */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextMute = !isAudioMuted;
                setIsAudioMuted(nextMute);
                if (nextMute && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                } else if (!nextMute) {
                  speakQuestion(assistantQuestion);
                }
              }}
              className={`p-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 px-3 ${
                isAudioMuted
                  ? 'bg-stone-100 text-stone-500 border-stone-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
              title={isAudioMuted ? 'Voice output muted (Click to enable audio)' : 'Voice audio active (Click to mute)'}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-semibold">{isAudioMuted ? 'Muted' : 'Audio ON'}</span>
            </button>

            <div className="flex items-center gap-2 bg-white/90 border border-stone-200/80 px-3 py-1.5 rounded-full text-xs font-medium shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSpeaking ? 'bg-purple-500' : isListening ? 'bg-emerald-500' : 'bg-[#C2410C]'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSpeaking ? 'bg-purple-600' : isListening ? 'bg-emerald-600' : 'bg-[#C2410C]'}`} />
              </span>
              <span className="text-stone-600 text-xs font-medium">
                {isSpeaking ? 'Assistant Speaking' : isListening ? 'Listening to You' : 'Interactive Intake'}
              </span>
            </div>
          </div>
        </div>

        {/* Center Stage Grid: Conversational Orb & Real-Time Constraints HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
          
          {/* Primary Conversational Canvas (8 Cols) */}
          <section className="lg:col-span-8 flex flex-col items-center justify-center text-center relative py-6 lg:py-8">
            
            {/* Center Interactive AI Voice Orb */}
            <div className="relative flex items-center justify-center mb-6">
              {/* Ambient Glow Background */}
              <div
                className={`absolute w-72 h-72 rounded-full blur-3xl -z-10 transition-all duration-700 ${
                  isSpeaking
                    ? 'bg-gradient-to-tr from-purple-600/40 via-violet-400/30 to-indigo-500/40 animate-pulse scale-110'
                    : isListening
                    ? 'bg-gradient-to-tr from-emerald-500/30 via-sky-400/25 to-amber-500/30 animate-pulse scale-110'
                    : 'bg-gradient-to-tr from-purple-500/15 via-sky-400/10 to-amber-500/15'
                }`}
              />

              {/* Outer Orb Shell */}
              <div
                onClick={toggleListening}
                className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-1 bg-gradient-to-b from-white/90 via-purple-100/60 to-purple-200/40 border border-purple-200/50 shadow-[0_0_60px_20px_rgba(124,58,237,0.18)] flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform"
                title={isListening ? 'Click to pause' : 'Click to speak'}
              >
                {/* Internal Liquid Orb */}
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-900 overflow-hidden relative flex items-center justify-center shadow-inner">
                  {/* Reflected Light Swirl */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/35 via-violet-600/40 to-transparent mix-blend-screen opacity-90 animate-pulse" />

                  {/* Centered Fluid Core Waveform */}
                  <div className="relative z-10 flex items-center justify-center gap-1.5 px-6 py-4">
                    {[
                      { bg: 'bg-sky-300', h: (isListening || isSpeaking) ? 24 : 14 },
                      { bg: 'bg-indigo-300', h: (isListening || isSpeaking) ? 42 : 22 },
                      { bg: 'bg-purple-300', h: (isListening || isSpeaking) ? 58 : 28 },
                      { bg: 'bg-violet-400', h: (isListening || isSpeaking) ? 76 : 36 },
                      { bg: 'bg-amber-200', h: (isListening || isSpeaking) ? 88 : 42 },
                      { bg: 'bg-rose-300', h: (isListening || isSpeaking) ? 68 : 32 },
                      { bg: 'bg-violet-300', h: (isListening || isSpeaking) ? 80 : 38 },
                      { bg: 'bg-sky-200', h: (isListening || isSpeaking) ? 50 : 26 },
                      { bg: 'bg-blue-300', h: (isListening || isSpeaking) ? 32 : 18 },
                      { bg: 'bg-purple-200', h: (isListening || isSpeaking) ? 22 : 12 },
                    ].map((bar, i) => (
                      <span
                        key={i}
                        className={`inline-block w-[3px] rounded-full transition-all duration-300 ${bar.bg} ${(isListening || isSpeaking) ? 'animate-pulse' : ''}`}
                        style={{ height: `${bar.h}px` }}
                      />
                    ))}
                  </div>

                  {/* Specular Glass Highlight */}
                  <div className="absolute -top-12 -left-8 w-36 h-36 bg-gradient-to-b from-white/30 to-transparent rounded-full transform -rotate-45 pointer-events-none" />
                </div>

                {/* Pulsing Listening Beacon Pill */}
                <div className="absolute -bottom-3.5 bg-[#292524] text-white font-mono text-[11px] font-medium tracking-wider px-3.5 py-1 rounded-full shadow-lg flex items-center gap-2 border border-white/20">
                  <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : isSpeaking ? 'bg-purple-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>
                    {recordingStatus || (isProcessing ? 'Processing with Groq AI...' : isListening ? 'Listening (Groq Voice)...' : isSpeaking ? 'Speaking...' : 'Tap orb to speak')}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversational Question from AI Assistant */}
            <div className="max-w-2xl mx-auto mb-6 px-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-3 border border-violet-100">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Question from Wandr Assistant</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#292524] tracking-tight leading-snug">
                "{assistantQuestion}"
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-2">
                Speak naturally or type your answer below. English or Hindi supported natively.
              </p>
            </div>

            {/* Context-Aware Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl px-2">
              {currentSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleProcessAnswer(item.value)}
                  className="group text-xs text-[#292524] bg-white/95 hover:bg-white hover:border-[#C2410C]/40 px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span className="text-[#C26D38]">✦</span>
                  <span className="text-left font-medium">{item.label}</span>
                </button>
              ))}
            </div>

          </section>

          {/* Extracted Constraints HUD Drawer (4 Cols) — Dynamic Real Data */}
          <aside className="lg:col-span-4">
            <div className="bg-white/95 rounded-2xl p-6 border border-stone-200/90 shadow-xl relative overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <h3 className="text-xs tracking-wider font-bold text-[#292524] uppercase font-mono">
                    Trip Summary
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                  isReady
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isReady ? 'Ready' : `${completedCount}/4 Details`}
                </span>
              </div>

              <div className="divide-y divide-stone-100 text-xs mt-3">
                <div className="py-3 flex items-start justify-between">
                  <div>
                    <span className="text-stone-400 block text-[10px] font-mono uppercase font-bold">DESTINATION</span>
                    <span className={`font-bold text-sm block mt-0.5 ${destination ? 'text-[#292524]' : 'text-stone-400 italic'}`}>
                      {destination || 'Awaiting destination...'}
                    </span>
                    {destinationSub && <span className="text-[11px] text-stone-500 block">{destinationSub}</span>}
                  </div>
                </div>

                <div className="py-3 flex items-start justify-between">
                  <div>
                    <span className="text-stone-400 block text-[10px] font-mono uppercase font-bold">BUDGET</span>
                    <span className={`font-bold text-sm block mt-0.5 ${budget ? 'text-[#C2410C]' : 'text-stone-400 italic'}`}>
                      {budget ? `₹${budget.toLocaleString('en-IN')}` : 'Awaiting budget...'}
                    </span>
                    <span className="text-[11px] text-stone-500 block">Estimated total budget</span>
                  </div>
                </div>

                <div className="py-3 flex items-start justify-between">
                  <div>
                    <span className="text-stone-400 block text-[10px] font-mono uppercase font-bold">TRAVELERS</span>
                    <span className={`font-bold text-xs block mt-0.5 ${people ? 'text-[#292524]' : 'text-stone-400 italic'}`}>
                      {people ? `${people} ${people === 1 ? 'Guest' : 'Guests'}` : 'Awaiting traveler count...'}
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      {lodgingMode === 'homestay' ? 'Authentic Village Homestays' : 'Boutique Heritage Stays'}
                    </span>
                  </div>
                </div>

                <div className="py-3 flex items-start justify-between">
                  <div>
                    <span className="text-stone-400 block text-[10px] font-mono uppercase font-bold">DURATION</span>
                    <span className={`font-bold text-xs block mt-0.5 ${days ? 'text-[#292524]' : 'text-stone-400 italic'}`}>
                      {days ? `${days} Days / ${Math.max(1, days - 1)} Nights` : 'Awaiting duration...'}
                    </span>
                  </div>
                </div>

                <div className="py-3 flex items-start justify-between">
                  <div>
                    <span className="text-stone-400 block text-[10px] font-mono uppercase font-bold">TRAVEL STYLE</span>
                    <span className="font-medium text-[#292524] text-xs block mt-0.5">
                      {travelStyle || 'Adaptive regional pacing'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 bg-stone-50/70 -mx-6 -mb-6 p-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#292524] font-bold text-xs">
                    {isReady ? 'Trip Details Ready' : 'In Conversation'}
                  </span>
                  <span className={`font-bold text-xs flex items-center gap-1 ${isReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isReady ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-3.5 h-3.5" /> In Progress
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-normal leading-relaxed">
                  {isReady
                    ? 'All parameters confirmed. Click below to generate your personalized itinerary.'
                    : `Provide your remaining details (${completedCount}/4 set) to create the itinerary.`}
                </p>
              </div>
            </div>
          </aside>

        </div>

        {/* Multimodal Omnibox Input Bar */}
        <div className="w-full max-w-4xl mx-auto pt-6 pb-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessAnswer();
            }}
            className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xl border border-stone-200/90 flex flex-col md:flex-row items-stretch md:items-center gap-3"
          >
            {/* Left Accessory Controls: Attachment & Language Switch */}
            <div className="flex items-center gap-1.5 pl-1.5 self-start md:self-auto">
              <button
                type="button"
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                title="Attach notes"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Language Switcher Pill */}
              <button
                type="button"
                onClick={() => {
                  const nextLang = languageMode === 'EN' ? 'HI' : 'EN';
                  setLanguageMode(nextLang);
                  const q = nextLang === 'HI'
                    ? 'नमस्ते! आप कहाँ घूमना चाहते हैं?'
                    : 'Where would you like to explore? Tell me your dream destination!';
                  setAssistantQuestion(q);
                  speakQuestion(q);
                }}
                className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 flex items-center gap-1 cursor-pointer"
                title="Toggle English / Hindi speech model"
              >
                <span className={languageMode === 'EN' ? 'text-[#C2410C]' : 'text-stone-500'}>EN</span>
                <span className="text-stone-400">/</span>
                <span className={languageMode === 'HI' ? 'text-[#C2410C]' : 'text-stone-500'}>HI</span>
              </button>
            </div>

            {/* Editable Input / Answer Box */}
            <div className="flex-1 min-w-0 px-2 py-1 flex items-center">
              <div className="w-full flex items-center gap-2">
                <span className="text-violet-600 font-bold select-none animate-pulse font-mono">|</span>
                <input
                  type="text"
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder={
                    languageMode === 'HI'
                      ? 'अपना उत्तर बोलें या टाइप करें (उदा. 3 दिन जयपुर में 25000 रुपये)...'
                      : 'Speak or type your answer (e.g. 2 days in Chandigarh for 3 people)...'
                  }
                  className="w-full bg-transparent font-medium text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Right Action Cluster: Send / Voice / Create */}
            <div className="flex items-center gap-2 justify-end">
              {/* Send Button */}
              {transcription.trim() && (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition shadow-xs cursor-pointer"
                  title="Send answer"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}

              {/* Voice Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`relative p-2.5 rounded-xl text-white shadow-md flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-600 to-amber-600 ring-2 ring-[#C2410C]'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-500 hover:opacity-90'
                }`}
                title={isListening ? 'Microphone Active — Tap to pause' : 'Tap to Activate Microphone'}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isListening ? (
                  <Mic className="w-4 h-4 animate-bounce" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Create Itinerary Action Button */}
              <button
                type="button"
                onClick={handleCreateItinerary}
                disabled={!isReady}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 font-medium text-xs sm:text-sm rounded-xl transition shadow whitespace-nowrap cursor-pointer ${
                  isReady
                    ? 'bg-[#292524] hover:bg-black text-white hover:shadow-md active:scale-98'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span>Create My Itinerary</span>
                <ArrowRight className={`w-4 h-4 ${isReady ? 'text-amber-400' : 'text-stone-400'}`} />
              </button>
            </div>

          </form>

          {/* Security and Privacy Footnote */}
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 px-3 mt-2">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              Tap microphone or speak naturally • Private & Secure
            </span>
            <span className="hidden sm:inline text-stone-400">
              {isReady ? 'All parameters complete' : `Remaining: ${4 - completedCount} details`}
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}