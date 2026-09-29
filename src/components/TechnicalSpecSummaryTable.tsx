import React, { useState } from 'react';
import {
  Zap,
  Radio,
  Cable,
  Clock,
  BatteryCharging,
  Maximize2,
  Cpu,
  CheckCircle2,
  Info
} from 'lucide-react';

interface KeySpecItem {
  id: string;
  metric: string;
  category: 'bandwidth' | 'distance' | 'power' | 'latency';
  icon: React.ReactNode;
  unit: string;
  mipi: {
    highlight: string;
    sub: string;
    tag: string;
    isBest?: boolean;
  };
  gmsl: {
    highlight: string;
    sub: string;
    tag: string;
    isBest?: boolean;
  };
  usb: {
    highlight: string;
    sub: string;
    tag: string;
    isBest?: boolean;
  };
  engineeringNote: string;
}

const SPEC_ROWS: KeySpecItem[] = [
  {
    id: 'bandwidth',
    metric: '대역폭 (Bandwidth)',
    category: 'bandwidth',
    icon: <Zap className="w-4 h-4 text-indigo-600" />,
    unit: 'Gbps',
    mipi: {
      highlight: '10 Gbps ~ 41 Gbps',
      sub: 'D-PHY v1.2 4레인(10G), v3.0(36G), C-PHY v3.1(41G)',
      tag: '최고 대역폭 (다중 레인)',
      isBest: true
    },
    gmsl: {
      highlight: '6 Gbps (고정 순방향)',
      sub: '순방향 6G + 독립 역방향 187.5 Mbps (차세대 GMSL3 16G)',
      tag: '단일 동축 최적화'
    },
    usb: {
      highlight: '5 Gbps (실효 350~400 MB/s)',
      sub: 'USB 3.2 Gen1x1 이론치, 패킷 오버헤드 감안 실효 ~3.2 Gbps',
      tag: '범용 비디오 제한'
    },
    engineeringNote:
      '4K 60fps RAW12(약 6 Gbps) 이상의 원시 데이터 스트림 전송 시 MIPI 4-레인 직결 또는 듀얼 GMSL2 링크가 필요하며, USB 3.0은 H.264/MJPEG 압축이 불가피합니다.'
  },
  {
    id: 'distance',
    metric: '최대 케이블 길이 (Max Distance)',
    category: 'distance',
    icon: <Maximize2 className="w-4 h-4 text-blue-600" />,
    unit: '미터 (m)',
    mipi: {
      highlight: '< 0.3 m (30 cm 이내)',
      sub: '0.5mm 피치 FPC 리본 케이블 또는 초미세 동축(Micro-Coax)',
      tag: '초단거리 온보드'
    },
    gmsl: {
      highlight: '최대 15 m (조건부 20 m)',
      sub: '50Ω 단일 차폐 동축선(RG-174/RTK031) 전장 FAKRA 커넥터',
      tag: '장거리 압도적 1위',
      isBest: true
    },
    usb: {
      highlight: '3 m ~ 5 m (패시브)',
      sub: '듀얼 스크류 락 체결 (AOC 광케이블 사용 시 최대 10~15m)',
      tag: '중거리 장비 랙'
    },
    engineeringNote:
      'MIPI CSI-2는 30cm 초과 시 차동 신호 고주파 감쇠로 링크가 단절됩니다. 대형 차량(ADAS)이나 공장 배선에는 적응형 등화기(Adaptive EQ)를 갖춘 GMSL2 동축 케이블이 필수입니다.'
  },
  {
    id: 'power',
    metric: '전력 소비 (Power Consumption)',
    category: 'power',
    icon: <BatteryCharging className="w-4 h-4 text-emerald-600" />,
    unit: '와트 (W)',
    mipi: {
      highlight: '0.1 ~ 0.5 W (극저전력)',
      sub: '독립 PCB 온보드 전원(1.8V/2.8V/3.3V LDO/PMIC 공급)',
      tag: '최저 전력 소모',
      isBest: true
    },
    gmsl: {
      highlight: '1.5 ~ 3.5 W (SerDes 포함)',
      sub: 'PoC (Power over Coax): 12V DC 단일 동축 중첩 전원 공급',
      tag: '단일선 전원 공급 (PoC)'
    },
    usb: {
      highlight: '1.0 ~ 2.5 W',
      sub: 'USB 버스 파워(5V DC, 최대 900mA / 4.5W 한도 내 구동)',
      tag: '표준 5V 버스 파워'
    },
    engineeringNote:
      'MIPI는 직렬화 브리지 칩이 없어 발열과 전력 소모가 극히 적어 모바일·드론에 최적입니다. GMSL2는 PoC 기술로 전원 가설 배선을 생략하는 대신 카메라 모듈 방열 설계가 필요합니다.'
  },
  {
    id: 'latency',
    metric: '실시간 지연 시간 (Real-time Latency)',
    category: 'latency',
    icon: <Clock className="w-4 h-4 text-amber-600" />,
    unit: '밀리초 (ms)',
    mipi: {
      highlight: '< 1 ms (~0.8 ms)',
      sub: 'SoC 내장 ISP 메모리 다이렉트 매핑, OS 버퍼링 제로',
      tag: '극초저지연 (물리 직결)',
      isBest: true
    },
    gmsl: {
      highlight: '수십 µs (결정론적)',
      sub: 'MAX9295/9296 파이프라인 고정 지연, 마이크로초 단위 FSYNC',
      tag: '하드웨어 결정론적 보장',
      isBest: true
    },
    usb: {
      highlight: '10 ~ 40 ms (가변 지터)',
      sub: 'OS 호스트 xHCI 폴링 인터벌 및 UVC 드라이버 메모리 복사',
      tag: '비결정론적 가변 지연'
    },
    engineeringNote:
      'MIPI와 GMSL2는 하드웨어 파이프라인으로 지연 시간 변동(Jitter)이 0에 가까워 로봇 서보 제어 및 자율주행 회피 기동에 적합하며, USB 3.0은 호스트 CPU 부하에 따라 지연이 변동됩니다.'
  }
];

export const TechnicalSpecSummaryTable: React.FC = () => {
  const [selectedRowId, setSelectedRowId] = useState<string>('bandwidth');
  const [visibleInterfaces, setVisibleInterfaces] = useState<{
    mipi: boolean;
    gmsl: boolean;
    usb: boolean;
  }>({
    mipi: true,
    gmsl: true,
    usb: true
  });

  const toggleInterface = (key: 'mipi' | 'gmsl' | 'usb') => {
    // Prevent unchecking all if only one is currently selected
    const activeCount = Object.values(visibleInterfaces).filter(Boolean).length;
    if (activeCount === 1 && visibleInterfaces[key]) {
      return;
    }
    setVisibleInterfaces((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAllInterfaces = () => {
    setVisibleInterfaces({
      mipi: true,
      gmsl: true,
      usb: true
    });
  };

  const activeCount = Object.values(visibleInterfaces).filter(Boolean).length;
  const selectedItem = SPEC_ROWS.find((row) => row.id === selectedRowId) || SPEC_ROWS[0];

  return (
    <div
      className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden"
      id="technical-spec-summary-table-container"
    >
      {/* Table Header / Title */}
      <div className="p-5 border-b border-gray-200 bg-gray-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">
              주요 사양 4대 핵심 지표 한눈에 비교 (Key Specifications Matrix)
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              대역폭 · 최대 케이블 길이 · 전력 소비 · 실시간 지연 시간 심층 대조표
            </p>
          </div>
        </div>

        {/* Interface Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 mr-1 flex items-center">
            인터페이스 필터:
          </span>

          {/* MIPI Checkbox Button */}
          <label
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer select-none transition-all ${
              visibleInterfaces.mipi
                ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'
                : 'bg-gray-100 text-gray-400 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={visibleInterfaces.mipi}
              onChange={() => toggleInterface('mipi')}
              className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              MIPI CSI-2
            </span>
          </label>

          {/* GMSL2 Checkbox Button */}
          <label
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer select-none transition-all ${
              visibleInterfaces.gmsl
                ? 'bg-red-50 text-red-800 border-red-300 shadow-2xs'
                : 'bg-gray-100 text-gray-400 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={visibleInterfaces.gmsl}
              onChange={() => toggleInterface('gmsl')}
              className="w-3.5 h-3.5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer accent-red-600"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
              GMSL2
            </span>
          </label>

          {/* USB 3.0 Checkbox Button */}
          <label
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer select-none transition-all ${
              visibleInterfaces.usb
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-gray-100 text-gray-400 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={visibleInterfaces.usb}
              onChange={() => toggleInterface('usb')}
              className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              USB 3.0
            </span>
          </label>

          {activeCount < 3 && (
            <button
              type="button"
              onClick={selectAllInterfaces}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium px-2 py-0.5 rounded hover:bg-indigo-50 transition-colors"
            >
              전체 보기
            </button>
          )}
        </div>
      </div>

      {/* The Spec Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100/90 text-gray-700 font-semibold border-b border-gray-200">
              <th className="p-3.5 min-w-[170px] text-gray-900">
                핵심 사양 평가 지표
              </th>
              {visibleInterfaces.mipi && (
                <th className="p-3.5 min-w-[210px] bg-blue-50/80 text-blue-950 border-l border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-1.5 inline-block" />
                      MIPI CSI-2 (온보드)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-semibold">
                      Direct
                    </span>
                  </div>
                </th>
              )}
              {visibleInterfaces.gmsl && (
                <th className="p-3.5 min-w-[210px] bg-red-50/80 text-red-950 border-l border-red-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 mr-1.5 inline-block" />
                      GMSL2 (차량 SerDes)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-semibold">
                      Coaxial
                    </span>
                  </div>
                </th>
              )}
              {visibleInterfaces.usb && (
                <th className="p-3.5 min-w-[210px] bg-emerald-50/80 text-emerald-950 border-l border-emerald-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1.5 inline-block" />
                      산업용 USB 3.0 / Vision
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                      Plug & Play
                    </span>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {SPEC_ROWS.map((row) => {
              const isSelected = selectedRowId === row.id;
              return (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRowId(row.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/40 font-medium'
                      : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* Metric column */}
                  <td className="p-3.5 bg-gray-50/50 align-top">
                    <div className="flex items-start space-x-2">
                      <div className="p-1 rounded bg-white border border-gray-200 shadow-2xs mt-0.5">
                        {row.icon}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block text-xs">
                          {row.metric}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          단위: {row.unit}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* MIPI cell */}
                  {visibleInterfaces.mipi && (
                    <td className="p-3.5 border-l border-gray-100 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span
                            className={`font-bold text-xs ${
                              row.mipi.isBest ? 'text-blue-700' : 'text-gray-900'
                            }`}
                          >
                            {row.mipi.highlight}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              row.mipi.isBest
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {row.mipi.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight">
                          {row.mipi.sub}
                        </p>
                      </div>
                    </td>
                  )}

                  {/* GMSL2 cell */}
                  {visibleInterfaces.gmsl && (
                    <td className="p-3.5 border-l border-gray-100 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span
                            className={`font-bold text-xs ${
                              row.gmsl.isBest ? 'text-red-700' : 'text-gray-900'
                            }`}
                          >
                            {row.gmsl.highlight}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              row.gmsl.isBest
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {row.gmsl.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight">
                          {row.gmsl.sub}
                        </p>
                      </div>
                    </td>
                  )}

                  {/* USB 3.0 cell */}
                  {visibleInterfaces.usb && (
                    <td className="p-3.5 border-l border-gray-100 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="font-bold text-xs text-gray-900">
                            {row.usb.highlight}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-gray-100 text-gray-600">
                            {row.usb.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight">
                          {row.usb.sub}
                        </p>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dynamic Detail Card based on selected metric row */}
      <div className="p-4 bg-indigo-50/50 border-t border-indigo-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start space-x-2.5">
          <div className="p-1 rounded-md bg-indigo-600 text-white shrink-0 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-indigo-950 block">
              💡 {selectedItem.metric} 엔지니어링 실무 분석 가이드:
            </span>
            <p className="text-gray-600 text-[11px] mt-0.5 leading-relaxed">
              {selectedItem.engineeringNote}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto">
          {SPEC_ROWS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRowId(r.id)}
              className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all ${
                selectedRowId === r.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {r.metric.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
