import type { Dispatch, SetStateAction } from 'react';

export interface Settings {
  language: string;
  voice: string;
  textSize: 'Small' | 'Medium' | 'Large';
}

export interface RecognitionResult {
  objectName: string;
  description: string;
  imageUrl: string;
}

export interface StoryResult {
  story: string;
  imageUrl: string;
}

export interface UtilityResult {
    utility: string;
}

export interface AppContextType {
  settings: Settings;
  // FIX: Use imported Dispatch and SetStateAction types to resolve 'React' namespace error.
  setSettings: Dispatch<SetStateAction<Settings>>;
  recognitionResult: RecognitionResult | null;
  // FIX: Use imported Dispatch and SetStateAction types to resolve 'React' namespace error.
  setRecognitionResult: Dispatch<SetStateAction<RecognitionResult | null>>;
  capturedImage: string | null;
  // FIX: Use imported Dispatch and SetStateAction types to resolve 'React' namespace error.
  setCapturedImage: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
  // FIX: Use imported Dispatch and SetStateAction types to resolve 'React' namespace error.
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  // FIX: Use imported Dispatch and SetStateAction types to resolve 'React' namespace error.
  setError: Dispatch<SetStateAction<string | null>>;
  unlockAudio: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  cancelSpeech: () => void;
}