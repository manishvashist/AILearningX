import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BackArrowIcon, GlobeIcon, MicrophoneIcon, TextSizeIcon, ChevronRightIcon } from './icons';
import type { Settings } from '../types';
import { useTranslation } from '../hooks/useTranslation';

type SettingProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick: () => void;
};

const SettingItem: React.FC<SettingProps> = React.memo(({ icon, label, value, onClick }) => (
  <button 
    onClick={onClick} 
    className="flex items-center w-full p-4 bg-white rounded-2xl text-left shadow-md border-2 border-transparent hover:border-[color:var(--c-primary)] active:scale-[0.98] transition-all duration-200"
  >
    <div className="p-4 bg-[color:var(--c-primary-light)] rounded-xl mr-5">
      {React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8" })}
    </div>
    <div className="flex-grow">
      <p className="font-semibold text-sm text-[color:var(--c-text-secondary)]">{label}</p>
      <p className="font-bold text-xl text-[color:var(--c-text-primary)]">{value}</p>
    </div>
    <div className="text-[color:var(--c-text-tertiary)]">
      <ChevronRightIcon className="h-7 w-7" />
    </div>
  </button>
));
SettingItem.displayName = 'SettingItem';

export const SettingsScreen: React.FC = () => {
  const { settings, setSettings } = useAppContext();
  const navigate = useNavigate();
  const t = useTranslation();

  const handleSettingChange = (key: keyof Settings, values: any[]) => {
    const currentIndex = values.indexOf(settings[key]);
    const nextIndex = (currentIndex + 1) % values.length;
    setSettings(prev => ({ ...prev, [key]: values[nextIndex] }));
  };

  return (
    <div className="bg-[color:var(--c-background)] min-h-[calc(100vh-6rem)]">
        <header className="flex items-center p-4 bg-transparent sticky top-0 z-20">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 text-[color:var(--c-text-secondary)] hover:text-[color:var(--c-primary)]">
              <BackArrowIcon className="h-7 w-7" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 mx-auto">{t('settingsHeader')}</h1>
             <div className="w-11"></div>
        </header>

        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-sm font-extrabold text-gray-500 mb-2 px-2 uppercase tracking-wider">{t('language')}</h2>
                <SettingItem
                    icon={<GlobeIcon className="text-[color:var(--c-primary)]"/>}
                    label={t('appLanguage')}
                    value={settings.language}
                    onClick={() => handleSettingChange('language', ['English', 'Hindi'])}
                />
            </div>
            <div>
                <h2 className="text-sm font-extrabold text-gray-500 mb-2 px-2 uppercase tracking-wider">{t('audio')}</h2>
                <SettingItem
                    icon={<MicrophoneIcon className="text-[color:var(--c-secondary)]"/>}
                    label={t('voice')}
                    value={settings.voice}
                    onClick={() => handleSettingChange('voice', ['Female', 'Male'])}
                />
            </div>
            <div>
                <h2 className="text-sm font-extrabold text-gray-500 mb-2 px-2 uppercase tracking-wider">{t('accessibility')}</h2>
                <SettingItem
                    icon={<TextSizeIcon className="text-[color:var(--c-accent)]"/>}
                    label={t('textSize')}
                    value={settings.textSize}
                    onClick={() => handleSettingChange('textSize', ['Small', 'Medium', 'Large'])}
                />
            </div>
        </div>
    </div>
  );
};