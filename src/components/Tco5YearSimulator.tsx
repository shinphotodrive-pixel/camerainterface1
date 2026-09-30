import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Sliders,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Cpu,
  RefreshCw,
  Layers,
  Wrench,
  Zap,
  Cable,
  FileSpreadsheet,
  Award
} from 'lucide-react';

export interface TcoSimulatorProps {
  initialCameraCount?: number;
  onCameraCountSync?: (count: number) => void;
}

export const Tco5YearSimulator: React.FC<TcoSimulatorProps> = ({
  initialCameraCount = 4,
  onCameraCountSync
}) => {
  // Input States
  const [cameraCount, setCameraCount] = useState<number>(initialCameraCount);
  const [cableLength, setCableLength] = useState<number>(2.5); // meters
  const [mipiNre, setMipiNre] = useState<number>(3500); // USD
  const [gmslNre, setGmslNre] = useState<number>(10000); // USD
  const [usbNre, setUsbNre] = useState<number>(500); // USD
  const [productionUnits, setProductionUnits] = useState<number>(100); // Production batch volume
  const [chartMode, setChartMode] = useState<'cumulative' | 'breakdown'>('cumulative');

  // Handle camera count change and optionally notify parent
  const handleCameraCountChange = (val: number) => {
    const clamped = Math.max(1, Math.min(16, val));
    setCameraCount(clamped);
    if (onCameraCountSync) {
      onCameraCountSync(clamped);
    }
  };

  // Presets
  const applyPreset = (preset: 'amr' | 'agv' | 'drone' | 'inspection') => {
    if (preset === 'amr') {
      handleCameraCountChange(4);
      setCableLength(1.5);
      setMipiNre(3500);
      setGmslNre(10000);
      setUsbNre(500);
      setProductionUnits(100);
    } else if (preset === 'agv') {
      handleCameraCountChange(8);
      setCableLength(10.0);
      setMipiNre(4500);
      setGmslNre(11000);
      setUsbNre(1200);
      setProductionUnits(50);
    } else if (preset === 'drone') {
      handleCameraCountChange(2);
      setCableLength(0.2);
      setMipiNre(3000);
      setGmslNre(8000);
      setUsbNre(500);
      setProductionUnits(300);
    } else if (preset === 'inspection') {
      handleCameraCountChange(1);
      setCableLength(3.0);
      setMipiNre(3500);
      setGmslNre(9000);
      setUsbNre(500);
      setProductionUnits(20);
    }
  };

  // Cost Calculations per System
  const simulation = useMemo(() => {
    const units = Math.max(1, productionUnits);

    // --- MIPI CSI-2 ---
    // Hardware BOM per system
    const mipiSensorBom = 150 * cameraCount;
    const mipiCarrierBom = 100;
    // Cable: Standard FPC ribbon <= 0.3m is $4/ea.
    // > 0.3m requires active FPC extender / differential bridge ($45/channel).
    // > 1.5m is physically non-viable without SerDes.
    let mipiCableBom = 4 * cameraCount;
    let mipiCableWarning: string | null = null;
    if (cableLength > 0.3 && cableLength <= 1.5) {
      mipiCableBom = (4 + 45) * cameraCount;
      mipiCableWarning = '0.3m 초과: 액티브 FPC 차동 버퍼/리피터 IC 추가 필수 (비용/발열 상승)';
    } else if (cableLength > 1.5) {
      mipiCableBom = (4 + 95) * cameraCount;
      mipiCableWarning = '1.5m 초과: 신호 감쇠(Eye Diagram 폐쇄)로 산업 현장 직결 불가능 (GMSL2 전향 권장)';
    }
    const mipiHwTotal = mipiSensorBom + mipiCarrierBom + mipiCableBom;

    // NRE allocated per system
    const mipiNrePerSystem = Math.round(mipiNre / units);

    // Annual Maintenance & Ops (Kernel updates: ~$420/yr, Vibration cable fatigue replace: 5% of cable/sensor ~$12/yr, Power 0.3W/cam: ~$1/yr)
    const mipiAnnualMaint = 420;
    const mipiAnnualReplace = Math.round(mipiHwTotal * 0.05);
    const mipiAnnualPower = Math.round(cameraCount * 0.3 * 24 * 365 * 0.00015);
    const mipiAnnualOpEx = mipiAnnualMaint + mipiAnnualReplace + mipiAnnualPower;

    // --- GMSL2 (SerDes) ---
    // Hardware BOM: MAX9295 Serializer Cam module ($480), Deserializer hub ($300)
    const gmslSensorBom = 480 * cameraCount;
    const gmslCarrierBom = 300;
    // FAKRA Coaxial Cable: $14 base connector + $2.2/meter
    const gmslCablePerCam = 14 + 2.2 * cableLength;
    const gmslCableBom = Math.round(gmslCablePerCam * cameraCount);
    let gmslCableWarning: string | null = null;
    if (cableLength > 15) {
      gmslCableWarning = '15m 초과: 저손실 RTK031 동축 케이블 및 대역폭 감쇄(6Gbps→3Gbps) 점검 필요';
    }
    const gmslHwTotal = gmslSensorBom + gmslCarrierBom + gmslCableBom;

    // NRE allocated per system
    const gmslNrePerSystem = Math.round(gmslNre / units);

    // Annual Maintenance (Kernel updates: ~$600/yr, FAKRA automotive-grade rugged replace: 1.5% ~$10/yr, Power 2.5W/cam: ~$7/yr)
    const gmslAnnualMaint = 600;
    const gmslAnnualReplace = Math.round(gmslHwTotal * 0.015);
    const gmslAnnualPower = Math.round(cameraCount * 2.5 * 24 * 365 * 0.00015);
    const gmslAnnualOpEx = gmslAnnualMaint + gmslAnnualReplace + gmslAnnualPower;

    // --- USB 3.0 ---
    // Hardware BOM: Industrial USB3 Cam ($230), PCIe Host Hub ($80)
    const usbSensorBom = 230 * cameraCount;
    const usbCarrierBom = 80;
    // Cable: <=3m ($18), 3m~5m ($38 high-grade), >5m requires AOC ($160/ea)
    let usbCablePerCam = 18;
    let usbCableWarning: string | null = null;
    if (cableLength > 3 && cableLength <= 5) {
      usbCablePerCam = 38;
      usbCableWarning = '3m~5m: 산업용 이중 차폐 스크류 락 케이블 필수';
    } else if (cableLength > 5) {
      usbCablePerCam = 160;
      usbCableWarning = '5m 초과: 액티브 광케이블(AOC) 및 별도 외부 전원 보강 필수 (내구성/단가 상승)';
    }
    const usbCableBom = Math.round(usbCablePerCam * cameraCount);
    const usbHwTotal = usbSensorBom + usbCarrierBom + usbCableBom;

    // NRE allocated per system
    const usbNrePerSystem = Math.round(usbNre / units);

    // Annual Maintenance (Standard UVC driver: ~$60/yr, Industrial USB connector wear: 3.5% ~$15/yr, Power 1.8W/cam: ~$5/yr)
    const usbAnnualMaint = 60;
    const usbAnnualReplace = Math.round(usbHwTotal * 0.035);
    const usbAnnualPower = Math.round(cameraCount * 1.8 * 24 * 365 * 0.00015);
    const usbAnnualOpEx = usbAnnualMaint + usbAnnualReplace + usbAnnualPower;

    // 5-Year Totals
    const mipiYear0 = mipiHwTotal + mipiNrePerSystem;
    const gmslYear0 = gmslHwTotal + gmslNrePerSystem;
    const usbYear0 = usbHwTotal + usbNrePerSystem;

    const mipi5YearTotal = mipiYear0 + mipiAnnualOpEx * 5;
    const gmsl5YearTotal = gmslYear0 + gmslAnnualOpEx * 5;
    const usb5YearTotal = usbYear0 + usbAnnualOpEx * 5;

    // Cumulative progression data for 5-Year timeline chart
    const timelineData = [
      {
        year: '초기 도입',
        'MIPI CSI-2': mipiYear0,
        'GMSL2': gmslYear0,
        'USB 3.0': usbYear0
      },
      {
        year: '1년차',
        'MIPI CSI-2': mipiYear0 + mipiAnnualOpEx * 1,
        'GMSL2': gmslYear0 + gmslAnnualOpEx * 1,
        'USB 3.0': usbYear0 + usbAnnualOpEx * 1
      },
      {
        year: '2년차',
        'MIPI CSI-2': mipiYear0 + mipiAnnualOpEx * 2,
        'GMSL2': gmslYear0 + gmslAnnualOpEx * 2,
        'USB 3.0': usbYear0 + usbAnnualOpEx * 2
      },
      {
        year: '3년차',
        'MIPI CSI-2': mipiYear0 + mipiAnnualOpEx * 3,
        'GMSL2': gmslYear0 + gmslAnnualOpEx * 3,
        'USB 3.0': usbYear0 + usbAnnualOpEx * 3
      },
      {
        year: '4년차',
        'MIPI CSI-2': mipiYear0 + mipiAnnualOpEx * 4,
        'GMSL2': gmslYear0 + gmslAnnualOpEx * 4,
        'USB 3.0': usbYear0 + usbAnnualOpEx * 4
      },
      {
        year: '5년차 총합',
        'MIPI CSI-2': mipi5YearTotal,
        'GMSL2': gmsl5YearTotal,
        'USB 3.0': usb5YearTotal
      }
    ];

    // Cost Breakdown data for Stacked Bar Chart
    const breakdownData = [
      {
        name: 'MIPI CSI-2',
        '카메라/센서 BOM': mipiSensorBom,
        '보드/인터페이스 BOM': mipiCarrierBom,
        '케이블/커넥터': mipiCableBom,
        'NRE 인건비 (상각)': mipiNrePerSystem,
        '5년 유지보수(커널/교체/전력)': mipiAnnualOpEx * 5,
        total: mipi5YearTotal,
        feasible: cableLength <= 1.5
      },
      {
        name: 'GMSL2 (SerDes)',
        '카메라/센서 BOM': gmslSensorBom,
        '보드/인터페이스 BOM': gmslCarrierBom,
        '케이블/커넥터': gmslCableBom,
        'NRE 인건비 (상각)': gmslNrePerSystem,
        '5년 유지보수(커널/교체/전력)': gmslAnnualOpEx * 5,
        total: gmsl5YearTotal,
        feasible: cableLength <= 20
      },
      {
        name: 'USB 3.0',
        '카메라/센서 BOM': usbSensorBom,
        '보드/인터페이스 BOM': usbCarrierBom,
        '케이블/커넥터': usbCableBom,
        'NRE 인건비 (상각)': usbNrePerSystem,
        '5년 유지보수(커널/교체/전력)': usbAnnualOpEx * 5,
        total: usb5YearTotal,
        feasible: true
      }
    ];

    // Determine Best TCO winner
    let bestTcoName = 'USB 3.0';
    let bestTcoTotal = usb5YearTotal;

    // MIPI is only candidate if distance is feasible (<= 1.5m)
    if (cableLength <= 1.5 && mipi5YearTotal < bestTcoTotal) {
      bestTcoName = 'MIPI CSI-2';
      bestTcoTotal = mipi5YearTotal;
    }
    // GMSL2 may win in high-channel long-distance or high-reliability scenarios
    if (gmsl5YearTotal < bestTcoTotal && cableLength <= 20) {
      bestTcoName = 'GMSL2';
      bestTcoTotal = gmsl5YearTotal;
    }

    return {
      timelineData,
      breakdownData,
      mipi: {
        total: mipi5YearTotal,
        capex: mipiHwTotal,
        sensorBom: mipiSensorBom,
        carrierBom: mipiCarrierBom,
        cableBom: mipiCableBom,
        nreTotal: mipiNre,
        nrePerSystem: mipiNrePerSystem,
        annualOpEx: mipiAnnualOpEx,
        fiveYearOpEx: mipiAnnualOpEx * 5,
        warning: mipiCableWarning,
        feasible: cableLength <= 1.5
      },
      gmsl: {
        total: gmsl5YearTotal,
        capex: gmslHwTotal,
        sensorBom: gmslSensorBom,
        carrierBom: gmslCarrierBom,
        cableBom: gmslCableBom,
        nreTotal: gmslNre,
        nrePerSystem: gmslNrePerSystem,
        annualOpEx: gmslAnnualOpEx,
        fiveYearOpEx: gmslAnnualOpEx * 5,
        warning: gmslCableWarning,
        feasible: cableLength <= 20
      },
      usb: {
        total: usb5YearTotal,
        capex: usbHwTotal,
        sensorBom: usbSensorBom,
        carrierBom: usbCarrierBom,
        cableBom: usbCableBom,
        nreTotal: usbNre,
        nrePerSystem: usbNrePerSystem,
        annualOpEx: usbAnnualOpEx,
        fiveYearOpEx: usbAnnualOpEx * 5,
        warning: usbCableWarning,
        feasible: true
      },
      bestTcoName
    };
  }, [cameraCount, cableLength, mipiNre, gmslNre, usbNre, productionUnits]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs p-5 sm:p-7 space-y-6" id="tco-simulator-section">
      {/* Header and Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Sliders className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
              5년 운용 총소유비용(TCO) 예측 시뮬레이터
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Interactive Tool
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            카메라 수량, 케이블 길이, NRE 개발비를 직접 입력하여 하드웨어 부품(BOM) + 초기 개발(NRE) + 5개년 유지보수(OpEx) 총비용을 실시간 비교 분석합니다.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          <span className="text-[11px] font-semibold text-gray-500 px-1.5">실무 시나리오:</span>
          <button
            type="button"
            onClick={() => applyPreset('amr')}
            className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-white text-gray-700 hover:text-indigo-600 border border-gray-200 shadow-2xs transition-all hover:border-indigo-300"
          >
            자율로봇 AMR (4CH, 1.5m)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('agv')}
            className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-white text-gray-700 hover:text-red-600 border border-gray-200 shadow-2xs transition-all hover:border-red-300"
          >
            물류 AGV/차량 (8CH, 10m)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('drone')}
            className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-white text-gray-700 hover:text-blue-600 border border-gray-200 shadow-2xs transition-all hover:border-blue-300"
          >
            소형 드론/짐벌 (2CH, 0.2m)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('inspection')}
            className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-white text-gray-700 hover:text-emerald-600 border border-gray-200 shadow-2xs transition-all hover:border-emerald-300"
          >
            비전 검사기 (1CH, 3m)
          </button>
        </div>
      </div>

      {/* Input Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200/80">
        {/* Parameter 1: Camera Count */}
        <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              카메라 수량 (채널)
            </label>
            <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {cameraCount} CH
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={16}
            step={1}
            value={cameraCount}
            onChange={(e) => handleCameraCountChange(Number(e.target.value))}
            className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between gap-1 pt-1">
            {[1, 2, 4, 6, 8, 12].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleCameraCountChange(num)}
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-all ${
                  cameraCount === num
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Parameter 2: Cable Length */}
        <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Cable className="w-3.5 h-3.5 text-blue-600" />
              케이블 전송 거리
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0.1}
                max={20}
                step={0.1}
                value={cableLength}
                onChange={(e) => setCableLength(Math.max(0.1, Math.min(20, Number(e.target.value))))}
                className="w-14 text-right text-xs font-extrabold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 focus:outline-indigo-500"
              />
              <span className="text-xs font-semibold text-gray-500">m</span>
            </div>
          </div>
          <input
            type="range"
            min={0.2}
            max={15}
            step={0.1}
            value={cableLength}
            onChange={(e) => setCableLength(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-semibold px-0.5">
            <span>0.2m (MIPI)</span>
            <span>3m (USB)</span>
            <span>10m (GMSL)</span>
            <span>15m</span>
          </div>
        </div>

        {/* Parameter 3: Production Batch Size */}
        <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              양산/도입 수량 (NRE 상각)
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={5000}
                step={10}
                value={productionUnits}
                onChange={(e) => setProductionUnits(Math.max(1, Number(e.target.value)))}
                className="w-16 text-right text-xs font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 focus:outline-indigo-500"
              />
              <span className="text-xs font-semibold text-gray-500">대</span>
            </div>
          </div>
          <input
            type="range"
            min={1}
            max={500}
            step={5}
            value={productionUnits}
            onChange={(e) => setProductionUnits(Number(e.target.value))}
            className="w-full accent-amber-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between gap-1 pt-1">
            {[10, 50, 100, 300, 500].map((units) => (
              <button
                key={units}
                type="button"
                onClick={() => setProductionUnits(units)}
                className={`text-[10px] px-1 py-0.5 rounded font-bold transition-all ${
                  productionUnits === units
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {units}
              </button>
            ))}
          </div>
        </div>

        {/* Parameter 4: NRE Quick Overview & Reset */}
        <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-red-600" />
                NRE 개발비 설정 ($)
              </label>
              <button
                type="button"
                onClick={() => {
                  setMipiNre(3500);
                  setGmslNre(10000);
                  setUsbNre(500);
                }}
                className="text-[10px] text-gray-500 hover:text-indigo-600 flex items-center gap-0.5 font-semibold"
                title="기본 표준값으로 초기화"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                표준값
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-blue-50/70 p-1 rounded border border-blue-100">
                <span className="text-[9px] text-blue-600 block font-semibold">MIPI</span>
                <input
                  type="number"
                  value={mipiNre}
                  onChange={(e) => setMipiNre(Math.max(0, Number(e.target.value)))}
                  className="w-full text-center text-[11px] font-extrabold text-blue-900 bg-white border border-blue-200 rounded px-1"
                />
              </div>
              <div className="bg-red-50/70 p-1 rounded border border-red-100">
                <span className="text-[9px] text-red-600 block font-semibold">GMSL2</span>
                <input
                  type="number"
                  value={gmslNre}
                  onChange={(e) => setGmslNre(Math.max(0, Number(e.target.value)))}
                  className="w-full text-center text-[11px] font-extrabold text-red-900 bg-white border border-red-200 rounded px-1"
                />
              </div>
              <div className="bg-emerald-50/70 p-1 rounded border border-emerald-100">
                <span className="text-[9px] text-emerald-600 block font-semibold">USB3</span>
                <input
                  type="number"
                  value={usbNre}
                  onChange={(e) => setUsbNre(Math.max(0, Number(e.target.value)))}
                  className="w-full text-center text-[11px] font-extrabold text-emerald-900 bg-white border border-emerald-200 rounded px-1"
                />
              </div>
            </div>
          </div>
          <span className="text-[10px] text-gray-500 mt-2 block">
            * 1대당 상각 NRE: MIPI ${Math.round(mipiNre / productionUnits)} | GMSL ${Math.round(gmslNre / productionUnits)} | USB ${Math.round(usbNre / productionUnits)}
          </span>
        </div>
      </div>

      {/* KPI 5-Year TCO Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MIPI Card */}
        <div
          className={`rounded-xl border p-4.5 transition-all relative ${
            simulation.bestTcoName === 'MIPI CSI-2'
              ? 'bg-blue-50/50 border-blue-400 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-white border-gray-200/90'
          }`}
        >
          {simulation.bestTcoName === 'MIPI CSI-2' && (
            <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
              <Award className="w-3 h-3" />
              5년 최저 TCO 달성
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
              MIPI CSI-2 (온보드)
            </span>
            <span className="text-[11px] text-gray-500 font-medium">대당 5년 총비용</span>
          </div>

          <div className="flex items-baseline space-x-1.5 my-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              ${simulation.mipi.total.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-semibold">/ 시스템</span>
          </div>

          <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex justify-between">
              <span>초기 H/W 부품 (BOM):</span>
              <strong className="text-gray-900">${simulation.mipi.capex.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>NRE 개발비 (대당 상각):</span>
              <strong className="text-gray-900">${simulation.mipi.nrePerSystem.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>5년 유지보수 및 교체:</span>
              <strong className="text-gray-900">${simulation.mipi.fiveYearOpEx.toLocaleString()}</strong>
            </div>
          </div>

          {simulation.mipi.warning && (
            <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{simulation.mipi.warning}</span>
            </div>
          )}
        </div>

        {/* GMSL2 Card */}
        <div
          className={`rounded-xl border p-4.5 transition-all relative ${
            simulation.bestTcoName === 'GMSL2'
              ? 'bg-red-50/50 border-red-400 shadow-sm ring-2 ring-red-500/20'
              : 'bg-white border-gray-200/90'
          }`}
        >
          {simulation.bestTcoName === 'GMSL2' && (
            <div className="absolute -top-2.5 right-4 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
              <Award className="w-3 h-3" />
              5년 최저 TCO 달성
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-md">
              GMSL2 (SerDes)
            </span>
            <span className="text-[11px] text-gray-500 font-medium">대당 5년 총비용</span>
          </div>

          <div className="flex items-baseline space-x-1.5 my-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              ${simulation.gmsl.total.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-semibold">/ 시스템</span>
          </div>

          <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex justify-between">
              <span>초기 H/W 부품 (BOM):</span>
              <strong className="text-gray-900">${simulation.gmsl.capex.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>NRE 개발비 (대당 상각):</span>
              <strong className="text-gray-900">${simulation.gmsl.nrePerSystem.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>5년 유지보수 및 교체:</span>
              <strong className="text-gray-900">${simulation.gmsl.fiveYearOpEx.toLocaleString()}</strong>
            </div>
          </div>

          {simulation.gmsl.warning ? (
            <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{simulation.gmsl.warning}</span>
            </div>
          ) : (
            <div className="mt-3 p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>15m 동축선 완벽 지원 (전장 등급 내진동/방수)</span>
            </div>
          )}
        </div>

        {/* USB 3.0 Card */}
        <div
          className={`rounded-xl border p-4.5 transition-all relative ${
            simulation.bestTcoName === 'USB 3.0'
              ? 'bg-emerald-50/50 border-emerald-400 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-gray-200/90'
          }`}
        >
          {simulation.bestTcoName === 'USB 3.0' && (
            <div className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
              <Award className="w-3 h-3" />
              5년 최저 TCO 달성
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              산업용 USB 3.0
            </span>
            <span className="text-[11px] text-gray-500 font-medium">대당 5년 총비용</span>
          </div>

          <div className="flex items-baseline space-x-1.5 my-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              ${simulation.usb.total.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-semibold">/ 시스템</span>
          </div>

          <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex justify-between">
              <span>초기 H/W 부품 (BOM):</span>
              <strong className="text-gray-900">${simulation.usb.capex.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>NRE 개발비 (대당 상각):</span>
              <strong className="text-gray-900">${simulation.usb.nrePerSystem.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>5년 유지보수 및 교체:</span>
              <strong className="text-gray-900">${simulation.usb.fiveYearOpEx.toLocaleString()}</strong>
            </div>
          </div>

          {simulation.usb.warning ? (
            <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{simulation.usb.warning}</span>
            </div>
          ) : (
            <div className="mt-3 p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>표준 UVC 플러그앤플레이 (NRE 거의 없음)</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Visualization Section */}
      <div className="bg-gray-50/70 p-4 sm:p-5 rounded-xl border border-gray-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              {chartMode === 'cumulative'
                ? '5개년 누적 비용 증가 곡선 (운용 기간별 TCO 추이)'
                : '비용 항목별 세부 구성 스택 차트 (BOM vs 케이블 vs NRE vs 유지보수)'}
            </h4>
            <p className="text-xs text-gray-500">
              {chartMode === 'cumulative'
                ? '시간 경과에 따른 초기 CapEx와 5개년 누적 유지보수비(OpEx)의 손익분기점 시각화'
                : '대당 하드웨어 부품비, 전송 케이블, NRE 인건비, 5년 유지보수비 비중 비교'}
            </p>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-gray-200 shadow-2xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMode('cumulative')}
              className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all ${
                chartMode === 'cumulative'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              5개년 누적 곡선
            </button>
            <button
              type="button"
              onClick={() => setChartMode('breakdown')}
              className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all ${
                chartMode === 'breakdown'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              항목별 스택 바
            </button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'cumulative' ? (
              <LineChart data={simulation.timelineData} margin={{ top: 15, right: 25, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="year"
                  stroke="#6b7280"
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                  width={65}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}`, name]}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                    border: 'none',
                    padding: '10px 14px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="MIPI CSI-2"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="GMSL2"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="USB 3.0"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={simulation.breakdownData} margin={{ top: 15, right: 25, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  tick={{ fontSize: 11, fontWeight: 700 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                  width={65}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}`, name]}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                    border: 'none',
                    padding: '10px 14px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="카메라/센서 BOM" stackId="a" fill="#3b82f6" />
                <Bar dataKey="보드/인터페이스 BOM" stackId="a" fill="#6366f1" />
                <Bar dataKey="케이블/커넥터" stackId="a" fill="#ec4899" />
                <Bar dataKey="NRE 인건비 (상각)" stackId="a" fill="#f59e0b" />
                <Bar dataKey="5년 유지보수(커널/교체/전력)" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Granular Cost Comparison Table */}
      <div className="overflow-x-auto">
        <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-gray-700" />
          5년 TCO 세부 산출 내역표 (단위: $ USD / 대당 기준)
        </h4>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gray-100/90 text-gray-700 border-b border-gray-300">
              <th className="py-2.5 px-3 font-bold">비용 항목 구분</th>
              <th className="py-2.5 px-3 font-bold text-blue-700">MIPI CSI-2 (온보드)</th>
              <th className="py-2.5 px-3 font-bold text-red-700">GMSL2 (SerDes)</th>
              <th className="py-2.5 px-3 font-bold text-emerald-700">산업용 USB 3.0</th>
              <th className="py-2.5 px-3 font-semibold text-gray-500">산출 기준 및 엔지니어링 메모</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            <tr>
              <td className="py-2 px-3 font-bold bg-gray-50">카메라 모듈 부품비 (BOM)</td>
              <td className="py-2 px-3 font-semibold text-blue-900">${simulation.mipi.sensorBom.toLocaleString()}</td>
              <td className="py-2 px-3 font-semibold text-red-900">${simulation.gmsl.sensorBom.toLocaleString()}</td>
              <td className="py-2 px-3 font-semibold text-emerald-900">${simulation.usb.sensorBom.toLocaleString()}</td>
              <td className="py-2 px-3 text-gray-500 text-[11px]">
                {cameraCount}CH 기준 (MIPI ~$150, GMSL2 Tx포함 ~$480, USB 산업용 ~$230)
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold bg-gray-50">인터페이스/허브 보드 비용</td>
              <td className="py-2 px-3">${simulation.mipi.carrierBom.toLocaleString()}</td>
              <td className="py-2 px-3">${simulation.gmsl.carrierBom.toLocaleString()}</td>
              <td className="py-2 px-3">${simulation.usb.carrierBom.toLocaleString()}</td>
              <td className="py-2 px-3 text-gray-500 text-[11px]">
                디시리얼라이저 Rx 허브, PCIe USB 호스트 컨트롤러 카드 반영
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold bg-gray-50">케이블 및 커넥터 ({cableLength}m)</td>
              <td className="py-2 px-3">
                <span className={simulation.mipi.feasible ? 'font-semibold' : 'text-red-600 font-bold'}>
                  ${simulation.mipi.cableBom.toLocaleString()}
                </span>
              </td>
              <td className="py-2 px-3 font-semibold">${simulation.gmsl.cableBom.toLocaleString()}</td>
              <td className="py-2 px-3 font-semibold">${simulation.usb.cableBom.toLocaleString()}</td>
              <td className="py-2 px-3 text-gray-500 text-[11px]">
                GMSL2: FAKRA 50Ω 동축 / USB: 스크류 락 및 5m 초과시 AOC 광케이블
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold bg-gray-50">초기 NRE 인건비 (대당 상각)</td>
              <td className="py-2 px-3 font-semibold">${simulation.mipi.nrePerSystem.toLocaleString()}</td>
              <td className="py-2 px-3 font-semibold">${simulation.gmsl.nrePerSystem.toLocaleString()}</td>
              <td className="py-2 px-3 font-semibold">${simulation.usb.nrePerSystem.toLocaleString()}</td>
              <td className="py-2 px-3 text-gray-500 text-[11px]">
                전체 NRE (MIPI ${mipiNre.toLocaleString()} / GMSL2 ${gmslNre.toLocaleString()} / USB ${usbNre.toLocaleString()}) ÷ {productionUnits}대
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold bg-gray-50">5개년 OS 커널 재포팅 & 유지보수</td>
              <td className="py-2 px-3 font-semibold">${(420 * 5).toLocaleString()}</td>
              <td className="py-2 px-3 font-semibold">${(600 * 5).toLocaleString()}</td>
              <td className="py-2 px-3 font-semibold">${(60 * 5).toLocaleString()}</td>
              <td className="py-2 px-3 text-gray-500 text-[11px]">
                리눅스 LTS 커널/Jetpack 메이저 판올림 시 V4L2 드라이버 마이그레이션 비용
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold bg-gray-50">5개년 현장 고장 교체비 (MTBF)</td>
              <td className="py-2 px-3 font-semibold">
                ${Math.round(simulation.mipi.capex * 0.05 * 5).toLocaleString()}
              </td>
              <td className="py-2 px-3 font-semibold">
                ${Math.round(simulation.gmsl.capex * 0.015 * 5).toLocaleString()}
              </td>
              <td className="py-2 px-3 font-semibold">
                ${Math.round(simulation.usb.capex * 0.035 * 5).toLocaleString()}
              </td>
              <td className="py-2 px-3 text-gray-500 text-[11px]">
                진동 환경 케이블 단선 및 접점 노후화 교체 (GMSL2 1.5%/년, MIPI 5%/년, USB 3.5%/년)
              </td>
            </tr>
            <tr className="bg-gray-100 font-extrabold text-sm border-t-2 border-gray-300">
              <td className="py-2.5 px-3 text-gray-900">대당 5년 총소유비용 (TCO 합계)</td>
              <td className="py-2.5 px-3 text-blue-900">
                ${simulation.mipi.total.toLocaleString()}
                {!simulation.mipi.feasible && (
                  <span className="ml-1 text-[10px] text-red-600 font-bold block">(물리 한계 초과)</span>
                )}
              </td>
              <td className="py-2.5 px-3 text-red-900">${simulation.gmsl.total.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-emerald-900">${simulation.usb.total.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-xs text-gray-700">
                <span className="font-bold text-indigo-700">
                  {simulation.bestTcoName} 최적 권장
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Engineering Decision Guidance Box */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 sm:p-5">
        <h4 className="text-xs sm:text-sm font-bold text-indigo-950 flex items-center gap-1.5 mb-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          시뮬레이션 조건 기반 엔지니어링 의사결정 권고안
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-indigo-900/90 leading-relaxed">
          <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
            <strong className="block font-bold text-blue-800 mb-1">1. 케이블 전송 거리 판정</strong>
            {cableLength <= 0.3 ? (
              <p>케이블이 {cableLength}m로 짧으므로 온보드 <strong>MIPI CSI-2</strong>가 BOM 비용과 지연 시간 면에서 최적입니다.</p>
            ) : cableLength <= 1.5 ? (
              <p>케이블 {cableLength}m는 MIPI 차동 버퍼가 필요하며, <strong>USB 3.0</strong>이 NRE 절감 및 안정성 면에서 우세합니다.</p>
            ) : (
              <p>케이블 {cableLength}m는 MIPI 물리 한계를 초과하므로 <strong>GMSL2(동축 15m)</strong> 전용 환경입니다.</p>
            )}
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
            <strong className="block font-bold text-red-800 mb-1">2. NRE 상각 분기점 (양산 {productionUnits}대)</strong>
            {productionUnits < 50 ? (
              <p>소량 제작({productionUnits}대)에서는 GMSL2의 $10,000 NRE 부담이 크므로 표준 UVC 드라이버의 <strong>USB 3.0</strong>이 경제적입니다.</p>
            ) : (
              <p>양산 규모({productionUnits}대 이상)가 확보되면 NRE가 대당 ${Math.round(gmslNre / productionUnits)} 이하로 희석되어 고신뢰성 <strong>GMSL2</strong> 채택이 타당합니다.</p>
            )}
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
            <strong className="block font-bold text-emerald-800 mb-1">3. 5년 누적 유지보수성</strong>
            <p>
              리눅스 커널 업그레이드가 빈번한 자율주행/로보틱스 엣지 장비는 V4L2 드라이버 재포팅 비용(연 $600)을 감안해야 하며,
              진동이 심한 환경에서는 FAKRA 커넥터의 현장 고장률(1.5%)이 총비용을 크게 절약합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
