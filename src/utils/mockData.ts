import { Case, TimelineEvent, Transaction, Metric } from './types';

export const mockMetrics: Metric[] = [
{
  label: 'Active Cases',
  value: 24,
  trend: 12,
  trendLabel: 'vs last week',
  status: 'negative'
},
{
  label: 'Total Exposure',
  value: '$4.2M',
  trend: 8,
  trendLabel: 'vs last week',
  status: 'negative'
},
{
  label: 'Detection Rate',
  value: '94.5%',
  trend: 2.1,
  trendLabel: 'vs last month',
  status: 'positive'
},
{
  label: 'Data Quality',
  value: '98.2%',
  trend: 0.5,
  trendLabel: 'vs last upload',
  status: 'positive'
}];


export const mockCases: Case[] = [
{
  id: 'CS-2024-001',
  title: 'Shell Vendor Pattern: TechCorp Solutions',
  type: 'Shell Vendor Risk',
  riskLevel: 'critical',
  riskScore: 92,
  exposureAmount: 450000,
  status: 'open',
  createdAt: '2024-03-10T09:00:00Z',
  assignee: 'Sarah Jenkins',
  description:
  'Detected rapid vendor creation followed by large round-dollar payments just below approval thresholds.'
},
{
  id: 'CS-2024-002',
  title: 'Duplicate Invoicing: Office Supplies Inc',
  type: 'Duplicate Invoicing',
  riskLevel: 'high',
  riskScore: 78,
  exposureAmount: 12500,
  status: 'review',
  createdAt: '2024-03-11T14:30:00Z',
  assignee: 'Mike Ross',
  description:
  'Multiple invoices with identical amounts and fuzzy-matched reference numbers within 24 hours.'
},
{
  id: 'CS-2024-003',
  title: 'Split Invoicing: Marketing Services',
  type: 'Structuring',
  riskLevel: 'medium',
  riskScore: 65,
  exposureAmount: 48000,
  status: 'open',
  createdAt: '2024-03-12T10:15:00Z',
  description:
  'Series of 5 invoices for $9,900 each, avoiding the $10k director approval limit.'
},
{
  id: 'CS-2024-004',
  title: 'Weekend Approval Anomaly',
  type: 'Behavioral Anomaly',
  riskLevel: 'medium',
  riskScore: 55,
  exposureAmount: 150000,
  status: 'escalated',
  createdAt: '2024-03-09T23:45:00Z',
  assignee: 'Sarah Jenkins',
  description:
  'Large batch of approvals processed on Sunday at 11:45 PM by a single user.'
},
{
  id: 'CS-2024-005',
  title: 'Ghost Employee Payroll',
  type: 'Payroll Fraud',
  riskLevel: 'critical',
  riskScore: 88,
  exposureAmount: 120000,
  status: 'open',
  createdAt: '2024-03-13T08:20:00Z',
  description: 'Employee ID matches vendor bank account details.'
},
{
  id: 'CS-2024-006',
  title: 'Round Dollar Payments',
  type: 'Payment Anomaly',
  riskLevel: 'medium',
  riskScore: 45,
  exposureAmount: 85000,
  status: 'closed',
  createdAt: '2024-03-08T11:00:00Z',
  assignee: 'Alex Investigator',
  description:
  'Unusual frequency of round dollar payments to consulting vendors.'
},
{
  id: 'CS-2024-007',
  title: 'Vendor Address Match',
  type: 'Conflict of Interest',
  riskLevel: 'high',
  riskScore: 72,
  exposureAmount: 210000,
  status: 'review',
  createdAt: '2024-03-07T15:30:00Z',
  assignee: 'Mike Ross',
  description: 'Vendor address matches employee home address on file.'
},
{
  id: 'CS-2024-008',
  title: 'Dormant Account Reactivation',
  type: 'Account Takeover',
  riskLevel: 'critical',
  riskScore: 95,
  exposureAmount: 650000,
  status: 'escalated',
  createdAt: '2024-03-06T09:45:00Z',
  assignee: 'Sarah Jenkins',
  description: 'Sudden activity on vendor account dormant for 18 months.'
},
{
  id: 'CS-2024-009',
  title: 'Sequential Invoice Numbers',
  type: 'Fabricated Invoices',
  riskLevel: 'high',
  riskScore: 75,
  exposureAmount: 42000,
  status: 'open',
  createdAt: '2024-03-05T13:15:00Z',
  description:
  'Vendor submitting invoices with perfectly sequential numbers over 6 months.'
},
{
  id: 'CS-2024-010',
  title: 'Off-Hours GL Entries',
  type: 'Journal Entry Fraud',
  riskLevel: 'medium',
  riskScore: 58,
  exposureAmount: 1200000,
  status: 'review',
  createdAt: '2024-03-04T22:10:00Z',
  assignee: 'Alex Investigator',
  description: 'Manual journal entries posted at 3 AM on Saturday.'
}];


export const mockTimeline: TimelineEvent[] = [
{
  id: 'evt-1',
  timestamp: '2024-03-01T09:00:00Z',
  type: 'alert',
  title: 'New Vendor Created',
  description:
  'Vendor "TechCorp Solutions" created by user J.DOE. Address matches residential zone.',
  actor: 'J.DOE',
  riskLevel: 'medium'
},
{
  id: 'evt-2',
  timestamp: '2024-03-01T09:15:00Z',
  type: 'invoice',
  title: 'Invoice #INV-2024-001 Received',
  description: 'Consulting Services for Q1',
  actor: 'TechCorp Solutions',
  amount: 9900,
  riskLevel: 'low'
},
{
  id: 'evt-3',
  timestamp: '2024-03-01T09:30:00Z',
  type: 'approval',
  title: 'Invoice Approved',
  description: 'Approved by J.DOE (Self-approval flag)',
  actor: 'J.DOE',
  riskLevel: 'high'
},
{
  id: 'evt-4',
  timestamp: '2024-03-02T10:00:00Z',
  type: 'payment',
  title: 'Payment Released',
  description: 'Wire transfer to account ending in 4455',
  actor: 'System',
  amount: 9900,
  riskLevel: 'low'
},
{
  id: 'evt-5',
  timestamp: '2024-03-05T14:00:00Z',
  type: 'invoice',
  title: 'Invoice #INV-2024-002 Received',
  description: 'Additional Consulting Services',
  actor: 'TechCorp Solutions',
  amount: 9900,
  riskLevel: 'medium'
}];


export const mockTransactions: Transaction[] = [
{
  id: 'tx-1',
  date: '2024-03-01',
  type: 'Invoice',
  reference: 'INV-001',
  vendor: 'TechCorp',
  amount: 9900,
  user: 'J.DOE',
  flags: ['Just Below Limit']
},
{
  id: 'tx-2',
  date: '2024-03-05',
  type: 'Invoice',
  reference: 'INV-002',
  vendor: 'TechCorp',
  amount: 9900,
  user: 'J.DOE',
  flags: ['Just Below Limit', 'Rapid Sequence']
},
{
  id: 'tx-3',
  date: '2024-03-10',
  type: 'Invoice',
  reference: 'INV-003',
  vendor: 'TechCorp',
  amount: 9900,
  user: 'J.DOE',
  flags: ['Just Below Limit']
},
{
  id: 'tx-4',
  date: '2024-03-15',
  type: 'Payment',
  reference: 'WIRE-992',
  vendor: 'TechCorp',
  amount: 29700,
  user: 'SYSTEM',
  flags: []
}];


export const mockUsers = [
{
  id: 'u1',
  name: 'Alex Investigator',
  role: 'Admin',
  email: 'alex@forensic.ai',
  status: 'Active',
  lastActive: 'Just now'
},
{
  id: 'u2',
  name: 'Sarah Jenkins',
  role: 'Investigator',
  email: 'sarah@forensic.ai',
  status: 'Active',
  lastActive: '2 hours ago'
},
{
  id: 'u3',
  name: 'Mike Ross',
  role: 'Analyst',
  email: 'mike@forensic.ai',
  status: 'Active',
  lastActive: '5 hours ago'
},
{
  id: 'u4',
  name: 'System Bot',
  role: 'Service Account',
  email: 'bot@forensic.ai',
  status: 'Active',
  lastActive: '1 min ago'
}];


export const mockReports = [
{
  id: 'r1',
  name: 'Q1 Fraud Risk Assessment',
  type: 'Audit Ready',
  generatedBy: 'Alex Investigator',
  date: '2024-03-15',
  size: '2.4 MB',
  status: 'Ready'
},
{
  id: 'r2',
  name: 'Vendor Risk Analysis - TechCorp',
  type: 'Evidence Bundle',
  generatedBy: 'Sarah Jenkins',
  date: '2024-03-14',
  size: '156 MB',
  status: 'Ready'
},
{
  id: 'r3',
  name: 'Monthly Executive Summary',
  type: 'Executive',
  generatedBy: 'System',
  date: '2024-03-01',
  size: '1.1 MB',
  status: 'Ready'
},
{
  id: 'r4',
  name: 'Suspicious Payments Export',
  type: 'CSV Extract',
  generatedBy: 'Mike Ross',
  date: '2024-02-28',
  size: '450 KB',
  status: 'Expired'
}];