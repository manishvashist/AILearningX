import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const Layout: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[color:var(--c-background)] pb-20">
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};