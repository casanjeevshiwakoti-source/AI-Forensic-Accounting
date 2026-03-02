import type { TimelineEvent, Transaction, CaseEntity, RiskLevel } from './types';

type RecordLike = Record<string, unknown>;

function parseDate(val: unknown): string {
  if (!val) return new Date().toISOString();
  const str = String(val);
  const d = new Date(str);
  return isNaN(d.getTime()) ? str : d.toISOString();
}

function parseNum(val: unknown): number {
  if (val == null) return 0;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

function getVendorName(vendorId: string, vendors: RecordLike[]): string {
  const v = vendors.find((x) => String(x.vendor_id || x.vendor_Id) === vendorId);
  return (v?.vendor_name as string) || vendorId;
}

/** Build TimelineEvent from invoice record */
function invoiceToTimelineEvent(
  inv: RecordLike,
  index: number,
  vendors: RecordLike[],
  riskLevel?: RiskLevel
): TimelineEvent {
  const amount = parseNum(inv.amount);
  const vendorId = String(inv.vendor_id ?? inv.vendor_Id ?? '');
  const vendorName = getVendorName(vendorId, vendors);
  const createdBy = String(inv.created_by_user_id ?? inv.createdBy ?? 'Unknown');
  const approvedBy = String(inv.approved_by_user_id ?? inv.approvedBy ?? '');
  const flags: string[] = [];
  if (amount >= 9800 && amount < 10000) flags.push('Just Below $10k');
  if (amount >= 4900 && amount < 5000) flags.push('Just Below $5k');
  if (amount >= 24800 && amount < 25000) flags.push('Just Below $25k');
  if (createdBy && approvedBy && createdBy === approvedBy) flags.push('Self-Approval');

  return {
    id: `evt-inv-${index}`,
    timestamp: parseDate(inv.invoice_date || inv.posting_date),
    type: 'invoice',
    title: `Invoice ${inv.invoice_number ?? inv.invoice_id ?? index}`,
    description: String(inv.description ?? 'Invoice received'),
    actor: vendorName,
    amount,
    riskLevel: flags.length ? (riskLevel ?? 'medium') : undefined,
  };
}

/** Build TimelineEvent from payment record */
function paymentToTimelineEvent(
  p: RecordLike,
  index: number,
  vendors: RecordLike[]
): TimelineEvent {
  const amount = parseNum(p.amount);
  const vendorId = String(p.vendor_id ?? p.vendor_Id ?? '');
  const vendorName = getVendorName(vendorId, vendors);
  return {
    id: `evt-pay-${index}`,
    timestamp: parseDate(p.payment_date),
    type: 'payment',
    title: `Payment ${p.payment_reference ?? p.payment_id ?? index}`,
    description: `Payment released - ${p.payment_method ?? 'Wire'}`,
    actor: 'System',
    amount,
    riskLevel: undefined,
  };
}

/** Build TimelineEvent from GL entry */
function glToTimelineEvent(gl: RecordLike, index: number): TimelineEvent {
  const debit = parseNum(gl.debit_amount);
  const credit = parseNum(gl.credit_amount);
  const amount = debit || credit;
  const ts = parseDate(gl.posting_date);
  const hour = new Date(ts).getHours();
  const isOffHours = hour < 6 || hour > 22;
  return {
    id: `evt-gl-${index}`,
    timestamp: ts,
    type: 'gl_entry',
    title: `Journal Entry ${gl.document_number ?? gl.gl_entry_id ?? index}`,
    description: String(gl.description ?? 'Manual adjustment'),
    actor: String(gl.created_by_user_id ?? gl.createdBy ?? 'Unknown'),
    amount,
    riskLevel: isOffHours ? 'high' : undefined,
  };
}

/** Build Transaction from invoice */
function invoiceToTransaction(
  inv: RecordLike,
  index: number,
  vendors: RecordLike[]
): Transaction {
  const amount = parseNum(inv.amount);
  const vendorId = String(inv.vendor_id ?? inv.vendor_Id ?? '');
  const vendorName = getVendorName(vendorId, vendors);
  const flags: string[] = [];
  if (amount >= 9800 && amount < 10000) flags.push('Just Below Limit');
  if (amount >= 4900 && amount < 5000) flags.push('Just Below Limit');
  if (amount >= 24800 && amount < 25000) flags.push('Just Below Limit');
  const createdBy = String(inv.created_by_user_id ?? '');
  const approvedBy = String(inv.approved_by_user_id ?? '');
  if (createdBy && approvedBy && createdBy === approvedBy) flags.push('Self-Approval');
  if (amount >= 1000 && amount % 1000 === 0) flags.push('Round Amount');

  return {
    id: String(inv.invoice_id ?? inv.invoice_Id ?? `inv-${index}`),
    date: parseDate(inv.invoice_date ?? inv.posting_date).split('T')[0],
    type: 'Invoice',
    reference: String(inv.invoice_number ?? inv.invoice_id ?? index),
    vendor: vendorName,
    amount,
    user: createdBy || 'Unknown',
    flags,
  };
}

/** Build Transaction from payment */
function paymentToTransaction(
  p: RecordLike,
  index: number,
  vendors: RecordLike[]
): Transaction {
  const vendorId = String(p.vendor_id ?? p.vendor_Id ?? '');
  const vendorName = getVendorName(vendorId, vendors);
  const date = parseDate(p.payment_date);
  const d = new Date(date);
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const flags: string[] = isWeekend ? ['Weekend Payment'] : [];
  return {
    id: String(p.payment_id ?? p.payment_Id ?? `pay-${index}`),
    date: date.split('T')[0],
    type: 'Payment',
    reference: String(p.payment_reference ?? p.payment_id ?? index),
    vendor: vendorName,
    amount: parseNum(p.amount),
    user: String(p.created_by_user_id ?? p.createdBy ?? 'System'),
    flags,
  };
}

/** Build Transaction from GL entry */
function glToTransaction(gl: RecordLike, index: number): Transaction {
  const debit = parseNum(gl.debit_amount);
  const credit = parseNum(gl.credit_amount);
  const amount = debit || credit;
  const ts = parseDate(gl.posting_date);
  const d = new Date(ts);
  const isOffHours = d.getHours() < 6 || d.getHours() > 22;
  const flags: string[] = isOffHours ? ['Off-Hours Entry'] : [];
  return {
    id: String(gl.gl_entry_id ?? gl.gl_entry_Id ?? `gl-${index}`),
    date: ts.split('T')[0],
    type: 'GL Entry',
    reference: String(gl.document_number ?? gl.gl_entry_id ?? index),
    vendor: '-',
    amount,
    user: String(gl.created_by_user_id ?? gl.createdBy ?? 'Unknown'),
    flags,
  };
}

/** Build CaseEntity from vendor */
function vendorToEntity(v: RecordLike, riskLevel?: RiskLevel): CaseEntity {
  const name = String(v.vendor_name ?? v.vendor_Name ?? v.vendor_id ?? 'Unknown');
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    id: String(v.vendor_id ?? v.vendor_Id ?? ''),
    name,
    type: 'vendor',
    riskLevel: v.risk_flag_internal === 'Y' ? 'critical' : riskLevel,
    subLabel: `Vendor ID: ${v.vendor_id ?? '-'}`,
  };
}

/** Build CaseEntity from user id */
function userToEntity(userId: string): CaseEntity {
  const initials = userId.length >= 2 ? userId.slice(0, 2).toUpperCase() : userId;
  return {
    id: userId,
    name: userId,
    type: 'user',
    subLabel: `User ID: ${userId}`,
  };
}

export interface ProcessedDataLike {
  vendors: RecordLike[];
  invoices: RecordLike[];
  payments: RecordLike[];
  glEntries: RecordLike[];
}

export interface CaseEvidenceInput {
  type: string;
  records: {
    invoices?: RecordLike[];
    payments?: RecordLike[];
    glEntries?: RecordLike[];
    vendors?: RecordLike[];
  };
  data: ProcessedDataLike;
}

export function buildCaseEvidence(input: CaseEvidenceInput): {
  timeline: TimelineEvent[];
  transactions: Transaction[];
  entities: CaseEntity[];
} {
  const { type, records, data, aiScores } = input;
  const { vendors, invoices, payments, glEntries } = data;
  const timeline: TimelineEvent[] = [];
  const transactions: Transaction[] = [];
  const entityMap = new Map<string, CaseEntity>();

  const addVendorEntity = (vendorId: string) => {
    const v = vendors.find((x) => String(x.vendor_id ?? x.vendor_Id) === vendorId);
    if (v && !entityMap.has(vendorId)) {
      entityMap.set(vendorId, vendorToEntity(v));
    }
  };

  const addUserEntity = (userId: string) => {
    if (userId && !entityMap.has(userId)) {
      entityMap.set(userId, userToEntity(userId));
    }
  };

  if (records.invoices?.length) {
    records.invoices.forEach((inv, i) => {
      timeline.push(invoiceToTimelineEvent(inv, i, vendors));
      const approvedBy = String(inv.approved_by_user_id ?? inv.approvedBy ?? '');
      const createdBy = String(inv.created_by_user_id ?? inv.createdBy ?? '');
      if (approvedBy) {
        timeline.push({
          id: `evt-approval-${i}`,
          timestamp: parseDate(inv.approval_date ?? inv.invoice_date ?? inv.posting_date),
          type: 'approval',
          title: 'Invoice Approved',
          description: approvedBy === createdBy ? 'Self-approval (same user created and approved)' : `Approved by ${approvedBy}`,
          actor: approvedBy,
          amount: parseNum(inv.amount),
          riskLevel: approvedBy === createdBy ? 'high' : undefined,
        });
      }
      const tx = invoiceToTransaction(inv, i, vendors);
      const score = aiScores?.invoices?.[i];
      if (score !== undefined) tx.aiScore = score;
      transactions.push(tx);
      addVendorEntity(String(inv.vendor_id ?? inv.vendor_Id ?? ''));
      addUserEntity(createdBy);
      addUserEntity(approvedBy);
    });
  }

  if (records.payments?.length) {
    records.payments.forEach((p, i) => {
      timeline.push(paymentToTimelineEvent(p, i, vendors));
      const tx = paymentToTransaction(p, i, vendors);
      const score = aiScores?.payments?.[i];
      if (score !== undefined) tx.aiScore = score;
      transactions.push(tx);
      addVendorEntity(String(p.vendor_id ?? p.vendor_Id ?? ''));
      addUserEntity(String(p.created_by_user_id ?? p.createdBy ?? ''));
    });
  }

  if (records.glEntries?.length) {
    records.glEntries.forEach((gl, i) => {
      timeline.push(glToTimelineEvent(gl, i));
      const tx = glToTransaction(gl, i);
      const score = aiScores?.glEntries?.[i];
      if (score !== undefined) tx.aiScore = score;
      transactions.push(tx);
      addUserEntity(String(gl.created_by_user_id ?? gl.createdBy ?? ''));
    });
  }

  if (records.vendors?.length) {
    records.vendors.forEach((v) => {
      const vid = String(v.vendor_id ?? v.vendor_Id ?? '');
      if (!entityMap.has(vid)) entityMap.set(vid, vendorToEntity(v));
    });
  }

  // Sort timeline by timestamp
  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Add alert events for vendor-based cases
  if (records.vendors?.length && (type.includes('Shell') || type.includes('Conflict') || type.includes('Duplicate'))) {
    records.vendors.forEach((v, i) => {
      timeline.unshift({
        id: `evt-alert-${i}`,
        timestamp: parseDate(v.created_date ?? v.createdDate ?? v.created_at),
        type: 'alert',
        title: `Vendor: ${v.vendor_name ?? v.vendor_id ?? 'Unknown'}`,
        description: type.includes('Shell') ? 'Vendor flagged with shell company indicators' : 'Vendor shares bank account with other vendors',
        actor: String(v.created_by_user_id ?? v.createdBy ?? 'System'),
        riskLevel: 'critical',
      });
    });
  }

  return {
    timeline,
    transactions,
    entities: Array.from(entityMap.values()),
  };
}
