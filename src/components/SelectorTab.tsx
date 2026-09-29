import React, { useState, useMemo } from 'react';
import { SelectorFormState, RecommendationResult } from '../types';
import { Compass, CheckCircle, Sparkles, Sliders, Shield, Zap, Cable } from 'lucide-react';

export const SelectorTab: React.FC = () => {
  const [formState, setFormState] = useState<SelectorFormState>({
    distance: 'long',
    environment: 'outdoor',
    latency: 'critical',
    development: 'custom',
    budget: 'medium',
    cameraCount: 4
  });

  // Presets for quick real-world scenario testing
  const applyPreset = (preset: 'adas' | 'drone' | 'factory' | 'robot') => {
    switch (preset) {
      case 'adas':
        setFormState({
          distance: 'long',
          environment: 'outdoor',
          latency: 'critical',
          development: 'custom',
          budget: 'high',
          cameraCount: 4
        });
        break;
      case 'drone':
        setFormState({
          distance: 'short',
          environment: 'indoor',
          latency: 'critical',
          development: 'custom',
          budget: 'low',
          cameraCount: 1
        });
        break;
      case 'factory':
        setFormState({
          distance: 'medium',
          environment: 'factory',
          latency: 'normal',
          development: 'fast',
          budget: 'medium',
          cameraCount: 2
        });
        break;
      case 'robot':
        setFormState({
          distance: 'medium',
          environment: 'factory',
          latency: 'critical',
          development: 'custom',
          budget: 'medium',
          cameraCount: 2
        });
        break;
    }
  };

  // Recommendation engine calculation
  const result: RecommendationResult = useMemo(() => {
    let scoreMipi = 50;
    let scoreGmsl = 50;
    let scoreUsb = 50;

    // 1. Distance
    if (formState.distance === 'short') {
      scoreMipi += 40;
      scoreGmsl += 10;
      scoreUsb += 20;
    } else if (formState.distance === 'medium') {
      scoreMipi -= 35;
      scoreGmsl += 25;
      scoreUsb += 35;
    } else if (formState.distance === 'long') {
      scoreMipi -= 60;
      scoreGmsl += 48;
      scoreUsb -= 20;
    }

    // 2. Environment
    if (formState.environment === 'indoor') {
      scoreMipi += 10;
      scoreUsb += 20;
    } else if (formState.environment === 'factory') {
      scoreGmsl += 20;
      scoreUsb += 15;
    } else if (formState.environment === 'outdoor') {
      scoreGmsl += 40;
      scoreMipi -= 30;
      scoreUsb -= 25;
    }

    // 3. Latency & Sync
    if (formState.latency === 'critical') {
      scoreMipi += 25;
      scoreGmsl += 25;
      scoreUsb -= 30;
    } else {
      scoreUsb += 20;
    }

    // 4. Dev Speed / NRE
    if (formState.development === 'fast') {
      scoreUsb += 40;
      scoreGmsl -= 25;
      scoreMipi -= 10;
    } else {
      scoreGmsl += 15;
      scoreMipi += 15;
    }

    // 5. Budget
    if (formState.budget === 'low') {
      scoreMipi += 25;
      scoreUsb += 15;
      scoreGmsl -= 35;
    } else if (formState.budget === 'high') {
      scoreGmsl += 20;
    }

    // Clamp scores
    const finalMipi = Math.max(10, Math.min(99, scoreMipi));
    const finalGmsl = Math.max(10, Math.min(99, scoreGmsl));
    const finalUsb = Math.max(10, Math.min(99, scoreUsb));

    const scores = { mipi: finalMipi, gmsl: finalGmsl, usb: finalUsb };

    if (finalGmsl >= finalMipi && finalGmsl >= finalUsb) {
      return {
        winner: 'gmsl',
        winnerTitle: 'GMSL2 (SerDes) 최적 추천',
        winnerBadge: `적합도 ${finalGmsl}%`,
        winnerDesc:
          '장거리 전송(최대 15m), 강력한 EMI 차폐, 마이크로초 단위의 완벽한 다중 카메라 동기화 및 전장급 신뢰성이 요구되는 환경입니다. 초기 BOM 및 NRE 개발비가 높더라도 GMSL2가 유일한 안전하고 검증된 선택입니다.',
        patternText:
          "GMSL2 4-채널 입력 스트림은 NVIDIA Jetson Orin의 ISP를 통해 비전 추론 모델용 720p/640x640 ROI로 하드웨어 다운스케일링하고, 4K 원본은 인코더(NVENC)로 실시간 압축 저장하는 '듀얼 스트림 파이프라인' 구성을 강력 권장합니다.",
        scores
      };
    } else if (finalMipi >= finalGmsl && finalMipi >= finalUsb) {
      return {
        winner: 'mipi',
        winnerTitle: 'MIPI CSI-2 최적 추천',
        winnerBadge: `적합도 ${finalMipi}%`,
        winnerDesc:
          '센서와 호스트 SoC 간 거리가 30cm 이내이며, 하드웨어 BOM 비용을 극도로 절감하고 1ms 미만의 극초저지연 직결 통신이 최우선인 소형 기기/드론/동일 보드 셋업에 최적입니다.',
        patternText:
          'MIPI CSI-2 초저전력 특성을 극대화하기 위해 센서 픽셀 데이터를 프로세서의 ISP 메모리 맵으로 직접 직결(Direct Mapping)하고, 리눅스 커널 레벨 V4L2 Subdev 드라이버와 Device Tree Overlay(DTS)를 최적화하세요.',
        scores
      };
    } else {
      return {
        winner: 'usb',
        winnerTitle: '산업용 USB 3.0 / USB3 Vision 최적 추천',
        winnerBadge: `적합도 ${finalUsb}%`,
        winnerDesc:
          '신속한 제품 출시(Time-to-Market) 및 $0에 가까운 드라이버 개발 비용이 핵심 목표입니다. x86/ARM 호스트와의 손쉬운 플러그앤플레이 통합과 표준 UVC/GenICam 에코시스템의 풍부한 도구를 즉시 활용할 수 있습니다.',
        patternText:
          '공장 진동에 대비해 반드시 산업용 듀얼 스크류 락(Screw-lock) 케이블을 채택하고, UVC 대신 USB3 Vision DMA 제로 카피 벌크 전송 라이브러리를 활용하여 호스트 CPU 부하와 패킷 지연을 최소화하세요.',
        scores
      };
    }
  }, [formState]);

  return (
    <div className="space-y-8" id="selector-tab-content">
      {/* Section Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              🎯 맞춤형 카메라 인터페이스 의사결정 추천 엔진
            </h3>
            <p className="text-xs text-gray-600">
              거리, 가혹도, 실시간성, 개발 여력 및 부품 예산을 입력하면 최적의 인터페이스와 실전 아키텍처 패턴을 도출합니다.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 self-start">
            <span className="text-[11px] font-semibold text-gray-400 mr-1 flex items-center">
              <Sparkles className="w-3 h-3 mr-1 text-indigo-500" /> 시나리오 프리셋:
            </span>
            <button
              onClick={() => applyPreset('adas')}
              className="px-2.5 py-1 text-xs rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-semibold transition"
            >
              자율주행 ADAS
            </button>
            <button
              onClick={() => applyPreset('drone')}
              className="px-2.5 py-1 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition"
            >
              드론/초소형
            </button>
            <button
              onClick={() => applyPreset('factory')}
              className="px-2.5 py-1 text-xs rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold transition"
            >
              공장 외관검사 PC
            </button>
            <button
              onClick={() => applyPreset('robot')}
              className="px-2.5 py-1 text-xs rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-semibold transition"
            >
              협동로봇 그리퍼
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Questionnaire + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Questionnaire Form */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-gray-200/90 shadow-xs space-y-5">
          <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3 flex items-center">
            <Sliders className="w-4 h-4 mr-2 text-indigo-600" />
            프로젝트 요구조건 파라미터 입력
          </h4>

          {/* Q1: Distance */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              1. 센서와 메인 컴퓨팅 간 전송 거리
            </label>
            <select
              value={formState.distance}
              onChange={(e) =>
                setFormState({ ...formState, distance: e.target.value as any })
              }
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-gray-900 font-medium"
            >
              <option value="short">0.3m (30cm) 이내 (동일 보드 / 소형 섀시 내부)</option>
              <option value="medium">0.3m ~ 3m (실내 소형 로봇 / 제조 장비 랙)</option>
              <option value="long">3m ~ 15m (대형 차량 / 실외 중장비 / 공장 장거리 배선)</option>
            </select>
          </div>

          {/* Q2: Environment */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              2. 사용 환경 및 전자기 간섭 (EMI/EMC)
            </label>
            <select
              value={formState.environment}
              onChange={(e) =>
                setFormState({ ...formState, environment: e.target.value as any })
              }
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-gray-900 font-medium"
            >
              <option value="indoor">실내 사무실 / 연구실 (노이즈 거의 없음)</option>
              <option value="factory">산업 제조 라인 (모터 노이즈, 기계 진동 감지)</option>
              <option value="outdoor">차량 ADAS / 건설 중장비 / 야외 가혹 환경 (극심한 EMI, 방수 IP67 필수)</option>
            </select>
          </div>

          {/* Q3: Latency */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              3. 지연 시간 (Latency) 및 다중 카메라 동기화 요구사항
            </label>
            <select
              value={formState.latency}
              onChange={(e) =>
                setFormState({ ...formState, latency: e.target.value as any })
              }
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-gray-900 font-medium"
            >
              <option value="critical">극강의 실시간성 (&lt; 1ms) & µs 단위 하드웨어 프레임 동기화 필수</option>
              <option value="normal">보통 수준 (10~30ms 수용 가능, 단순 화상 검사/기록)</option>
            </select>
          </div>

          {/* Q4: Development Resource */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              4. 소프트웨어 드라이버 개발 자원 및 출시 일정 (Time-to-Market)
            </label>
            <select
              value={formState.development}
              onChange={(e) =>
                setFormState({ ...formState, development: e.target.value as any })
              }
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-gray-900 font-medium"
            >
              <option value="fast">최우선 목표: 수일 내 신속한 PoC 완료 (드라이버 개발 인력 부재)</option>
              <option value="custom">임베디드 리눅스 V4L2 / DTS 커널 드라이버 튜닝 인력 보유</option>
            </select>
          </div>

          {/* Q5: Budget Level */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              5. 양산 부품 예산 (BOM Cost)
            </label>
            <select
              value={formState.budget}
              onChange={(e) =>
                setFormState({ ...formState, budget: e.target.value as any })
              }
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-gray-900 font-medium"
            >
              <option value="low">최저가 양산 원가 필수 ($)</option>
              <option value="medium">중간 수준 예산 ($$)</option>
              <option value="high">고가 비용 수용 가능, 성능 및 신뢰성 최우선 ($$$)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Recommendation Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-xs">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              인공지능 추천 엔진 결과
            </h4>

            {/* Winner Card */}
            <div
              className={`p-5 rounded-xl border-2 mb-5 transition-all ${
                result.winner === 'gmsl'
                  ? 'bg-red-50/70 border-red-300'
                  : result.winner === 'mipi'
                  ? 'bg-blue-50/70 border-blue-300'
                  : 'bg-emerald-50/70 border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  {result.winner === 'gmsl' && <Shield className="w-5 h-5 text-red-600" />}
                  {result.winner === 'mipi' && <Zap className="w-5 h-5 text-blue-600" />}
                  {result.winner === 'usb' && <Cable className="w-5 h-5 text-emerald-600" />}
                  <span
                    className={`text-base font-bold ${
                      result.winner === 'gmsl'
                        ? 'text-red-950'
                        : result.winner === 'mipi'
                        ? 'text-blue-950'
                        : 'text-emerald-950'
                    }`}
                  >
                    {result.winnerTitle}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 font-bold text-xs rounded-full shadow-2xs ${
                    result.winner === 'gmsl'
                      ? 'bg-red-600 text-white'
                      : result.winner === 'mipi'
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {result.winnerBadge}
                </span>
              </div>

              <p
                className={`text-xs mt-2.5 leading-relaxed font-normal ${
                  result.winner === 'gmsl'
                    ? 'text-red-900'
                    : result.winner === 'mipi'
                    ? 'text-blue-900'
                    : 'text-emerald-900'
                }`}
              >
                {result.winnerDesc}
              </p>
            </div>

            {/* Score Breakdown Bars */}
            <h5 className="font-bold text-gray-800 text-xs mb-3">
              규격별 알고리즘 산출 적합도 점수
            </h5>
            <div className="space-y-3 text-xs">
              {/* MIPI Score */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-blue-950 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mr-1.5"></span>
                    MIPI CSI-2
                  </span>
                  <span className="font-bold text-blue-900">{result.scores.mipi}점</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${result.scores.mipi}%` }}
                  ></div>
                </div>
              </div>

              {/* GMSL2 Score */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-red-950 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-600 mr-1.5"></span>
                    GMSL2 (SerDes)
                  </span>
                  <span className="font-bold text-red-900">{result.scores.gmsl}점</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${result.scores.gmsl}%` }}
                  ></div>
                </div>
              </div>

              {/* USB Score */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-emerald-950 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5"></span>
                    산업용 USB 3.0 / Vision
                  </span>
                  <span className="font-bold text-emerald-900">{result.scores.usb}점</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${result.scores.usb}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Architecture Recommended Blueprint */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h5 className="font-bold text-gray-900 text-xs mb-1.5 flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                현장 엔지니어링 실전 아키텍처 권장 패턴
              </h5>
              <p className="text-xs text-gray-600 leading-relaxed">
                {result.patternText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
