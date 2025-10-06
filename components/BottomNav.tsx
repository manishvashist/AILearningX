import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, LearnIcon, SettingsIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

const NavItem: React.FC<{ to: string, icon: (isActive: boolean) => React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/result' && (location.pathname === '/info' || location.pathname === '/result'));

  const activeClasses = 'text-white';
  const inactiveClasses = 'text-[color:var(--c-text-secondary)]';

  return (
    <NavLink 
      to={to} 
      className="relative flex-1 flex flex-col items-center justify-center h-full"
    >
      <div className={`relative z-10 flex flex-col items-center justify-center transition-all duration-300 transform ${isActive ? 'scale-110' : 'scale-100'}`}>
        {icon(isActive)}
        <span className={`text-xs font-bold mt-1 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-100'}`}>{label}</span>
      </div>
      {isActive && (
        <div className="absolute inset-0 bg-[color:var(--c-primary)] rounded-full m-2 transition-all duration-300 animate-pop-in z-0"></div>
      )}
    </NavLink>
  );
};

export const BottomNav: React.FC = () => {
  const t = useTranslation();
  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-20 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-full flex justify-around items-center shadow-2xl z-50">
      <NavItem to="/welcome" icon={(active) => <HomeIcon className="h-7 w-7" filled={active} />} label={t('home')} />
      <NavItem to="/result" icon={(active) => <LearnIcon className="h-7 w-7" filled={active} />} label={t('learn')} />
      <NavItem to="/settings" icon={(active) => <SettingsIcon className="h-7 w-7" filled={active} />} label={t('settings')} />
    </footer>
  );
};