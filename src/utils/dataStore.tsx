import React, { useCallback, useState, createContext, useContext, useEffect } from 'react';
import { Case, Metric, CaseEvidence, CaseNote } from './types';
import { buildCaseEvidence } from './evidenceBuilder';
import { validateCSVSchema, type DataType } from './schemaValidation';
import { loadThresholds, saveThresholds, type DetectionThresholds } from './thresholds';
import { loadState, saveState } from './persistence';
import { generateVendorMasterCSV, generateInvoicesCSV, generatePaymentsCSV, generateGLEntriesCSV } from './sampleData';
import { analyzeWithAI, trainModel as trainAIModel, getModelStatus, type TrainResult } from './aiService';
// Types for uploaded data
export interface UploadedFile {
  id: string;
  name: string;
  type: 'vendors' | 'invoices' | 'payments' | 'gl';
  size: string;
  records: number;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'error';
  schemaErrors?: string[];
  schemaWarnings?: string[];
}
export interface ProcessedData {
  vendors: any[];
  invoices: any[];
  payments: any[];
  glEntries: any[];
}
export interface GeneratedCase extends Case {
  evidence?: CaseEvidence;
}
export interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  generatedBy: string;
  date: string;
  size: string;
  status: 'Ready' | 'Expired';
}
interface DataStoreContextType {
  uploadedFiles: UploadedFile[];
  isDataLoaded: boolean;
  processedData: ProcessedData;
  cases: GeneratedCase[];
  metrics: Metric[];
  reports: GeneratedReport[];
  thresholds: DetectionThresholds;
  caseNotes: Record<string, CaseNote[]>;
  uploadFile: (file: File, type: UploadedFile['type']) => Promise<void>;
  clearAllData: () => void;
  processData: () => void;
  downloadReport: (reportId: string) => void;
  generateReportByType: (type: 'audit' | 'executive' | 'evidence') => void;
  updateThresholds: (t: Partial<DetectionThresholds>) => void;
  loadSampleData: () => void;
  addCase: (caseData: Partial<Case>) => void;
  updateCase: (caseId: string, updates: Partial<Case>) => void;
  addCaseNote: (caseId: string, content: string, author?: string) => void;
  useAI: boolean;
  setUseAI: (v: boolean) => void;
  trainModel: (options?: { pushToHub?: boolean; hfRepoId?: string }) => Promise<TrainResult>;
  modelStatus: { model_exists: boolean; model_path: string | null };
  lastAIAnalysisSummary: {
    totalScored: number;
    highRiskCount: number;
    mediumRiskCount: number;
    runAt: string;
  } | null;
}
const DataStoreContext = createContext<DataStoreContextType | null>(null);
export function useDataStore() {
  const context = useContext(DataStoreContext);
  if (!context) {
    throw new Error('useDataStore must be used within DataStoreProvider');
  }
  return context;
}
// CSV Parser - handles quoted fields, different line endings, empty values, BOM
function parseCSV(csvText: string): any[] {
  const bomStripped = csvText.replace(/^\uFEFF/, '');
  const normalized = bomStripped.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const lines = normalized.split('\n');
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === ',' && !inQuotes) || (c === '\n' && !inQuotes)) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
        if (c === '\n') break;
      } else {
        current += c;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/"/g, ''));
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function getCSVHeaders(csvText: string): string[] {
  const bomStripped = csvText.replace(/^\uFEFF/, '');
  const normalized = bomStripped.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const firstLine = normalized.split('\n')[0];
  if (!firstLine) return [];
  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else current += c;
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };
  return parseRow(firstLine).map((h) => h.replace(/"/g, '').trim());
}

// Analyze data and generate cases (uses configurable thresholds)
function analyzeDataAndGenerateCases(data: ProcessedData, thresholds: DetectionThresholds): GeneratedCase[] {
  const cases: GeneratedCase[] = [];
  let caseIndex = 1;
  const t = thresholds;
  // Analyze invoices for threshold evasion
  const thresholdInvoices = data.invoices.filter((inv) => {
    const amount = parseFloat(inv.amount);
    return (
      (amount >= t.threshold10kMin && amount < t.threshold10kMax) ||
      (amount >= t.threshold5kMin && amount < t.threshold5kMax) ||
      (amount >= t.threshold25kMin && amount < t.threshold25kMax)
    );
  });
  if (thresholdInvoices.length > 0) {
    const totalExposure = thresholdInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.amount || 0),
      0
    );
    const evidence = buildCaseEvidence({
      type: 'Structuring',
      records: { invoices: thresholdInvoices },
      data,
    });
    cases.push({
      id: `CS-2024-${String(caseIndex++).padStart(3, '0')}`,
      title: `Threshold Evasion Pattern Detected`,
      type: 'Structuring',
      riskLevel: 'critical',
      riskScore: 92,
      exposureAmount: Math.round(totalExposure),
      status: 'open',
      createdAt: new Date().toISOString(),
      description: `${thresholdInvoices.length} invoices detected with amounts just below approval thresholds ($5k, $10k, $25k).`,
      evidence,
    });
  }
  // Analyze for self-approvals
  const selfApprovals = data.invoices.filter(
    (inv) =>
    inv.created_by_user_id &&
    inv.approved_by_user_id &&
    inv.created_by_user_id === inv.approved_by_user_id
  );
  if (selfApprovals.length > 0) {
    const totalExposure = selfApprovals.reduce(
      (sum, inv) => sum + parseFloat(inv.amount || 0),
      0
    );
    const evidence = buildCaseEvidence({
      type: 'Segregation of Duties',
      records: { invoices: selfApprovals },
      data,
    });
    cases.push({
      id: `CS-2024-${String(caseIndex++).padStart(3, '0')}`,
      title: `Self-Approval Violations`,
      type: 'Segregation of Duties',
      riskLevel: 'high',
      riskScore: 85,
      exposureAmount: Math.round(totalExposure),
      status: 'open',
      createdAt: new Date().toISOString(),
      description: `${selfApprovals.length} invoices where the same user created and approved the transaction.`,
      evidence,
    });
  }
  // Analyze vendors for shell company indicators
  const suspiciousVendors = data.vendors.filter(
    (v) => v.risk_flag_internal === 'Y'
  );
  if (suspiciousVendors.length > 0) {
    const evidence = buildCaseEvidence({
      type: 'Shell Vendor Risk',
      records: { vendors: suspiciousVendors },
      data,
    });
    cases.push({
      id: `CS-2024-${String(caseIndex++).padStart(3, '0')}`,
      title: `Shell Vendor Risk Indicators`,
      type: 'Shell Vendor Risk',
      riskLevel: 'critical',
      riskScore: 88,
      exposureAmount: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
      description: `${suspiciousVendors.length} vendors flagged with potential shell company indicators (matching addresses, similar names, same bank accounts).`,
      evidence,
    });
  }
  // Analyze for duplicate bank accounts across vendors
  const bankAccounts: {
    [key: string]: any[];
  } = {};
  data.vendors.forEach((v) => {
    const last4 = v.bank_account_last4;
    if (last4) {
      if (!bankAccounts[last4]) bankAccounts[last4] = [];
      bankAccounts[last4].push(v);
    }
  });
  const duplicateBankVendors = Object.entries(bankAccounts).filter(
    ([_, vendors]) => vendors.length > 1
  );
  if (duplicateBankVendors.length > 0) {
    const allVendors = duplicateBankVendors.flatMap(([, vs]) => vs);
    const evidence = buildCaseEvidence({
      type: 'Conflict of Interest',
      records: { vendors: allVendors },
      data,
    });
    cases.push({
      id: `CS-2024-${String(caseIndex++).padStart(3, '0')}`,
      title: `Duplicate Bank Account Detection`,
      type: 'Conflict of Interest',
      riskLevel: 'high',
      riskScore: 78,
      exposureAmount: 0,
      status: 'review',
      createdAt: new Date().toISOString(),
      description: `${duplicateBankVendors.length} bank accounts shared across multiple vendors.`,
      evidence,
    });
  }
  // Analyze payments for weekend activity
  const weekendPayments = data.payments.filter((p) => {
    const date = new Date(p.payment_date);
    const day = date.getDay();
    return day === 0 || day === 6;
  });
  if (weekendPayments.length > 0) {
    const totalExposure = weekendPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0
    );
    const evidence = buildCaseEvidence({
      type: 'Behavioral Anomaly',
      records: { payments: weekendPayments },
      data,
    });
    cases.push({
      id: `CS-2024-${String(caseIndex++).padStart(3, '0')}`,
      title: `Weekend Payment Anomaly`,
      type: 'Behavioral Anomaly',
      riskLevel: 'medium',
      riskScore: 65,
      exposureAmount: Math.round(totalExposure),
      status: 'open',
      createdAt: new Date().toISOString(),
      description: `${weekendPayments.length} payments processed on weekends.`,
      evidence,
    });
  }
  // Analyze GL entries for off-hours activity
  const offHoursEntries = data.glEntries.filter((gl) => {
    const date = new Date(gl.posting_date);
    const hour = date.getHours();
    return hour < t.offHoursStart || hour > t.offHoursEnd;
  });
  if (offHoursEntries.length > 0) {
    const totalAmount = offHoursEntries.reduce((sum, gl) => {
      return (
        sum +
        parseFloat(gl.debit_amount || 0) +
        parseFloat(gl.credit_amount || 0));

    }, 0);
    const evidence = buildCaseEvidence({
      type: 'Journal Entry Fraud',
      records: { glEntries: offHoursEntries },
      data,
    });
    cases.push({
      id: `CS-2024-${String(caseIndex++).padStart(3, '0')}`,
      title: `Off-Hours Journal Entries`,
      type: 'Journal Entry Fraud',
      riskLevel: 'medium',
      riskScore: 58,
      exposureAmount: Math.round(totalAmount),
      status: 'review',
      createdAt: new Date().toISOString(),
      description: `${offHoursEntries.length} GL entries posted outside business hours (before 6 AM or after 10 PM).`,
      evidence,
    });
  }
  // Analyze for round dollar amounts
  const roundDollarInvoices = data.invoices.filter((inv) => {
    const amount = parseFloat(inv.amount);
    return amount >= t.roundDollarMin && amount % 1000 === 0;
  });
  if (roundDollarInvoices.length >= t.roundDollarMinCount) {
    const totalExposure = roundDollarInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.amount || 0),
      0
    );
    const evidence = buildCaseEvidence({
      type: 'Payment Anomaly',
      records: { invoices: roundDollarInvoices },
      data,
    });
    cases.push({
      id: `CS-2024-${String(caseIndex++).padStart(3, '0')}`,
      title: `Round Dollar Amount Pattern`,
      type: 'Payment Anomaly',
      riskLevel: 'low',
      riskScore: 42,
      exposureAmount: Math.round(totalExposure),
      status: 'open',
      createdAt: new Date().toISOString(),
      description: `${roundDollarInvoices.length} invoices with suspiciously round dollar amounts.`,
      evidence,
    });
  }
  return cases;
}

const AI_ENABLED_KEY = 'forensic-ai-use-ai';

function loadUseAI(): boolean {
  try {
    const v = localStorage.getItem(AI_ENABLED_KEY);
    return v !== 'false';
  } catch { return true; }
}

function saveUseAI(v: boolean): void {
  try {
    localStorage.setItem(AI_ENABLED_KEY, String(v));
  } catch { /* ignore */ }
}

// Generate metrics from processed data
function generateMetrics(
data: ProcessedData,
cases: GeneratedCase[])
: Metric[] {
  const activeCases = cases.filter((c) => c.status !== 'closed').length;
  const totalExposure = cases.reduce((sum, c) => sum + c.exposureAmount, 0);
  const criticalCases = cases.filter((c) => c.riskLevel === 'critical').length;
  const totalRecords =
  data.vendors.length +
  data.invoices.length +
  data.payments.length +
  data.glEntries.length;
  return [
  {
    label: 'Active Cases',
    value: activeCases,
    trend: activeCases > 0 ? 100 : 0,
    trendLabel: 'from analysis',
    status: activeCases > 5 ? 'negative' : 'positive'
  },
  {
    label: 'Total Exposure',
    value: `$${(totalExposure / 1000000).toFixed(1)}M`,
    trend: totalExposure > 0 ? Math.round(totalExposure / 1000000 * 10) : 0,
    trendLabel: 'identified',
    status: totalExposure > 500000 ? 'negative' : 'positive'
  },
  {
    label: 'Critical Alerts',
    value: criticalCases,
    trend: criticalCases,
    trendLabel: 'require attention',
    status: criticalCases > 0 ? 'negative' : 'positive'
  },
  {
    label: 'Records Analyzed',
    value: totalRecords.toLocaleString(),
    trend: 100,
    trendLabel: 'processed',
    status: 'positive'
  }];

}
export function DataStoreProvider({ children }: {children: ReactNode;}) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData>({
    vendors: [],
    invoices: [],
    payments: [],
    glEntries: []
  });
  const [cases, setCases] = useState<GeneratedCase[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [caseNotes, setCaseNotes] = useState<Record<string, CaseNote[]>>({});
  const [thresholds, setThresholdsState] = useState<DetectionThresholds>(loadThresholds);
  const [useAI, setUseAIState] = useState(loadUseAI);
  const [modelStatus, setModelStatus] = useState<{ model_exists: boolean; model_path: string | null }>({ model_exists: false, model_path: null });
  const [lastAIAnalysisSummary, setLastAIAnalysisSummary] = useState<{
    totalScored: number;
    highRiskCount: number;
    mediumRiskCount: number;
    runAt: string;
  } | null>(null);
  const isDataLoaded = uploadedFiles.some((f) => f.status === 'completed');

  const setUseAI = useCallback((v: boolean) => {
    setUseAIState(v);
    saveUseAI(v);
  }, []);

  useEffect(() => {
    getModelStatus().then(setModelStatus);
  }, []);

  useEffect(() => {
    loadState().then((s) => {
      if (s) {
        setUploadedFiles((s.uploadedFiles ?? []).map((f) => ({
          ...f,
          uploadedAt: new Date(f.uploadedAt)
        })));
        setProcessedData(s.processedData ?? { vendors: [], invoices: [], payments: [], glEntries: [] });
        setCases((s.cases ?? []) as GeneratedCase[]);
        setMetrics((s.metrics ?? []) as Metric[]);
        setReports((s.reports ?? []) as GeneratedReport[]);
      }
    });
  }, []);

  const persistState = useCallback(() => {
    const files = uploadedFiles.map((f) => ({
      ...f,
      uploadedAt: f.uploadedAt.toISOString()
    }));
    saveState({
      uploadedFiles: files,
      processedData,
      cases,
      metrics,
      reports,
      caseNotes,
      savedAt: new Date().toISOString()
    });
  }, [uploadedFiles, processedData, cases, metrics, reports, caseNotes]);

  useEffect(() => {
    if (isDataLoaded) persistState();
  }, [isDataLoaded, cases, metrics, reports, processedData, persistState]);

  const updateThresholds = useCallback((t: Partial<DetectionThresholds>) => {
    saveThresholds(t);
    setThresholdsState(loadThresholds());
  }, []);

  const runAnalysis = useCallback(async (data: ProcessedData) => {
    const generatedCases = analyzeDataAndGenerateCases(data, thresholds);

    if (useAI) {
      const scores = await analyzeWithAI({
        vendors: data.vendors,
        invoices: data.invoices,
        payments: data.payments,
        glEntries: data.glEntries,
      }, { useZeroShot: false, useTabular: true });
      if (scores) {
        const aiThresholdHigh = 0.8;
        const aiThreshold = 0.65;
        const allScores = [
          ...(scores.invoices ?? []),
          ...(scores.payments ?? []),
          ...(scores.glEntries ?? []),
        ];
        const highRiskCount = allScores.filter((s) => s >= aiThresholdHigh).length;
        const mediumRiskCount = allScores.filter((s) => s >= aiThreshold && s < aiThresholdHigh).length;
        setLastAIAnalysisSummary({
          totalScored: allScores.length,
          highRiskCount,
          mediumRiskCount,
          runAt: new Date().toISOString(),
        });
        const aiInvoices = (scores.invoices ?? []).map((s, i) => ({ score: s, record: data.invoices[i] })).filter((x) => x.score >= aiThreshold && x.record);
        const aiPayments = (scores.payments ?? []).map((s, i) => ({ score: s, record: data.payments[i] })).filter((x) => x.score >= aiThreshold && x.record);
        const aiGL = (scores.glEntries ?? []).map((s, i) => ({ score: s, record: data.glEntries[i] })).filter((x) => x.score >= aiThreshold && x.record);
        const aiInvoiceRecords = aiInvoices.map((x) => x.record);
        const aiPaymentRecords = aiPayments.map((x) => x.record);
        const aiGLRecords = aiGL.map((x) => x.record);
        const totalAi = aiInvoiceRecords.length + aiPaymentRecords.length + aiGLRecords.length;
        if (totalAi > 0) {
          const totalExposure = aiInvoiceRecords.reduce((s, r) => s + parseFloat(r?.amount || 0), 0)
            + aiPaymentRecords.reduce((s, r) => s + parseFloat(r?.amount || 0), 0)
            + aiGLRecords.reduce((s, r) => s + parseFloat(r?.debit_amount || 0) + parseFloat(r?.credit_amount || 0), 0);
          const evidence = buildCaseEvidence({
            type: 'AI-Detected Anomaly',
            records: { invoices: aiInvoiceRecords, payments: aiPaymentRecords, glEntries: aiGLRecords },
            data,
            aiScores: {
              invoices: aiInvoices.map((x) => x.score),
              payments: aiPayments.map((x) => x.score),
              glEntries: aiGL.map((x) => x.score),
            },
          });
          generatedCases.unshift({
            id: `CS-2024-${String(generatedCases.length + 1).padStart(3, '0')}`,
            title: 'AI-Detected Fraud Risk',
            type: 'AI-Detected Anomaly',
            riskLevel: 'high',
            riskScore: 80,
            exposureAmount: Math.round(totalExposure),
            status: 'open',
            createdAt: new Date().toISOString(),
            description: `${totalAi} records flagged by the ML model with elevated fraud risk.`,
            evidence,
          });
        }
      }
    }

    setCases(generatedCases);
    setMetrics(generateMetrics(data, generatedCases));
    const generatedReports: GeneratedReport[] = [];
    if (generatedCases.length > 0) {
      generatedReports.push({ id: 'r1', name: 'Fraud Risk Assessment', type: 'Audit Ready', generatedBy: 'System', date: new Date().toISOString().split('T')[0], size: `${(generatedCases.length * 0.3).toFixed(1)} MB`, status: 'Ready' });
    }
    if (data.vendors.length > 0) {
      generatedReports.push({ id: 'r2', name: 'Vendor Risk Analysis', type: 'Evidence Bundle', generatedBy: 'System', date: new Date().toISOString().split('T')[0], size: `${(data.vendors.length * 0.1).toFixed(1)} MB`, status: 'Ready' });
    }
    if (data.invoices.length > 0 || data.payments.length > 0) {
      generatedReports.push({ id: 'r3', name: 'Transaction Analysis Summary', type: 'Executive', generatedBy: 'System', date: new Date().toISOString().split('T')[0], size: `${((data.invoices.length + data.payments.length) * 0.05).toFixed(1)} MB`, status: 'Ready' });
    }
    setReports(generatedReports);
    getModelStatus().then(setModelStatus);
  }, [thresholds, useAI]);

  const loadSampleData = useCallback(() => {
    const vendors = parseCSV(generateVendorMasterCSV());
    const invoices = parseCSV(generateInvoicesCSV());
    const payments = parseCSV(generatePaymentsCSV());
    const glEntries = parseCSV(generateGLEntriesCSV());
    const data: ProcessedData = { vendors, invoices, payments, glEntries };
    setProcessedData(data);
    const now = new Date();
    setUploadedFiles([
      { id: 'sample-vendors', name: 'Sample Vendor Master', type: 'vendors', size: '< 0.1 MB', records: vendors.length, uploadedAt: now, status: 'completed' },
      { id: 'sample-invoices', name: 'Sample AP Invoices', type: 'invoices', size: '< 0.1 MB', records: invoices.length, uploadedAt: now, status: 'completed' },
      { id: 'sample-payments', name: 'Sample Payments', type: 'payments', size: '< 0.1 MB', records: payments.length, uploadedAt: now, status: 'completed' },
      { id: 'sample-gl', name: 'Sample GL Entries', type: 'gl', size: '< 0.1 MB', records: glEntries.length, uploadedAt: now, status: 'completed' },
    ]);
    runAnalysis(data).catch(console.error);
  }, [runAnalysis]);

  const uploadFile = useCallback(
    async (file: File, type: UploadedFile['type']) => {
      const fileId = `file-${Date.now()}`;
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        records: 0,
        uploadedAt: new Date(),
        status: 'processing'
      };
      setUploadedFiles((prev) => [...prev, newFile]);
      try {
        const text = await file.text();
        const headers = getCSVHeaders(text);
        const validation = validateCSVSchema(headers, type as DataType);
        if (!validation.valid) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: 'error' as const,
                    schemaErrors: validation.errors,
                    schemaWarnings: validation.warnings
                  }
                : f
            )
          );
          return;
        }
        const rows = parseCSV(text);
        // Update processed data based on type
        setProcessedData((prev) => {
          const updated = {
            ...prev
          };
          switch (type) {
            case 'vendors':
              updated.vendors = rows;
              break;
            case 'invoices':
              updated.invoices = rows;
              break;
            case 'payments':
              updated.payments = rows;
              break;
            case 'gl':
              updated.glEntries = rows;
              break;
          }
          return updated;
        });
        // Update file status
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: 'completed' as const,
                  records: rows.length,
                  schemaWarnings: validation.warnings.length > 0 ? validation.warnings : undefined
                }
              : f
          )
        );
      } catch (error) {
        setUploadedFiles((prev) =>
        prev.map((f) =>
        f.id === fileId ?
        {
          ...f,
          status: 'error' as const
        } :
        f
        )
        );
      }
    },
    []
  );
  const processData = useCallback(async () => {
    await runAnalysis(processedData);
  }, [processedData, runAnalysis]);
  const clearAllData = useCallback(() => {
    setUploadedFiles([]);
    setProcessedData({
      vendors: [],
      invoices: [],
      payments: [],
      glEntries: []
    });
    setCases([]);
    setMetrics([]);
    setReports([]);
    setCaseNotes({});
    setLastAIAnalysisSummary(null);
    saveState({
      uploadedFiles: [],
      processedData: { vendors: [], invoices: [], payments: [], glEntries: [] },
      cases: [],
      metrics: [],
      reports: [],
      caseNotes: {},
      savedAt: new Date().toISOString()
    });
  }, []);

  const downloadReport = useCallback((reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report || report.status === 'Expired') return;
    const payload = {
      report: { id: report.id, name: report.name, type: report.type, date: report.date },
      generatedAt: new Date().toISOString(),
      summary: {
        totalCases: cases.length,
        activeCases: cases.filter((c) => c.status !== 'closed').length,
        totalExposure: cases.reduce((s, c) => s + c.exposureAmount, 0),
        recordsAnalyzed:
          processedData.vendors.length +
          processedData.invoices.length +
          processedData.payments.length +
          processedData.glEntries.length,
      },
      metrics,
      cases: cases.map((c) => ({
        ...c,
        evidence: undefined,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '-')}-${report.date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [reports, cases, metrics, processedData]);

  const generateReportByType = useCallback((type: 'audit' | 'executive' | 'evidence') => {
    const templates = {
      audit: { name: 'Audit-Ready-Fraud-Assessment', title: 'Fraud Risk Assessment' },
      executive: { name: 'Executive-Summary', title: 'Executive Summary' },
      evidence: { name: 'Evidence-Bundle', title: 'Evidence Bundle' },
    };
    const t = templates[type];
    const payload = {
      reportType: t.title,
      generatedAt: new Date().toISOString(),
      dataSource: { vendors: processedData.vendors.length, invoices: processedData.invoices.length, payments: processedData.payments.length, glEntries: processedData.glEntries.length },
      summary: { totalCases: cases.length, activeCases: cases.filter((c) => c.status !== 'closed').length, totalExposure: cases.reduce((s, c) => s + c.exposureAmount, 0) },
      metrics,
      cases: cases.map((c) => ({ ...c, evidence: undefined })),
      ...(type === 'evidence' && { processedData: { vendors: processedData.vendors, invoices: processedData.invoices, payments: processedData.payments, glEntries: processedData.glEntries } }),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t.name}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cases, metrics, processedData]);

  const addCase = useCallback((caseData: Partial<Case>) => {
    const ids = cases.map((c) => parseInt(c.id.replace(/\D/g, ''), 10) || 0);
    const nextId = (ids.length > 0 ? Math.max(...ids) : 0) + 1;
    const newCase: GeneratedCase = {
      id: `CS-2024-${String(nextId).padStart(3, '0')}`,
      title: caseData.title ?? 'Manual Case',
      type: caseData.type ?? 'Manual',
      riskLevel: (caseData.riskLevel as Case['riskLevel']) ?? 'medium',
      riskScore: caseData.riskScore ?? 50,
      exposureAmount: caseData.exposureAmount ?? 0,
      status: caseData.status ?? 'open',
      createdAt: new Date().toISOString(),
      description: caseData.description ?? '',
      assignee: caseData.assignee,
    };
    setCases((prev) => [newCase, ...prev]);
  }, [cases]);

  const updateCase = useCallback((caseId: string, updates: Partial<Case>) => {
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, ...updates } : c)));
  }, []);

  const trainModel = useCallback(async (options?: { pushToHub?: boolean; hfRepoId?: string }) => {
    const result = await trainAIModel({
      vendors: processedData.vendors,
      invoices: processedData.invoices,
      payments: processedData.payments,
      glEntries: processedData.glEntries,
    }, { ruleBasedLabels: true, ...options });
    if (result.success) getModelStatus().then(setModelStatus);
    return result;
  }, [processedData]);

  const addCaseNote = useCallback((caseId: string, content: string, author = 'Current User') => {
    const note: CaseNote = {
      id: `note-${Date.now()}`,
      caseId,
      author,
      content,
      createdAt: new Date().toISOString(),
    };
    setCaseNotes((prev) => ({
      ...prev,
      [caseId]: [...(prev[caseId] ?? []), note],
    }));
  }, []);

  return (
    <DataStoreContext.Provider
      value={{
        uploadedFiles,
        isDataLoaded,
        processedData,
        cases,
        metrics,
        reports,
        caseNotes,
        thresholds,
        uploadFile,
        clearAllData,
        processData,
        downloadReport,
        generateReportByType,
        updateThresholds,
        loadSampleData,
        addCase,
        updateCase,
        addCaseNote,
        useAI,
        setUseAI,
        trainModel,
        modelStatus,
        lastAIAnalysisSummary,
      }}>

      {children}
    </DataStoreContext.Provider>);

}