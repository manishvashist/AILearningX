import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BackArrowIcon, PlayIcon, PauseIcon, CameraIcon, LearnIcon, PuzzledMascotIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

const SuccessScreen: React.FC = () => {
    const { recognitionResult, speak, cancelSpeech, settings } = useAppContext();
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const t = useTranslation();

    const textSizeClass = {
        Small: 'text-base',
        Medium: 'text-lg',
        Large: 'text-xl',
    }[settings.textSize];

    const speechText = recognitionResult ? `${recognitionResult.objectName}. ${recognitionResult.description}` : '';

    const handlePlayPause = useCallback(() => {
        if (isPlaying) {
            cancelSpeech();
            setIsPlaying(false);
        } else if (speechText) {
            speak(speechText, () => setIsPlaying(false));
            setIsPlaying(true);
        }
    }, [isPlaying, cancelSpeech, speak, speechText]);

    useEffect(() => {
        return () => {
            cancelSpeech();
        };
    }, [cancelSpeech]);

    if (!recognitionResult) return null;

    return (
        <div className="flex flex-col items-center justify-start w-full h-full text-center p-4 animate-pop-in">
            <div className="relative w-full max-w-sm mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-3">
                     <img src={recognitionResult.imageUrl} alt={recognitionResult.objectName} className="w-full aspect-square object-cover rounded-2xl" />
                </div>
                <button
                    onClick={handlePlayPause}
                    className="absolute -bottom-8 right-8 flex items-center justify-center h-20 w-20 bg-[color:var(--c-primary)] hover:scale-105 active:scale-95 text-white font-bold rounded-full shadow-lg transition-transform duration-200"
                    aria-label={isPlaying ? t('pauseDescription') : t('playDescription')}
                >
                    {isPlaying ? <PauseIcon className="h-10 w-10 text-white" /> : <PlayIcon className="h-10 w-10 text-white ml-1" />}
                </button>
            </div>
            
            <div className="mt-12">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-[color:var(--c-text-primary)] capitalize">{recognitionResult.objectName}</h1>
                 <p className={`mt-2 text-[color:var(--c-text-secondary)] max-w-md mx-auto ${textSizeClass}`}>{recognitionResult.description}</p>
            </div>

            <button
                onClick={() => navigate('/info')}
                className="mt-8 inline-flex items-center gap-3 bg-gradient-to-r from-[color:var(--c-secondary)] to-[color:var(--c-accent)] hover:scale-105 active:scale-100 text-white font-extrabold py-4 px-8 rounded-full text-lg shadow-lg shadow-[color:var(--c-secondary)]/30 transition-transform duration-200"
            >
                <LearnIcon className="h-6 w-6" />
                {t('listenToStory', { objectName: recognitionResult.objectName })}
            </button>
        </div>
    );
};

const FailureScreen: React.FC = () => {
    const navigate = useNavigate();
    const { speak, cancelSpeech } = useAppContext();
    const t = useTranslation();

    useEffect(() => {
        const message = t('failureSpeech');
        speak(message);
        return () => {
          cancelSpeech();
        };
      }, [speak, cancelSpeech, t]);

    return (
        <div className="text-center flex flex-col items-center justify-center h-full animate-pop-in">
             <div className="w-40 h-40 mb-6">
                <PuzzledMascotIcon />
            </div>
            <p className="text-3xl font-extrabold text-gray-800">{t('tryAgain')}</p>
            <p className="text-lg mt-1 text-[color:var(--c-text-secondary)]">{t('couldNotRecognize')}</p>
            <button
                onClick={() => navigate('/camera')}
                className="mt-8 inline-flex items-center justify-center gap-3 w-full max-w-sm bg-[color:var(--c-primary)] hover:scale-105 active:scale-100 text-white font-bold py-4 px-6 rounded-full text-lg shadow-lg shadow-[color:var(--c-primary)]/30 transition-transform duration-200"
            >
                <CameraIcon className="h-6 w-6" />
                {t('retake')}
            </button>
        </div>
    );
};

export const ResultScreen: React.FC = () => {
    const { recognitionResult, error, isLoading, setCapturedImage, capturedImage } = useAppContext();
    const navigate = useNavigate();
    const t = useTranslation();

    useEffect(() => {
        if (!isLoading && !recognitionResult && !error && !capturedImage) {
            navigate('/welcome', { replace: true });
        }
    }, [isLoading, recognitionResult, error, capturedImage, navigate]);

    const handleBack = () => {
        setCapturedImage(null);
        navigate('/camera');
    }

    if (isLoading) {
        return null;
    }
    
    if (!recognitionResult && !error && !capturedImage) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-6rem)] p-4">
             <header className="flex items-center w-full mb-4">
                 <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100 text-[color:var(--c-text-secondary)] hover:text-[color:var(--c-primary)]">
                    <BackArrowIcon className="h-7 w-7" />
                </button>
                <h1 className="text-xl font-bold text-gray-800 mx-auto">{t('objectRecognitionHeader')}</h1>
                <div className="w-11"></div>
            </header>
            <main className="flex-grow flex items-center justify-center">
                {error || !recognitionResult ? <FailureScreen /> : <SuccessScreen />}
            </main>
        </div>
    );
};