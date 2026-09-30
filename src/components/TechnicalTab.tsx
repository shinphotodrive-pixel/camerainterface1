import React, { useState, useMemo } from 'react';
import { LatencyCpuChart, BandwidthRoadmapChart } from './Charts';
import { TechnicalSpecSummaryTable } from './TechnicalSpecSummaryTable';
import { PowerAndDistanceBarChart } from './PowerAndDistanceBarChart';
import { TechnicalReportExportModal } from './TechnicalReportExportModal';
import { RESOLUTION_OPTIONS, BIT_DEPTH_OPTIONS } from '../data/interfaceData';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Activity,
  FileDown,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

export const TechnicalTab: React.FC = () => {
  // Bandwidth calculator state
  const [selectedResIdx, setSelectedResIdx] = useState(1); // AR0234 default
  const [fps, setFps] = useState(120);
  const [bitDepth, setBitDepth] = useState(12); // RAW12
  const [cameraCount, setCameraCount] = useState(1);

  // Report Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [modalInitialInterfaces, setModalInitialInterfaces] = useState<{
    mipi: boolean;
    gmsl: boolean;
    usb: boolean;
  }>({
    mipi: true,
    gmsl: true,
    usb: true
  });
  const [modalDefaultTab, setModalDefaultTab] = useState<'config' | 'preview'>('config');

  const openExportModal = (
    tab: 'config' | 'preview' = 'config',
    interfaces?: { mipi: boolean; gmsl: boolean; usb: boolean }
  ) => {
    if (interfaces) {
      setModalInitialInterfaces(interfaces);
    }
    setModalDefaultTab(tab);
    setIsExportModalOpen(true);
  };

  // Bandwidth calculation (bits/sec = width * height * fps * bitDepth * cameraCount * 1.15 protocol overhead)
  const bandwidthCalc = useMemo(() => {
    const res = RESOLUTION_OPTIONS[selectedResIdx];
    const rawBps = res.width * res.height * fps * bitDepth * cameraCount;
    const gbps = (rawBps * 1.12) / 1_000_000_000; // 12% packet overhead
    const mbytePerSec = (rawBps * 1.12) / 8 / 1_000_000;

    // Checks
    // MIPI CSI-2 4-lane D-PHY v1.2: 10 Gbps max, D-PHY v2.5: 18 Gbps
    const mipiSupported = gbps <= 10.0;
    // GMSL2: 6 Gbps single link (or 12 Gbps dual link)
    const gmslSingleSupported = gbps <= 5.8;
    const gmslDualSupported = gbps <= 11.6;
    // USB 3.0: 3.2 Gbps effective bandwidth for uncompressed video
    const usbSupported = gbps <= 3.2;

    return {
      res,
      gbps: Number(gbps.toFixed(2)),
      mbytePerSec: Number(mbytePerSec.toFixed(0)),
      mipiSupported,
      gmslSingleSupported,
      gmslDualSupported,
      usbSupported
    };
  }, [selectedResIdx, fps, bitDepth, cameraCount]);

  return (
    <div className="space-y-8" id="technical-tab-content">
      {/* Section Header with Report Export Toolbar */}
      <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span>⚡ 기술 성능 심층 분석: 대역폭, 지연 시간 및 물리 계층(PHY)</span>
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
            카메라 인터페이스의 성능은 단순 링크 속도뿐 아니라, 데이터 전달의 확정적 지연성(Deterministic Latency),
            호스트 CPU 점유 오버헤드, 그리고 센서 픽셀 파이프라인 구조에 의해 결정됩니다.
          </p>
        </div>

        {/* Report Export Button Group */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openExportModal('config')}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow transition-all cursor-pointer"
            title="사용자 선택 사양을 PDF 또는 CSV 보고서로 내보내기"
          >
            <FileDown className="w-4 h-4" />
            <span>보고서 내보내기</span>
          </button>

          <button
            type="button"
            onClick={() => openExportModal('preview')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
            title="인쇄용 A4 규격 PDF 미리보기 및 다운로드"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>PDF 미리보기</span>
          </button>
        </div>
      </div>

      {/* Key Specifications Table (Bandwidth, Cable Length, Power, Latency) */}
      <TechnicalSpecSummaryTable
        onExportReport={(interfaces) => openExportModal('config', interfaces)}
      />

      {/* Quantitative Bar Chart Comparison: Power Consumption & Max Cable Length */}
      <PowerAndDistanceBarChart />

      {/* Latency and Bandwidth Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency & CPU Load Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-gray-900 text-sm">
              인터페이스별 지연 시간(Latency) 및 호스트 CPU 점유율
            </h4>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            하드웨어 직결(MIPI/GMSL2)과 소프트웨어 스택(USB UVC/DMA)의 실시간성 격차
          </p>
          <div className="h-72 sm:h-80">
            <LatencyCpuChart className="w-full h-full" />
          </div>
          <div className="mt-3 p-2.5 bg-gray-50 rounded-lg text-[11px] text-gray-600 flex items-center justify-between">
            <span>🔹 MIPI & GMSL2: 하드웨어 ISP DMA 직결로 1ms 미만 및 CPU 점유 10%대 미만 유지</span>
          </div>
        </div>

        {/* Bandwidth Roadmap Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-gray-900 text-sm">
              인터페이스 세대별 물리 전송 대역폭 발전 추이
            </h4>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            차세대 SerDes(GMSL3/A-PHY) 및 MIPI PHY 발전 로드맵 (Gbps 단위)
          </p>
          <div className="h-72 sm:h-80">
            <BandwidthRoadmapChart className="w-full h-full" />
          </div>
          <div className="mt-3 p-2.5 bg-gray-50 rounded-lg text-[11px] text-gray-600 flex items-center justify-between">
            <span>🔹 MIPI C-PHY v3.1은 3-와이어 위상 인코딩으로 레인당 최대 17.1 Gbps 달성</span>
          </div>
        </div>
      </div>

      {/* Interactive Bandwidth & Interface Feasibility Calculator */}
      <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-xs">
        <div className="flex items-center space-x-2 text-indigo-600 mb-2">
          <Calculator className="w-5 h-5" />
          <h4 className="font-bold text-gray-900 text-sm">
            🧮 센서 사양별 원시 데이터 대역폭 & 인터페이스 적합도 계산기
          </h4>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          해상도, 프레임레이트(FPS), 픽셀 비트 심도 및 카메라 수를 조절하여 비압축 비디오 스트림 대역폭을 실시간 산출합니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Resolution select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              카메라 해상도
            </label>
            <select
              value={selectedResIdx}
              onChange={(e) => setSelectedResIdx(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-gray-900 font-medium"
            >
              {RESOLUTION_OPTIONS.map((res, i) => (
                <option key={i} value={i}>
                  {res.label}
                </option>
              ))}
            </select>
          </div>

          {/* FPS select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              프레임레이트 (FPS): <span className="font-bold text-indigo-600">{fps} fps</span>
            </label>
            <select
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-gray-900 font-medium"
            >
              <option value={30}>30 fps (표준 영상)</option>
              <option value={60}>60 fps (고속 검사)</option>
              <option value={90}>90 fps (로보틱스)</option>
              <option value={120}>120 fps (글로벌 셔터 고속)</option>
            </select>
          </div>

          {/* Bit Depth */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              픽셀 포맷 / 비트 심도
            </label>
            <select
              value={bitDepth}
              onChange={(e) => setBitDepth(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-gray-900 font-medium"
            >
              {BIT_DEPTH_OPTIONS.map((b) => (
                <option key={b.bits} value={b.bits}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Count */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              동시 스트리밍 카메라 수: <span className="font-bold text-indigo-600">{cameraCount}대</span>
            </label>
            <div className="flex items-center space-x-2 pt-1">
              {[1, 2, 4, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setCameraCount(n)}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-bold border transition-colors ${
                    cameraCount === n
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {n}CH
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Output Display */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 font-medium">필요 비압축 전송 대역폭 (패킷 오버헤드 12% 포함)</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-extrabold text-indigo-600">{bandwidthCalc.gbps}</span>
              <span className="text-sm font-bold text-gray-700">Gbps</span>
              <span className="text-xs text-gray-400">({bandwidthCalc.mbytePerSec.toLocaleString()} MB/s)</span>
            </div>
          </div>

          {/* Feasibility Badges */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* MIPI */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              bandwidthCalc.mipiSupported
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {bandwidthCalc.mipiSupported ? (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span>MIPI CSI-2 (10Gbps): {bandwidthCalc.mipiSupported ? '수용 가능' : '대역폭 초과'}</span>
            </div>

            {/* GMSL2 */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              bandwidthCalc.gmslSingleSupported
                ? 'bg-red-50 text-red-800 border-red-200'
                : bandwidthCalc.gmslDualSupported
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {bandwidthCalc.gmslSingleSupported ? (
                <CheckCircle2 className="w-4 h-4 text-red-600" />
              ) : bandwidthCalc.gmslDualSupported ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span>
                GMSL2: {bandwidthCalc.gmslSingleSupported
                  ? '단일 링크 (6G) 가능'
                  : bandwidthCalc.gmslDualSupported
                  ? '듀얼 링크 (12G) 필요'
                  : '대역폭 초과'}
              </span>
            </div>

            {/* USB 3.0 */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              bandwidthCalc.usbSupported
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {bandwidthCalc.usbSupported ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span>USB 3.0 (3.2Gbps): {bandwidthCalc.usbSupported ? '수용 가능' : '압축(H.264/MJPEG) 필수'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latency & Frame Sync Deep Dive */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
            <Activity className="w-4 h-4" />
            <h4>지연 시간(Latency)과 정밀 프레임 동기화 매커니즘</h4>
          </div>
          <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
            <p>
              <strong className="text-gray-900">MIPI CSI-2:</strong> 센서 픽셀 데이터가 프로세서의 내장 하드웨어 ISP
              직접 메모리 맵(Direct Memory Access)으로 기록됩니다. OS 계층 인터럽트 버퍼링이 배제되므로 1ms 미만의
              절대적 지연을 기록하며 비전 서보잉(Visual Servoing)에 가장 적합합니다.
            </p>
            <p>
              <strong className="text-gray-900">GMSL2:</strong> MAX9295 직렬화기와 MAX9296 역직렬화기 파이프라인에서
              수십 마이크로초(µs)의 고정 하드웨어 지연이 발생하지만, 지터가 없는 완벽한 <em>결정론적(Deterministic)</em> 지연입니다.
              특히 16개 MIPI 가상 채널(VC)을 단일 동축선으로 병합하고, FSYNC 펄스를 통해 여러 카메라 노출 시점을
              마이크로초 이내로 정밀 동기화합니다.
            </p>
            <p>
              <strong className="text-gray-900">USB 3.0:</strong> 호스트 xHCI 컨트롤러의 비동기 폴링 인터벌과 OS UVC
              커널 스택의 메모리 복사(Copy Overhead)로 인해 10~40ms의 불규칙한 지연과 지터가 발생합니다.
              USB3 Vision DMA 제로 카피를 사용해도 지연을 8~10ms 이하로 낮추기는 어렵습니다.
            </p>
          </div>
        </div>

        {/* SerDes War: MIPI A-PHY vs OpenGMSL */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-red-600 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <h4>차세대 차량용 SerDes 표준화 전쟁: MIPI A-PHY vs OpenGMSL</h4>
          </div>
          <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
            <p>
              <strong className="text-gray-900">MIPI A-PHY (IEEE 2977):</strong> 완성차 업계의 벤더 락인 탈피를 위해
              제정된 글로벌 공개 표준입니다. 별도의 직렬화 브리지 칩 없이 센서와 SoC가 직접 A-PHY 링크를 맺어
              최대 15m 거리에서 16~32 Gbps 초고속 전송 및 10<sup>-19</sup>의 극초저 패킷 에러율(PER)을 달성합니다.
              MASS(Mipi Automotive SerDes Solutions) 프레임워크를 탑재해 ASIL-D 기능안전을 보장합니다.
            </p>
            <p>
              <strong className="text-gray-900">OpenGMSL 연합:</strong> 아날로그 디바이스(ADI)는 A-PHY의 개방형 표준
              공세에 대응하기 위해 독자 규격이던 GMSL 기술 특허와 사양을 로열티 없이 전격 공개하는 OpenGMSL 협회를
              발족했습니다. 전 세계 25개 이상 완성차 브랜드에 10억 개 이상 탑재되어 도로 주행 신뢰성 검증이 완료되었다는 점이
              최대 경쟁력입니다.
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Integration Case Study: AR0234 */}
      <div className="bg-gradient-to-r from-gray-50 to-indigo-50/40 border border-gray-200 p-5 rounded-xl">
        <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
          <span>🔍</span>
          <span>고속 비전 실증 케이스 스터디: onsemi AR0234 글로벌 셔터 센서</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
            <span className="font-bold text-gray-900">센서 광학 스펙</span>
            <p className="text-gray-600 mt-1 leading-relaxed">
              onsemi AR0234CS, 1/2.6인치 광학 포맷, 2.3MP (1920×1200), 최대 120fps 비압축 12-bit UYVY 출력.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
            <span className="font-bold text-gray-900">글로벌 셔터의 가치</span>
            <p className="text-gray-600 mt-1 leading-relaxed">
              고속 회전체나 차량 이동 촬영 시 롤링 셔터 특유의 젤로(Jello) 왜곡을 100% 제거하여 번호판 인식 및 자율주행에 필수.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
            <span className="font-bold text-gray-900">인터페이스 요구사항</span>
            <p className="text-gray-600 mt-1 leading-relaxed">
              120fps 원시 분출 비트레이트(약 3.7 Gbps)를 감당하려면 MIPI 4레인 또는 GMSL2 6Gbps 단일 동축선이 요구되며 USB 3.0은 포화됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Report Export Modal */}
      <TechnicalReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultTab={modalDefaultTab}
        initialInterfaces={modalInitialInterfaces}
        calculatorData={{
          resLabel: bandwidthCalc.res.label,
          width: bandwidthCalc.res.width,
          height: bandwidthCalc.res.height,
          fps,
          bitDepth,
          cameraCount,
          gbps: bandwidthCalc.gbps,
          mbytePerSec: bandwidthCalc.mbytePerSec,
          mipiSupported: bandwidthCalc.mipiSupported,
          gmslSingleSupported: bandwidthCalc.gmslSingleSupported,
          gmslDualSupported: bandwidthCalc.gmslDualSupported,
          usbSupported: bandwidthCalc.usbSupported
        }}
      />
    </div>
  );
};
