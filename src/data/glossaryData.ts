import { GlossaryTerm } from '../types';

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'serdes',
    term: 'SerDes',
    fullTerm: 'Serializer / Deserializer',
    koreanName: '직렬화기 / 역직렬화기',
    category: 'hardware',
    categoryLabel: '하드웨어 및 물리 계층',
    summary: '병렬 디지털 비디오 데이터를 초고속 단일 직렬 신호로 변환하여 장거리 전송한 후 다시 병렬로 복원하는 핵심 트랜시버 기술',
    description:
      'SerDes는 이미지 센서의 다중 레인 병렬 데이터(예: MIPI CSI-2 4-Lane, 각 1.5~2.5Gbps)를 단일 고주파수 직렬 비트스트림(최대 6Gbps 이상)으로 다중화(Serialization)하여 한 가닥의 동축 케이블이나 연선(STP)으로 전송하고, 수신단 프로세서 앞에서 역직렬화(Deserialization)하여 원래의 MIPI 가상 채널로 복원해 주는 고속 통신 하드웨어 칩셋 기술입니다.',
    relevance:
      'GMSL2(Maxim/ADI MAX9295 Serializer + MAX9296 Deserializer)와 TI FPD-Link가 대표적입니다. MIPI CSI-2가 30cm 이내 온보드 직결에 국한되는 반면, SerDes를 장착하면 차량 전장 환경에서 최대 15m까지 무손실 비압축 전송이 가능해집니다.',
    engineeringTip:
      'SerDes 링크는 고주파(3GHz 대역) 신호이므로 PCB 설계 시 50Ω 단일 종단 또는 100Ω 차동 임피던스 매칭이 필수적이며, 송수신 트랜시버 간 적응형 등화기(Adaptive Equalizer) 설정이 정상 링크 락(Link Lock)을 결정합니다.',
    relatedTermIds: ['signal-integrity', 'poc', 'mipi-csi2']
  },
  {
    id: 'bom',
    term: 'BOM',
    fullTerm: 'Bill of Materials',
    koreanName: '부품 원가 명세서',
    category: 'economics',
    categoryLabel: '경제성 및 원가 분석',
    summary: '카메라 모듈 및 베이스보드 제작에 소요되는 모든 전자 부품, IC, 커넥터, 하우징의 총 하드웨어 원가',
    description:
      'BOM(Bill of Materials)은 제품 양산 시 투입되는 모든 물리적 하드웨어 부품(이미지 센서, SerDes IC, PMIC, LDO, 수동 소자, FAKRA/USB 커넥터, 알루미늄 다이캐스팅 하우징, 케이블)의 소요 단가와 수량을 합산한 순수 제조 원가 지표입니다.',
    relevance:
      'MIPI CSI-2는 브리지 칩 없이 SoC로 직결되므로 채널당 BOM이 $150 안팎(전체 시스템 $300~$800)으로 가장 저렴합니다. 반면 GMSL2는 카메라 모듈 내 MAX9295 직렬화기($15~$25), 호스트 보드 내 MAX9296 역직렬화기($30~$45), 그리고 전장용 FAKRA 커넥터 및 동축 케이블 비용이 추가되어 채널당 $450~$600(시스템 $1,500~$2,300) 수준으로 BOM이 3배 이상 상승합니다.',
    engineeringTip:
      '연간 양산 수량이 수만 대를 초과하는 대량 생산 시스템에서는 BOM 1달러 절감이 전체 수익성을 좌우하므로 MIPI 직결 구조를 선호하며, 소량 다품종이거나 가혹 환경인 경우엔 신뢰성을 위해 GMSL2의 높은 BOM을 감수합니다.',
    relatedTermIds: ['nre', 'serdes', 'poc']
  },
  {
    id: 'nre',
    term: 'NRE',
    fullTerm: 'Non-Recurring Engineering',
    koreanName: '비반복 엔지니어링 비용 (초기 개발비)',
    category: 'economics',
    categoryLabel: '경제성 및 원가 분석',
    summary: '양산 수량과 무관하게 최초 1회 발생하는 리눅스 커널 드라이버 작성, 하드웨어 회로 설계 및 ISP 튜닝 인건비',
    description:
      'NRE(Non-Recurring Engineering)는 특정 카메라 인터페이스를 임베디드 호스트(예: NVIDIA Jetson Orin, NXP i.MX, Raspberry Pi 등)에 연동(Bring-up)하기 위해 최초에 투입되는 하드웨어 R&D 설계비, 리눅스 커널 V4L2 서브디바이스 드라이버 작성, 디바이스 트리(DTS) 설정 및 카메라 화질 ISP 튜닝에 소요되는 일회성 개발 인건비입니다.',
    relevance:
      '산업용 USB 3.0 카메라는 표준 UVC(USB Video Class) 및 USB3 Vision GenICam 규격 드라이버가 OS에 내장되어 있어 NRE가 거의 $0(1~3일 개발)에 불과합니다. 반면 GMSL2는 MAX9295/MAX9296 링크 트레이닝, I2C 터널링 주소 가상화 변환, 그리고 프레임 싱크 커널 제어 드라이버 포팅에 시니어 임베디드 엔지니어 3~5주가 소요되어 $10,000 이상의 막대한 NRE가 발생합니다.',
    engineeringTip:
      '소량 시제품(PoC)이나 연구용 프로토타입(1~50대 미만)에서는 고가의 NRE를 지불하는 GMSL2/MIPI보다 USB 3.0을 사용하는 것이 총소유비용(TCO)과 프로젝트 출시 기간(Time-to-Market) 면에서 압도적으로 유리합니다.',
    relatedTermIds: ['bom', 'serdes']
  },
  {
    id: 'signal-integrity',
    term: 'Signal Integrity',
    fullTerm: 'Signal Integrity (SI)',
    koreanName: '신호 무결성',
    category: 'hardware',
    categoryLabel: '하드웨어 및 물리 계층',
    summary: '고속 전기 신호가 전송 선로를 통과할 때 감쇠, 지터, 반사 및 노이즈 간섭 없이 온전한 파형을 유지하는 특성',
    description:
      '신호 무결성(Signal Integrity)은 초당 수 기가비트(Gbps)로 전송되는 고주파 디지털 신호가 송신단에서 수신단으로 이동하는 동안 감쇠(Attenuation), 신호 지터(Jitter), 전송선로 임피던스 불연속에 따른 신호 반사(Reflection), 인접 신호선 간 전자기 누화(Crosstalk), 그리고 외부 EMI 노이즈에 의해 파형이 무너지지 않고 아이 다이어그램(Eye Diagram)의 마진을 유지하는 능력을 뜻합니다.',
    relevance:
      'MIPI CSI-2는 차폐가 취약한 FPC 리본 케이블 특성상 30cm를 넘어가면 신호 무결성이 급격히 무너져 비트 오류율(BER)이 치솟습니다. 반면 GMSL2는 50Ω 동축 케이블의 강력한 차폐 실드와 칩셋 내부에 탑재된 CTLE(Continuous-Time Linear Equalizer) 및 DFE(Decision Feedback Equalizer) 적응형 등화 기술을 통해 15m 거리에서도 완벽한 신호 무결성을 유지합니다.',
    engineeringTip:
      '고속 비전 기판 설계 시 50Ω 특성 임피던스 라우팅, AC 커플링 커패시터 하단의 접지면 컷아웃(Ground Cutout), 그리고 비아(Via) 개수를 최소화해야 기생 인덕턴스로 인한 신호 왜곡을 방지할 수 있습니다.',
    relatedTermIds: ['serdes', 'poc', 'deterministic-latency']
  },
  {
    id: 'poc',
    term: 'PoC',
    fullTerm: 'Power over Coax',
    koreanName: '동축 케이블 전원 중첩 송전 기술',
    category: 'hardware',
    categoryLabel: '하드웨어 및 물리 계층',
    summary: '단 1가닥의 50Ω 동축 케이블로 고속 비디오 데이터, 양방향 I2C 제어 신호 및 12V DC 전원을 동시에 전송하는 기술',
    description:
      'PoC(Power over Coax)는 전송 선로의 주파수 대역 분할 기술을 활용하여, 고주파 대역(수백 MHz ~ 3GHz)의 비디오 데이터 스트림과 저주파 대역의 직류 전원(12V DC, 최대 1~1.5A)을 단일 동축 케이블 중심 도체에 중첩시켜 동시에 송수신하는 기술입니다.',
    relevance:
      'GMSL2의 핵심 강점 중 하나로, 카메라 모듈에 별도의 전원 케이블을 배선할 필요가 없어 차량 도어나 범퍼, 로봇 팔 관절부의 하네스 부피와 무게를 70% 이상 줄여줍니다. 반면 USB는 5V 버스 파워(최대 4.5W)에 의존하며, MIPI는 별도의 독립 전원 라인이 요구됩니다.',
    engineeringTip:
      'DC 전원 공급용 바이어스 티(Bias-T) 인덕터는 고주파 비디오 신호가 전원 회로로 누설되지 않도록 광대역 자기포화 방지 인덕터를 사용해야 하며, 전원 켜짐 시의 돌입 전류(Inrush Current)를 제어하는 소프트 스타트 회로가 필수적입니다.',
    relatedTermIds: ['serdes', 'signal-integrity']
  },
  {
    id: 'deterministic-latency',
    term: 'Deterministic Latency',
    fullTerm: 'Deterministic Latency',
    koreanName: '결정론적 초저지연 시간',
    category: 'architecture',
    categoryLabel: '시스템 아키텍처 및 실시간성',
    summary: '데이터가 카메라 센서에서 처리 프로세서로 전달되는 시간이 확률적이지 않고 일정하게 예측 가능한 마이크로초 단위의 실시간성',
    description:
      '결정론적 지연(Deterministic Latency)은 전송 지연 시간의 표준 편차(지터, Jitter)가 거의 0에 수렴하여, 매 프레임이 센서의 픽셀 노출 시점부터 호스트 프로세서 메모리에 안착하기까지의 소요 시간을 마이크로초(µs) 또는 클록 사이클 단위로 수학적으로 정확히 예측할 수 있는 상태를 의미합니다.',
    relevance:
      'MIPI CSI-2(<1ms)와 GMSL2(수십 µs)는 하드웨어 파이프라인으로 ISP 메모리에 직접 기록되므로 완벽한 결정론적 지연을 제공합니다. 이는 100km/h로 주행하는 자율주행차의 비상 제동(AEB)이나 고속 로봇팔의 비전 서보잉에 필수적입니다. 반면 USB 3.0은 OS 커널의 비동기 인터럽트와 호스트 컨트롤러 폴링 스케줄링으로 인해 10~40ms의 비결정론적 가변 지연과 프레임 지터가 발생합니다.',
    engineeringTip:
      '다중 카메라 센서 퓨전(LiDAR + Radar + Camera) 시스템에서는 타임스탬프 오차를 마이크로초 이내로 맞춰야 하므로 결정론적 지연을 보장하는 GMSL2의 FSYNC(Frame Sync) 펄스 방송 기능이 필수입니다.',
    relatedTermIds: ['serdes', 'mipi-csi2']
  },
  {
    id: 'mipi-csi2',
    term: 'MIPI CSI-2',
    fullTerm: 'Mobile Industry Processor Interface Camera Serial Interface 2',
    koreanName: 'MIPI 카메라 시리얼 인터페이스 2',
    category: 'protocol',
    categoryLabel: '통신 프로토콜 및 표준',
    summary: '스마트폰, 임베디드 보드 및 모바일 기기용 온보드 고대역 초저지연 카메라 직결 표준 규격',
    description:
      'MIPI 얼라이언스에서 제정한 모바일 및 임베디드 비전 표준으로, 차동 신호 방식인 D-PHY(클록 1쌍 + 데이터 1~4레인) 또는 3-와이어 위상 인코딩 방식인 C-PHY를 사용하여 저전력으로 수십 Gbps의 원시 이미지 데이터를 애플리케이션 프로세서(AP) 내장 ISP로 직결 전송합니다.',
    relevance:
      '온보드 30cm 이내에서 가장 이상적인 성능(대역폭 10Gbps+, 지연시간 1ms 미만, 최저 전력 0.2W)을 발휘하며 브리지 칩이 불필요합니다. 최근에는 15m 전장 장거리 표준인 MIPI A-PHY(IEEE 2977)로 확장되고 있습니다.',
    engineeringTip:
      'D-PHY는 고속(HS) 모드와 저전력(LP) 모드를 동적으로 전환하므로, PCB 배선 시 스큐(Skew) 매칭을 위해 각 차동 페어 간 길이 오차를 5mils 이내로 극도로 엄격하게 제어해야 합니다.',
    relatedTermIds: ['serdes', 'signal-integrity']
  },
  {
    id: 'usb3-vision',
    term: 'USB3 Vision',
    fullTerm: 'USB3 Vision Standard (GenICam)',
    koreanName: '산업용 USB3 비전 머신비전 표준',
    category: 'protocol',
    categoryLabel: '통신 프로토콜 및 표준',
    summary: '일반 소비자용 UVC 웹캠 표준의 한계를 극복하고 산업용 카메라를 위해 제정된 고성능 머신비전 전송 규격',
    description:
      'AIA(Automated Imaging Association)에서 제정한 머신비전 전용 카메라 인터페이스 표준입니다. 일반 웹캠 규격인 UVC(USB Video Class)가 운영체제 인터럽트와 메모리 복사 오버헤드로 높은 CPU 부하와 지연을 유발하는 반면, USB3 Vision은 커널 제로 카피(Zero-copy) Direct DMA 전송 및 GenICam 표준 제어 프로토콜을 구현하여 고속 프레임 캡처를 지원합니다.',
    relevance:
      '공장 자동화, PCB 결함 검사, 반도체 웨이퍼 검사 장비 등에서 x86 산업용 PC와 연결할 때 주로 사용됩니다. NRE가 매우 낮고 케이블 스크류 락을 통해 안정성을 확보합니다.',
    engineeringTip:
      'USB3 Vision 카메라를 2대 이상 단일 시스템에 연결할 때는 USB 호스트 컨트롤러 대역폭(약 380MB/s)이 병목이 되지 않도록 메인보드의 독립된 PCIe xHCI 호스트 카드를 채널별로 분리해야 프레임 드롭이 방지됩니다.',
    relatedTermIds: ['nre', 'deterministic-latency']
  }
];
