import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CameraScreen } from './components/CameraScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultScreen } from './components/ResultScreen';
import { ObjectInfoScreen } from './components/ObjectInfoScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav } from './components/BottomNav';


const AppContent: React.FC = () => {
    const location = useLocation();
    const showBottomNav = ['/result', '/info', '/settings', '/welcome'].includes(location.pathname);

    useEffect(() => {
        const preventVolumeKeyNavigation = (event: KeyboardEvent) => {
            if (event.key === 'AudioVolumeUp' || event.key === 'AudioVolumeDown') {
                event.stopPropagation();
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                const target = event.target as HTMLElement;
                const isEditable = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName.toUpperCase());
                if (!isEditable) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        };

        document.addEventListener('keydown', preventVolumeKeyNavigation, true);
        return () => {
            document.removeEventListener('keydown', preventVolumeKeyNavigation, true);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-[color:var(--c-background)] pb-24">
            <main className="page" key={location.pathname}>
                <Routes>
                  <Route path="/welcome" element={<WelcomeScreen />} />
                  <Route path="/camera" element={<CameraScreen />} />
                  <Route path="/processing" element={<ProcessingScreen />} />
                  <Route path="/result" element={<ResultScreen />} />
                  <Route path="/info" element={<ObjectInfoScreen />} />
                  <Route path="/settings" element={<SettingsScreen />} />
                  
                  <Route path="/" element={<Navigate to="/welcome" replace />} />
                  <Route path="*" element={<Navigate to="/welcome" replace />} />
                </Routes>
            </main>
            {showBottomNav && <BottomNav />}
        </div>
    );
};


const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;