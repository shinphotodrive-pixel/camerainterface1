import React, { useState } from 'react';
import { TabType } from './types';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { OverviewTab } from './components/OverviewTab';
import { TechnicalTab } from './components/TechnicalTab';
import { InstallationTab } from './components/InstallationTab';
import { TcoTab } from './components/TcoTab';
import { SelectorTab } from './components/SelectorTab';
import { GlossaryModal } from './components/GlossaryModal';
import { BookOpen, Award, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [selectedGlossaryTermId, setSelectedGlossaryTermId] = useState<string | null>('serdes');

  const openGlossary = (termId: string) => {
    setSelectedGlossaryTermId(termId);
    setIsGlossaryOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-gray-800 antialiased font-sans" id="app-root">
      {/* Header with Navigation */}
      <Header activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full" id="main-content">
        {/* Executive Summary Intro Box with Interactive Glossary Terms */}
        <div className="mb-6 bg-white p-5 sm:p-6 rounded-xl border border-gray-200/90 shadow-xs" id="executive-summary-banner">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 shadow-2xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                    임베디드 비전 시스템 인터페이스 아키텍처 비교 분석 보고서
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                    Executive Summary
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  현대 엣지 AI, 자율주행(ADAS), 산업용 로보틱스 및 머신비전 시스템에서는 고해상도 시각 데이터의 실시간 전송과{' '}
                  <button
                    type="button"
                    onClick={() => openGlossary('deterministic-latency')}
                    className="inline-flex items-center px-1.5 py-0.2 mx-0.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                    title="클릭하여 '결정론적 지연 시간' 해설 보기"
                  >
                    결정론적 지연 시간
                    <HelpCircle className="w-3 h-3 ml-0.5 text-indigo-500" />
                  </button>
                  이 전체 파이프라인의 성패를 좌우합니다. 본 대시보드는{' '}
                  <button
                    type="button"
                    onClick={() => openGlossary('mipi-csi2')}
                    className="inline-flex items-center px-1.5 py-0.2 mx-0.5 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-900 border border-blue-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                    title="클릭하여 'MIPI CSI-2' 해설 보기"
                  >
                    MIPI CSI-2
                    <HelpCircle className="w-3 h-3 ml-0.5 text-blue-500" />
                  </button>
                  (온보드 초저지연 직결),{' '}
                  <button
                    type="button"
                    onClick={() => openGlossary('serdes')}
                    className="inline-flex items-center px-1.5 py-0.2 mx-0.5 text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-900 border border-red-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                    title="클릭하여 'SerDes (GMSL2)' 해설 보기"
                  >
                    GMSL2 SerDes
                    <HelpCircle className="w-3 h-3 ml-0.5 text-red-500" />
                  </button>
                  (차량용/산업용 장거리 신뢰성 및{' '}
                  <button
                    type="button"
                    onClick={() => openGlossary('poc')}
                    className="inline-flex items-center px-1.5 py-0.2 mx-0.5 text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-900 border border-red-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                    title="클릭하여 'PoC (Power over Coax)' 해설 보기"
                  >
                    PoC
                    <HelpCircle className="w-3 h-3 ml-0.5 text-red-500" />
                  </button>
                  단일 배선), 그리고{' '}
                  <button
                    type="button"
                    onClick={() => openGlossary('usb3-vision')}
                    className="inline-flex items-center px-1.5 py-0.2 mx-0.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                    title="클릭하여 'USB3 Vision' 해설 보기"
                  >
                    USB 3.0 / USB3 Vision
                    <HelpCircle className="w-3 h-3 ml-0.5 text-emerald-500" />
                  </button>
                  (범용 플러그 앤 플레이)의 기술 사양,{' '}
                  <button
                    type="button"
                    onClick={() => openGlossary('signal-integrity')}
                    className="inline-flex items-center px-1.5 py-0.2 mx-0.5 text-purple-700 bg-purple-50 hover:bg-purple-100 hover:text-purple-900 border border-purple-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                    title="클릭하여 '신호 무결성 (Signal Integrity)' 해설 보기"
                  >
                    신호 무결성 (Signal Integrity)
                    <HelpCircle className="w-3 h-3 ml-0.5 text-purple-500" />
                  </button>
                  , 하드웨어{' '}
                  <button
                    type="button"
                    onClick={() => openGlossary('bom')}
                    className="inline-flex items-center px-1.5 py-0.2 mx-0.5 text-amber-800 bg-amber-50 hover:bg-amber-100 hover:text-amber-950 border border-amber-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                    title="클릭하여 'BOM (Bill of Materials)' 해설 보기"
                  >
                    BOM
                    <HelpCircle className="w-3 h-3 ml-0.5 text-amber-600" />
                  </button>
                  {' / '}
                  <button
                    type="button"
                    onClick={() => openGlossary('nre')}
                    className="inline-flex items-center px-1.5 py-0.2 mx-0.5 text-amber-800 bg-amber-50 hover:bg-amber-100 hover:text-amber-950 border border-amber-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                    title="클릭하여 'NRE (Non-Recurring Engineering)' 해설 보기"
                  >
                    NRE
                    <HelpCircle className="w-3 h-3 ml-0.5 text-amber-600" />
                  </button>
                  {' '}비용, 물리적 설치 배선 및 미래 기술 동향을 종합 분석하여 최적의 비전 아키텍처 선택을 지원합니다.
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>위 문장의 <strong>강조된 기술 용어(SerDes, BOM, NRE, 신호 무결성 등)</strong>를 클릭하면 심층 엔지니어링 용어 사전 모달이 열립니다.</span>
                </div>
              </div>
            </div>

            {/* Quick Glossary Trigger Button */}
            <div className="shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => openGlossary('serdes')}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>기술 용어 사전 열기</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 Quick Metric Cards */}
        <MetricCards onSelectTab={setActiveTab} />

        {/* Active Tab Content */}
        <div className="transition-opacity duration-200" id="tab-container">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'technical' && <TechnicalTab />}
          {activeTab === 'installation' && <InstallationTab />}
          {activeTab === 'tco' && <TcoTab />}
          {activeTab === 'selector' && <SelectorTab />}
        </div>
      </main>

      {/* Technical Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        initialTermId={selectedGlossaryTermId}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12" id="main-footer">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 space-y-1.5">
          <div className="flex items-center justify-center space-x-2 text-gray-700 font-semibold mb-1">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>임베디드 비전 카메라 인터페이스 규격 분석 시스템</span>
          </div>
          <p className="text-gray-500">
            GMSL2 · MIPI CSI-2 · USB 3.0 / USB3 Vision 기술성, 경제성, 기계적 설치성 비교 연구
          </p>
          <p className="text-gray-400 text-[11px] pt-2">
            본 대시보드는 자율주행, 머신비전, 산업용 로보틱스 시스템 설계자를 위한 기술 사양 데이터셋을 기반으로 실시간 렌더링됩니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
