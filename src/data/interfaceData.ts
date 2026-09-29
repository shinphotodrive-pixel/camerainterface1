import { ComparisonRow } from '../types';

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    id: 'bandwidth',
    category: 'performance',
    categoryLabel: '전송 및 대역폭',
    title: '최대 물리 대역폭',
    mipi: {
      value: '10 Gbps+ (D-PHY 4레인)',
      subtext: 'C-PHY 시 최대 41 Gbps, D-PHY v3.0 최대 36 Gbps 지원',
      highlight: true
    },
    gmsl: {
      value: '6 Gbps (고정 순방향)',
      subtext: '역방향 제어 링크 187.5 Mbps 독립 양방향 채널'
    },
    usb: {
      value: '5 Gbps (이론치)',
      subtext: '실효 대역폭 350~400 MB/s (패킷 오버헤드 감안)'
    }
  },
  {
    id: 'distance',
    category: 'physical',
    categoryLabel: '물리적 한계',
    title: '최대 전송 거리',
    mipi: {
      value: '< 0.3 m (30 cm 이내)',
      subtext: '초과 시 신호 감쇠 및 높은 비트 에러율 발생',
      badge: '초단거리'
    },
    gmsl: {
      value: '최대 15 m (동축 케이블)',
      subtext: 'AEC-Q100 전장 인증 동축 케이블 기준 (최대 20m 조건부 가능)',
      highlight: true,
      badge: '장거리 특화'
    },
    usb: {
      value: '3 ~ 5 m (패시브 케이블)',
      subtext: '액티브 리피터 케이블 사용 시 최대 10~15m 연장 가능',
      badge: '중거리'
    }
  },
  {
    id: 'latency',
    category: 'performance',
    categoryLabel: '전송 및 대역폭',
    title: '지연 시간 (Latency)',
    mipi: {
      value: '< 1 ms (극초저지연)',
      subtext: '하드웨어 ISP 메모리 다이렉트 매핑, OS 버퍼링 없음',
      highlight: true
    },
    gmsl: {
      value: '수십 µs (하드웨어 지연)',
      subtext: 'MAX9295/9296 직렬화 지연 발생하나 완벽한 결정론적(Deterministic)',
      highlight: true
    },
    usb: {
      value: '10 ~ 40 ms (가변 지연)',
      subtext: 'OS 호스트 컨트롤러 폴링 및 UVC 소프트웨어 스택 오버헤드'
    }
  },
  {
    id: 'cabling',
    category: 'physical',
    categoryLabel: '물리적 한계',
    title: '케이블 및 커넥터',
    mipi: {
      value: 'FPC(연성인쇄회로) / 초미세 B2B',
      subtext: '초경량, 진동에 취약, 굴곡 피로 파괴 주의 필요'
    },
    gmsl: {
      value: '50Ω 동축 FAKRA / Mini-FAKRA',
      subtext: '차량용 래치 결합 커넥터, H-MTD 고속 전장 커넥터 지원',
      highlight: true
    },
    usb: {
      value: 'USB Type-A / Type-C',
      subtext: '산업용 듀얼 스크류 락(Screw-lock) 체결 권장'
    }
  },
  {
    id: 'power',
    category: 'reliability',
    categoryLabel: '신뢰성 및 전원',
    title: '전력 공급 방식',
    mipi: {
      value: '독립 PCB 전원 라인 필요',
      subtext: 'FPC 내 별도 전원 배선 또는 전원 인가 보드 구성'
    },
    gmsl: {
      value: 'PoC (Power over Coax)',
      subtext: '동축 케이블 1가닥으로 비디오, I2C/GPIO 제어, 12V DC 동시 전송',
      highlight: true,
      badge: '단일 배선 혁신'
    },
    usb: {
      value: 'USB 버스 파워 (5V, 최대 4.5W)',
      subtext: '일반 카메라는 충분하나 고성능 쿨링/가열 카메라엔 부족'
    }
  },
  {
    id: 'emc',
    category: 'reliability',
    categoryLabel: '신뢰성 및 전원',
    title: 'EMI / EMC 내성',
    mipi: {
      value: '취약 (내부 섀시 전용)',
      subtext: '차폐 없는 FPC는 모터 노이즈나 인버터 주변에서 영상 깨짐'
    },
    gmsl: {
      value: '극강 (AEC-Q100 전장 인증)',
      subtext: '동축 차폐 실드 + SSC(확산 스펙트럼 클록) 내장으로 노이즈 분산',
      highlight: true
    },
    usb: {
      value: '보통 (산업용 차폐 권장)',
      subtext: '모터 인버터 근처 배선 시 차폐 페라이트 코어 필수'
    }
  },
  {
    id: 'sync',
    category: 'performance',
    categoryLabel: '전송 및 대역폭',
    title: '다중 카메라 프레임 동기화',
    mipi: {
      value: 'SoC 가상 채널(VC) 지원',
      subtext: '하드웨어 GPIO 트리거 신호선 별도 배선 필요'
    },
    gmsl: {
      value: '마이크로초(µs) 정밀 하드웨어 Sync',
      subtext: 'MAX9296 허브가 16개 가상 채널 완벽 병합 및 프레임 트리거 방송',
      highlight: true
    },
    usb: {
      value: '소프트웨어 타임스탬프 기반 동기화',
      subtext: 'USB 호스트 허브 공유 시 대역폭 경쟁 및 지터(Jitter)로 프레임 드롭'
    }
  },
  {
    id: 'safety',
    category: 'reliability',
    categoryLabel: '신뢰성 및 전원',
    title: '에러 정정 및 기능 안전',
    mipi: {
      value: '패킷 헤더 수준 CRC-16',
      subtext: '단거리 직결 가정으로 패킷 재전송(ARQ) 메커니즘 부재'
    },
    gmsl: {
      value: 'ARQ 재전송 + 32bit CRC',
      subtext: 'ISO 26262 ASIL-B 기능안전 네이티브 지원, 비트 에러 실시간 감지',
      highlight: true
    },
    usb: {
      value: 'USB 패킷 재전송 프로토콜',
      subtext: '재전송 발생 시 지연시간 급증하여 실시간 스트리밍 프레임 드롭'
    }
  },
  {
    id: 'bom',
    category: 'cost',
    categoryLabel: '비용 및 개발성',
    title: '초기 하드웨어 BOM 비용',
    mipi: {
      value: '$300 ~ $800 (최저가)',
      subtext: '브리지 칩셋 없음, 대량 양산 시 단가 극적 절감',
      highlight: true,
      badge: '최고 가성비'
    },
    gmsl: {
      value: '$1,500 ~ $2,300 (고가)',
      subtext: 'Serializer/Deserializer 칩셋 + 전장 FAKRA 케이블 비용 가산'
    },
    usb: {
      value: '$400 ~ $1,200 (중간)',
      subtext: '산업용 카메라 하우징 + 락킹 케이블 기준'
    }
  },
  {
    id: 'nre',
    category: 'cost',
    categoryLabel: '비용 및 개발성',
    title: '드라이버 개발 (NRE 및 소요 기간)',
    mipi: {
      value: '보통 (1 ~ 2주 소요)',
      subtext: '디바이스 트리(DTS) 작성 및 리눅스 V4L2 서브디바이스 바인딩'
    },
    gmsl: {
      value: '높음 (3 ~ 5주 소요)',
      subtext: 'I2C 터널링 주소 변환, SerDes 링크 트레이닝, ISP 튜닝 필수'
    },
    usb: {
      value: '매우 낮음 (1 ~ 3일 완성)',
      subtext: 'UVC / USB3 Vision GenICam 표준 드라이버로 즉시 구동',
      highlight: true,
      badge: '즉시 배포'
    }
  }
];

export const RESOLUTION_OPTIONS = [
  { label: 'Full HD (1920 × 1080)', width: 1920, height: 1080 },
  { label: 'AR0234 FHD+ (1920 × 1200)', width: 1920, height: 1200 },
  { label: '2.5K QHD (2560 × 1440)', width: 2560, height: 1440 },
  { label: '4K UHD (3840 × 2160)', width: 3840, height: 2160 },
  { label: '8K UHD (7680 × 4320)', width: 7680, height: 4320 }
];

export const BIT_DEPTH_OPTIONS = [
  { label: 'RAW8 / Grayscale (8-bit)', bits: 8 },
  { label: 'RAW10 (10-bit)', bits: 10 },
  { label: 'RAW12 (12-bit High Dynamic)', bits: 12 },
  { label: 'YUV 4:2:2 (16-bit per pixel)', bits: 16 },
  { label: 'RGB888 / RAW24 (24-bit uncompressed)', bits: 24 }
];
