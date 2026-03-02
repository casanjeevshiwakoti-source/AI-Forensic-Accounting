export type DataType = 'vendors' | 'invoices' | 'payments' | 'gl';

export interface SchemaField {
  name: string;
  required: boolean;
  description: string;
  /** Alternative column names (e.g. camelCase variants) */
  aliases?: string[];
}

export const SCHEMAS: Record<DataType, SchemaField[]> = {
  vendors: [
    { name: 'vendor_id', required: true, description: 'Unique vendor identifier', aliases: ['vendor_Id', 'vendorId', 'Vendor ID', 'VendorId', 'vendor id'] },
    { name: 'vendor_name', required: true, description: 'Vendor display name', aliases: ['vendor_Name', 'vendorName', 'Vendor Name', 'VendorName', 'vendor name', 'name'] },
    { name: 'bank_account_last4', required: false, description: 'Last 4 digits of bank account', aliases: ['bankAccountLast4'] },
    { name: 'risk_flag_internal', required: false, description: 'Internal risk flag (Y/N)', aliases: ['riskFlagInternal'] },
    { name: 'created_by_user_id', required: false, description: 'User who created vendor', aliases: ['createdByUserId', 'created_by'] },
  ],
  invoices: [
    { name: 'invoice_id', required: true, description: 'Unique invoice identifier', aliases: ['invoice_Id', 'invoiceId', 'Invoice ID', 'invoice_number', 'invoice number'] },
    { name: 'vendor_id', required: true, description: 'Vendor reference', aliases: ['vendor_Id', 'vendorId', 'Vendor ID', 'vendor'] },
    { name: 'amount', required: true, description: 'Invoice amount', aliases: ['Amount', 'total', 'Total'] },
    { name: 'invoice_date', required: false, description: 'Invoice date', aliases: ['invoiceDate', 'posting_date', 'postingDate'] },
    { name: 'created_by_user_id', required: false, description: 'User who created', aliases: ['createdByUserId', 'created_by'] },
    { name: 'approved_by_user_id', required: false, description: 'User who approved', aliases: ['approvedByUserId', 'approved_by'] },
  ],
  payments: [
    { name: 'payment_id', required: true, description: 'Unique payment identifier', aliases: ['payment_Id', 'paymentId', 'Payment ID', 'payment number'] },
    { name: 'vendor_id', required: true, description: 'Vendor reference', aliases: ['vendor_Id', 'vendorId', 'Vendor ID', 'vendor'] },
    { name: 'amount', required: true, description: 'Payment amount', aliases: ['Amount', 'total', 'Total'] },
    { name: 'payment_date', required: true, description: 'Payment date', aliases: ['paymentDate', 'date', 'Date'] },
    { name: 'created_by_user_id', required: false, description: 'User who created', aliases: ['createdByUserId', 'created_by'] },
  ],
  gl: [
    { name: 'gl_entry_id', required: true, description: 'Unique GL entry identifier', aliases: ['gl_entry_Id', 'glEntryId', 'GL Entry ID', 'entry_id'] },
    { name: 'posting_date', required: true, description: 'Posting date', aliases: ['postingDate', 'date', 'Date'] },
    { name: 'debit_amount', required: false, description: 'Debit amount', aliases: ['debitAmount'] },
    { name: 'credit_amount', required: false, description: 'Credit amount', aliases: ['creditAmount'] },
    { name: 'created_by_user_id', required: false, description: 'User who created', aliases: ['createdByUserId', 'created_by'] },
  ],
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  mappedHeaders: Record<string, string>;
}

/** Check if a header matches a field (name or alias) - case insensitive */
function headerMatchesField(header: string, field: SchemaField): boolean {
  const h = header.trim().toLowerCase();
  if (h === field.name.toLowerCase()) return true;
  return (field.aliases ?? []).some((a) => a.toLowerCase() === h);
}

/** Normalize header for comparison: trim, lowercase, collapse spaces */
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Find the schema column name for a CSV header */
function mapHeader(header: string, fields: SchemaField[]): string | null {
  const h = header.trim();
  for (const field of fields) {
    if (headerMatchesField(h, field)) return field.name;
  }
  return null;
}

export function validateCSVSchema(
  headers: string[],
  dataType: DataType
): ValidationResult {
  const schema = SCHEMAS[dataType];
  const errors: string[] = [];
  const warnings: string[] = [];
  const mappedHeaders: Record<string, string> = {};

  for (const field of schema) {
    const normalizedField = normalizeHeader(field.name);
    const allNormalized = [normalizedField, ...(field.aliases ?? []).map(normalizeHeader)];
    const found = headers.find((h) =>
      allNormalized.some((n) => normalizeHeader(h) === n)
    );
    if (found) {
      mappedHeaders[field.name] = found.trim();
    } else if (field.required) {
      errors.push(`Missing required column: ${field.name} (or ${(field.aliases ?? []).join(', ')})`);
    } else {
      warnings.push(`Optional column missing: ${field.name} - some checks may be skipped`);
    }
  }

  if (headers.length === 0) {
    errors.push('File appears empty or has no header row. Ensure the file has a header row and uses comma (,) as delimiter.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    mappedHeaders,
  };
}
