import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { recognizeObject } from '../services/geminiService';
import { useTranslation } from '../hooks/useTranslation';
import { resizeImage } from '../utils/imageUtils';
import { MascotIcon } from './icons';

export const ProcessingScreen: React.FC = () => {
  const { capturedImage, setRecognitionResult, setIsLoading, setError, settings } = useAppContext();
  const navigate = useNavigate();
  const t = useTranslation();

  useEffect(() => {
    const processImage = async () => {
      if (!capturedImage) {
        navigate('/welcome', { replace: true });
        return;
      }

      try {
        const resizedImage = await resizeImage(capturedImage, 800, 800);
        const result = await recognizeObject(resizedImage, settings.language);

        if ('error' in result) {
            setError(result.error);
            setRecognitionResult(null);
        } else {
            setRecognitionResult(result);
            setError(null);
        }
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
        setRecognitionResult(null);
      } finally {
        setIsLoading(false);
        navigate('/result');
      }
    };

    const timer = setTimeout(processImage, 500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage, navigate, setRecognitionResult, setIsLoading, setError, settings.language]);

  return (
    <div className="flex flex-col h-screen bg-white items-center justify-center text-center p-4">
        <div className="relative mb-8">
            {capturedImage && (
                <div className="p-2 bg-white rounded-3xl shadow-lg">
                    <img 
                        src={`data:image/jpeg;base64,${capturedImage}`} 
                        alt="Captured for processing" 
                        className="w-48 h-48 object-cover rounded-2xl"
                    />
                </div>
            )}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 animate-searching">
                <MascotIcon />
            </div>
        </div>

        <h1 className="text-3xl font-extrabold text-[color:var(--c-text-primary)] mt-12">{t('analyzing')}</h1>
        <p className="text-lg text-[color:var(--c-text-secondary)] mt-2">Let's see what this is...</p>
    </div>
  );
};