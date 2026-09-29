import React, { useState, useEffect, useMemo } from 'react';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { GlossaryTerm } from '../types';
import {
  X,
  Search,
  BookOpen,
  Cpu,
  Coins,
  Network,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTermId?: string | null;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  initialTermId
}) => {
  const [selectedTermId, setSelectedTermId] = useState<string>('serdes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Update selected term if initialTermId changes when opening
  useEffect(() => {
    if (initialTermId && GLOSSARY_TERMS.some((t) => t.id === initialTermId)) {
      setSelectedTermId(initialTermId);
    }
  }, [initialTermId, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((term) => {
      const matchesCategory =
        selectedCategory === 'all' || term.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        term.term.toLowerCase().includes(q) ||
        term.fullTerm.toLowerCase().includes(q) ||
        term.koreanName.toLowerCase().includes(q) ||
        term.summary.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const activeTerm = useMemo(() => {
    return (
      GLOSSARY_TERMS.find((t) => t.id === selectedTermId) ||
      filteredTerms[0] ||
      GLOSSARY_TERMS[0]
    );
  }, [selectedTermId, filteredTerms]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hardware':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'economics':
        return <Coins className="w-3.5 h-3.5" />;
      case 'architecture':
        return <Network className="w-3.5 h-3.5" />;
      case 'protocol':
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'hardware':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'economics':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'architecture':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'protocol':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 sm:py-8 bg-gray-900/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-gray-800"
        onClick={(e) => e.stopPropagation()}
        id="glossary-modal-content"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="glossary-modal-title"
                className="text-base sm:text-lg font-bold text-gray-900 flex items-center"
              >
                임베디드 비전 핵심 기술 용어 사전
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {GLOSSARY_TERMS.length} Terms
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                SerDes, BOM, NRE, 신호 무결성(SI) 등 카메라 인터페이스 필수 엔지니어링 개념 해설
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200/60 transition-colors"
            aria-label="용어 사전 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two-Column Responsive Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: Search & Term List */}
          <div className="md:col-span-5 border-r border-gray-200 flex flex-col bg-gray-50/40 min-h-0">
            {/* Search Input */}
            <div className="p-3.5 border-b border-gray-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="용어 검색 (예: SerDes, BOM, NRE, 무결성)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1 mt-2.5">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'hardware', label: '하드웨어' },
                  { id: 'economics', label: '비용/원가' },
                  { id: 'architecture', label: '아키텍처' },
                  { id: 'protocol', label: '프로토콜' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Terms */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
              {filteredTerms.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  <HelpCircle className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  검색 결과가 없습니다.
                </div>
              ) : (
                filteredTerms.map((term) => {
                  const isSelected = activeTerm.id === term.id;
                  return (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => setSelectedTermId(term.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                        isSelected
                          ? 'bg-white border-indigo-300 shadow-xs ring-1 ring-indigo-500/20'
                          : 'bg-transparent border-transparent hover:bg-white/80 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold text-xs ${
                            isSelected ? 'text-indigo-600' : 'text-gray-900'
                          }`}
                        >
                          {term.term}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border font-medium flex items-center gap-1 ${getCategoryBadgeClass(
                            term.category
                          )}`}
                        >
                          {getCategoryIcon(term.category)}
                          {term.categoryLabel.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-gray-500 mt-0.5">
                        {term.koreanName}
                      </div>
                      <div className="text-[11px] text-gray-400 line-clamp-1 mt-1 leading-tight">
                        {term.summary}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Term Detailed View */}
          <div className="md:col-span-7 p-6 overflow-y-auto bg-white flex flex-col space-y-5">
            {/* Term Title & Badge */}
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold inline-flex items-center gap-1.5 ${getCategoryBadgeClass(
                    activeTerm.category
                  )}`}
                >
                  {getCategoryIcon(activeTerm.category)}
                  {activeTerm.categoryLabel}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  ID: {activeTerm.id}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
                {activeTerm.term}
              </h2>
              <div className="text-xs sm:text-sm font-semibold text-indigo-700 mt-0.5">
                {activeTerm.fullTerm} · <span className="text-gray-600">{activeTerm.koreanName}</span>
              </div>
              <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 font-medium">
                💡 {activeTerm.summary}
              </p>
            </div>

            {/* Core Explanation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center">
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                기술적 정의 및 동작 원리
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed bg-white">
                {activeTerm.description}
              </p>
            </div>

            {/* Relevance to MIPI vs GMSL2 vs USB */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                인터페이스 아키텍처 비교 맥락 (MIPI vs GMSL2 vs USB)
              </h4>
              <p className="text-xs text-indigo-900 leading-relaxed">
                {activeTerm.relevance}
              </p>
            </div>

            {/* Engineering Tip & Practical Consideration */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-1.5">
              <h4 className="text-xs font-bold text-amber-950 flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                실무 엔지니어링 고려사항 & 설계 팁
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                {activeTerm.engineeringTip}
              </p>
            </div>

            {/* Related Terms Navigation */}
            {activeTerm.relatedTermIds && activeTerm.relatedTermIds.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 block mb-2">
                  연관 기술 용어 바로가기:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeTerm.relatedTermIds.map((relId) => {
                    const relTerm = GLOSSARY_TERMS.find((t) => t.id === relId);
                    if (!relTerm) return null;
                    return (
                      <button
                        key={relId}
                        type="button"
                        onClick={() => setSelectedTermId(relId)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-gray-200 transition-colors flex items-center space-x-1"
                      >
                        <span className="font-semibold">{relTerm.term}</span>
                        <span className="text-[10px] text-gray-500">
                          ({relTerm.koreanName.split(' ')[0]})
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-400 ml-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">단축키:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-600 shadow-2xs">
              ESC
            </kbd>
            <span>를 누르면 닫힙니다.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
