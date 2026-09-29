import React from 'react';
import { TabType } from '../types';
import { Camera, Layers, Cpu, Wrench, DollarSign, Compass } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '종합 비교', icon: <Layers className="w-4 h-4" /> },
    { id: 'technical', label: '기술 성능', icon: <Cpu className="w-4 h-4" /> },
    { id: 'installation', label: '기계 & 설치성', icon: <Wrench className="w-4 h-4" /> },
    { id: 'tco', label: 'TCO & 경제성', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'selector', label: '인터페이스 추천기', icon: <Compass className="w-4 h-4" /> }
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  카메라 인터페이스 규격 심층 분석 대시보드
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-gray-100 text-gray-600 rounded">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                GMSL2 · MIPI CSI-2 · USB 3.0 / USB3 Vision 기술 & 경제성 비교
              </p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-1 lg:space-x-2 text-xs font-semibold" id="desktop-nav">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/70 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex overflow-x-auto border-t border-gray-100 bg-gray-50/80 px-2 py-1.5 text-xs space-x-1 scrollbar-none" id="mobile-nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-gray-700 border border-gray-200/80'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
