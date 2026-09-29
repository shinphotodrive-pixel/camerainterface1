export type TabType = 'overview' | 'technical' | 'installation' | 'tco' | 'selector';

export interface ComparisonRow {
  id: string;
  category: 'performance' | 'physical' | 'reliability' | 'cost';
  categoryLabel: string;
  title: string;
  mipi: {
    value: string;
    highlight?: boolean;
    badge?: string;
    subtext?: string;
  };
  gmsl: {
    value: string;
    highlight?: boolean;
    badge?: string;
    subtext?: string;
  };
  usb: {
    value: string;
    highlight?: boolean;
    badge?: string;
    subtext?: string;
  };
}

export interface SelectorFormState {
  distance: 'short' | 'medium' | 'long';
  environment: 'indoor' | 'factory' | 'outdoor';
  latency: 'critical' | 'normal';
  development: 'fast' | 'custom';
  budget: 'low' | 'medium' | 'high';
  cameraCount: number;
}

export interface InterfaceScore {
  mipi: number;
  gmsl: number;
  usb: number;
}

export interface RecommendationResult {
  winner: 'mipi' | 'gmsl' | 'usb';
  winnerTitle: string;
  winnerBadge: string;
  winnerDesc: string;
  patternText: string;
  scores: InterfaceScore;
}

export interface BandwidthCalcParams {
  width: number;
  height: number;
  fps: number;
  bitDepth: 8 | 10 | 12 | 16 | 24;
  cameraCount: number;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  fullTerm: string;
  koreanName: string;
  category: 'hardware' | 'economics' | 'architecture' | 'protocol';
  categoryLabel: string;
  summary: string;
  description: string;
  relevance: string;
  engineeringTip: string;
  relatedTermIds?: string[];
}

