export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface Case {
  id: string;
  title: string;
  type: string;
  riskLevel: RiskLevel;
  riskScore: number;
  exposureAmount: number;
  status: 'open' | 'review' | 'escalated' | 'closed';
  createdAt: string;
  assignee?: string;
  description: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'invoice' | 'payment' | 'approval' | 'gl_entry' | 'alert';
  title: string;
  description: string;
  actor: string;
  amount?: number;
  riskLevel?: RiskLevel;
}

export interface Transaction {
  id: string;
  date: string;
  type: string;
  reference: string;
  vendor: string;
  amount: number;
  user: string;
  flags: string[];
  /** AI model fraud risk score 0–1 when from an AI-detected case */
  aiScore?: number;
}

export interface Metric {
  label: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  status: 'positive' | 'negative' | 'neutral';
}

export interface CaseEntity {
  id: string;
  name: string;
  type: 'vendor' | 'user' | 'invoice' | 'payment' | 'gl';
  riskLevel?: RiskLevel;
  subLabel?: string;
}

export interface CaseEvidence {
  timeline: TimelineEvent[];
  transactions: Transaction[];
  entities: CaseEntity[];
}

export interface CaseNote {
  id: string;
  caseId: string;
  author: string;
  content: string;
  createdAt: string;
}