import React from 'react';
import { Cable, ShieldAlert, Cpu, CheckCircle, Wrench, Lock, Radio } from 'lucide-react';

export const InstallationTab: React.FC = () => {
  return (
    <div className="space-y-8" id="installation-tab-content">
      {/* Section Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          🛠️ 기계적 설치성, 케이블 배선 및 물리적 한계 심층 분석
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          카메라 인터페이스의 결정은 시스템의 기구 폼팩터, 라우팅 유연성, 고온·진동 내구도 및 IP67 방수 방진 하우징 설계 난이도에 직접적인 영향을 미칩니다.
          연구실 프로토타입 단계와 실제 산업 현장 양산 단계의 물리적 장벽을 대조합니다.
        </p>
      </div>

      {/* 3 Mechanical Profiles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MIPI Profile */}
        <div className="bg-white p-5 rounded-xl border border-blue-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <h4>MIPI CSI-2: 초단거리 초경량</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
              0.3m 한계
            </span>
          </div>
          <ul className="space-y-2 text-xs text-gray-600 list-disc pl-4 leading-relaxed">
            <li>
              <strong className="text-gray-900">케이블 규격:</strong> 0.5mm 피치 FPC(연성인쇄회로) 또는 마이크로 동축(Micro-Coax) 번들.
            </li>
            <li>
              <strong className="text-gray-900">배선 거리 한계:</strong> 최대 30cm 이내. 30cm 초과 시 차동 신호 고주파 감쇠로 링크가 단절됩니다.
            </li>
            <li>
              <strong className="text-gray-900">내진동성 & 방수:</strong> ZIF/LIF 커넥터는 진동에 슬라이딩 이탈 위험이 있어 밀봉 섀시 내부에서만 사용 가능합니다.
            </li>
            <li>
              <strong className="text-gray-900">최대 강점:</strong> 케이블 중량이 수 그램(g)에 불과하여 드론 짐벌 및 초소형 로봇팔 관절 내부 관통 배선에 이상적입니다.
            </li>
          </ul>
        </div>

        {/* GMSL2 Profile */}
        <div className="bg-white p-5 rounded-xl border border-red-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-700 font-bold text-sm">
              <Radio className="w-4 h-4" />
              <h4>GMSL2: 극한환경 전장 배선</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded">
              최대 15m
            </span>
          </div>
          <ul className="space-y-2 text-xs text-gray-600 list-disc pl-4 leading-relaxed">
            <li>
              <strong className="text-gray-900">케이블 규격:</strong> 50Ω 단일 차폐 동축 케이블(RG-174, RTK031) 또는 100Ω STP(차폐 연선).
            </li>
            <li>
              <strong className="text-gray-900">커넥터 규격:</strong> 전장 규격 FAKRA, 미니 FAKRA(수납 공간 80% 절감), H-MTD 기가비트 커넥터.
            </li>
            <li>
              <strong className="text-gray-900">PoC 혁신:</strong> 단 1가닥 동축선으로 비디오 + I2C/GPIO 제어 + 12V DC 전원(최대 1A)을 통합 전송합니다.
            </li>
            <li>
              <strong className="text-gray-900">IP67/IP69K 하우징:</strong> 센서와 직렬화기(MAX9295)를 소형 알루미늄 다이캐스트 큐브에 봉인하여 완전 방수 구현.
            </li>
          </ul>
        </div>

        {/* USB Profile */}
        <div className="bg-white p-5 rounded-xl border border-emerald-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
              <Cable className="w-4 h-4" />
              <h4>USB 3.0: 유연한 탈부착 가설</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
              3~5m 범용
            </span>
          </div>
          <ul className="space-y-2 text-xs text-gray-600 list-disc pl-4 leading-relaxed">
            <li>
              <strong className="text-gray-900">케이블 규격:</strong> 범용 USB Type-A / Type-C 패시브 케이블 (3m 권장, 최대 5m).
            </li>
            <li>
              <strong className="text-gray-900">산업용 스크류 락:</strong> 진동 환경에서 일반 USB는 즉시 이탈하므로 나사 체결식 듀얼 스크류 락 규격이 필수적입니다.
            </li>
            <li>
              <strong className="text-gray-900">전원 공급:</strong> USB 버스 파워(5V, 900mA, 약 4.5W)를 호스트에서 공급받아 별도 배선이 불필요합니다.
            </li>
            <li>
              <strong className="text-gray-900">설치 편의성:</strong> 복잡한 임피던스 설계 없이 기성품 케이블을 즉시 꽂아 테스트 가능한 최고의 민첩성을 제공합니다.
            </li>
          </ul>
        </div>
      </div>

      {/* Mechanical Benchmark Comparison Table */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/70">
          <h4 className="font-bold text-gray-900 text-xs flex items-center">
            <Wrench className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
            물리적 신뢰성 및 기구 설계 항목별 비교표
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100/80 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3 w-1/4">물리 설계 항목</th>
                <th className="p-3 w-1/4 text-blue-900 bg-blue-50/50">MIPI CSI-2</th>
                <th className="p-3 w-1/4 text-red-900 bg-red-50/50">GMSL2 SerDes</th>
                <th className="p-3 w-1/4 text-emerald-900 bg-emerald-50/50">산업용 USB 3.0</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              <tr>
                <td className="p-3 font-semibold bg-gray-50/40">최소 곡률 반경 (R)</td>
                <td className="p-3">R = 5mm (FPC 필름 유연)</td>
                <td className="p-3">R = 25~35mm (동축 차폐선)</td>
                <td className="p-3">R = 30~50mm (이중 차폐선)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-gray-50/40">커넥터 기계적 래치 결합력</td>
                <td className="p-3 text-red-600 font-medium">낮음 (ZIF 마찰력, 5~10N)</td>
                <td className="p-3 text-green-600 font-semibold">매우 높음 (FAKRA 래치 &gt;110N)</td>
                <td className="p-3 font-medium">스크류 볼트 체결 시 안전 (&gt;80N)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-gray-50/40">전장 진동 규격 (ISO 16750-3)</td>
                <td className="p-3 text-gray-500">불가 (내부 회로용)</td>
                <td className="p-3 text-green-600 font-semibold">완벽 통과 (차량 엔진룸 진동 견딤)</td>
                <td className="p-3 text-amber-600">일반 규격 (브라켓 고정 필요)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-gray-50/40">IP67 방수 센서 모듈 제작성</td>
                <td className="p-3 text-red-600">어려움 (메인보드와 동시 밀폐)</td>
                <td className="p-3 text-green-600 font-semibold">최적 (원형 동축 그랜드 관통)</td>
                <td className="p-3 font-medium">가능 (USB 방수 캡 및 글랜드 사용)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-gray-50/40">무게 (카메라 + 1m 케이블)</td>
                <td className="p-3 text-blue-600 font-semibold">&lt; 15g (초경량)</td>
                <td className="p-3">약 80~120g</td>
                <td className="p-3">약 100~150g</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PoC Hardware Design Challenge Deep-Dive */}
      <div className="bg-gray-50 border border-gray-200/90 p-6 rounded-xl space-y-4">
        <div className="flex items-center space-x-2 text-amber-700">
          <ShieldAlert className="w-5 h-5" />
          <h4 className="font-bold text-gray-900 text-sm">
            ⚠️ GMSL2 PoC (Power over Coax) 베이스보드 설계의 하드웨어 기술적 난관
          </h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          GMSL2의 PoC 기술은 전원 케이블을 생략해 현장 배선 공수를 혁신적으로 절감하지만, 하드웨어 회로 설계 난이도를 크게 끌어올립니다.
          3GHz 대역의 초고속 RF 디지털 비디오 신호와 12V DC 전력이 동일한 동축선에 흐르므로, 임피던스 불연속점을 방지하는 고난도 PCB 아트워크가 요구됩니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-1.5">
            <span className="font-bold text-indigo-900 flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>
              1. AC 커플링 & Ground Cutout
            </span>
            <p className="text-gray-600 leading-relaxed">
              100nF AC 커플링 커패시터는 트랜시버 핀으로부터 500mils(12.7mm) 이내에 배치해야 합니다.
              SMD 패드 하부 접지면(Layer 2 GND)을 패드 면적의 1.35배 파내는 Ground Cutout 처리를 통해 기생 정전용량(Parasitic Capacitance)을 배제해야 신호 반사가 발생하지 않습니다.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-1.5">
            <span className="font-bold text-indigo-900 flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>
              2. PoC 인덕터 자기포화 방지
            </span>
            <p className="text-gray-600 leading-relaxed">
              고주파 비디오 신호가 DC 전원 레일로 누설되는 것을 막는 PoC 초크 인덕터는 카메라 부팅 시 발생하는 돌입 전류(Inrush Current)에 의해
              자기포화(Saturation)가 일어나지 않도록 정격 전류 마진을 최소 2배 이상 확보한 특수 광대역 인덕터를 선정해야 합니다.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-1.5">
            <span className="font-bold text-indigo-900 flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>
              3. Link Lock 실패 및 I2C 터널링
            </span>
            <p className="text-gray-600 leading-relaxed">
              50Ω 특성 임피던스 매칭이 10% 이상 틀어질 경우 역직렬화기(MAX9296)의 하드웨어 LOCK 핀이 High로 전환되지 않습니다.
              LOCK이 체결되지 않으면 역방향 제어 I2C 터널링이 열리지 않아 리눅스 커널에서 센서 검색(i2cdetect)이 원천적으로 불가능해집니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
