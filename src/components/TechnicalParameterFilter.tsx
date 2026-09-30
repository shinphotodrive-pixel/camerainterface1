import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Zap,
  Maximize2,
  BatteryCharging,
  Clock,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Info,
  Cable,
  Cpu,
  RefreshCw
} from 'lucide-react';

export interface TechParams {
  bandwidthGbps: number;
  maxDistanceMeters: number;
  maxPowerWatts: number;
  targetLatency: 'critical' | 'normal' | 'relaxed'; // <1ms, <10ms, <50ms
  cameraCount: number;
  requirePoC: boolean; // Power over Coax single cable
  requireFsync: boolean; // Hardware frame sync (< 1µs)
}

interface InterfaceEvaluation {
  id: 'mipi' | 'gmsl' | 'usb';
  name: string;
  shortName: string;
  tagline: string;
  color: string;
  bgLight: string;
  borderLight: string;
  borderActive: string;
  textColor: string;
  badgeBg: string;
  score: number;
  status: 'recommended' | 'compatible' | 'conditional' | 'incompatible';
  statusText: string;
  statusIcon: React.ReactNode;
  reasons: string[];
  warnings: string[];
  failures: string[];
  headroom: {
    bandwidth: { val: number; label: string; ok: boolean };
    distance: { val: number; label: string; ok: boolean };
    power: { val: number; label: string; ok: boolean };
  };
  recommendedSetup: string;
}

export const TechnicalParameterFilter: React.FC = () => {
  // Input parameters state
  const [params, setParams] = useState<TechParams>({
    bandwidthGbps: 3.5,
    maxDistanceMeters: 2.0,
    maxPowerWatts: 2.5,
    targetLatency: 'critical',
    cameraCount: 2,
    requirePoC: false,
    requireFsync: true
  });

  // Filter & view controls
  const [hideIncompatible, setHideIncompatible] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'power' | 'bandwidth'>('score');

  // Quick Preset Scenarios
  const applyPreset = (presetKey: 'drone' | 'adas' | 'factory' | 'amr' | 'lab') => {
    switch (presetKey) {
      case 'drone':
        setParams({
          bandwidthGbps: 2.5,
          maxDistanceMeters: 0.15,
          maxPowerWatts: 0.5,
          targetLatency: 'critical',
          cameraCount: 1,
          requirePoC: false,
          requireFsync: false
        });
        break;
      case 'adas':
        setParams({
          bandwidthGbps: 6.0,
          maxDistanceMeters: 12.0,
          maxPowerWatts: 3.5,
          targetLatency: 'critical',
          cameraCount: 4,
          requirePoC: true,
          requireFsync: true
        });
        break;
      case 'amr':
        setParams({
          bandwidthGbps: 4.8,
          maxDistanceMeters: 4.5,
          maxPowerWatts: 2.5,
          targetLatency: 'critical',
          cameraCount: 4,
          requirePoC: true,
          requireFsync: true
        });
        break;
      case 'factory':
        setParams({
          bandwidthGbps: 2.0,
          maxDistanceMeters: 3.0,
          maxPowerWatts: 2.0,
          targetLatency: 'normal',
          cameraCount: 1,
          requirePoC: false,
          requireFsync: false
        });
        break;
      case 'lab':
        setParams({
          bandwidthGbps: 1.5,
          maxDistanceMeters: 1.5,
          maxPowerWatts: 1.5,
          targetLatency: 'relaxed',
          cameraCount: 1,
          requirePoC: false,
          requireFsync: false
        });
        break;
    }
  };

  // Preset bandwidth shortcuts
  const setBandwidthPreset = (gbps: number) => {
    setParams((p) => ({ ...p, bandwidthGbps: gbps }));
  };

  // Evaluation Engine
  const evaluations: InterfaceEvaluation[] = useMemo(() => {
    const {
      bandwidthGbps,
      maxDistanceMeters,
      maxPowerWatts,
      targetLatency,
      cameraCount,
      requirePoC,
      requireFsync
    } = params;

    // 1. Evaluate MIPI CSI-2
    const mipiFailures: string[] = [];
    const mipiWarnings: string[] = [];
    const mipiReasons: string[] = [];
    let mipiScore = 75;

    // Distance check: Hard limit 0.3m
    if (maxDistanceMeters > 0.3) {
      mipiFailures.push(
        `전송 거리(${maxDistanceMeters}m)가 MIPI 물리 한계(0.3m / 30cm)를 초과하여 신호 무결성 상실로 링크 단절`
      );
      mipiScore -= 65;
    } else {
      mipiReasons.push(`단거리 온보드(${maxDistanceMeters}m ≤ 0.3m) 전송에 완벽 대응`);
      mipiScore += 10;
    }

    // Bandwidth check: 4-lane D-PHY v1.2 = 10 Gbps, D-PHY v2.5 = 18 Gbps
    const totalBandwidth = bandwidthGbps * (cameraCount > 1 ? 1 : 1); // Total stream
    if (bandwidthGbps > 18.0) {
      mipiFailures.push(`필요 대역폭(${bandwidthGbps} Gbps)이 단일 MIPI 포트 D-PHY v2.5 한계(18G) 초과`);
      mipiScore -= 50;
    } else if (bandwidthGbps > 10.0) {
      mipiWarnings.push(`대역폭(${bandwidthGbps} Gbps) 충족을 위해 D-PHY v2.5 이상 또는 다중 CSI-2 포트 분할 필요`);
      mipiScore -= 10;
    } else {
      mipiReasons.push(`4레인 D-PHY 10 Gbps 대역폭 내 안정적 비압축 수용`);
      mipiScore += 10;
    }

    // Power check: MIPI is ultra-low (0.1 ~ 0.5W)
    if (maxPowerWatts < 0.2) {
      mipiWarnings.push(`전력 예산(${maxPowerWatts}W)이 센서 및 LDO PMIC 구동 한계치 근접`);
    } else {
      mipiReasons.push(`초저전력(~0.3W) 구동으로 전력 예산(${maxPowerWatts}W) 여유 충분`);
      mipiScore += 15;
    }

    // PoC check
    if (requirePoC) {
      mipiFailures.push(`MIPI CSI-2는 FPC 리본 케이블 구조로 PoC(Power over Coax) 단일선 전송 미지원`);
      mipiScore -= 40;
    }

    // Latency check: MIPI is < 0.8ms direct DMA
    if (targetLatency === 'critical') {
      mipiReasons.push(`SoC 하드웨어 ISP 다이렉트 DMA 매핑으로 1ms 미만 극초저지연 보장`);
      mipiScore += 15;
    }

    // Fsync check
    if (requireFsync && cameraCount > 1) {
      mipiWarnings.push(`다중 카메라 동기화 시 센서 트리거 GPIO 핀 배선 및 드라이버 제어 설계 필요`);
    }

    // 2. Evaluate GMSL2
    const gmslFailures: string[] = [];
    const gmslWarnings: string[] = [];
    const gmslReasons: string[] = [];
    let gmslScore = 70;

    // Distance check: GMSL2 is up to 15m (up to 20m conditional)
    if (maxDistanceMeters > 20.0) {
      gmslFailures.push(`전송 거리(${maxDistanceMeters}m)가 GMSL2 동축 케이블 전송 한계(20m) 초과`);
      gmslScore -= 50;
    } else if (maxDistanceMeters > 15.0) {
      gmslWarnings.push(`15m 초과 전송(${maxDistanceMeters}m) 시 저손실 RTK031 동축 케이블 및 EQ 마진 튜닝 필수`);
      gmslScore += 5;
    } else if (maxDistanceMeters >= 0.5) {
      gmslReasons.push(`최대 15m 단일 동축 FAKRA 케이블로 장거리 신뢰성 완벽 보장`);
      gmslScore += 25;
    } else {
      // Short distance with GMSL2 is over-engineered
      gmslWarnings.push(`30cm 미만 초단거리에서 GMSL2 채택은 SerDes BOM 비용($15~$25) 과다 투자 우려`);
      gmslScore -= 10;
    }

    // Bandwidth check: 6 Gbps single link / 12 Gbps dual link
    if (bandwidthGbps > 11.6) {
      gmslFailures.push(`필요 대역폭(${bandwidthGbps} Gbps)이 GMSL2 듀얼 링크(12G) 한계 초과 (차세대 GMSL3 권장)`);
      gmslScore -= 45;
    } else if (bandwidthGbps > 5.8) {
      gmslWarnings.push(`대역폭(${bandwidthGbps} Gbps) 충족을 위해 듀얼 GMSL2 링크 또는 2-동축 케이블 구성 필요`);
      gmslScore += 5;
    } else {
      gmslReasons.push(`단일 50Ω 동축선 6 Gbps 링크로 무손실 고속 전송 완벽 지원`);
      gmslScore += 15;
    }

    // Power check: GMSL2 draws 1.5 ~ 3.5W (SerDes + PoC)
    if (maxPowerWatts < 1.2) {
      gmslFailures.push(`허용 전력(${maxPowerWatts}W)이 SerDes 브리지 칩 및 PoC 회로 구동 전력(최소 1.5W) 부족`);
      gmslScore -= 55;
    } else if (maxPowerWatts < 2.0) {
      gmslWarnings.push(`전력 예산(${maxPowerWatts}W)이 타이트하여 저전력 SerDes 선정 및 방열 설계 필수`);
    } else {
      gmslReasons.push(`전력 예산(${maxPowerWatts}W) 내 PoC 전원 공급 및 SerDes 안정 구동 가능`);
      gmslScore += 10;
    }

    // PoC check
    if (requirePoC) {
      gmslReasons.push(`단일 동축 케이블 1가닥으로 12V DC 전원 + 고속 비디오 + 제어 신호 통합 (PoC 특화)`);
      gmslScore += 25;
    }

    // Latency & Fsync
    if (targetLatency === 'critical') {
      gmslReasons.push(`MAX9295/9296 파이프라인 고정 수십 µs 결정론적 지연 보장`);
      gmslScore += 15;
    }
    if (requireFsync) {
      gmslReasons.push(`하드웨어 FSYNC 펄스를 통해 여러 카메라의 셔터 노출을 마이크로초 단위로 완벽 동기화`);
      gmslScore += 15;
    }

    // 3. Evaluate USB 3.0 / USB3 Vision
    const usbFailures: string[] = [];
    const usbWarnings: string[] = [];
    const usbReasons: string[] = [];
    let usbScore = 65;

    // Distance check: passive 3m, max 5m
    if (maxDistanceMeters > 5.0) {
      usbFailures.push(`전송 거리(${maxDistanceMeters}m)가 USB 3.0 패시브 케이블 신호 감쇠 한계(5m) 초과 (액티브 리피터 필수)`);
      usbScore -= 45;
    } else if (maxDistanceMeters > 3.0) {
      usbWarnings.push(`3m 초과(${maxDistanceMeters}m) 전송 시 전압 강하 및 패킷 재전송 발생 가능, 고급 차폐 케이블 권장`);
      usbScore -= 5;
    } else {
      usbReasons.push(`표준 패시브 USB 3.0 케이블(3m 이내)로 손쉬운 직접 연결 가능`);
      usbScore += 15;
    }

    // Bandwidth check: ~3.2 Gbps effective
    if (bandwidthGbps > 8.0) {
      usbFailures.push(`필요 대역폭(${bandwidthGbps} Gbps)이 USB 3.0 버스 대역폭을 전면 포화`);
      usbScore -= 45;
    } else if (bandwidthGbps > 3.2) {
      usbWarnings.push(`실효 대역폭(~3.2 Gbps) 초과로 센서 원시 데이터 압축(H.264/MJPEG) 필수, 화질 저하 및 5~15ms 인코딩 지연 발생`);
      usbScore -= 15;
    } else {
      usbReasons.push(`USB 3.0 실효 대역폭(~3.2 Gbps) 내 비압축 수용 가능`);
      usbScore += 10;
    }

    // Power check: 1.0 ~ 2.5W
    if (maxPowerWatts < 0.9) {
      usbFailures.push(`허용 전력(${maxPowerWatts}W)이 USB 3.0 컨트롤러 표준 소비 전력(최소 1.0W) 부족`);
      usbScore -= 35;
    } else {
      usbReasons.push(`표준 5V 버스 파워(최대 4.5W 지원)로 간편한 플러그앤플레이 전원 공급`);
      usbScore += 10;
    }

    // PoC check
    if (requirePoC) {
      usbFailures.push(`USB는 동축선 PoC(Power over Coax) 규격 미지원 (USB 5V 버스 파워만 지원)`);
      usbScore -= 30;
    }

    // Latency check: 10~40ms
    if (targetLatency === 'critical') {
      usbFailures.push(`OS xHCI 폴링 및 커널 UVC 버퍼링으로 인해 1ms 미만 초저지연 달성 불가능 (최소 10~30ms 발생)`);
      usbScore -= 50;
    } else if (targetLatency === 'normal') {
      usbWarnings.push(`USB3 Vision 제로카피 DMA 드라이버 사용 시 8~15ms 지연으로 수용 가능`);
      usbScore += 5;
    } else {
      usbReasons.push(`완화된 지연 허용 조건(50ms 이내)에 완벽 부합`);
      usbScore += 15;
    }

    // Fsync check
    if (requireFsync && cameraCount > 1) {
      usbWarnings.push(`USB 버스 비동기 패킷 전송 특성상 마이크로초 단위 하드웨어 셔터 동기화 불가능`);
      usbScore -= 15;
    }

    // Multi-camera load
    if (cameraCount > 2) {
      usbWarnings.push(`다중 카메라(${cameraCount}대) 연결 시 단일 USB 호스트 컨트롤러 대역폭 경합 및 프레임 드롭 위험`);
      usbScore -= 10;
    }

    // Helper to determine status & score
    const finalizeItem = (
      id: 'mipi' | 'gmsl' | 'usb',
      rawScore: number,
      failures: string[],
      warnings: string[],
      reasons: string[]
    ): InterfaceEvaluation => {
      const hasFail = failures.length > 0;
      const clampedScore = hasFail
        ? Math.max(10, Math.min(48, rawScore))
        : Math.max(50, Math.min(99, rawScore));

      let status: InterfaceEvaluation['status'] = 'compatible';
      let statusText = '호환 가능';
      let statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;

      if (hasFail) {
        status = 'incompatible';
        statusText = '물리적 한계 초과 (불가)';
        statusIcon = <XCircle className="w-4 h-4 text-red-600" />;
      } else if (warnings.length > 0) {
        status = 'conditional';
        statusText = '조건부 적합';
        statusIcon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
      } else {
        status = 'recommended';
        statusText = '최적 적합';
        statusIcon = <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      }

      if (id === 'mipi') {
        return {
          id: 'mipi',
          name: 'MIPI CSI-2',
          shortName: 'MIPI CSI-2',
          tagline: '온보드 초저지연 직결 표준',
          color: '#2563eb',
          bgLight: 'bg-blue-50/70',
          borderLight: 'border-blue-200',
          borderActive: 'border-blue-500 ring-2 ring-blue-500/20',
          textColor: 'text-blue-900',
          badgeBg: 'bg-blue-600 text-white',
          score: clampedScore,
          status,
          statusText,
          statusIcon,
          reasons,
          warnings,
          failures,
          headroom: {
            bandwidth: {
              val: Number((10.0 - bandwidthGbps).toFixed(1)),
              label: `한계 10G 대비 ${Number((10.0 - bandwidthGbps).toFixed(1))}G 여유`,
              ok: bandwidthGbps <= 10.0
            },
            distance: {
              val: Number((0.3 - maxDistanceMeters).toFixed(2)),
              label: `한계 0.3m 대비 ${maxDistanceMeters <= 0.3 ? '적합' : '초과'}`,
              ok: maxDistanceMeters <= 0.3
            },
            power: {
              val: Number((maxPowerWatts - 0.3).toFixed(1)),
              label: `소비전력 ~0.3W (초저전력)`,
              ok: maxPowerWatts >= 0.2
            }
          },
          recommendedSetup:
            'SoC 내장 ISP 직결, 0.5mm 피치 15cm FPC 리본 케이블, Linux V4L2 Subdev 드라이버 최적화'
        };
      } else if (id === 'gmsl') {
        return {
          id: 'gmsl',
          name: 'GMSL2 (SerDes)',
          shortName: 'GMSL2',
          tagline: '차량·산업용 장거리 동축 및 PoC 표준',
          color: '#dc2626',
          bgLight: 'bg-red-50/70',
          borderLight: 'border-red-200',
          borderActive: 'border-red-500 ring-2 ring-red-500/20',
          textColor: 'text-red-900',
          badgeBg: 'bg-red-600 text-white',
          score: clampedScore,
          status,
          statusText,
          statusIcon,
          reasons,
          warnings,
          failures,
          headroom: {
            bandwidth: {
              val: Number((6.0 - bandwidthGbps).toFixed(1)),
              label: `단일 6G / 듀얼 12G 모드 지원`,
              ok: bandwidthGbps <= 11.6
            },
            distance: {
              val: Number((15.0 - maxDistanceMeters).toFixed(1)),
              label: `최대 15m 지원 (${Number((15.0 - maxDistanceMeters).toFixed(1))}m 여유)`,
              ok: maxDistanceMeters <= 15.0
            },
            power: {
              val: Number((maxPowerWatts - 2.2).toFixed(1)),
              label: `소비전력 ~2.2W (SerDes + PoC)`,
              ok: maxPowerWatts >= 1.5
            }
          },
          recommendedSetup:
            'MAX9295A 직렬화기 + MAX9296A 역직렬화기, 50Ω RTK031 동축 케이블, FAKRA 커넥터, PoC 12V 전원 공급'
        };
      } else {
        return {
          id: 'usb',
          name: '산업용 USB 3.0 / USB3 Vision',
          shortName: 'USB 3.0',
          tagline: '범용 플러그앤플레이 표준',
          color: '#16a34a',
          bgLight: 'bg-emerald-50/70',
          borderLight: 'border-emerald-200',
          borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
          textColor: 'text-emerald-900',
          badgeBg: 'bg-emerald-600 text-white',
          score: clampedScore,
          status,
          statusText,
          statusIcon,
          reasons,
          warnings,
          failures,
          headroom: {
            bandwidth: {
              val: Number((3.2 - bandwidthGbps).toFixed(1)),
              label: `실효 대역폭 ~3.2 Gbps`,
              ok: bandwidthGbps <= 3.2
            },
            distance: {
              val: Number((3.0 - maxDistanceMeters).toFixed(1)),
              label: `패시브 한계 3~5m`,
              ok: maxDistanceMeters <= 5.0
            },
            power: {
              val: Number((maxPowerWatts - 1.8).toFixed(1)),
              label: `소비전력 ~1.8W (5V 버스 파워)`,
              ok: maxPowerWatts >= 1.0
            }
          },
          recommendedSetup:
            'USB3 Vision 규격 카메라, 듀얼 스크류 락(Screw-lock) 케이블, UVC 제로카피 커널 드라이버'
        };
      }
    };

    const evaluated = [
      finalizeItem('gmsl', gmslScore, gmslFailures, gmslWarnings, gmslReasons),
      finalizeItem('mipi', mipiScore, mipiFailures, mipiWarnings, mipiReasons),
      finalizeItem('usb', usbScore, usbFailures, usbWarnings, usbReasons)
    ];

    // Mark highest score as 'recommended' if not incompatible
    const feasibleList = evaluated.filter((e) => e.status !== 'incompatible');
    if (feasibleList.length > 0) {
      feasibleList.sort((a, b) => b.score - a.score);
      const topId = feasibleList[0].id;
      evaluated.forEach((item) => {
        if (item.id === topId) {
          item.status = 'recommended';
          item.statusText = '최우선 추천 (Best Match)';
        }
      });
    }

    return evaluated;
  }, [params]);

  // Sort & filter evaluations for display
  const displayedEvaluations = useMemo(() => {
    let list = [...evaluations];
    if (hideIncompatible) {
      list = list.filter((e) => e.status !== 'incompatible');
    }

    if (sortBy === 'score') {
      list.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'power') {
      // MIPI (0.3) < USB (1.8) < GMSL (2.2)
      const powerOrder = { mipi: 1, usb: 2, gmsl: 3 };
      list.sort((a, b) => powerOrder[a.id] - powerOrder[b.id]);
    } else if (sortBy === 'bandwidth') {
      // MIPI (10G) > GMSL (6G) > USB (3.2G)
      const bwOrder = { mipi: 1, gmsl: 2, usb: 3 };
      list.sort((a, b) => bwOrder[a.id] - bwOrder[b.id]);
    }
    return list;
  }, [evaluations, hideIncompatible, sortBy]);

  // Top winner for executive banner
  const bestMatch = useMemo(() => {
    const sorted = [...evaluations].sort((a, b) => b.score - a.score);
    return sorted[0];
  }, [evaluations]);

  return (
    <div className="space-y-6" id="tech-parameter-filter-container">
      {/* Parameter Control Panel Card */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200/90 shadow-xs space-y-6">
        {/* Header & Quick Scenario Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm sm:text-base">
              <Sliders className="w-5 h-5" />
              <h4 className="text-gray-900">카메라 모듈 기술 파라미터 정밀 검색 & 필터링</h4>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              대역폭, 전송 거리, 전력 소비, 지연 시간 요구치를 직접 조절하여 3대 인터페이스(GMSL2, MIPI, USB3)의 정량 호환성을 즉시 판정합니다.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 self-start lg:self-auto shrink-0">
            <span className="text-[11px] font-semibold text-gray-400 mr-1 flex items-center">
              <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
              실무 프리셋:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('drone')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
            >
              드론/초소형 (MIPI)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('adas')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
            >
              ADAS 자율주행 (GMSL2)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('amr')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
            >
              물류 AMR 4CH
            </button>
            <button
              type="button"
              onClick={() => applyPreset('factory')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            >
              공장 외관검사 (USB3)
            </button>
          </div>
        </div>

        {/* Sliders Grid: 4 Core Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Bandwidth */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-gray-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>필요 대역폭 (Bandwidth)</span>
              </label>
              <span className="font-extrabold text-indigo-600 text-sm">
                {params.bandwidthGbps.toFixed(1)} <span className="text-[11px] font-semibold text-gray-500">Gbps</span>
              </span>
            </div>

            <input
              type="range"
              min={0.5}
              max={15.0}
              step={0.1}
              value={params.bandwidthGbps}
              onChange={(e) => setParams({ ...params, bandwidthGbps: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>0.5G (FHD 30p)</span>
              <span>6.0G (GMSL2)</span>
              <span>15G (고속)</span>
            </div>

            {/* Quick Bandwidth Buttons */}
            <div className="flex items-center gap-1 pt-1">
              <button
                type="button"
                onClick={() => setBandwidthPreset(0.8)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  Math.abs(params.bandwidthGbps - 0.8) < 0.1
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                1080p
              </button>
              <button
                type="button"
                onClick={() => setBandwidthPreset(3.2)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  Math.abs(params.bandwidthGbps - 3.2) < 0.1
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                USB한계(3.2G)
              </button>
              <button
                type="button"
                onClick={() => setBandwidthPreset(6.0)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  Math.abs(params.bandwidthGbps - 6.0) < 0.1
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                4K@60fps
              </button>
            </div>
          </div>

          {/* 2. Max Cable Distance */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-gray-900 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                <span>최대 전송 거리 (Cable Distance)</span>
              </label>
              <span className="font-extrabold text-blue-600 text-sm">
                {params.maxDistanceMeters.toFixed(1)} <span className="text-[11px] font-semibold text-gray-500">m</span>
              </span>
            </div>

            <input
              type="range"
              min={0.1}
              max={18.0}
              step={0.1}
              value={params.maxDistanceMeters}
              onChange={(e) => setParams({ ...params, maxDistanceMeters: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span className={params.maxDistanceMeters <= 0.3 ? 'font-bold text-blue-600' : ''}>
                0.3m(MIPI한계)
              </span>
              <span className={params.maxDistanceMeters > 0.3 && params.maxDistanceMeters <= 5 ? 'font-bold text-emerald-600' : ''}>
                5m(USB한계)
              </span>
              <span className={params.maxDistanceMeters > 5 ? 'font-bold text-red-600' : ''}>
                15m(GMSL2)
              </span>
            </div>

            {/* Quick Distance Buttons */}
            <div className="flex items-center gap-1 pt-1">
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, maxDistanceMeters: 0.2 }))}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  params.maxDistanceMeters === 0.2
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                0.2m (온보드)
              </button>
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, maxDistanceMeters: 2.5 }))}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  params.maxDistanceMeters === 2.5
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                2.5m (장비내)
              </button>
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, maxDistanceMeters: 10.0 }))}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  params.maxDistanceMeters === 10.0
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                10m (차량/외곽)
              </button>
            </div>
          </div>

          {/* 3. Max Power Budget */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-gray-900 flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                <span>허용 전력 소모 (Power Budget)</span>
              </label>
              <span className="font-extrabold text-emerald-600 text-sm">
                {params.maxPowerWatts.toFixed(1)} <span className="text-[11px] font-semibold text-gray-500">W</span>
              </span>
            </div>

            <input
              type="range"
              min={0.3}
              max={5.0}
              step={0.1}
              value={params.maxPowerWatts}
              onChange={(e) => setParams({ ...params, maxPowerWatts: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>0.3W (초저전력)</span>
              <span>2.5W (표준)</span>
              <span>5.0W (고성능)</span>
            </div>

            {/* Quick Power Buttons */}
            <div className="flex items-center gap-1 pt-1">
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, maxPowerWatts: 0.5 }))}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  params.maxPowerWatts === 0.5
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                0.5W (배터리)
              </button>
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, maxPowerWatts: 2.0 }))}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  params.maxPowerWatts === 2.0
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                2.0W (표준)
              </button>
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, maxPowerWatts: 3.5 }))}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  params.maxPowerWatts === 3.5
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                3.5W (SerDes여유)
              </button>
            </div>
          </div>

          {/* 4. Target Latency */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-gray-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>목표 지연 시간 (Latency)</span>
              </label>
            </div>

            <div className="space-y-1.5 pt-0.5">
              <label
                className={`flex items-center space-x-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  params.targetLatency === 'critical'
                    ? 'bg-amber-50 border-amber-300 font-bold text-amber-900'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="targetLatency"
                  checked={params.targetLatency === 'critical'}
                  onChange={() => setParams({ ...params, targetLatency: 'critical' })}
                  className="w-3 h-3 text-amber-600 accent-amber-600 cursor-pointer"
                />
                <span className="text-[11px]">&lt; 1 ms (극초저지연/결정론적)</span>
              </label>

              <label
                className={`flex items-center space-x-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  params.targetLatency === 'normal'
                    ? 'bg-amber-50 border-amber-300 font-bold text-amber-900'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="targetLatency"
                  checked={params.targetLatency === 'normal'}
                  onChange={() => setParams({ ...params, targetLatency: 'normal' })}
                  className="w-3 h-3 text-amber-600 accent-amber-600 cursor-pointer"
                />
                <span className="text-[11px]">&lt; 10 ms (산업용 실시간 검사)</span>
              </label>

              <label
                className={`flex items-center space-x-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  params.targetLatency === 'relaxed'
                    ? 'bg-amber-50 border-amber-300 font-bold text-amber-900'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="targetLatency"
                  checked={params.targetLatency === 'relaxed'}
                  onChange={() => setParams({ ...params, targetLatency: 'relaxed' })}
                  className="w-3 h-3 text-amber-600 accent-amber-600 cursor-pointer"
                />
                <span className="text-[11px]">&lt; 50 ms (일반 화상/모니터링)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Secondary Parameters: Camera Count, PoC, Fsync */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Camera Count */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
            <span className="font-semibold text-gray-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span>동시 스트리밍 카메라 수</span>
            </span>
            <div className="flex items-center space-x-1">
              {[1, 2, 4, 8].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setParams({ ...params, cameraCount: count })}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                    params.cameraCount === count
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {count}CH
                </button>
              ))}
            </div>
          </div>

          {/* PoC Requirement Toggle */}
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs cursor-pointer hover:bg-gray-100/80 transition-colors">
            <div className="flex items-center gap-2">
              <Cable className="w-4 h-4 text-red-600" />
              <div>
                <span className="font-semibold text-gray-900 block">PoC 단일선 배선 필수</span>
                <span className="text-[10px] text-gray-500">전원+비디오 동축 1가닥 통합</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={params.requirePoC}
              onChange={(e) => setParams({ ...params, requirePoC: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 accent-red-600 cursor-pointer"
            />
          </label>

          {/* Hardware Fsync Toggle */}
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs cursor-pointer hover:bg-gray-100/80 transition-colors">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="font-semibold text-gray-900 block">하드웨어 FSYNC 동기화 필수</span>
                <span className="text-[10px] text-gray-500">마이크로초(&lt; 1µs) 셔터 일치</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={params.requireFsync}
              onChange={(e) => setParams({ ...params, requireFsync: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Best Match Executive Recommendation Banner */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border-2 transition-all shadow-xs ${
          bestMatch.status === 'incompatible'
            ? 'bg-red-50/80 border-red-300'
            : bestMatch.id === 'gmsl'
            ? 'bg-gradient-to-r from-red-50/80 via-white to-red-50/40 border-red-300'
            : bestMatch.id === 'mipi'
            ? 'bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 border-blue-300'
            : 'bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 border-emerald-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs ${
                bestMatch.id === 'gmsl'
                  ? 'bg-red-600'
                  : bestMatch.id === 'mipi'
                  ? 'bg-blue-600'
                  : 'bg-emerald-600'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                입력 파라미터 기반 최적 규격 판정 결과
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <span>{bestMatch.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
                  적합도 {bestMatch.score}%
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold shadow-2xs flex items-center gap-1.5 ${
                bestMatch.status === 'recommended'
                  ? 'bg-indigo-600 text-white'
                  : bestMatch.status === 'conditional'
                  ? 'bg-amber-600 text-white'
                  : bestMatch.status === 'compatible'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {bestMatch.statusIcon}
              <span>{bestMatch.statusText}</span>
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4">
          입력하신 요구조건(대역폭 {params.bandwidthGbps} Gbps, 전송 거리 {params.maxDistanceMeters}m,
          전력 예산 {params.maxPowerWatts}W, 지연 시간{' '}
          {params.targetLatency === 'critical'
            ? '< 1ms'
            : params.targetLatency === 'normal'
            ? '< 10ms'
            : '< 50ms'}
          , {params.cameraCount}채널)을 종합 분석한 결과, <strong>{bestMatch.name}</strong>가 가장 우수한
          엔지니어링 마진과 시스템 안정성을 제공합니다.
        </p>

        {/* Recommended Setup snippet */}
        <div className="p-3 bg-white/90 rounded-xl border border-gray-200/90 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-gray-800">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>권장 아키텍처:</strong> {bestMatch.recommendedSetup}
            </span>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 shrink-0">
            {params.requirePoC ? '⚡ PoC 필수 구성' : '일반 배선'} · {params.cameraCount}채널 분산
          </span>
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
            인터페이스별 정량 기술 검증 및 마진 분석 (3개 규격 대조)
          </h4>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Hide Incompatible Toggle */}
          <label className="inline-flex items-center space-x-1.5 cursor-pointer text-gray-700 font-medium select-none">
            <input
              type="checkbox"
              checked={hideIncompatible}
              onChange={(e) => setHideIncompatible(e.target.checked)}
              className="w-3.5 h-3.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 accent-indigo-600"
            />
            <span>호환 불가 규격 숨기기</span>
          </label>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-400 text-[11px]">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs p-1.5 bg-white border border-gray-200 rounded-lg text-gray-800 font-semibold"
            >
              <option value="score">적합도 점수 높은 순</option>
              <option value="power">소비 전력 낮은 순</option>
              <option value="bandwidth">대역폭 큰 순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3 Interface Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedEvaluations.map((item) => {
          const isWinner = item.id === bestMatch.id && item.status !== 'incompatible';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                isWinner
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                  : item.status === 'incompatible'
                  ? 'border-red-200 opacity-80'
                  : 'border-gray-200/90'
              }`}
            >
              {/* Card Header */}
              <div className={`p-4 border-b ${item.bgLight} ${item.borderLight}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <h5 className="font-extrabold text-sm sm:text-base text-gray-900">
                      {item.name}
                    </h5>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1 ${
                      item.status === 'recommended'
                        ? 'bg-indigo-600 text-white'
                        : item.status === 'conditional'
                        ? 'bg-amber-600 text-white'
                        : item.status === 'compatible'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {item.statusIcon}
                    <span>{item.statusText}</span>
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">{item.tagline}</p>

                {/* Score Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-600 text-[11px]">종합 적합도 지수</span>
                    <span className="font-bold text-gray-900">{item.score}점</span>
                  </div>
                  <div className="w-full bg-gray-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${item.score}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Body: Headroom Gauges & Reasons */}
              <div className="p-4 space-y-4 flex-1 text-xs">
                {/* 3 Parameter Headroom Indicators */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">대역폭 여유</span>
                    <span
                      className={`text-[11px] font-bold ${
                        item.headroom.bandwidth.ok ? 'text-gray-900' : 'text-red-600'
                      }`}
                    >
                      {item.headroom.bandwidth.ok ? '여유' : '초과'}
                    </span>
                  </div>
                  <div className="border-x border-gray-200 px-1">
                    <span className="text-[10px] text-gray-400 block font-semibold">거리 여유</span>
                    <span
                      className={`text-[11px] font-bold ${
                        item.headroom.distance.ok ? 'text-gray-900' : 'text-red-600'
                      }`}
                    >
                      {item.headroom.distance.ok ? '적합' : '초과'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">전력 마진</span>
                    <span
                      className={`text-[11px] font-bold ${
                        item.headroom.power.ok ? 'text-gray-900' : 'text-red-600'
                      }`}
                    >
                      {item.headroom.power.ok ? '충분' : '부족'}
                    </span>
                  </div>
                </div>

                {/* Hard Failures (Red) */}
                {item.failures.length > 0 && (
                  <div className="space-y-1.5 p-2.5 bg-red-50/80 border border-red-200 rounded-xl">
                    <span className="font-bold text-red-900 text-[11px] flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>물리적 제약 조건 위반 (탈락 사유)</span>
                    </span>
                    {item.failures.map((fail, i) => (
                      <p key={i} className="text-[11px] text-red-700 leading-snug">
                        • {fail}
                      </p>
                    ))}
                  </div>
                )}

                {/* Warnings (Amber) */}
                {item.warnings.length > 0 && (
                  <div className="space-y-1.5 p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl">
                    <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>설계 시 고려 및 보완 사항</span>
                    </span>
                    {item.warnings.map((warn, i) => (
                      <p key={i} className="text-[11px] text-amber-800 leading-snug">
                        • {warn}
                      </p>
                    ))}
                  </div>
                )}

                {/* Positive Matching Reasons (Green) */}
                {item.reasons.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-gray-800 text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>기술적 부합 장점</span>
                    </span>
                    {item.reasons.slice(0, 3).map((reason, i) => (
                      <p key={i} className="text-[11px] text-gray-600 leading-snug">
                        ✓ {reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Recommended Architecture */}
              <div className="p-3 bg-gray-50/80 border-t border-gray-200 text-[11px] text-gray-600">
                <span className="font-bold text-gray-800 block mb-0.5">실전 권장 구성:</span>
                <span className="line-clamp-2 leading-tight">{item.recommendedSetup}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
