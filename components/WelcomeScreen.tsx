import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAppContext } from '../context/AppContext';
import { MascotIcon } from './icons';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { unlockAudio } = useAppContext();

  const handleGetStarted = () => {
    unlockAudio();
    navigate('/camera');
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-b from-[color:var(--c-primary-light)] to-white p-8 overflow-hidden">
      <div className="text-center w-full max-w-md flex flex-col items-center">
        <div 
            className="w-48 h-48 animate-pop-in" 
            style={{ animationDelay: '100ms' }}>
            <MascotIcon className="w-full h-full"/>
        </div>
        <h1 
            className="text-4xl lg:text-5xl font-extrabold text-[color:var(--c-text-primary)] mt-8 animate-pop-in" 
            style={{ animationDelay: '200ms' }}>
            {t('welcomeTitle')}
        </h1>
        <p 
            className="mt-4 text-lg text-[color:var(--c-text-secondary)] animate-pop-in" 
            style={{ animationDelay: '300ms' }}>
          {t('welcomeDesc')}
        </p>
      </div>
      <div className="w-full max-w-md animate-pop-in mt-12" style={{ animationDelay: '400ms' }}>
          <button
            onClick={handleGetStarted}
            className="w-full bg-gradient-to-r from-[color:var(--c-secondary)] to-[color:var(--c-accent)] hover:scale-105 active:scale-100 text-white font-extrabold py-5 px-4 rounded-full text-2xl shadow-lg shadow-[color:var(--c-secondary)]/30 transition-transform duration-200"
          >
            {t('getStarted')}
          </button>
      </div>
    </div>
  );
};