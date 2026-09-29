import React, { useState, useEffect, useRef } from 'react';
import { Mic, Globe } from 'lucide-react';

/**
 * Reusable VoiceInputButton adapted from earlier prototype.
 * Uses W3C browser-native Web Speech API.
 * Supports Hindi, Hinglish, and Indian English voice queries.
 */
export default function VoiceInputButton({ onTranscript, className = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [lang, setLang] = useState('hi-IN'); // Default to Hindi/Hinglish speech recognition
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          currentInterim += transcript;
        }
      }

      setInterimText(currentInterim);
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is supported natively in Chrome, Edge, and Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = lang;
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const toggleLang = (e) => {
    e.stopPropagation();
    const nextLang = lang === 'hi-IN' ? 'en-IN' : 'hi-IN';
    setLang(nextLang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = nextLang;
    }
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {/* Listening Status Ripple Indicator */}
      {isListening && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#0EA5E9] text-white text-[11px] font-medium shadow-lg flex items-center gap-1.5 whitespace-nowrap animate-bounce z-40">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Listening ({lang === 'hi-IN' ? 'Hindi/Hinglish' : 'English'})...</span>
        </div>
      )}

      {/* Main Microphone Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
          isListening
            ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-md shadow-rose-500/20 animate-pulse'
            : 'bg-[#1E293B] border-gray-700 text-gray-300 hover:text-white hover:border-[#0EA5E9]'
        }`}
        title={isListening ? 'Click to stop listening' : `Speak prompt in ${lang === 'hi-IN' ? 'Hindi/Hinglish' : 'English'}`}
      >
        <Mic className={`w-4 h-4 ${isListening ? 'text-rose-400 animate-pulse' : 'text-gray-400'}`} />
      </button>

      {/* Language Switcher Pill */}
      <button
        type="button"
        onClick={toggleLang}
        className="text-[10px] font-mono px-1.5 py-1 rounded bg-[#0F172A] border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
        title="Toggle voice language: Hindi (hi-IN) / English (en-IN)"
      >
        {lang === 'hi-IN' ? 'हिं/EN' : 'EN'}
      </button>
    </div>
  );
}
