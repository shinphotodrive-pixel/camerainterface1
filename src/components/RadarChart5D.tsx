import React, { useState } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts';
import { Layers, Eye, EyeOff, Info, Check } from 'lucide-react';

export interface DimensionMetric {
  dimension: string;
  dimensionEn: 'Latency' | 'Bandwidth' | 'TCO' | 'Installation' | 'Reliability';
  fullMark: number;
  'MIPI CSI-2': number;
  'GMSL2 (SerDes)': number;
  'USB 3.0 / Vision': number;
  mipiDetail: string;
  gmslDetail: string;
  usbDetail: string;
}

export const RADAR_5D_DATA: DimensionMetric[] = [
  {
    dimension: 'Latency (지연 시간)',
    dimensionEn: 'Latency',
    fullMark: 100,
    'MIPI CSI-2': 98,
    'GMSL2 (SerDes)': 92,
    'USB 3.0 / Vision': 38,
    mipiDetail: '< 1ms (ISP 하드웨어 직결, OS 제로 버퍼링)',
    gmslDetail: '수십 µs (결정론적 고정 지연, 프레임 지터 무)',
    usbDetail: '10~40ms (UVC 스택 폴링 오버헤드)'
  },
  {
    dimension: 'Bandwidth (대역폭)',
    dimensionEn: 'Bandwidth',
    fullMark: 100,
    'MIPI CSI-2': 94,
    'GMSL2 (SerDes)': 85,
    'USB 3.0 / Vision': 60,
    mipiDetail: '10Gbps+ (D-PHY v3.0 36G, C-PHY 41G)',
    gmslDetail: '6Gbps 고정 순방향 (차세대 GMSL3 16G)',
    usbDetail: '5Gbps 이론치 (실효 350~400MB/s)'
  },
  {
    dimension: 'TCO (총소유비용)',
    dimensionEn: 'TCO',
    fullMark: 100,
    'MIPI CSI-2': 86,
    'GMSL2 (SerDes)': 42,
    'USB 3.0 / Vision': 82,
    mipiDetail: 'BOM 최저가 ($300~$800), 대량 양산 극대화',
    gmslDetail: '고가 SerDes/FAKRA + 리눅스 드라이버 NRE',
    usbDetail: 'NRE $0 수준, 신속 출시 및 호환 유지'
  },
  {
    dimension: 'Installation (설치/배선)',
    dimensionEn: 'Installation',
    fullMark: 100,
    'MIPI CSI-2': 32,
    'GMSL2 (SerDes)': 95,
    'USB 3.0 / Vision': 76,
    mipiDetail: '< 0.3m (FPC 리본선, 진동/곡률 취약)',
    gmslDetail: '최대 15m (동축 FAKRA + PoC 전원 통합)',
    usbDetail: '3~5m (스크류 락 체결, 버스 파워)'
  },
  {
    dimension: 'Reliability (신뢰성/EMC)',
    dimensionEn: 'Reliability',
    fullMark: 100,
    'MIPI CSI-2': 42,
    'GMSL2 (SerDes)': 98,
    'USB 3.0 / Vision': 62,
    mipiDetail: '차폐 취약 (밀폐 내부 전용, 노이즈 민감)',
    gmslDetail: 'AEC-Q100 전장 인증 + ISO 26262 ASIL-B + ARQ',
    usbDetail: '일반 환경용 (진동/노이즈 시 이중 차폐 필수)'
  }
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomRadarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataItem = RADAR_5D_DATA.find((d) => d.dimension === label);

    return (
      <div className="bg-gray-900/95 backdrop-blur-xs text-white p-3.5 rounded-xl shadow-xl border border-gray-700 text-xs space-y-2 max-w-xs z-50">
        <div className="border-b border-gray-700 pb-1.5 flex justify-between items-center">
          <span className="font-bold text-gray-100">{label}</span>
          <span className="text-[10px] text-gray-400 font-mono">100점 만점</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            let detail = '';
            if (entry.name === 'MIPI CSI-2') detail = dataItem?.mipiDetail || '';
            if (entry.name === 'GMSL2 (SerDes)') detail = dataItem?.gmslDetail || '';
            if (entry.name === 'USB 3.0 / Vision') detail = dataItem?.usbDetail || '';

            return (
              <div key={`tooltip-${index}`} className="flex flex-col text-[11px]">
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center" style={{ color: entry.color }}>
                    <span
                      className="w-2 h-2 rounded-full mr-1.5 inline-block"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}:
                  </span>
                  <span className="font-bold font-mono text-white">{entry.value}점</span>
                </div>
                {detail && (
                  <span className="text-[10px] text-gray-300 pl-3.5 leading-tight">
                    ↳ {detail}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const RadarChart5D: React.FC = () => {
  // Toggle visibility of specific interfaces to analyze isolated trade-offs
  const [visibleInterfaces, setVisibleInterfaces] = useState({
    mipi: true,
    gmsl: true,
    usb: true
  });

  const [activeDimension, setActiveDimension] = useState<string | null>(null);

  const toggleInterface = (key: 'mipi' | 'gmsl' | 'usb') => {
    setVisibleInterfaces((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="w-full space-y-4" id="recharts-radar-5d-container">
      {/* Chart Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-gray-700 flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            5대 핵심 평가 축 레이더 (Recharts)
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
            5 Dimensions
          </span>
        </div>

        {/* Toggle Badges */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            type="button"
            onClick={() => toggleInterface('mipi')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
              visibleInterfaces.mipi
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>MIPI CSI-2</span>
          </button>

          <button
            type="button"
            onClick={() => toggleInterface('gmsl')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
              visibleInterfaces.gmsl
                ? 'bg-red-50 text-red-700 border-red-200 shadow-2xs'
                : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>GMSL2 (SerDes)</span>
          </button>

          <button
            type="button"
            onClick={() => toggleInterface('usb')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
              visibleInterfaces.usb
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>USB 3.0</span>
          </button>
        </div>
      </div>

      {/* Recharts Radar Chart */}
      <div className="w-full h-80 sm:h-96 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="78%"
            data={RADAR_5D_DATA}
            margin={{ top: 15, right: 30, bottom: 15, left: 30 }}
          >
            <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#374151', fontSize: 11, fontWeight: 'bold' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 9 }}
              stroke="#e5e7eb"
            />

            {visibleInterfaces.mipi && (
              <Radar
                name="MIPI CSI-2"
                dataKey="MIPI CSI-2"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.25}
                strokeWidth={2}
                dot={{ r: 4, fill: '#2563eb', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
              />
            )}

            {visibleInterfaces.gmsl && (
              <Radar
                name="GMSL2 (SerDes)"
                dataKey="GMSL2 (SerDes)"
                stroke="#dc2626"
                fill="#ef4444"
                fillOpacity={0.22}
                strokeWidth={2}
                dot={{ r: 4, fill: '#dc2626', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#b91c1c' }}
              />
            )}

            {visibleInterfaces.usb && (
              <Radar
                name="USB 3.0 / Vision"
                dataKey="USB 3.0 / Vision"
                stroke="#16a34a"
                fill="#22c55e"
                fillOpacity={0.22}
                strokeWidth={2}
                dot={{ r: 4, fill: '#16a34a', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#15803d' }}
              />
            )}

            <Tooltip content={<CustomRadarTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: '11px', fontWeight: 'bold' }}
              iconType="circle"
              iconSize={8}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 5-Dimension Trade-Off Deep Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2">
        {RADAR_5D_DATA.map((item) => {
          const isSelected = activeDimension === item.dimensionEn;
          return (
            <div
              key={item.dimensionEn}
              onClick={() =>
                setActiveDimension(isSelected ? null : item.dimensionEn)
              }
              className={`p-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                  : 'bg-white hover:bg-gray-50/80 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-gray-800">
                  {item.dimensionEn}
                </span>
                <span className="text-[9px] px-1 py-0.2 bg-gray-100 text-gray-600 rounded">
                  {item.dimension.split(' ')[0]}
                </span>
              </div>
              <div className="space-y-0.5 text-[10px] font-mono">
                <div className="flex justify-between text-blue-700">
                  <span>MIPI:</span>
                  <span className="font-bold">{item['MIPI CSI-2']}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>GMSL:</span>
                  <span className="font-bold">{item['GMSL2 (SerDes)']}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>USB:</span>
                  <span className="font-bold">{item['USB 3.0 / Vision']}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active dimension detail card if clicked */}
      {activeDimension && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs animate-fadeIn">
          {(() => {
            const current = RADAR_5D_DATA.find((d) => d.dimensionEn === activeDimension);
            if (!current) return null;
            return (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-bold text-indigo-950">
                  <span className="flex items-center">
                    <Info className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    {current.dimension} 차원 상세 분석
                  </span>
                  <button
                    onClick={() => setActiveDimension(null)}
                    className="text-[11px] text-gray-500 hover:text-gray-800"
                  >
                    닫기 ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="bg-white p-2 rounded border border-blue-100 text-blue-950">
                    <span className="font-bold block text-blue-700">MIPI CSI-2 ({current['MIPI CSI-2']}점)</span>
                    <span className="text-gray-600 text-[10px] leading-tight block mt-0.5">{current.mipiDetail}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-red-100 text-red-950">
                    <span className="font-bold block text-red-700">GMSL2 ({current['GMSL2 (SerDes)']}점)</span>
                    <span className="text-gray-600 text-[10px] leading-tight block mt-0.5">{current.gmslDetail}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-100 text-emerald-950">
                    <span className="font-bold block text-emerald-700">USB 3.0 ({current['USB 3.0 / Vision']}점)</span>
                    <span className="text-gray-600 text-[10px] leading-tight block mt-0.5">{current.usbDetail}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
