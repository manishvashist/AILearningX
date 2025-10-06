import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateStory, generateUtilityInfo } from '../services/geminiService';
import type { StoryResult, UtilityResult } from '../types';
import { BackArrowIcon, PlayIcon, PauseIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

export const ObjectInfoScreen: React.FC = () => {
  const { recognitionResult, setError, speak, cancelSpeech, settings } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Story' | 'Utility'>('Story');
  const [storyData, setStoryData] = useState<StoryResult | null>(null);
  const [utilityData, setUtilityData] = useState<UtilityResult | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const t = useTranslation();

  const textSizeClass = {
    Small: 'text-base',
    Medium: 'text-lg',
    Large: 'text-xl'
  }[settings.textSize];

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, [cancelSpeech]);

  const currentText = activeTab === 'Story' ? storyData?.story : utilityData?.utility;

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      cancelSpeech();
      setIsPlaying(false);
    } else if (currentText) {
      speak(currentText, () => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [isPlaying, currentText, speak, cancelSpeech]);
  
  const handleTabClick = useCallback((tab: 'Story' | 'Utility') => {
    if (activeTab === tab) return;
    
    cancelSpeech();
    setIsPlaying(false);
    setActiveTab(tab);
  }, [activeTab, cancelSpeech]);

  useEffect(() => {
    if (!recognitionResult) return;

    const loadData = async () => {
      if ((activeTab === 'Story' && storyData) || (activeTab === 'Utility' && utilityData)) {
          return;
      }

      setIsContentLoading(true);
      try {
        if (activeTab === 'Story') {
          const result = await generateStory(recognitionResult.objectName, settings.language);
          setStoryData(result);
        } else if (activeTab === 'Utility') {
          const result = await generateUtilityInfo(recognitionResult.objectName, settings.language);
          setUtilityData(result);
        }
      } catch (e: any) {
        setError('Failed to load content.');
      } finally {
        setIsContentLoading(false);
      }
    };

    loadData();
  }, [activeTab, recognitionResult, storyData, utilityData, setError, settings.language]);

  useEffect(() => {
    if (!recognitionResult) {
      navigate('/welcome', { replace: true });
    }
  }, [recognitionResult, navigate]);
  
  const goBack = () => {
      navigate('/result');
  }

  if (!recognitionResult) {
    return null;
  }

  return (
    <div className="bg-[color:var(--c-background)] min-h-[calc(100vh-6rem)]">
      <header className="flex items-center p-4 bg-transparent sticky top-0 z-20">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100 text-[color:var(--c-text-secondary)] hover:text-[color:var(--c-primary)]">
          <BackArrowIcon className="h-7 w-7" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 mx-auto">{t('objectInfoHeader')}</h1>
        <div className="w-11"></div>
      </header>

      {recognitionResult && (
        <>
            <div className="w-full overflow-x-auto whitespace-nowrap scroll-smooth snap-x snap-mandatory px-4 py-2 flex space-x-4">
                <img src={recognitionResult.imageUrl} alt={recognitionResult.objectName} className="h-48 w-48 object-cover inline-block snap-center rounded-3xl shadow-lg"/>
                {storyData?.imageUrl && <img src={storyData.imageUrl} alt="Story illustration" className="h-48 w-48 object-cover inline-block snap-center rounded-3xl shadow-lg"/>}
            </div>

            <div className="bg-white rounded-t-3xl p-6 shadow-top-strong z-10 mt-4 relative">
                 <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => handleTabClick('Story')}
                        className={`text-center font-extrabold text-lg py-4 rounded-xl transition-all duration-300 ${activeTab === 'Story' ? 'bg-[color:var(--c-primary)] text-white shadow-lg' : 'bg-white text-[color:var(--c-text-secondary)] shadow-md'}`}
                    >
                        {t('storyTab')}
                    </button>
                    <button
                        onClick={() => handleTabClick('Utility')}
                         className={`text-center font-extrabold text-lg py-4 rounded-xl transition-all duration-300 ${activeTab === 'Utility' ? 'bg-[color:var(--c-primary)] text-white shadow-lg' : 'bg-white text-[color:var(--c-text-secondary)] shadow-md'}`}
                    >
                        {t('utilityTab')}
                    </button>
                </div>
                
                <div className="mt-6 min-h-[16rem]">
                {isContentLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-12 h-12 border-4 border-[color:var(--c-primary)] border-b-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="animate-pop-in">
                        {activeTab === 'Story' && storyData && (
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-800">{t('adventureTitle', { objectName: recognitionResult.objectName })}</h2>
                                <p className={`mt-4 text-gray-600 leading-relaxed ${textSizeClass}`}>{storyData.story}</p>
                            </div>
                        )}
                        {activeTab === 'Utility' && utilityData && (
                             <div>
                                <h2 className="text-3xl font-extrabold text-gray-800">{t('whatIsItFor')}</h2>
                                <p className={`mt-4 text-gray-600 leading-relaxed ${textSizeClass}`}>{utilityData.utility}</p>
                            </div>
                        )}
                    </div>
                )}
                </div>

                {!isContentLoading && currentText && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handlePlayPause}
                            className="flex items-center justify-center h-20 w-20 bg-[color:var(--c-primary)] hover:scale-105 active:scale-95 text-white font-bold rounded-full text-lg shadow-lg transition-transform duration-200"
                            aria-label={isPlaying ? t('pauseNarration') : t('playNarration')}
                        >
                            {isPlaying ? <PauseIcon className="h-10 w-10" /> : <PlayIcon className="h-10 w-10 ml-1" />}
                        </button>
                    </div>
                )}
            </div>
        </>
      )}
    </div>
  );
};