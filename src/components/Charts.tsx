import React, { useEffect, useRef } from 'react';
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register all required Chart.js controllers and components
Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RadarChartProps {
  className?: string;
}

export const RadarComparisonChart: React.FC<RadarChartProps> = ({ className = 'h-80 w-full' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['전송 거리', '실효 대역폭', '초저지연성', 'EMI/신뢰성', 'BOM 경제성', '개발 용이성(NRE)'],
        datasets: [
          {
            label: 'MIPI CSI-2',
            data: [2, 9, 10, 3, 10, 6],
            backgroundColor: 'rgba(37, 99, 235, 0.22)',
            borderColor: '#2563eb',
            borderWidth: 2,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#ffffff',
            pointHoverRadius: 6
          },
          {
            label: 'GMSL2 (SerDes)',
            data: [10, 8, 9, 10, 3, 4],
            backgroundColor: 'rgba(220, 38, 38, 0.22)',
            borderColor: '#dc2626',
            borderWidth: 2,
            pointBackgroundColor: '#dc2626',
            pointBorderColor: '#ffffff',
            pointHoverRadius: 6
          },
          {
            label: 'USB 3.0 / Vision',
            data: [5, 6, 4, 5, 7, 10],
            backgroundColor: 'rgba(22, 163, 74, 0.22)',
            borderColor: '#16a34a',
            borderWidth: 2,
            pointBackgroundColor: '#16a34a',
            pointBorderColor: '#ffffff',
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: '#e5e7eb' },
            grid: { color: '#f3f4f6' },
            suggestedMin: 0,
            suggestedMax: 10,
            ticks: {
              stepSize: 2,
              backdropColor: 'transparent',
              font: { size: 10, family: 'system-ui' },
              color: '#6b7280'
            },
            pointLabels: {
              font: { size: 11, weight: 'bold' },
              color: '#374151'
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 14,
              boxHeight: 14,
              font: { size: 12, weight: 'bold' },
              color: '#374151',
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            padding: 10,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export const LatencyCpuChart: React.FC<{ className?: string }> = ({ className = 'h-80 w-full' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['MIPI CSI-2 (Direct)', 'GMSL2 (SerDes)', 'USB 3.0 (UVC)', 'USB3 Vision (DMA)'],
        datasets: [
          {
            label: '종단 간 지연 시간 (ms)',
            data: [0.8, 1.2, 35.0, 9.5],
            backgroundColor: '#4f46e5',
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            label: '호스트 CPU 점유율 (%)',
            data: [10, 12, 42, 18],
            backgroundColor: '#f59e0b',
            borderRadius: 6,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: '지연 시간 (ms - 낮을수록 우수)',
              font: { size: 11, weight: 'bold' },
              color: '#4f46e5'
            },
            suggestedMax: 40,
            grid: { color: '#f3f4f6' },
            ticks: { color: '#4f46e5', font: { weight: 'bold' } }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: '호스트 CPU 점유율 (% - 낮을수록 우수)',
              font: { size: 11, weight: 'bold' },
              color: '#d97706'
            },
            grid: { drawOnChartArea: false },
            suggestedMax: 50,
            ticks: { color: '#d97706', font: { weight: 'bold' } }
          },
          x: {
            ticks: { font: { size: 11, weight: 'bold' }, color: '#374151' },
            grid: { display: false }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 14, font: { size: 12, weight: 'bold' }, color: '#374151' }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            padding: 10
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export const BandwidthRoadmapChart: React.FC<{ className?: string }> = ({ className = 'h-80 w-full' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'MIPI D-PHY v1.2',
          'MIPI D-PHY v3.0',
          'MIPI C-PHY v3.1',
          'GMSL1 (Legacy)',
          'GMSL2 (현행 표준)',
          'GMSL3 / A-PHY (차세대)',
          'USB 3.0 Gen1'
        ],
        datasets: [
          {
            label: '최대 물리 전송 대역폭 (Gbps)',
            data: [10.0, 36.0, 51.4, 3.12, 6.0, 16.0, 5.0],
            backgroundColor: [
              '#93c5fd',
              '#3b82f6',
              '#1d4ed8',
              '#fca5a5',
              '#ef4444',
              '#b91c1c',
              '#86efac'
            ],
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            title: {
              display: true,
              text: '물리 전송 대역폭 (Gbps)',
              font: { size: 11, weight: 'bold' }
            },
            grid: { color: '#f3f4f6' }
          },
          y: {
            ticks: { font: { size: 11, weight: 'bold' }, color: '#374151' },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` 대역폭: ${context.parsed.x} Gbps`
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
};

interface TcoChartProps {
  cameraCount: number;
  className?: string;
}

export const TcoCostChart: React.FC<TcoChartProps> = ({ cameraCount, className = 'h-80 w-full' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Dynamic cost scaling based on camera count
    // MIPI: BOM ~$150 per cam + base carrier $100. NRE ~$3500. Maintenance ~$2000.
    const mipiBom = Math.round(150 * cameraCount + 100);
    const mipiNre = 3500;
    const mipiMaint = 2000;

    // GMSL2: BOM ~$480 per cam (SerDes + FAKRA + Camera) + Deserializer Hub $300. NRE ~$10000. Maintenance ~$2500.
    const gmslBom = Math.round(480 * cameraCount + 300);
    const gmslNre = 10000;
    const gmslMaint = 2500;

    // USB 3.0: BOM ~$230 per cam (Industrial USB cam + screw-lock cable) + PCIe host hub $80. NRE ~$500. Maintenance ~$300.
    const usbBom = Math.round(230 * cameraCount + 80);
    const usbNre = 500;
    const usbMaint = 300;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          `MIPI CSI-2 (${cameraCount}채널)`,
          `GMSL2 SerDes (${cameraCount}채널)`,
          `USB 3.0 (${cameraCount}채널)`
        ],
        datasets: [
          {
            label: '하드웨어 부품 BOM 비용',
            data: [mipiBom, gmslBom, usbBom],
            backgroundColor: '#3b82f6',
            borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
          },
          {
            label: '소프트웨어 Bring-up NRE 인건비',
            data: [mipiNre, gmslNre, usbNre],
            backgroundColor: '#ef4444'
          },
          {
            label: '1년차 OS 메이저 유지보수비',
            data: [mipiMaint, gmslMaint, usbMaint],
            backgroundColor: '#10b981',
            borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: { font: { size: 11, weight: 'bold' }, color: '#374151' },
            grid: { display: false }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: '총 1년차 투입 비용 ($ USD)',
              font: { size: 11, weight: 'bold' },
              color: '#374151'
            },
            grid: { color: '#f3f4f6' },
            ticks: {
              callback: (value) => `$${Number(value).toLocaleString()}`
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 14, font: { size: 12, weight: 'bold' }, color: '#374151', padding: 14 }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.dataset.label}: $${Number(context.parsed.y).toLocaleString()}`,
              footer: (items) => {
                const total = items.reduce((acc, curr) => acc + curr.parsed.y, 0);
                return `총계: $${total.toLocaleString()}`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [cameraCount]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
};
