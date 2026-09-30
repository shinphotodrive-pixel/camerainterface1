import React, { useState } from 'react';
import { TcoCostChart } from './Charts';
import { Tco5YearSimulator } from './Tco5YearSimulator';
import { DollarSign, TrendingUp, AlertCircle, Clock, ShieldAlert, Calculator } from 'lucide-react';

export const TcoTab: React.FC = () => {
  const [cameraCount, setCameraCount] = useState<number>(4);

  // Dynamic cost estimations for summary
  const mipiTotal = Math.round(150 * cameraCount + 100 + 3500 + 2000);
  const gmslTotal = Math.round(480 * cameraCount + 300 + 10000 + 2500);
  const usbTotal = Math.round(230 * cameraCount + 80 + 500 + 300);

  return (
    <div className="space-y-8" id="tco-tab-content">
      {/* Section Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          💰 총소유비용(TCO) 및 경제성 분석: BOM vs NRE vs 유지보수
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          초기 하드웨어 부품값(BOM)만으로 시스템 비용을 판단하는 것은 흔히 발생하는 엔지니어링 착시입니다.
          임베디드 리눅스 커널 드라이버 작성 인건비(NRE), 제품 출시 지연(Time-to-Market) 및 OS 메이저 업그레이드 시 드라이버 재포팅 유지보수비까지 합산한
          1년차 총소유비용을 산출합니다.
        </p>
      </div>

      {/* Interactive TCO Calculator & Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Stacked Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">
                카메라 채널 수에 따른 1년차 총소유비용(TCO) 비교
              </h4>
              <p className="text-xs text-gray-500">
                하드웨어 BOM + NRE 소프트웨어 인건비 + OS 유지보수비 합산 ($ USD)
              </p>
            </div>

            {/* Camera count slider/buttons */}
            <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-gray-50 p-1 rounded-lg border border-gray-200">
              <span className="text-[11px] font-semibold text-gray-500 px-1">채널:</span>
              {[1, 2, 4, 6, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setCameraCount(num)}
                  className={`px-2 py-1 text-xs rounded-md font-bold transition-all ${
                    cameraCount === num
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  {num}CH
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 sm:h-80">
            <TcoCostChart cameraCount={cameraCount} className="w-full h-full" />
          </div>

          {/* Quick Summary Numbers */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100 text-center">
            <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100">
              <span className="text-[10px] text-blue-700 font-semibold block">MIPI CSI-2 총합</span>
              <span className="text-sm font-extrabold text-blue-900">${mipiTotal.toLocaleString()}</span>
            </div>
            <div className="p-2 bg-red-50/60 rounded-lg border border-red-100">
              <span className="text-[10px] text-red-700 font-semibold block">GMSL2 총합</span>
              <span className="text-sm font-extrabold text-red-900">${gmslTotal.toLocaleString()}</span>
            </div>
            <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
              <span className="text-[10px] text-emerald-700 font-semibold block">USB 3.0 총합</span>
              <span className="text-sm font-extrabold text-emerald-900">${usbTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Strategic TCO Articles & Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs">
              <DollarSign className="w-4 h-4" />
              <h4>1. 하드웨어 BOM 비용의 역전 법칙</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              순수 부품값만 비교하면 <strong>MIPI CSI-2</strong>(채널당 ~$150)가 가장 저렴하고,
              <strong>GMSL2</strong>(채널당 ~$480)는 MAX9295 직렬화기 + FAKRA 전장 케이블 + 디시리얼라이저 보드로 인해 부품비가 3배 이상 비쌉니다.
              연간 수만 대 이상을 양산하는 모바일·가전 기기에서는 MIPI의 부품 절감 효과가 소프트웨어 개발비를 압도합니다.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs">
              <Clock className="w-4 h-4" />
              <h4>2. 초기 NRE(비반복 엔지니어링) 비용의 함정</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>USB 3.0은 NRE가 $0에 수렴합니다.</strong> UVC 표준 드라이버 덕분에 1~3일이면 프로토타입 동작을 완료합니다.
              반면 <strong>GMSL2는 리눅스 V4L2 커널 드라이버 작성, I2C 주소 가상화 변환, ISP 튜닝에 시니어 엔지니어 3~5주가 소요</strong>되어
              최소 $10,000 이상의 초기 인건비가 발생합니다. 소량 생산(~100대)에서는 USB나 기성 MIPI 키트가 훨씬 경제적입니다.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
              <TrendingUp className="w-4 h-4" />
              <h4>3. OS 메이저 업그레이드 유지보수 리스크</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              NVIDIA Jetpack 또는 리눅스 커널 메이저 업데이트 시 커널 API 변경으로 MIPI/GMSL2 맞춤 드라이버는 호환성이 깨져
              재포팅 비용이 주기적으로 발생합니다. 반면 표준 USB UVC/GenICam 인터페이스는 OS 업그레이드와 무관하게 100% 호환되어
              장기 유지보수비를 대폭 절감합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 5-Year TCO Predictive Simulator Component */}
      <Tco5YearSimulator
        initialCameraCount={cameraCount}
        onCameraCountSync={(count) => setCameraCount(count)}
      />
    </div>
  );
};

