import React, { useState, useMemo } from 'react';
import { RadarChart5D } from './RadarChart5D';
import { COMPARISON_ROWS } from '../data/interfaceData';
import { Search, Filter, CheckCircle, Info, SlidersHorizontal } from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: '전체 항목 (10개)' },
    { id: 'performance', label: '전송 및 대역폭' },
    { id: 'physical', label: '물리적 한계' },
    { id: 'reliability', label: '신뢰성 및 전원' },
    { id: 'cost', label: '비용 및 개발성' }
  ];

  const filteredRows = useMemo(() => {
    return COMPARISON_ROWS.filter((row) => {
      const matchCategory = selectedCategory === 'all' || row.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.mipi.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.gmsl.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.usb.value.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-8" id="overview-tab-content">
      {/* Strategic Radar & Cards Overview */}
      <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              📊 5대 핵심 평가 축 트레이드오프 레이더 (Recharts)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              지연 시간(Latency), 대역폭(Bandwidth), 총소유비용(TCO), 설치/배선성(Installation), 신뢰성(Reliability) 5대 차원 비교
            </p>
          </div>
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 self-start">
            <Info className="w-3.5 h-3.5 mr-1" />
            100점 만점 표준화 스코어
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Recharts 5-Dimension Radar Chart Container */}
          <div className="lg:col-span-7 bg-gray-50/70 p-4 rounded-xl border border-gray-100 flex flex-col">
            <RadarChart5D />
          </div>

          {/* Strategic Decision Guide Highlights */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 transition-all hover:bg-blue-50">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-blue-950 text-xs flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mr-2"></span>
                  MIPI CSI-2 채택 핵심 시나리오
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-200/70 text-blue-900 rounded">
                  온보드 초단거리
                </span>
              </div>
              <p className="text-xs text-blue-900 mt-1.5 leading-relaxed">
                센서와 처리 프로세서(SoC/AP)가 동일 보드 상에 있거나 30cm 이내인 경우 최상의 선택입니다.
                추가 직렬화 칩이 없어 초저전력 구동이 가능하며, 대량 양산 시 단가가 가장 낮습니다.
              </p>
              <div className="mt-2 flex gap-2 text-[11px] text-blue-800 font-medium">
                <span>✓ 0ms 수준 지연</span>
                <span>✓ 센서 직접 ISP 파이프라인</span>
                <span>✓ 최소 전력 소모</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200/80 transition-all hover:bg-red-50">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-red-950 text-xs flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>
                  GMSL2 (SerDes) 채택 핵심 시나리오
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-200/70 text-red-900 rounded">
                  차량·산업 가혹환경
                </span>
              </div>
              <p className="text-xs text-red-900 mt-1.5 leading-relaxed">
                15m 장거리 배선, 고온·진동, 모터/인버터 극심 노이즈 환경 및 PoC(Power over Coax) 단일 케이블 전원 공급이
                필수적인 자율주행(ADAS), 야외 AMR 로봇에 사실상의 글로벌 표준입니다.
              </p>
              <div className="mt-2 flex gap-2 text-[11px] text-red-800 font-medium">
                <span>✓ 15m 동축 FAKRA</span>
                <span>✓ ASIL-B 기능안전</span>
                <span>✓ µs 단위 정밀 동기화</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 transition-all hover:bg-emerald-50">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-950 text-xs flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2"></span>
                  산업용 USB 3.0 / USB3 Vision 채택 핵심 시나리오
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200/70 text-emerald-900 rounded">
                  신속 출시 & 범용 PC
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-1.5 leading-relaxed">
                Windows/Linux PC 기반 머신비전 검사 장비나 타임투마켓이 촉박한 신속 PoC 프로젝트에 최적입니다.
                드라이버 개발 소요(NRE)가 1~3일에 불과하여 프로젝트 셋업 기간을 획기적으로 단축합니다.
              </p>
              <div className="mt-2 flex gap-2 text-[11px] text-emerald-800 font-medium">
                <span>✓ UVC 플러그앤플레이</span>
                <span>✓ 스크류락 안전 체결</span>
                <span>✓ NRE $0 수준</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Detailed Matrix Table */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden" id="full-spec-matrix">
        {/* Table Controls & Filters */}
        <div className="p-5 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              📋 인터페이스별 세부 사양 종합 비교 매트릭스
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              항목별 필터 및 검색을 통해 필요한 사양을 신속히 검토할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="항목 또는 사양 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-5 py-2.5 bg-gray-50/30 border-b border-gray-100 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-gray-400 flex items-center text-[11px] mr-1">
            <SlidersHorizontal className="w-3 h-3 mr-1" /> 분류:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors font-medium text-xs ${
                selectedCategory === cat.id
                  ? 'bg-gray-800 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100/90 text-gray-700 font-semibold border-b border-gray-200">
                <th className="p-3.5 w-1/4 min-w-[170px] text-gray-800">비교 항목</th>
                <th className="p-3.5 w-1/4 min-w-[210px] bg-blue-50/80 text-blue-950 border-l border-blue-100">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="font-bold">MIPI CSI-2</span>
                  </div>
                </th>
                <th className="p-3.5 w-1/4 min-w-[210px] bg-red-50/80 text-red-950 border-l border-red-100">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span className="font-bold">GMSL2 (SerDes)</span>
                  </div>
                </th>
                <th className="p-3.5 w-1/4 min-w-[210px] bg-emerald-50/80 text-emerald-950 border-l border-emerald-100">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="font-bold">산업용 USB 3.0 / Vision</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900 bg-gray-50/40 align-top">
                      <div className="flex flex-col">
                        <span>{row.title}</span>
                        <span className="text-[10px] font-normal text-gray-400 mt-0.5">
                          {row.categoryLabel}
                        </span>
                      </div>
                    </td>

                    {/* MIPI cell */}
                    <td className="p-3.5 border-l border-gray-100 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span
                            className={`font-semibold ${
                              row.mipi.highlight ? 'text-blue-700' : 'text-gray-900'
                            }`}
                          >
                            {row.mipi.value}
                          </span>
                          {row.mipi.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">
                              {row.mipi.badge}
                            </span>
                          )}
                        </div>
                        {row.mipi.subtext && (
                          <p className="text-[11px] text-gray-500 leading-tight">
                            {row.mipi.subtext}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* GMSL2 cell */}
                    <td className="p-3.5 border-l border-gray-100 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span
                            className={`font-semibold ${
                              row.gmsl.highlight ? 'text-red-700' : 'text-gray-900'
                            }`}
                          >
                            {row.gmsl.value}
                          </span>
                          {row.gmsl.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-semibold">
                              {row.gmsl.badge}
                            </span>
                          )}
                        </div>
                        {row.gmsl.subtext && (
                          <p className="text-[11px] text-gray-500 leading-tight">
                            {row.gmsl.subtext}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* USB cell */}
                    <td className="p-3.5 border-l border-gray-100 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span
                            className={`font-semibold ${
                              row.usb.highlight ? 'text-emerald-700' : 'text-gray-900'
                            }`}
                          >
                            {row.usb.value}
                          </span>
                          {row.usb.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              {row.usb.badge}
                            </span>
                          )}
                        </div>
                        {row.usb.subtext && (
                          <p className="text-[11px] text-gray-500 leading-tight">
                            {row.usb.subtext}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    검색 조건에 일치하는 비교 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
