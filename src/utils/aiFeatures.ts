/**
 * Client-side feature engineering for fraud detection (ported from Python backend).
 */

export const FEATURE_COLS = [
  'amount_log',
  'threshold_evasion',
  'self_approval',
  'round_dollar',
  'vendor_risk',
  'weekend_payment',
  'off_hours_entry',
] as const;

type RecordLike = Record<string, unknown>;
type VendorLookup = Record<string, RecordLike>;

function parseNum(val: unknown): number {
  if (val == null || val === '') return 0;
  const n = parseFloat(String(val));
  return Number.isFinite(n) ? n : 0;
}

function parseDateStr(val: unknown): string {
  if (!val) return '';
  return String(val);
}

function getWeekday(dateStr: string): number {
  if (!dateStr) return 0;
  const s = dateStr.slice(0, 10);
  const d = new Date(s + 'T12:00:00Z');
  return d.getUTCDay();
}

function getHours(dateStr: string): number {
  if (!dateStr) return 12;
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    return d.getHours();
  }
  return 12;
}

export function invoiceToFeatures(inv: RecordLike, vendorLookup: VendorLookup): Record<string, number> {
  const amount = parseNum(inv.amount);
  const vendorId = String(inv.vendor_id ?? inv.vendor_Id ?? '');
  const vendor = vendorLookup[vendorId] ?? {};
  const createdBy = String(inv.created_by_user_id ?? inv.createdBy ?? '');
  const approvedBy = String(inv.approved_by_user_id ?? inv.approvedBy ?? '');

  const in5k = amount >= 4900 && amount < 5000 ? 1 : 0;
  const in10k = amount >= 9800 && amount < 10000 ? 1 : 0;
  const in25k = amount >= 24800 && amount < 25000 ? 1 : 0;
  const thresholdEvasion = Math.max(in5k, in10k, in25k);
  const selfApproval = createdBy && approvedBy && createdBy === approvedBy ? 1 : 0;
  const roundDollar = amount >= 1000 && amount % 1000 === 0 ? 1 : 0;
  const vendorRisk = (vendor.risk_flag_internal as string) === 'Y' ? 1 : 0;
  const amountLog = amount > 0 ? Math.log1p(amount) : 0;

  return {
    amount_log: amountLog,
    threshold_evasion: thresholdEvasion,
    self_approval: selfApproval,
    round_dollar: roundDollar,
    vendor_risk: vendorRisk,
    weekend_payment: 0,
    off_hours_entry: 0,
  };
}

export function paymentToFeatures(p: RecordLike, vendorLookup: VendorLookup): Record<string, number> {
  const amount = parseNum(p.amount);
  const vendorId = String(p.vendor_id ?? p.vendor_Id ?? '');
  const vendor = vendorLookup[vendorId] ?? {};
  const dateStr = parseDateStr(p.payment_date);
  const weekday = getWeekday(dateStr);
  const weekend = weekday === 0 || weekday === 6 ? 1 : 0;
  const vendorRisk = (vendor.risk_flag_internal as string) === 'Y' ? 1 : 0;
  const amountLog = amount > 0 ? Math.log1p(amount) : 0;

  return {
    amount_log: amountLog,
    threshold_evasion: 0,
    self_approval: 0,
    round_dollar: 0,
    vendor_risk: vendorRisk,
    weekend_payment: weekend,
    off_hours_entry: 0,
  };
}

export function glToFeatures(gl: RecordLike): Record<string, number> {
  const debit = parseNum(gl.debit_amount);
  const credit = parseNum(gl.credit_amount);
  const amount = debit || credit;
  const dateStr = parseDateStr(gl.posting_date);
  const hour = getHours(dateStr);
  const offHours = hour < 6 || hour > 22 ? 1 : 0;
  const amountLog = amount > 0 ? Math.log1p(amount) : 0;

  return {
    amount_log: amountLog,
    threshold_evasion: 0,
    self_approval: 0,
    round_dollar: 0,
    vendor_risk: 0,
    weekend_payment: 0,
    off_hours_entry: offHours,
  };
}

export function featureDictToVector(feats: Record<string, number>): number[] {
  return FEATURE_COLS.map((c) => Number(feats[c] ?? 0));
}

export function buildTrainingData(data: {
  vendors: RecordLike[];
  invoices: RecordLike[];
  payments: RecordLike[];
  glEntries: RecordLike[];
}): { X: number[][]; y: number[] } {
  const vendorLookup: VendorLookup = {};
  data.vendors.forEach((v) => {
    const id = String(v.vendor_id ?? v.vendor_Id ?? '');
    vendorLookup[id] = v;
  });

  const X: number[][] = [];
  const y: number[] = [];

  data.invoices.forEach((inv) => {
    const feats = invoiceToFeatures(inv, vendorLookup);
    const vec = featureDictToVector(feats);
    X.push(vec);
    const label =
      feats.threshold_evasion || feats.self_approval || (feats.round_dollar && feats.vendor_risk) ? 1 : 0;
    y.push(label);
  });

  data.payments.forEach((p) => {
    const feats = paymentToFeatures(p, vendorLookup);
    X.push(featureDictToVector(feats));
    y.push(feats.weekend_payment || feats.vendor_risk ? 1 : 0);
  });

  data.glEntries.forEach((gl) => {
    const feats = glToFeatures(gl);
    X.push(featureDictToVector(feats));
    y.push(feats.off_hours_entry ? 1 : 0);
  });

  return { X, y };
}

export function buildScoreInput(data: {
  vendors: RecordLike[];
  invoices: RecordLike[];
  payments: RecordLike[];
  glEntries: RecordLike[];
}): { invoices: number[][]; payments: number[][]; glEntries: number[][] } {
  const vendorLookup: VendorLookup = {};
  data.vendors.forEach((v) => {
    const id = String(v.vendor_id ?? v.vendor_Id ?? '');
    vendorLookup[id] = v;
  });

  return {
    invoices: data.invoices.map((inv) => featureDictToVector(invoiceToFeatures(inv, vendorLookup))),
    payments: data.payments.map((p) => featureDictToVector(paymentToFeatures(p, vendorLookup))),
    glEntries: data.glEntries.map((gl) => featureDictToVector(glToFeatures(gl))),
  };
}
