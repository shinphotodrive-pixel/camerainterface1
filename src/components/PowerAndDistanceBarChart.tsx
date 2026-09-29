import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LabelList
} from 'recharts';
import {
  Zap,
  Maximize2,
  BatteryCharging,
  Layers,
  Info,
  CheckCircle2,
  TrendingDown,
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface InterfaceMetricData {
  id: 'mipi' | 'gmsl' | 'usb';
  name: string;
  shortName: string;
  color: string;
  lightBg: string;
  borderColor: string;
  textColor: string;
  // Cable length (m)
  cableLengthTypical: number;
  cableLengthMax: number;
  cableNote: string;
  cableSpecDetail: string;
  // Power consumption (W)
  powerTypical: number;
  powerMax: number;
  powerNote: string;
  powerSpecDetail: string;
  powerDelivery: string;
}

const INTERFACE_BENCHMARK_DATA: InterfaceMetricData[] = [
  {
    id: 'mipi',
    name: 'MIPI CSI-2 (온보드 직결)',
    shortName: 'MIPI CSI-2',
    color: '#2563eb',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    cableLengthTypical: 0.15,
    cableLengthMax: 0.3,
    cableNote: '< 0.3m (30cm 한계)',
    cableSpecDetail: '0.5mm FPC 리본 케이블 또는 초미세 동축 (30cm 초과 시 차동 감쇠 급증)',
    powerTypical: 0.2,
    powerMax: 0.5,
    powerNote: '0.1 ~ 0.5W (초저전력)',
    powerSpecDetail: '별도 SerDes IC 없음, 모바일 AP 내장 ISP 직결로 발열 및 전력 소모 극소화',
    powerDelivery: '독립 온보드 전원 (1.8V / 2.8V / 3.3V LDO or PMIC)'
  },
  {
    id: 'gmsl',
    name: 'GMSL2 (차량용 SerDes)',
    shortName: 'GMSL2',
    color: '#dc2626',
    lightBg: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    cableLengthTypical: 15,
    cableLengthMax: 20,
    cableNote: '최대 15m (조건부 20m)',
    cableSpecDetail: '50Ω 차폐 동축선(RG-174/RTK031) + FAKRA 커넥터, 하드웨어 적응형 등화기(EQ)',
    powerTypical: 2.2,
    powerMax: 3.5,
    powerNote: '1.5 ~ 3.5W (SerDes 구동)',
    powerSpecDetail: 'MAX9295 직렬화기 + MAX9296 역직렬화기 + PoC 회로 소모 전력 포함',
    powerDelivery: 'PoC (Power over Coax) 12V DC 단일 동축선 전원 중첩'
  },
  {
    id: 'usb',
    name: '산업용 USB 3.0 / Vision',
    shortName: 'USB 3.0',
    color: '#16a34a',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    cableLengthTypical: 3,
    cableLengthMax: 5,
    cableNote: '3m ~ 5m (패시브)',
    cableSpecDetail: '산업용 스크류 락 체결 (AOC 광케이블 사용 시 최대 10~15m 가능)',
    powerTypical: 1.6,
    powerMax: 2.5,
    powerNote: '1.0 ~ 2.5W (버스 파워)',
    powerSpecDetail: 'USB 호스트 5V 전원(최대 900mA / 4.5W 규격) 범위 내에서 카메라 전체 구동',
    powerDelivery: '표준 USB 5V 버스 파워 (별도 어댑터 불필요)'
  }
];

type MetricViewMode = 'both' | 'power' | 'cable';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  metricType?: 'power' | 'cable';
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, metricType }) => {
  if (active && payload && payload.length) {
    const item = INTERFACE_BENCHMARK_DATA.find(
      (d) => d.shortName === label || d.name === label
    );

    return (
      <div className="bg-gray-900/95 backdrop-blur-xs text-white p-3.5 rounded-xl shadow-xl border border-gray-700 text-xs space-y-2 max-w-xs z-50">
        <div className="border-b border-gray-700 pb-1.5 flex justify-between items-center">
          <span className="font-bold text-gray-100 flex items-center">
            <span
              className="w-2.5 h-2.5 rounded-full mr-1.5"
              style={{ backgroundColor: item?.color || '#6366f1' }}
            />
            {item?.name || label}
          </span>
        </div>

        {metricType === 'power' || !metricType ? (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-emerald-400 font-medium">
              <span>전력 소비 (Typical / Max):</span>
              <span className="font-bold font-mono text-white">
                {item?.powerTypical}W / {item?.powerMax}W
              </span>
            </div>
            <p className="text-[10px] text-gray-300 pl-2 leading-tight">
              ↳ 공급: {item?.powerDelivery}
            </p>
            <p className="text-[10px] text-gray-400 pl-2 leading-tight">
              ↳ 상세: {item?.powerSpecDetail}
            </p>
          </div>
        ) : null}

        {metricType === 'cable' || !metricType ? (
          <div className="space-y-1 pt-1 border-t border-gray-800">
            <div className="flex justify-between items-center text-blue-400 font-medium">
              <span>최대 케이블 길이:</span>
              <span className="font-bold font-mono text-white">
                {item?.cableLengthMax}m ({item?.cableLengthTypical}m 권장)
              </span>
            </div>
            <p className="text-[10px] text-gray-300 pl-2 leading-tight">
              ↳ 배선: {item?.cableSpecDetail}
            </p>
          </div>
        ) : null}
      </div>
    );
  }
  return null;
};

export const PowerAndDistanceBarChart: React.FC = () => {
  // Toggle selection for interfaces
  const [selectedInterfaces, setSelectedInterfaces] = useState<{
    mipi: boolean;
    gmsl: boolean;
    usb: boolean;
  }>({
    mipi: true,
    gmsl: true,
    usb: true
  });

  const [viewMode, setViewMode] = useState<MetricViewMode>('both');

  const toggleInterface = (key: 'mipi' | 'gmsl' | 'usb') => {
    const activeCount = Object.values(selectedInterfaces).filter(Boolean).length;
    if (activeCount === 1 && selectedInterfaces[key]) {
      return; // prevent unchecking everything
    }
    setSelectedInterfaces((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAll = () => {
    setSelectedInterfaces({ mipi: true, gmsl: true, usb: true });
  };

  // Filtered dataset according to user selection
  const filteredData = useMemo(() => {
    return INTERFACE_BENCHMARK_DATA.filter((item) => selectedInterfaces[item.id]);
  }, [selectedInterfaces]);

  const activeCount = Object.values(selectedInterfaces).filter(Boolean).length;

  return (
    <div
      className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200/90 shadow-xs space-y-5"
      id="power-distance-bar-chart-container"
    >
      {/* Component Header & Control Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
              <BatteryCharging className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">
              전력 소비량(Power) 및 최대 케이블 길이(Cable Length) 정량 비교 차트
            </h4>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            선택된 인터페이스 간 소비 전력(W)과 전송 거리(m)의 트레이드오프를 막대 그래프로 시각화합니다.
          </p>
        </div>

        {/* View Mode & Interface Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'both'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              종합 (2개 지표)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('power')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'power'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              전력 소비 (W)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cable')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'cable'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              케이블 거리 (m)
            </button>
          </div>

          <div className="h-4 w-px bg-gray-200 hidden sm:block" />

          {/* Interface Checkbox Controls */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => toggleInterface('mipi')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                selectedInterfaces.mipi
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-60'
              }`}
              title="MIPI CSI-2 인터페이스 표시 토글"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>MIPI CSI-2</span>
            </button>

            <button
              type="button"
              onClick={() => toggleInterface('gmsl')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                selectedInterfaces.gmsl
                  ? 'bg-red-50 text-red-700 border-red-200 shadow-2xs'
                  : 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-60'
              }`}
              title="GMSL2 인터페이스 표시 토글"
            >
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>GMSL2</span>
            </button>

            <button
              type="button"
              onClick={() => toggleInterface('usb')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                selectedInterfaces.usb
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                  : 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-60'
              }`}
              title="USB 3.0 인터페이스 표시 토글"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>USB 3.0</span>
            </button>

            {activeCount < 3 && (
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium px-1.5 py-0.5 rounded hover:bg-indigo-50"
              >
                전체
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="space-y-6">
        {/* Case 1: Both Metrics Displayed Side by Side */}
        {viewMode === 'both' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Power Consumption Bar Chart */}
            <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-800">
                    소비 전력 (Power Consumption, W)
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  낮을수록 우수 (W 단위)
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">
                카메라 1대당 전력 소모량 (Typical 기준 및 Max 피크 범위)
              </p>

              <div className="w-full h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fill: '#374151', fontSize: 11, fontWeight: 'bold' }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis
                      domain={[0, 4]}
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      axisLine={{ stroke: '#d1d5db' }}
                      unit="W"
                    />
                    <Tooltip content={<CustomBarTooltip metricType="power" />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: 8 }}
                      iconSize={8}
                    />
                    <Bar
                      name="Typical 소비전력 (W)"
                      dataKey="powerTypical"
                      radius={[6, 6, 0, 0]}
                    >
                      {filteredData.map((entry) => (
                        <Cell key={`cell-power-${entry.id}`} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="powerTypical"
                        position="top"
                        formatter={(val: number) => `${val}W`}
                        style={{ fill: '#1f2937', fontSize: 10, fontWeight: 'bold' }}
                      />
                    </Bar>
                    <Bar
                      name="최대 피크 전력 (W)"
                      dataKey="powerMax"
                      fill="#9ca3af"
                      fillOpacity={0.4}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="powerMax"
                        position="top"
                        formatter={(val: number) => `(최대 ${val}W)`}
                        style={{ fill: '#6b7280', fontSize: 9 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 text-[10px] text-gray-500 bg-white p-2 rounded-lg border border-gray-200/70">
                💡 <strong>MIPI:</strong> 브리지 IC가 없어 0.2W로 최저 · <strong>GMSL2:</strong> SerDes 칩셋 및 12V PoC로 2.2W 소모
              </div>
            </div>

            {/* 2. Maximum Cable Length Bar Chart */}
            <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <Maximize2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-gray-800">
                    최대 케이블 전송 거리 (Max Cable Length, m)
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  길수록 우수 (미터 단위)
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">
                신호 무결성(SI) 감쇠 없이 비압축 전송 가능한 최대 물리적 거리
              </p>

              <div className="w-full h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fill: '#374151', fontSize: 11, fontWeight: 'bold' }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis
                      domain={[0, 22]}
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      axisLine={{ stroke: '#d1d5db' }}
                      unit="m"
                    />
                    <Tooltip content={<CustomBarTooltip metricType="cable" />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: 8 }}
                      iconSize={8}
                    />
                    <Bar
                      name="공식 보장 전송거리 (m)"
                      dataKey="cableLengthTypical"
                      radius={[6, 6, 0, 0]}
                    >
                      {filteredData.map((entry) => (
                        <Cell key={`cell-cable-${entry.id}`} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="cableLengthTypical"
                        position="top"
                        formatter={(val: number) => (val < 1 ? `${val * 100}cm` : `${val}m`)}
                        style={{ fill: '#1f2937', fontSize: 10, fontWeight: 'bold' }}
                      />
                    </Bar>
                    <Bar
                      name="조건부 최대 한계 거리 (m)"
                      dataKey="cableLengthMax"
                      fill="#9ca3af"
                      fillOpacity={0.4}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="cableLengthMax"
                        position="top"
                        formatter={(val: number) => (val < 1 ? `(한계 ${val * 100}cm)` : `(최대 ${val}m)`)}
                        style={{ fill: '#6b7280', fontSize: 9 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 text-[10px] text-gray-500 bg-white p-2 rounded-lg border border-gray-200/70">
                💡 <strong>GMSL2:</strong> 15m 동축 전장 FAKRA로 압도적 1위 · <strong>MIPI:</strong> 30cm 이내 온보드 전용
              </div>
            </div>
          </div>
        )}

        {/* Case 2: Isolated Power Consumption View */}
        {viewMode === 'power' && (
          <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <h5 className="text-sm font-bold text-gray-800">
                  인터페이스별 소비 전력(W) 및 발열/전원 공급 아키텍처
                </h5>
              </div>
              <span className="text-xs text-gray-500 font-mono">단위: 와트 (W)</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              카메라 모듈 및 SerDes 트랜시버가 소모하는 상시 Typical 전력과 최대 피크 전력 심층 비교
            </p>

            <div className="w-full h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 20, right: 30, bottom: 25, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis
                    domain={[0, 4]}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                    unit="W"
                  />
                  <Tooltip content={<CustomBarTooltip metricType="power" />} />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: '12px' }} />
                  <Bar
                    name="Typical 평균 소비전력 (W)"
                    dataKey="powerTypical"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  >
                    {filteredData.map((entry) => (
                      <Cell key={`cell-p-${entry.id}`} fill={entry.color} />
                    ))}
                    <LabelList
                      dataKey="powerTypical"
                      position="top"
                      formatter={(val: number) => `${val} W`}
                      style={{ fill: '#111827', fontSize: 11, fontWeight: 'bold' }}
                    />
                  </Bar>
                  <Bar
                    name="최대 소비전력 한계 (W)"
                    dataKey="powerMax"
                    fill="#9ca3af"
                    fillOpacity={0.35}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  >
                    <LabelList
                      dataKey="powerMax"
                      position="top"
                      formatter={(val: number) => `${val} W Max`}
                      style={{ fill: '#4b5563', fontSize: 10 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Case 3: Isolated Cable Length View */}
        {viewMode === 'cable' && (
          <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Maximize2 className="w-4 h-4 text-blue-600" />
                <h5 className="text-sm font-bold text-gray-800">
                  인터페이스별 최대 케이블 전송 거리(m) 및 배선 규격
                </h5>
              </div>
              <span className="text-xs text-gray-500 font-mono">단위: 미터 (m)</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              고속 비디오 스트림 전송 시 신호 감쇠(Loss) 및 지터 없이 보장되는 거리 정량 대조
            </p>

            <div className="w-full h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 20, right: 30, bottom: 25, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis
                    domain={[0, 22]}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                    unit="m"
                  />
                  <Tooltip content={<CustomBarTooltip metricType="cable" />} />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: '12px' }} />
                  <Bar
                    name="표준 보장 전송거리 (m)"
                    dataKey="cableLengthTypical"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  >
                    {filteredData.map((entry) => (
                      <Cell key={`cell-c-${entry.id}`} fill={entry.color} />
                    ))}
                    <LabelList
                      dataKey="cableLengthTypical"
                      position="top"
                      formatter={(val: number) => (val < 1 ? `${val * 100} cm` : `${val} m`)}
                      style={{ fill: '#111827', fontSize: 11, fontWeight: 'bold' }}
                    />
                  </Bar>
                  <Bar
                    name="조건부 최대 한계 거리 (m)"
                    dataKey="cableLengthMax"
                    fill="#9ca3af"
                    fillOpacity={0.35}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  >
                    <LabelList
                      dataKey="cableLengthMax"
                      position="top"
                      formatter={(val: number) => (val < 1 ? `${val * 100} cm` : `${val} m Max`)}
                      style={{ fill: '#4b5563', fontSize: 10 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quantitative Comparative Insights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {filteredData.map((item) => (
            <div
              key={`insight-${item.id}`}
              className={`p-3.5 rounded-xl border ${item.borderColor} ${item.lightBg}/60 space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${item.textColor} flex items-center`}>
                  <span
                    className="w-2.5 h-2.5 rounded-full mr-1.5"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.shortName}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-white border border-gray-200 text-gray-700">
                  {item.cableNote.split(' ')[0]} / {item.powerNote.split(' ')[0]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-200/60 font-mono">
                <div>
                  <span className="text-[10px] text-gray-500 block font-sans">소비전력</span>
                  <span className="font-bold text-gray-900">{item.powerTypical}W</span>
                  <span className="text-[9px] text-gray-400 block font-sans">최대 {item.powerMax}W</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block font-sans">최대거리</span>
                  <span className="font-bold text-gray-900">
                    {item.cableLengthTypical < 1
                      ? `${item.cableLengthTypical * 100}cm`
                      : `${item.cableLengthTypical}m`}
                  </span>
                  <span className="text-[9px] text-gray-400 block font-sans">
                    한계 {item.cableLengthMax}m
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gray-600 leading-tight pt-1">
                <strong>전원/배선:</strong> {item.powerDelivery.split('(')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
