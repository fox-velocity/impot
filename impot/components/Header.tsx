import React from 'react';
import { ComponentProps } from '../types';
import { Layout } from 'lucide-react';

interface HeaderProps extends ComponentProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title, className = '' }) => {
  return (
    <header className={`bg-white border-b border-slate-200 sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Layout size={20} />
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <span className="text-sm font-medium text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors">Documentation</span>
          <span className="text-sm font-medium text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors">Support</span>
        </nav>
      </div>
    </header>
  );
};