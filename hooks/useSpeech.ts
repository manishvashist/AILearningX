
import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const useSpeech = (text: string | null) => {
  const { speak, cancelSpeech } = useAppContext();

  useEffect(() => {
    if (text) {
      speak(text);
    }
    // Cleanup function to stop speech when component unmounts or text changes
    return () => {
      cancelSpeech();
    };
  }, [text, speak, cancelSpeech]);
};
