import { SPEC_ROWS } from '../components/TechnicalSpecSummaryTable';
import { INTERFACE_BENCHMARK_DATA } from '../components/PowerAndDistanceBarChart';
import { COMPARISON_ROWS } from '../data/interfaceData';

export interface ReportExportConfig {
  selectedInterfaces: {
    mipi: boolean;
    gmsl: boolean;
    usb: boolean;
  };
  includeSections: {
    keySpecs: boolean;
    calculator: boolean;
    powerDistance: boolean;
    detailedSpecs: boolean;
    engineeringNotes: boolean;
  };
  metadata: {
    title: string;
    author: string;
    projectName: string;
    date: string;
    version: string;
  };
  calculatorData?: {
    resLabel: string;
    width: number;
    height: number;
    fps: number;
    bitDepth: number;
    cameraCount: number;
    gbps: number;
    mbytePerSec: number;
    mipiSupported: boolean;
    gmslSingleSupported: boolean;
    gmslDualSupported: boolean;
    usbSupported: boolean;
  };
}

/**
 * Escapes CSV values for Excel/RFC4180 compatibility.
 */
function escapeCsv(val: any): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates an RFC4180-compliant UTF-8 CSV string with BOM for Excel compatibility.
 */
export function buildCsvReport(config: ReportExportConfig): string {
  const lines: string[] = [];
  const { selectedInterfaces, includeSections, metadata, calculatorData } = config;

  // Active interfaces headers
  const activeKeys: ('mipi' | 'gmsl' | 'usb')[] = [];
  const activeHeaders: string[] = [];

  if (selectedInterfaces.mipi) {
    activeKeys.push('mipi');
    activeHeaders.push('MIPI CSI-2');
  }
  if (selectedInterfaces.gmsl) {
    activeKeys.push('gmsl');
    activeHeaders.push('GMSL2');
  }
  if (selectedInterfaces.usb) {
    activeKeys.push('usb');
    activeHeaders.push('USB 3.0');
  }

  // 1. Report Header & Metadata
  lines.push([escapeCsv('========================================================================================')].join(','));
  lines.push([escapeCsv(`비전 카메라 인터페이스 기술 사양 비교 검토 보고서`)].join(','));
  lines.push([escapeCsv(`문서 제목: ${metadata.title}`)].join(','));
  lines.push([escapeCsv(`프로젝트: ${metadata.projectName}`), escapeCsv(`작성자/부서: ${metadata.author}`)].join(','));
  lines.push([escapeCsv(`작성 일시: ${metadata.date}`), escapeCsv(`보고서 버전: ${metadata.version}`)].join(','));
  lines.push([escapeCsv(`비교 대상 인터페이스: ${activeHeaders.join(', ')}`)].join(','));
  lines.push([escapeCsv('========================================================================================')].join(','));
  lines.push('');

  // 2. Section: 4 Key Specifications Matrix
  if (includeSections.keySpecs) {
    lines.push([escapeCsv('[1. 주요 사양 4대 핵심 지표 비교]')].join(','));
    const tableHeader = ['평가 항목', '단위', ...activeHeaders, '엔지니어링 세부 메모'];
    lines.push(tableHeader.map(escapeCsv).join(','));

    SPEC_ROWS.forEach((row) => {
      const rowCols = [
        row.metric,
        row.unit,
        ...activeKeys.map((key) => `${row[key].highlight} (${row[key].sub})`),
        row.engineeringNote
      ];
      lines.push(rowCols.map(escapeCsv).join(','));
    });
    lines.push('');
  }

  // 3. Section: Real-time Bandwidth Calculator Simulation
  if (includeSections.calculator && calculatorData) {
    lines.push([escapeCsv('[2. 센서 대역폭 & 인터페이스 적합도 시뮬레이션 결과]')].join(','));
    lines.push([escapeCsv('입력 파라미터'), escapeCsv('설정값'), escapeCsv('비고')].join(','));
    lines.push([escapeCsv('선택 센서 해상도'), escapeCsv(calculatorData.resLabel), escapeCsv(`${calculatorData.width} x ${calculatorData.height}`)].join(','));
    lines.push([escapeCsv('프레임레이트(FPS)'), escapeCsv(`${calculatorData.fps} fps`), escapeCsv('초당 전송 프레임')].join(','));
    lines.push([escapeCsv('픽셀 포맷 / 비트 심도'), escapeCsv(`${calculatorData.bitDepth} bit`), escapeCsv('RAW/YUV 픽셀 크기')].join(','));
    lines.push([escapeCsv('동시 구동 카메라 수'), escapeCsv(`${calculatorData.cameraCount} 대`), escapeCsv('동시 스트리밍 채널 수')].join(','));
    lines.push([escapeCsv('산출 총 비압축 대역폭'), escapeCsv(`${calculatorData.gbps} Gbps`), escapeCsv(`12% 패킷 오버헤드 포함 (~${calculatorData.mbytePerSec.toLocaleString()} MB/s)`)].join(','));
    lines.push('');

    lines.push([escapeCsv('인터페이스별 대역폭 적합도 판정 결과')].join(','));
    lines.push([escapeCsv('인터페이스'), escapeCsv('물리 링크 한계'), escapeCsv('수용 판정'), escapeCsv('적합도 상세 분석')].join(','));

    if (selectedInterfaces.mipi) {
      lines.push([
        escapeCsv('MIPI CSI-2 (4-lane)'),
        escapeCsv('최대 10.0 Gbps (D-PHY v1.2)'),
        escapeCsv(calculatorData.mipiSupported ? 'PASS (수용 가능)' : 'FAIL (대역폭 초과)'),
        escapeCsv(calculatorData.mipiSupported ? '4레인 구성으로 대역폭 여유 충분, 무손실 비압축 전송 가능' : 'D-PHY v2.5 이상 또는 다중 CSI-2 포트 분할 수신 필요')
      ].join(','));
    }

    if (selectedInterfaces.gmsl) {
      const gmslStatus = calculatorData.gmslSingleSupported
        ? 'PASS (단일 링크 가능)'
        : calculatorData.gmslDualSupported
        ? 'CONDITIONAL (듀얼 링크 필요)'
        : 'FAIL (대역폭 초과)';
      const gmslDetail = calculatorData.gmslSingleSupported
        ? 'GMSL2 단일 링크(6 Gbps)로 단일 동축선 케이블 전송 완벽 지원'
        : calculatorData.gmslDualSupported
        ? '단일 6G 링크 한도 초과로 듀얼 GMSL2 링크(12 Gbps) 또는 차세대 GMSL3(16 Gbps) 권장'
        : 'GMSL2 듀얼 링크 한도 초과, 차세대 SerDes 또는 센서 해상도 하향 검토 필요';

      lines.push([
        escapeCsv('GMSL2 (SerDes)'),
        escapeCsv('단일 6.0 Gbps / 듀얼 12.0 Gbps'),
        escapeCsv(gmslStatus),
        escapeCsv(gmslDetail)
      ].join(','));
    }

    if (selectedInterfaces.usb) {
      const usbStatus = calculatorData.usbSupported ? 'PASS (비압축 수용)' : 'FAIL (압축 필수)';
      const usbDetail = calculatorData.usbSupported
        ? 'USB 3.0 실효 대역폭(~3.2 Gbps) 내 수용 가능, 단 프레임 지터 발생 가능'
        : '실효 대역폭 포화로 H.264/MJPEG 유손실 압축 필수, 인코딩 레이턴시 발생';

      lines.push([
        escapeCsv('USB 3.0 / USB3 Vision'),
        escapeCsv('실효 대역폭 ~3.2 Gbps'),
        escapeCsv(usbStatus),
        escapeCsv(usbDetail)
      ].join(','));
    }
    lines.push('');
  }

  // 4. Section: Physical Layer Power & Distance Benchmarks
  if (includeSections.powerDistance) {
    lines.push([escapeCsv('[3. 물리 계층(PHY) 전력 소비 및 케이블 전송 거리 정량 분석]')].join(','));
    const benchHeader = ['인터페이스', '전형적 전송거리', '최대 전송거리', '전형적 소비전력', '최대 소비전력', '전원 공급 방식', '케이블 규격'];
    lines.push(benchHeader.map(escapeCsv).join(','));

    INTERFACE_BENCHMARK_DATA.filter((item) => selectedInterfaces[item.id]).forEach((item) => {
      lines.push([
        escapeCsv(item.name),
        escapeCsv(`${item.cableLengthTypical} m`),
        escapeCsv(`${item.cableLengthMax} m (${item.cableNote})`),
        escapeCsv(`${item.powerTypical} W`),
        escapeCsv(`${item.powerMax} W (${item.powerNote})`),
        escapeCsv(item.powerDelivery),
        escapeCsv(item.cableSpecDetail)
      ].join(','));
    });
    lines.push('');
  }

  // 5. Section: Detailed 12-Item Comparison Matrix
  if (includeSections.detailedSpecs) {
    lines.push([escapeCsv('[4. 기술 사양 12대 상세 항목 종합 대조표]')].join(','));
    const compHeader = ['분류', '평가 항목', ...activeHeaders];
    lines.push(compHeader.map(escapeCsv).join(','));

    COMPARISON_ROWS.forEach((row) => {
      const rowCols = [
        row.categoryLabel,
        row.title,
        ...activeKeys.map((k) => `${row[k].value} ${row[k].subtext ? `[${row[k].subtext}]` : ''}`)
      ];
      lines.push(rowCols.map(escapeCsv).join(','));
    });
    lines.push('');
  }

  // 6. Section: Engineering Decision Notes & Recommendations
  if (includeSections.engineeringNotes) {
    lines.push([escapeCsv('[5. 실무 엔지니어링 의사결정 권고안]')].join(','));
    lines.push([escapeCsv('인터페이스'), escapeCsv('핵심 적용 권고 분야'), escapeCsv('설계 시 주의사항 및 리스크')].join(','));

    if (selectedInterfaces.mipi) {
      lines.push([
        escapeCsv('MIPI CSI-2'),
        escapeCsv('초저지연 비전 서보잉, 드론, 모바일 로봇 본체 내부, 소형 배터리 구동 기기'),
        escapeCsv('케이블 30cm 초과 금지, FPC 굴곡 피로 파괴 방지 구조 설계 필수, Linux 커널 센서 드라이버 개발 NRE 수천만 원 고려 필요')
      ].join(','));
    }
    if (selectedInterfaces.gmsl) {
      lines.push([
        escapeCsv('GMSL2'),
        escapeCsv('ADAS/자율주행, 대형 공장 AMR, 옥외 가혹 환경, 3~15m 장거리 분산 멀티 카메라'),
        escapeCsv('SerDes 칩셋 단가(BOM) 상승, PoC 인덕터 및 카메라 발열 해소를 위한 방열 하우징 설계 필수, 전장 FAKRA 커넥터 체결 관리')
      ].join(','));
    }
    if (selectedInterfaces.usb) {
      lines.push([
        escapeCsv('USB 3.0'),
        escapeCsv('빠른 PoC 프로토타이핑, 범용 x86/데스크톱 비전 검사, 단일 카메라 표준 랩 환경'),
        escapeCsv('10~40ms 가변 지연과 프레임 지터 발생, 진동 환경에서 커넥터 이탈 위험(스크류 락 필수), 다중 카메라 구성 시 USB 버스 대역폭 병목')
      ].join(','));
    }
    lines.push('');
  }

  // Trailing footer
  lines.push([escapeCsv(`--- 본 보고서는 ${metadata.projectName} 기술 검토 목적으로 자동 생성되었습니다. (${metadata.date}) ---`)].join(','));

  // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Initiates download of the generated CSV file.
 */
export function downloadCsvReport(config: ReportExportConfig, filename?: string): void {
  const csvContent = buildCsvReport(config);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const defaultFilename = filename || `camera_interface_report_${new Date().toISOString().slice(0, 10)}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a standalone printable HTML report that can be opened in any browser or saved to PDF.
 */
export function downloadHtmlReport(config: ReportExportConfig, filename?: string): void {
  const htmlContent = generateStandaloneHtmlReport(config);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const defaultFilename = filename || `camera_interface_report_${new Date().toISOString().slice(0, 10)}.html`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an elegant, standalone, single-file HTML document formatted for A4 printing and archiving.
 */
export function generateStandaloneHtmlReport(config: ReportExportConfig): string {
  const { selectedInterfaces, includeSections, metadata, calculatorData } = config;

  const activeKeys: ('mipi' | 'gmsl' | 'usb')[] = [];
  if (selectedInterfaces.mipi) activeKeys.push('mipi');
  if (selectedInterfaces.gmsl) activeKeys.push('gmsl');
  if (selectedInterfaces.usb) activeKeys.push('usb');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${metadata.title} - 기술 사양 검토 보고서</title>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      padding: 24px;
      font-size: 13px;
    }

    .report-container {
      max-width: 960px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 44px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .header-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .badge-confidential {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      display: inline-block;
      text-transform: uppercase;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      padding: 14px 18px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin-bottom: 28px;
      font-size: 12px;
    }

    .meta-item strong {
      display: block;
      color: #64748b;
      font-size: 11px;
      margin-bottom: 2px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin: 28px 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }

    th, td {
      padding: 10px 12px;
      text-align: left;
      border: 1px solid #e2e8f0;
    }

    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
    }

    .badge-mipi { background: #eff6ff; color: #1d4ed8; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .badge-gmsl { background: #fef2f2; color: #b91c1c; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .badge-usb { background: #f0fdf4; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .pass { color: #15803d; font-weight: 700; }
    .fail { color: #b91c1c; font-weight: 700; }
    .conditional { color: #b45309; font-weight: 700; }

    .calc-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .calc-val {
      font-size: 24px;
      font-weight: 800;
      color: #4f46e5;
    }

    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 11px;
    }

    .print-btn-bar {
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .btn-primary { background: #4f46e5; color: white; }
    .btn-secondary { background: #e2e8f0; color: #334155; }

    @media print {
      body { background: white; padding: 0; font-size: 10pt; }
      .report-container { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .print-btn-bar { display: none; }
      @page { size: A4; margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="print-btn-bar">
    <button class="btn btn-secondary" onclick="window.close()">창 닫기</button>
    <button class="btn btn-primary" onclick="window.print()">🖨️ PDF로 인쇄 / 저장</button>
  </div>

  <div class="report-container">
    <div class="header-bar">
      <div>
        <div class="header-title">${metadata.title}</div>
        <div style="color: #64748b; font-size: 12px; margin-top: 4px;">
          MIPI CSI-2 · GMSL2 · USB 3.0 엔지니어링 정량 비교 및 시스템 아키텍처 적합도 분석
        </div>
      </div>
      <div>
        <span class="badge-confidential">ENGINEERING SPEC SHEET</span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <strong>프로젝트 명</strong>
        <span>${metadata.projectName}</span>
      </div>
      <div class="meta-item">
        <strong>작성자 / 부서</strong>
        <span>${metadata.author}</span>
      </div>
      <div class="meta-item">
        <strong>문서 버전</strong>
        <span>${metadata.version}</span>
      </div>
      <div class="meta-item">
        <strong>발행 일자</strong>
        <span>${metadata.date}</span>
      </div>
    </div>

    ${
      includeSections.keySpecs
        ? `
      <div class="section-title">⚡ 1. 주요 사양 4대 핵심 지표 매트릭스</div>
      <table>
        <thead>
          <tr>
            <th style="width: 16%;">평가 항목</th>
            <th style="width: 10%;">단위</th>
            ${activeKeys.map((k) => `<th style="width: 22%;">${k.toUpperCase() === 'GMSL' ? 'GMSL2' : k.toUpperCase() === 'MIPI' ? 'MIPI CSI-2' : 'USB 3.0'}</th>`).join('')}
            <th>엔지니어링 메모</th>
          </tr>
        </thead>
        <tbody>
          ${SPEC_ROWS.map(
            (row) => `
            <tr>
              <td><strong>${row.metric}</strong></td>
              <td>${row.unit}</td>
              ${activeKeys
                .map(
                  (k) => `
                <td>
                  <span class="badge-${k}">${row[k].highlight}</span>
                  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${row[k].sub}</div>
                </td>
              `
                )
                .join('')}
              <td style="font-size: 11px; color: #475569;">${row.engineeringNote}</td>
            </tr>
          `
          ).join('')}
        </tbody>
      </table>
    `
        : ''
    }

    ${
      includeSections.calculator && calculatorData
        ? `
      <div class="section-title">🧮 2. 센서 대역폭 & 인터페이스 적합도 시뮬레이션 결과</div>
      <div class="calc-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div style="font-size: 11px; color: #64748b;">센서 조건: ${calculatorData.resLabel} (${calculatorData.width}x${calculatorData.height}) · ${calculatorData.fps}fps · ${calculatorData.bitDepth}bit · ${calculatorData.cameraCount}채널</div>
            <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 2px;">필요 비압축 전송 대역폭 (12% 패킷 오버헤드 반영)</div>
          </div>
          <div>
            <span class="calc-val">${calculatorData.gbps} Gbps</span>
            <span style="font-size: 12px; color: #64748b;">(~${calculatorData.mbytePerSec.toLocaleString()} MB/s)</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>인터페이스</th>
              <th>물리 대역폭 한계</th>
              <th>적합도 판정</th>
              <th>기술 평가 의견</th>
            </tr>
          </thead>
          <tbody>
            ${
              selectedInterfaces.mipi
                ? `
              <tr>
                <td><strong>MIPI CSI-2</strong></td>
                <td>10.0 Gbps (4-lane D-PHY v1.2)</td>
                <td><span class="${calculatorData.mipiSupported ? 'pass' : 'fail'}">${calculatorData.mipiSupported ? 'PASS (수용 가능)' : '대역폭 초과'}</span></td>
                <td>${calculatorData.mipiSupported ? 'SoC ISP 다이렉트 DMA 매핑으로 제로 버퍼링 전송 완벽 지원' : 'C-PHY 또는 다중 포트 인터리빙 필요'}</td>
              </tr>
            `
                : ''
            }
            ${
              selectedInterfaces.gmsl
                ? `
              <tr>
                <td><strong>GMSL2</strong></td>
                <td>6.0 Gbps (단일) / 12.0 Gbps (듀얼)</td>
                <td><span class="${calculatorData.gmslSingleSupported ? 'pass' : calculatorData.gmslDualSupported ? 'conditional' : 'fail'}">
                  ${calculatorData.gmslSingleSupported ? 'PASS (단일 링크)' : calculatorData.gmslDualSupported ? '듀얼 링크 필요' : '대역폭 초과'}
                </span></td>
                <td>${calculatorData.gmslSingleSupported ? '단일 동축 케이블 전송 지원' : calculatorData.gmslDualSupported ? '2채널 동축 케이블 결합 또는 GMSL3 검토' : '대역폭 한계 초과'}</td>
              </tr>
            `
                : ''
            }
            ${
              selectedInterfaces.usb
                ? `
              <tr>
                <td><strong>USB 3.0</strong></td>
                <td>~3.2 Gbps (실효 대역폭)</td>
                <td><span class="${calculatorData.usbSupported ? 'pass' : 'fail'}">${calculatorData.usbSupported ? 'PASS (비압축 수용)' : '압축 필수 (H.264)'}</span></td>
                <td>${calculatorData.usbSupported ? '실효 대역폭 내 수용 가능하나 CPU 폴링 오버헤드 주의' : '실효 대역폭 초과로 하드웨어 인코더 압축 필수'}</td>
              </tr>
            `
                : ''
            }
          </tbody>
        </table>
      </div>
    `
        : ''
    }

    ${
      includeSections.powerDistance
        ? `
      <div class="section-title">📊 3. 소비 전력 및 케이블 전송 거리 정량 벤치마크</div>
      <table>
        <thead>
          <tr>
            <th>인터페이스</th>
            <th>전형적 거리</th>
            <th>최대 전송거리</th>
            <th>전형적 소비전력</th>
            <th>최대 소비전력</th>
            <th>전원 공급 방식</th>
            <th>케이블 사양</th>
          </tr>
        </thead>
        <tbody>
          ${INTERFACE_BENCHMARK_DATA.filter((item) => selectedInterfaces[item.id])
            .map(
              (item) => `
            <tr>
              <td><strong>${item.name}</strong></td>
              <td>${item.cableLengthTypical} m</td>
              <td><strong>${item.cableLengthMax} m</strong></td>
              <td>${item.powerTypical} W</td>
              <td><strong>${item.powerMax} W</strong></td>
              <td>${item.powerDelivery}</td>
              <td style="font-size: 11px;">${item.cableSpecDetail}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
        : ''
    }

    ${
      includeSections.detailedSpecs
        ? `
      <div class="section-title">📑 4. 종합 기술 사양 12대 세부 대조표</div>
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">분류</th>
            <th style="width: 22%;">평가 항목</th>
            ${activeKeys.map((k) => `<th>${k.toUpperCase() === 'GMSL' ? 'GMSL2' : k.toUpperCase() === 'MIPI' ? 'MIPI CSI-2' : 'USB 3.0'}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${COMPARISON_ROWS.map(
            (row) => `
            <tr>
              <td><span style="font-size: 10px; color: #64748b; font-weight: 700;">${row.categoryLabel}</span></td>
              <td><strong>${row.title}</strong></td>
              ${activeKeys
                .map(
                  (k) => `
                <td>
                  <div>${row[k].value}</div>
                  ${row[k].subtext ? `<div style="font-size: 11px; color: #64748b;">${row[k].subtext}</div>` : ''}
                </td>
              `
                )
                .join('')}
            </tr>
          `
          ).join('')}
        </tbody>
      </table>
    `
        : ''
    }

    ${
      includeSections.engineeringNotes
        ? `
      <div class="section-title">💡 5. 엔지니어링 의사결정 권고 및 결론</div>
      <table>
        <thead>
          <tr>
            <th style="width: 20%;">인터페이스</th>
            <th style="width: 40%;">최적 적합 애플리케이션</th>
            <th>핵심 설계 주의점 및 리스크 관리</th>
          </tr>
        </thead>
        <tbody>
          ${
            selectedInterfaces.mipi
              ? `
            <tr>
              <td><strong>MIPI CSI-2</strong></td>
              <td>초저지연 비전 서보잉, 모바일 로봇 내부 근거리, 소형 드론</td>
              <td>케이블 길이 30cm 이내 엄수, FPC 굴곡 피로 방지, 초기 Linux V4L2 드라이버 포팅 NRE 필요</td>
            </tr>
          `
              : ''
          }
          ${
            selectedInterfaces.gmsl
              ? `
            <tr>
              <td><strong>GMSL2</strong></td>
              <td>ADAS 자율주행, 대형 물류 AMR 서라운드 뷰, 가혹한 공장 환경</td>
              <td>PoC 인덕터 발열 관리, 방열 하우징 설계, 직렬화기/역직렬화기 BOM 비용 분기점 산정</td>
            </tr>
          `
              : ''
          }
          ${
            selectedInterfaces.usb
              ? `
            <tr>
              <td><strong>USB 3.0</strong></td>
              <td>연구실 PoC 프로토타이핑, x86 PC 머신비전 검사, 단일 채널</td>
              <td>10~40ms 가변 지터로 실시간 제어 제한, 스크류 락 커넥터 체결 필수, 다채널 버스 병목</td>
            </tr>
          `
              : ''
          }
        </tbody>
      </table>
    `
        : ''
    }

    <div class="footer">
      <div>발행처: ${metadata.author} · 프로젝트: ${metadata.projectName}</div>
      <div>문서 검토 일시: ${metadata.date} · Confidential</div>
    </div>
  </div>
</body>
</html>`;
}
