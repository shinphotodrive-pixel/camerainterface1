import React, { useState, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileDown,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  Info,
  Calendar,
  User,
  FolderGit2
} from 'lucide-react';
import {
  ReportExportConfig,
  buildCsvReport,
  downloadCsvReport,
  downloadHtmlReport
} from '../utils/exportUtils';
import { SPEC_ROWS } from './TechnicalSpecSummaryTable';
import { INTERFACE_BENCHMARK_DATA } from './PowerAndDistanceBarChart';
import { COMPARISON_ROWS } from '../data/interfaceData';

interface TechnicalReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorData?: {
    resLabel: string;
    width: number;
    height: number;
    fps: number;
    bitDepth: number;
    cameraCount: number;
    gbps: number;
    mbytePerSec: number;
    mipiSupported: boolean;
    gmslSingleSupported: boolean;
    gmslDualSupported: boolean;
    usbSupported: boolean;
  };
  initialInterfaces?: {
    mipi: boolean;
    gmsl: boolean;
    usb: boolean;
  };
  defaultTab?: 'config' | 'preview';
}

export const TechnicalReportExportModal: React.FC<TechnicalReportExportModalProps> = ({
  isOpen,
  onClose,
  calculatorData,
  initialInterfaces = { mipi: true, gmsl: true, usb: true },
  defaultTab = 'config'
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>(defaultTab);

  // Interfaces to include
  const [selectedInterfaces, setSelectedInterfaces] = useState<{
    mipi: boolean;
    gmsl: boolean;
    usb: boolean;
  }>(initialInterfaces);

  // Sections to include
  const [includeSections, setIncludeSections] = useState({
    keySpecs: true,
    calculator: true,
    powerDistance: true,
    detailedSpecs: true,
    engineeringNotes: true
  });

  // Metadata
  const [reportTitle, setReportTitle] = useState(
    '임베디드 비전 카메라 인터페이스(MIPI vs GMSL2 vs USB) 기술 사양 비교 검토서'
  );
  const [projectName, setProjectName] = useState('차세대 자율주행 AMR 멀티비전 시스템');
  const [author, setAuthor] = useState('Vision Hardware Architecture Team');

  // Status feedback
  const [downloadSuccess, setDownloadSuccess] = useState<'csv' | 'pdf' | 'html' | null>(null);

  if (!isOpen) return null;

  const activeInterfaceCount = Object.values(selectedInterfaces).filter(Boolean).length;

  const toggleInterface = (key: 'mipi' | 'gmsl' | 'usb') => {
    if (activeInterfaceCount === 1 && selectedInterfaces[key]) {
      return; // Keep at least one
    }
    setSelectedInterfaces((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const applyPreset = (preset: 'all' | 'mipi-gmsl' | 'mipi-usb') => {
    if (preset === 'all') {
      setSelectedInterfaces({ mipi: true, gmsl: true, usb: true });
    } else if (preset === 'mipi-gmsl') {
      setSelectedInterfaces({ mipi: true, gmsl: true, usb: false });
    } else if (preset === 'mipi-usb') {
      setSelectedInterfaces({ mipi: true, gmsl: false, usb: true });
    }
  };

  const exportConfig: ReportExportConfig = {
    selectedInterfaces,
    includeSections,
    metadata: {
      title: reportTitle,
      author,
      projectName,
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      version: 'v1.4'
    },
    calculatorData
  };

  const handleDownloadCsv = () => {
    downloadCsvReport(
      exportConfig,
      `camera_interface_technical_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    setDownloadSuccess('csv');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleDownloadHtml = () => {
    downloadHtmlReport(
      exportConfig,
      `camera_interface_technical_report_${new Date().toISOString().slice(0, 10)}.html`
    );
    setDownloadSuccess('html');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handlePrintPdf = () => {
    // Invoke browser print dialog for the current frame
    setDownloadSuccess('pdf');
    setTimeout(() => {
      window.print();
      setDownloadSuccess(null);
    }, 150);
  };

  const activeKeys: ('mipi' | 'gmsl' | 'usb')[] = [];
  if (selectedInterfaces.mipi) activeKeys.push('mipi');
  if (selectedInterfaces.gmsl) activeKeys.push('gmsl');
  if (selectedInterfaces.usb) activeKeys.push('usb');

  return (
    <>
      {/* Screen Modal Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>기술 사양 비교 보고서 내보내기 (Export Report)</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                    PDF · CSV
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  선택한 인터페이스 및 실시간 계산 데이터를 엔지니어링 보고서로 구성하여 저장합니다.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation: Configure vs Preview */}
          <div className="px-6 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('config')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'config'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>보고서 구성 및 필터링</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>문서 미리보기 (Preview)</span>
              </button>
            </div>

            <div className="text-[11px] text-gray-500 hidden sm:flex items-center gap-1">
              <span>선택 인터페이스:</span>
              <span className="font-bold text-gray-900">{activeInterfaceCount}개</span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {activeTab === 'config' ? (
              <div className="space-y-6">
                {/* 1. Interface Selector */}
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/90">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                        <span>비교할 인터페이스 선택 (필수 1개 이상)</span>
                      </label>
                      <p className="text-[11px] text-gray-500">
                        보고서에 포함할 인터페이스를 선택하세요. 체크된 항목만 열(Column)로 출력됩니다.
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyPreset('all')}
                        className="px-2 py-1 text-[11px] font-semibold bg-white border border-gray-200 hover:border-indigo-300 rounded text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        전체 선택 (3종)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('mipi-gmsl')}
                        className="px-2 py-1 text-[11px] font-semibold bg-white border border-gray-200 hover:border-indigo-300 rounded text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        MIPI vs GMSL2
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('mipi-usb')}
                        className="px-2 py-1 text-[11px] font-semibold bg-white border border-gray-200 hover:border-indigo-300 rounded text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        MIPI vs USB
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* MIPI CSI-2 */}
                    <label
                      className={`flex items-start space-x-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedInterfaces.mipi
                          ? 'bg-blue-50/60 border-blue-300 shadow-2xs'
                          : 'bg-white border-gray-200 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedInterfaces.mipi}
                        onChange={() => toggleInterface('mipi')}
                        className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-blue-900 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>MIPI CSI-2</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          온보드 초저지연 직결 (&lt; 0.3m)
                        </p>
                      </div>
                    </label>

                    {/* GMSL2 */}
                    <label
                      className={`flex items-start space-x-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedInterfaces.gmsl
                          ? 'bg-red-50/60 border-red-300 shadow-2xs'
                          : 'bg-white border-gray-200 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedInterfaces.gmsl}
                        onChange={() => toggleInterface('gmsl')}
                        className="mt-0.5 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer accent-red-600"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-red-900 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-600" />
                          <span>GMSL2 SerDes</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          차량·산업용 장거리 동축 (최대 15m)
                        </p>
                      </div>
                    </label>

                    {/* USB 3.0 */}
                    <label
                      className={`flex items-start space-x-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedInterfaces.usb
                          ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                          : 'bg-white border-gray-200 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedInterfaces.usb}
                        onChange={() => toggleInterface('usb')}
                        className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-emerald-900 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span>USB 3.0</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          표준 플러그앤플레이 범용 (3~5m)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 2. Sections to Include */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>포함할 보고서 세부 분석 섹션</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Section 1 */}
                    <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors text-xs">
                      <input
                        type="checkbox"
                        checked={includeSections.keySpecs}
                        onChange={(e) =>
                          setIncludeSections({ ...includeSections, keySpecs: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">
                          1. 주요 사양 4대 핵심 지표 매트릭스
                        </span>
                        <p className="text-[11px] text-gray-500">
                          대역폭, 최대 케이블 길이, 소비 전력, 실시간 지연 시간
                        </p>
                      </div>
                    </label>

                    {/* Section 2 */}
                    <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors text-xs">
                      <input
                        type="checkbox"
                        checked={includeSections.calculator}
                        onChange={(e) =>
                          setIncludeSections({ ...includeSections, calculator: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">
                          2. 센서 대역폭 & 인터페이스 적합도 계산 결과
                        </span>
                        <p className="text-[11px] text-gray-500">
                          현재 설정된 해상도/FPS/채널 수에 따른 실시간 대역폭 및 수용 여부
                        </p>
                      </div>
                    </label>

                    {/* Section 3 */}
                    <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors text-xs">
                      <input
                        type="checkbox"
                        checked={includeSections.powerDistance}
                        onChange={(e) =>
                          setIncludeSections({ ...includeSections, powerDistance: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">
                          3. 소비 전력 & 케이블 전송 거리 정량 벤치마크
                        </span>
                        <p className="text-[11px] text-gray-500">
                          전형적/최대 전력 소모(W), 전송거리(m), 전원 공급 방식(PoC 등)
                        </p>
                      </div>
                    </label>

                    {/* Section 4 */}
                    <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors text-xs">
                      <input
                        type="checkbox"
                        checked={includeSections.detailedSpecs}
                        onChange={(e) =>
                          setIncludeSections({ ...includeSections, detailedSpecs: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">
                          4. 기술 사양 12대 상세 항목 종합 대조표
                        </span>
                        <p className="text-[11px] text-gray-500">
                          EMI 노이즈 내성, CPU 점유율, 다중 동기화, NRE 난이도, 원가
                        </p>
                      </div>
                    </label>

                    {/* Section 5 */}
                    <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors text-xs sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={includeSections.engineeringNotes}
                        onChange={(e) =>
                          setIncludeSections({ ...includeSections, engineeringNotes: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">
                          5. 실무 엔지니어링 권고사항 및 설계 가이드
                        </span>
                        <p className="text-[11px] text-gray-500">
                          인터페이스별 권고 적용 분야, 리스크 요인 및 하드웨어/소프트웨어 대응안
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3. Report Metadata */}
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/90 space-y-3">
                  <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>보고서 메타데이터 설정 (PDF/CSV 헤더에 표기)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-gray-600 mb-1 block">
                        프로젝트 명
                      </span>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 text-gray-900"
                        placeholder="예: AMR 서라운드 뷰 비전 시스템"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-gray-600 mb-1 block">
                        작성자 / 부서
                      </span>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 text-gray-900"
                        placeholder="예: 비전 하드웨어 엔지니어링팀"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-gray-600 mb-1 block">
                        보고서 문서 제목
                      </span>
                      <input
                        type="text"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Live Preview Tab */
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>
                      아래는 <strong>A4 용지 규격</strong>으로 인쇄 및 내보내기될 보고서의 실시간 미리보기입니다.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('config')}
                    className="font-bold underline text-indigo-700 hover:text-indigo-900"
                  >
                    구성 변경하기
                  </button>
                </div>

                {/* Styled A4 Sheet Preview */}
                <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-300 shadow-md font-sans text-xs space-y-6">
                  {/* Document Header */}
                  <div className="border-b-2 border-gray-900 pb-4 flex items-start justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                        {reportTitle}
                      </h2>
                      <p className="text-[11px] text-gray-500 mt-1">
                        MIPI CSI-2 · GMSL2 · USB 3.0 엔지니어링 정량 비교 및 시스템 아키텍처 적합도 분석
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 text-[10px] font-bold text-gray-700 tracking-wider">
                        CONFIDENTIAL SPEC
                      </span>
                    </div>
                  </div>

                  {/* Metadata strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px]">
                    <div>
                      <span className="text-gray-400 block font-semibold text-[10px]">프로젝트 명</span>
                      <span className="font-bold text-gray-800">{projectName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold text-[10px]">작성자 / 부서</span>
                      <span className="font-bold text-gray-800">{author}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold text-[10px]">비교 인터페이스</span>
                      <span className="font-bold text-indigo-700">
                        {activeKeys.map((k) => (k === 'gmsl' ? 'GMSL2' : k === 'mipi' ? 'MIPI' : 'USB 3.0')).join(' · ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold text-[10px]">발행 일자</span>
                      <span className="font-bold text-gray-800">
                        {new Date().toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>

                  {/* Preview Section 1: Key Specs */}
                  {includeSections.keySpecs && (
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs mb-2 flex items-center gap-1.5 border-b pb-1">
                        <Zap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>1. 주요 사양 4대 핵심 지표 매트릭스</span>
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50 text-gray-700">
                              <th className="p-2 border border-gray-200 text-left w-28">평가 지표</th>
                              <th className="p-2 border border-gray-200 text-left w-16">단위</th>
                              {activeKeys.map((k) => (
                                <th key={k} className="p-2 border border-gray-200 text-left">
                                  {k === 'gmsl' ? 'GMSL2' : k === 'mipi' ? 'MIPI CSI-2' : 'USB 3.0'}
                                </th>
                              ))}
                              <th className="p-2 border border-gray-200 text-left">엔지니어링 메모</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SPEC_ROWS.map((row) => (
                              <tr key={row.id} className="border-b border-gray-200">
                                <td className="p-2 border border-gray-200 font-semibold text-gray-900">
                                  {row.metric}
                                </td>
                                <td className="p-2 border border-gray-200 text-gray-500">{row.unit}</td>
                                {activeKeys.map((k) => (
                                  <td key={k} className="p-2 border border-gray-200">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        k === 'mipi'
                                          ? 'bg-blue-50 text-blue-700'
                                          : k === 'gmsl'
                                          ? 'bg-red-50 text-red-700'
                                          : 'bg-emerald-50 text-emerald-700'
                                      }`}
                                    >
                                      {row[k].highlight}
                                    </span>
                                    <div className="text-[10px] text-gray-500 mt-0.5">{row[k].sub}</div>
                                  </td>
                                ))}
                                <td className="p-2 border border-gray-200 text-gray-600 text-[10px] leading-tight">
                                  {row.engineeringNote}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Preview Section 2: Calculator Simulation */}
                  {includeSections.calculator && calculatorData && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900 text-xs">
                          🧮 2. 센서 대역폭 & 인터페이스 적합도 계산 결과
                        </h4>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-indigo-600">
                            {calculatorData.gbps} Gbps
                          </span>
                          <span className="text-[10px] text-gray-500 ml-1">
                            (~{calculatorData.mbytePerSec.toLocaleString()} MB/s)
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-600 mb-2">
                        조건: {calculatorData.resLabel} ({calculatorData.width}×{calculatorData.height}) · {calculatorData.fps} fps · {calculatorData.bitDepth}-bit · {calculatorData.cameraCount}채널
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {selectedInterfaces.mipi && (
                          <div
                            className={`p-2 rounded border text-[11px] ${
                              calculatorData.mipiSupported
                                ? 'bg-blue-50 border-blue-200 text-blue-900'
                                : 'bg-red-50 border-red-200 text-red-900'
                            }`}
                          >
                            <span className="font-bold">MIPI CSI-2 (10G):</span>{' '}
                            {calculatorData.mipiSupported ? '✅ 수용 가능' : '❌ 대역폭 초과'}
                          </div>
                        )}
                        {selectedInterfaces.gmsl && (
                          <div
                            className={`p-2 rounded border text-[11px] ${
                              calculatorData.gmslSingleSupported
                                ? 'bg-red-50 border-red-200 text-red-900'
                                : calculatorData.gmslDualSupported
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : 'bg-red-50 border-red-200 text-red-900'
                            }`}
                          >
                            <span className="font-bold">GMSL2:</span>{' '}
                            {calculatorData.gmslSingleSupported
                              ? '✅ 단일 링크 가능'
                              : calculatorData.gmslDualSupported
                              ? '⚠️ 듀얼 링크 필요'
                              : '❌ 대역폭 초과'}
                          </div>
                        )}
                        {selectedInterfaces.usb && (
                          <div
                            className={`p-2 rounded border text-[11px] ${
                              calculatorData.usbSupported
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-red-50 border-red-200 text-red-900'
                            }`}
                          >
                            <span className="font-bold">USB 3.0 (3.2G):</span>{' '}
                            {calculatorData.usbSupported ? '✅ 수용 가능' : '❌ 압축(H.264) 필수'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preview Section 3: Power & Distance */}
                  {includeSections.powerDistance && (
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs mb-2 flex items-center gap-1.5 border-b pb-1">
                        <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                        <span>3. 소비 전력 및 케이블 전송 거리 정량 벤치마크</span>
                      </h4>
                      <table className="w-full text-[11px] border border-gray-200 border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-700">
                            <th className="p-2 border border-gray-200 text-left">인터페이스</th>
                            <th className="p-2 border border-gray-200 text-left">전형적 거리</th>
                            <th className="p-2 border border-gray-200 text-left">최대 전송거리</th>
                            <th className="p-2 border border-gray-200 text-left">전형적 소비전력</th>
                            <th className="p-2 border border-gray-200 text-left">최대 소비전력</th>
                            <th className="p-2 border border-gray-200 text-left">전원 공급 방식</th>
                          </tr>
                        </thead>
                        <tbody>
                          {INTERFACE_BENCHMARK_DATA.filter((i) => selectedInterfaces[i.id]).map((item) => (
                            <tr key={item.id} className="border-b border-gray-200">
                              <td className="p-2 border border-gray-200 font-bold">{item.name}</td>
                              <td className="p-2 border border-gray-200">{item.cableLengthTypical}m</td>
                              <td className="p-2 border border-gray-200 font-bold text-indigo-700">
                                {item.cableLengthMax}m
                              </td>
                              <td className="p-2 border border-gray-200">{item.powerTypical}W</td>
                              <td className="p-2 border border-gray-200 font-bold text-indigo-700">
                                {item.powerMax}W
                              </td>
                              <td className="p-2 border border-gray-200 text-gray-600">{item.powerDelivery}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Feedback Toast if download occurred */}
          {downloadSuccess && (
            <div className="px-6 py-2.5 bg-emerald-50 border-t border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {downloadSuccess === 'csv'
                    ? 'CSV 파일이 성공적으로 다운로드되었습니다. (UTF-8 BOM 포함으로 Excel에서 바로 열립니다)'
                    : downloadSuccess === 'html'
                    ? '단독 실행 가능한 오프라인 HTML 보고서가 다운로드되었습니다.'
                    : '브라우저 인쇄 대화상자가 열렸습니다. [대상: PDF로 저장]을 선택하세요.'}
                </span>
              </div>
            </div>
          )}

          {/* Modal Footer / Action Bar */}
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5 self-start sm:self-auto">
              <Info className="w-4 h-4 text-gray-400" />
              <span>
                PDF 내보내기는 고해상도 벡터 그래픽 및 인쇄용 폰트가 적용됩니다.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* CSV Download Button */}
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 shadow-2xs transition-colors"
                title="Excel 호환 UTF-8 BOM CSV 파일 다운로드"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>CSV 파일 다운로드</span>
              </button>

              {/* Standalone HTML Report Download */}
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="hidden md:inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-2xs transition-colors"
                title="단독 실행 가능한 오프라인 HTML 보고서 다운로드"
              >
                <FileText className="w-4 h-4 text-gray-500" />
                <span>HTML 보고서 저장</span>
              </button>

              {/* PDF Print/Export Button */}
              <button
                type="button"
                onClick={handlePrintPdf}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                title="브라우저 인쇄를 통해 PDF로 저장"
              >
                <Printer className="w-4 h-4" />
                <span>PDF 보고서 다운로드 / 인쇄</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sheet rendered in body via Portal for clean window.print() */}
      {createPortal(
        <div id="printable-technical-report-container">
          {/* Printable Report Header */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '18pt', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                {reportTitle}
              </h1>
              <p style={{ fontSize: '9pt', color: '#475569', margin: '4px 0 0 0' }}>
                MIPI CSI-2 · GMSL2 · USB 3.0 엔지니어링 정량 비교 및 시스템 아키텍처 적합도 분석 보고서
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '8pt', fontWeight: 700, padding: '3px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', textTransform: 'uppercase', color: '#475569', background: '#f8fafc' }}>
                CONFIDENTIAL SPEC SHEET
              </span>
            </div>
          </div>

          {/* Printable Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '18px', fontSize: '9pt' }}>
            <div>
              <span style={{ display: 'block', fontSize: '8pt', color: '#64748b' }}>프로젝트 명</span>
              <strong style={{ color: '#0f172a' }}>{projectName}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '8pt', color: '#64748b' }}>작성자 / 부서</span>
              <strong style={{ color: '#0f172a' }}>{author}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '8pt', color: '#64748b' }}>비교 인터페이스</span>
              <strong style={{ color: '#4338ca' }}>
                {activeKeys.map((k) => (k === 'gmsl' ? 'GMSL2' : k === 'mipi' ? 'MIPI CSI-2' : 'USB 3.0')).join(' · ')}
              </strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '8pt', color: '#64748b' }}>발행 일자</span>
              <strong style={{ color: '#0f172a' }}>{new Date().toLocaleDateString('ko-KR')}</strong>
            </div>
          </div>

          {/* Section 1: Key Specs */}
          {includeSections.keySpecs && (
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
                ⚡ 1. 주요 사양 4대 핵심 지표 매트릭스
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left', width: '16%' }}>평가 지표</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left', width: '10%' }}>단위</th>
                    {activeKeys.map((k) => (
                      <th key={k} style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left', width: '22%' }}>
                        {k === 'gmsl' ? 'GMSL2' : k === 'mipi' ? 'MIPI CSI-2' : 'USB 3.0'}
                      </th>
                    ))}
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>엔지니어링 메모</th>
                  </tr>
                </thead>
                <tbody>
                  {SPEC_ROWS.map((row) => (
                    <tr key={row.id}>
                      <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px', fontWeight: 700 }}>{row.metric}</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px', color: '#64748b' }}>{row.unit}</td>
                      {activeKeys.map((k) => (
                        <td key={k} style={{ border: '1px solid #e2e8f0', padding: '6px 8px' }}>
                          <span style={{ fontWeight: 700, color: k === 'mipi' ? '#1d4ed8' : k === 'gmsl' ? '#b91c1c' : '#15803d' }}>
                            {row[k].highlight}
                          </span>
                          <div style={{ fontSize: '7.5pt', color: '#64748b', marginTop: '2px' }}>{row[k].sub}</div>
                        </td>
                      ))}
                      <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px', fontSize: '8pt', color: '#334155' }}>
                        {row.engineeringNote}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 2: Calculator Simulation */}
          {includeSections.calculator && calculatorData && (
            <div style={{ marginBottom: '18px', background: '#f8fafc', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    🧮 2. 센서 대역폭 & 인터페이스 적합도 계산 결과
                  </h2>
                  <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '2px' }}>
                    조건: {calculatorData.resLabel} ({calculatorData.width}×{calculatorData.height}) · {calculatorData.fps} fps · {calculatorData.bitDepth}-bit · {calculatorData.cameraCount}채널
                  </div>
                </div>
                <div>
                  <strong style={{ fontSize: '14pt', color: '#4f46e5' }}>{calculatorData.gbps} Gbps</strong>
                  <span style={{ fontSize: '8.5pt', color: '#64748b', marginLeft: '4px' }}>
                    (~{calculatorData.mbytePerSec.toLocaleString()} MB/s)
                  </span>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>인터페이스</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>물리 대역폭 한계</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>적합도 판정</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>기술 평가 의견</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInterfaces.mipi && (
                    <tr>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700 }}>MIPI CSI-2</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>10.0 Gbps (4-lane)</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700, color: calculatorData.mipiSupported ? '#15803d' : '#b91c1c' }}>
                        {calculatorData.mipiSupported ? 'PASS (수용 가능)' : 'FAIL (대역폭 초과)'}
                      </td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>
                        {calculatorData.mipiSupported ? 'SoC ISP 다이렉트 DMA 매핑으로 제로 버퍼링 전송 완벽 지원' : 'C-PHY 또는 포트 분할 필요'}
                      </td>
                    </tr>
                  )}
                  {selectedInterfaces.gmsl && (
                    <tr>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700 }}>GMSL2</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>단일 6.0G / 듀얼 12.0G</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700, color: calculatorData.gmslSingleSupported ? '#15803d' : calculatorData.gmslDualSupported ? '#b45309' : '#b91c1c' }}>
                        {calculatorData.gmslSingleSupported ? 'PASS (단일 링크)' : calculatorData.gmslDualSupported ? '듀얼 링크 필요' : '대역폭 초과'}
                      </td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>
                        {calculatorData.gmslSingleSupported ? '단일 동축 케이블 전송 지원' : '2채널 동축선 결합 또는 GMSL3 검토'}
                      </td>
                    </tr>
                  )}
                  {selectedInterfaces.usb && (
                    <tr>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700 }}>USB 3.0</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>~3.2 Gbps (실효)</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700, color: calculatorData.usbSupported ? '#15803d' : '#b91c1c' }}>
                        {calculatorData.usbSupported ? 'PASS (비압축 수용)' : 'FAIL (압축 필수)'}
                      </td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>
                        {calculatorData.usbSupported ? '실효 대역폭 내 수용 가능하나 지터 주의' : '실효 대역폭 초과로 H.264 인코더 압축 필수'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 3: Power & Distance */}
          {includeSections.powerDistance && (
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
                📊 3. 소비 전력 및 케이블 전송 거리 정량 벤치마크
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>인터페이스</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>전형적 거리</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>최대 전송거리</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>전형적 소비전력</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>최대 소비전력</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>전원 공급 방식</th>
                  </tr>
                </thead>
                <tbody>
                  {INTERFACE_BENCHMARK_DATA.filter((i) => selectedInterfaces[i.id]).map((item) => (
                    <tr key={item.id}>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700 }}>{item.name}</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>{item.cableLengthTypical}m</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700 }}>{item.cableLengthMax}m</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>{item.powerTypical}W</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700 }}>{item.powerMax}W</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>{item.powerDelivery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 4: Detailed Specs */}
          {includeSections.detailedSpecs && (
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
                📑 4. 종합 기술 사양 12대 세부 대조표
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 6px', textAlign: 'left', width: '14%' }}>분류</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 6px', textAlign: 'left', width: '22%' }}>평가 항목</th>
                    {activeKeys.map((k) => (
                      <th key={k} style={{ border: '1px solid #cbd5e1', padding: '5px 6px', textAlign: 'left' }}>
                        {k === 'gmsl' ? 'GMSL2' : k === 'mipi' ? 'MIPI CSI-2' : 'USB 3.0'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.id}>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 6px', color: '#64748b' }}>{row.categoryLabel}</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 6px', fontWeight: 700 }}>{row.title}</td>
                      {activeKeys.map((k) => (
                        <td key={k} style={{ border: '1px solid #e2e8f0', padding: '5px 6px' }}>
                          <span style={{ fontWeight: 600 }}>{row[k].value}</span>
                          {row[k].subtext && (
                            <div style={{ fontSize: '7pt', color: '#64748b' }}>{row[k].subtext}</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 5: Engineering Notes */}
          {includeSections.engineeringNotes && (
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
                💡 5. 엔지니어링 의사결정 권고 및 설계 가이드
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left', width: '20%' }}>인터페이스</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left', width: '38%' }}>최적 권고 애플리케이션</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '5px 8px', textAlign: 'left' }}>핵심 설계 주의점 및 리스크</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInterfaces.mipi && (
                    <tr>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700, color: '#1d4ed8' }}>MIPI CSI-2</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>초저지연 비전 서보잉, 모바일 로봇 본체 내부, 소형 배터리 구동 드론</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>케이블 30cm 이내 엄수, FPC 굴곡 피로 방지, 초기 Linux 커널 센서 드라이버 개발 NRE 고려</td>
                    </tr>
                  )}
                  {selectedInterfaces.gmsl && (
                    <tr>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700, color: '#b91c1c' }}>GMSL2</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>ADAS/자율주행, 대형 공장 AMR 서라운드 뷰, 옥외 가혹 환경, 3~15m 분산</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>SerDes 칩셋 단가 상승, PoC 인덕터 및 카메라 발열 해소를 위한 방열 하우징 설계 필수</td>
                    </tr>
                  )}
                  {selectedInterfaces.usb && (
                    <tr>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px', fontWeight: 700, color: '#15803d' }}>USB 3.0</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>빠른 PoC 프로토타이핑, 범용 x86 PC 비전 검사, 단일 카메라 표준 랩 환경</td>
                      <td style={{ border: '1px solid #e2e8f0', padding: '5px 8px' }}>10~40ms 가변 지연과 프레임 지터 발생, 진동 환경에서 커넥터 이탈 위험(스크류 락 필수)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Printable Footer */}
          <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '8pt', color: '#64748b' }}>
            <div>발행처: {author} · 프로젝트: {projectName}</div>
            <div>생성 일시: {new Date().toLocaleString('ko-KR')} · Confidential Engineering Report</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
