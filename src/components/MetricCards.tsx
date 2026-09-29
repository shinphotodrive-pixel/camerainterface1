import React from 'react';
import { Zap, ShieldCheck, Cable, ArrowUpRight } from 'lucide-react';
import { TabType } from '../types';

interface MetricCardsProps {
  onSelectTab: (tab: TabType) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ onSelectTab }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" id="metric-kpi-cards">
      {/* MIPI CSI-2 Card */}
      <div className="bg-white rounded-xl p-5 border border-blue-200/90 shadow-xs hover:border-blue-300 transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              MIPI CSI-2
            </span>
          </div>
          <span className="text-[11px] font-semibold text-gray-500">온보드 직결</span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm mb-1.5 flex items-center justify-between">
          <span>초저지연 고대역 직결 표준</span>
        </h3>
        <div className="space-y-1.5 text-xs text-gray-600">
          <div className="flex justify-between py-0.5 border-b border-gray-100">
            <span className="text-gray-500">전송 거리:</span>
            <span className="font-semibold text-gray-900">&lt; 0.3m (PCB / FPC)</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-gray-100">
            <span className="text-gray-500">지연 시간:</span>
            <span className="font-semibold text-blue-700">&lt; 1ms (ISP 하드웨어 직결)</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-gray-100">
            <span className="text-gray-500">실효 대역폭:</span>
            <span className="font-semibold text-gray-900">10 Gbps+ (D-PHY 4-Lane)</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-500">하드웨어 BOM:</span>
            <span className="font-semibold text-emerald-700">$300 ~ $800 (가장 저렴)</span>
          </div>
        </div>
        <div className="mt-3.5 pt-3 border-t border-blue-100 text-xs text-blue-900 flex items-center justify-between font-medium">
          <span>타겟: 스마트폰, 드론, 로봇팔 그리퍼</span>
          <button
            onClick={() => onSelectTab('overview')}
            className="text-blue-600 hover:text-blue-800 p-1 flex items-center text-[11px]"
            title="세부 분석 보기"
          >
            상세 <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* GMSL2 Card */}
      <div className="bg-white rounded-xl p-5 border border-red-200/90 shadow-xs hover:border-red-300 transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              GMSL2 (SerDes)
            </span>
          </div>
          <span className="text-[11px] font-semibold text-gray-500">차량 전장 표준</span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm mb-1.5 flex items-center justify-between">
          <span>차량·가혹환경 장거리 표준</span>
        </h3>
        <div className="space-y-1.5 text-xs text-gray-600">
          <div className="flex justify-between py-0.5 border-b border-gray-100">
            <span className="text-gray-500">전송 거리:</span>
            <span className="font-semibold text-red-700">최대 15m (동축 FAKRA)</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-gray-100">
            <span className="text-gray-500">지연 시간:</span>
            <span className="font-semibold text-gray-900">수십 µs (결정론적 지연)</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-gray-100">
            <span className="text-gray-500">실효 대역폭:</span>
            <span className="font-semibold text-gray-900">6 Gbps 순방향 고정</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-500">하드웨어 BOM:</span>
            <span className="font-semibold text-amber-700">$1,500 ~ $2,300 (최고가 SerDes)</span>
          </div>
        </div>
        <div className="mt-3.5 pt-3 border-t border-red-100 text-xs text-red-900 flex items-center justify-between font-medium">
          <span>타겟: 자율주행 ADAS, 야외 AMR, 특수장비</span>
          <button
            onClick={() => onSelectTab('overview')}
            className="text-red-600 hover:text-red-800 p-1 flex items-center text-[11px]"
            title="세부 분석 보기"
          >
            상세 <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* USB 3.0 Card */}
      <div className="bg-white rounded-xl p-5 border border-emerald-200/90 shadow-xs hover:border-emerald-300 transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Cable className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              USB 3.0 / Vision
            </span>
          </div>
          <span className="text-[11px] font-semibold text-gray-500">플러그 & 플레이</span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm mb-1.5 flex items-center justify-between">
          <span>범용 호환 머신비전 표준</span>
        </h3>
        <div className="space-y-1.5 text-xs text-gray-600">
          <div className="flex justify-between py-0.5 border-b border-gray-100">
            <span className="text-gray-500">전송 거리:</span>
            <span className="font-semibold text-gray-900">3 ~ 5m (패시브 케이블)</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-gray-100">
            <span className="text-gray-500">지연 시간:</span>
            <span className="font-semibold text-gray-900">10~40ms (소프트웨어 UVC)</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-gray-100">
            <span className="text-gray-500">실효 대역폭:</span>
            <span className="font-semibold text-gray-900">5 Gbps (350~400 MB/s)</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-500">드라이버 개발:</span>
            <span className="font-semibold text-emerald-700">1~3일 (NRE $0 수준)</span>
          </div>
        </div>
        <div className="mt-3.5 pt-3 border-t border-emerald-100 text-xs text-emerald-900 flex items-center justify-between font-medium">
          <span>타겟: 공장 검사 비전, 신속 PoC, 협동로봇</span>
          <button
            onClick={() => onSelectTab('overview')}
            className="text-emerald-600 hover:text-emerald-800 p-1 flex items-center text-[11px]"
            title="세부 분석 보기"
          >
            상세 <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
