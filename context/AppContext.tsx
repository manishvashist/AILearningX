

import React, { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Settings, RecognitionResult, AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

const SETTINGS_KEY = 'interactive-learning-companion-settings';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const defaultSettings: Settings = {
      language: 'English',
      voice: 'Female',
      textSize: 'Medium',
    };
    try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
            return { ...defaultSettings, ...JSON.parse(savedSettings) };
        }
    } catch (error) {
        console.error("Could not load settings from localStorage", error);
    }
    return defaultSettings;
  });
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSpeechReady, setIsSpeechReady] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const speechQueue = useRef<{ text: string; onEnd?: () => void } | null>(null);

  useEffect(() => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Could not save settings to localStorage", error);
    }
  }, [settings]);
  
  const unlockAudio = useCallback(() => {
    if (isAudioUnlocked) return;

    try {
      const audioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (audioContext) {
        const context = new audioContext();
        if (context.state === 'suspended') {
          context.resume();
        }

        // Play a silent sound to ensure the audio system is active.
        const source = context.createBufferSource();
        source.buffer = context.createBuffer(1, 1, 22050);
        source.connect(context.destination);
        source.start(0);

        // A dummy speech synthesis call can also help initialize the engine.
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel(); // Clear any previous state
          const utterance = new SpeechSynthesisUtterance(' ');
          utterance.volume = 0;
          window.speechSynthesis.speak(utterance);
        }

        setIsAudioUnlocked(true);
        console.log('Audio context has been unlocked.');
      } else {
        setIsAudioUnlocked(true); // If no audio context, we can't do much.
      }
    } catch (e) {
      console.error("Failed to unlock audio context:", e);
      setIsAudioUnlocked(true); // Prevent repeated attempts on error.
    }
  }, [isAudioUnlocked]);


  const performSpeech = useCallback((text: string, onEnd?: () => void) => {
    if (!text || typeof window.speechSynthesis === 'undefined' || text.trim().toLowerCase() === 'undefined') {
      if (onEnd) onEnd();
      return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const allVoices = window.speechSynthesis.getVoices();
    
    if (allVoices.length > 0) {
        const lowerCaseVoiceName = (voice: SpeechSynthesisVoice) => voice.name.toLowerCase();
        let selectedVoice: SpeechSynthesisVoice | undefined;

        if (settings.language === 'Hindi') {
            utterance.lang = 'hi-IN';
            const preferredVoices = allVoices.filter(v => v.lang.startsWith('hi'));
            
            const femaleNames = ['swara', 'lekha', 'female', 'woman'];
            const maleNames = ['madhur', 'rishi', 'male', 'man'];

            const isFemale = (voice: SpeechSynthesisVoice) => femaleNames.some(name => lowerCaseVoiceName(voice).includes(name));
            const isMale = (voice: SpeechSynthesisVoice) => maleNames.some(name => lowerCaseVoiceName(voice).includes(name));

            if (settings.voice === 'Female') {
                selectedVoice = preferredVoices.find(isFemale) ||
                                preferredVoices.find(v => !isMale(v));
            } else { // Male
                selectedVoice = preferredVoices.find(isMale) ||
                                preferredVoices.find(v => !isFemale(v));
            }

            if (!selectedVoice && preferredVoices.length > 0) {
                 selectedVoice = preferredVoices.find(v => lowerCaseVoiceName(v).includes('google')) || preferredVoices[0];
            }
        } else { // English
            const femaleNames = ['zira', 'susan', 'hazel', 'catherine', 'eva', 'karen', 'samantha', 'victoria', 'female', 'woman'];
            const maleNames = ['david', 'mark', 'george', 'paul', 'tom', 'daniel', 'alex', 'male', 'man'];

            const isFemale = (voice: SpeechSynthesisVoice) => femaleNames.some(name => lowerCaseVoiceName(voice).includes(name));
            const isMale = (voice: SpeechSynthesisVoice) => maleNames.some(name => lowerCaseVoiceName(voice).includes(name));

            let preferredVoices = allVoices.filter(v => v.lang.startsWith('en'));
            if (preferredVoices.length === 0) {
                preferredVoices = allVoices;
            }
            
            if (settings.voice === 'Female') {
                selectedVoice = preferredVoices.find(v => lowerCaseVoiceName(v).includes('google') && isFemale(v)) || 
                                preferredVoices.find(isFemale) || 
                                preferredVoices.find(v => !isMale(v));
            } else { // Male
                selectedVoice = preferredVoices.find(v => lowerCaseVoiceName(v).includes('google') && isMale(v)) || 
                                preferredVoices.find(isMale) ||
                                preferredVoices.find(v => !isFemale(v));
            }
            utterance.lang = selectedVoice?.lang || 'en-US';
        }
        
        utterance.voice = selectedVoice || allVoices.find(v => v.lang.startsWith(utterance.lang.split('-')[0])) || allVoices[0] || null;
    } else {
        utterance.lang = settings.language === 'Hindi' ? 'hi-IN' : 'en-US';
    }
    
    utterance.onend = () => {
        if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
        const event = e as SpeechSynthesisErrorEvent;
        // The 'interrupted' error is expected when speech is cancelled by the user.
        // We can safely ignore it to avoid cluttering the console.
        if (event.error !== 'interrupted') {
          console.error("Speech synthesis error:", event.error);
        }
        if (onEnd) onEnd(); // Ensure UI state is reset (e.g., pause button).
    };
    window.speechSynthesis.speak(utterance);

  }, [settings.voice, settings.language]);
  
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!isSpeechReady) {
        speechQueue.current = { text, onEnd };
        return;
    }
    performSpeech(text, onEnd);
  }, [isSpeechReady, performSpeech]);

  useEffect(() => {
    const checkVoicesAndSpeak = () => {
        if (typeof window.speechSynthesis === 'undefined') return;
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            setIsSpeechReady(true);
            window.speechSynthesis.onvoiceschanged = null;
            
            if (speechQueue.current) {
                const { text, onEnd } = speechQueue.current;
                speechQueue.current = null;
                performSpeech(text, onEnd);
            }
        }
    };

    checkVoicesAndSpeak();
    if (typeof window.speechSynthesis !== 'undefined' && !isSpeechReady) {
        window.speechSynthesis.onvoiceschanged = checkVoicesAndSpeak;
    }

    return () => {
        if (typeof window.speechSynthesis !== 'undefined') {
            window.speechSynthesis.onvoiceschanged = null;
        }
    };
  }, [isSpeechReady, performSpeech]);

  const cancelSpeech = useCallback(() => {
    speechQueue.current = null;
    if (typeof window.speechSynthesis !== 'undefined') {
      window.speechSynthesis.cancel();
    }
  }, []);

  const value = useMemo(() => ({
    settings,
    setSettings,
    recognitionResult,
    setRecognitionResult,
    capturedImage,
    setCapturedImage,
    isLoading,
    setIsLoading,
    error,
    setError,
    unlockAudio,
    speak,
    cancelSpeech,
  }), [
      settings, 
      recognitionResult, 
      capturedImage, 
      isLoading, 
      error, 
      unlockAudio, 
      speak, 
      cancelSpeech
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};