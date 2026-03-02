/** Sample CSV generators - schema-compliant, includes forensic red flags for testing */

export function generateVendorMasterCSV(): string {
  const headers = [
    'vendor_id', 'vendor_name', 'vendor_type', 'created_date', 'created_by_user_id',
    'status', 'tax_id_hash', 'address_line1', 'city', 'state', 'country',
    'bank_account_last4', 'risk_flag_internal',
  ];
  const vendorTypes = ['Consulting', 'Supplies', 'Services', 'Logistics', 'IT', 'Marketing', 'Staffing', 'Construction'];
  const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'MA', 'CO'];
  const users = ['U-1001', 'U-1002', 'U-1003', 'U-1004', 'U-1005'];
  let csv = headers.join(',') + '\n';
  for (let i = 1; i <= 100; i++) {
    const vendorId = `V-${String(i).padStart(4, '0')}`;
    const isSuspicious = i <= 15;
    const vendorName = isSuspicious && i <= 5 ? `TechCorp Solutions ${i}` : `Vendor ${i} ${vendorTypes[i % vendorTypes.length]} LLC`;
    const createdDate = new Date(2024, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
    const createdBy = isSuspicious && i <= 10 ? 'U-1001' : users[Math.floor(Math.random() * users.length)];
    const status = i > 95 ? 'Inactive' : 'Active';
    const taxIdHash = `HASH${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const address = isSuspicious && i <= 8 ? '123 Residential Lane' : `${100 + i} Business Blvd`;
    const city = isSuspicious && i <= 8 ? 'Hometown' : ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5];
    const bankLast4 = isSuspicious && i <= 5 ? '4455' : String(1000 + Math.floor(Math.random() * 9000));
    const riskFlag = isSuspicious ? 'Y' : 'N';
    csv += `${vendorId},"${vendorName}",${vendorTypes[i % vendorTypes.length]},${createdDate},${createdBy},${status},${taxIdHash},"${address}",${city},${states[i % states.length]},US,${bankLast4},${riskFlag}\n`;
  }
  return csv;
}

export function generateInvoicesCSV(): string {
  const headers = ['invoice_id', 'vendor_id', 'invoice_number', 'invoice_date', 'posting_date', 'amount', 'currency', 'created_by_user_id', 'payment_status', 'approved_by_user_id', 'approval_date', 'cost_center_id', 'department', 'gl_account', 'description'];
  const departments = ['IT', 'Marketing', 'Operations', 'Finance', 'HR', 'Sales'];
  const users = ['U-1001', 'U-1002', 'U-1003', 'U-1004', 'U-1005'];
  let csv = headers.join(',') + '\n';
  for (let i = 1; i <= 100; i++) {
    const invoiceId = `INV-2024-${String(i).padStart(4, '0')}`;
    const vendorId = `V-${String((i % 20) + 1).padStart(4, '0')}`;
    const invoiceNum = `EXT-${1000 + i}`;
    const isSuspicious = i <= 25;
    let amount: number;
    if (isSuspicious && i <= 10) amount = 9900 + Math.floor(Math.random() * 99);
    else if (isSuspicious && i <= 15) amount = 4950 + Math.floor(Math.random() * 49);
    else if (isSuspicious && i <= 20) amount = 24900 + Math.floor(Math.random() * 99);
    else amount = Math.floor(Math.random() * 50000) + 500;
    const invoiceDate = new Date(2024, Math.floor(i / 35), (i % 28) + 1);
    const postingDate = new Date(invoiceDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
    const createdBy = isSuspicious && i <= 15 ? 'U-1001' : users[Math.floor(Math.random() * users.length)];
    const approvedBy = isSuspicious && i <= 10 ? 'U-1001' : users[Math.floor(Math.random() * users.length)];
    const approvalDate = new Date(postingDate.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000);
    const status = i > 90 ? 'Pending' : 'Paid';
    const costCenter = `CC-${100 + (i % 10)}`;
    const dept = departments[i % departments.length];
    const glAccount = `GL-${4000 + (i % 20)}`;
    const description = isSuspicious ? 'Consulting Services' : ['Office Supplies', 'IT Equipment', 'Marketing Services', 'Travel Expenses', 'Professional Services'][i % 5];
    csv += `${invoiceId},${vendorId},${invoiceNum},${invoiceDate.toISOString().split('T')[0]},${postingDate.toISOString().split('T')[0]},${amount.toFixed(2)},USD,${createdBy},${status},${approvedBy},${approvalDate.toISOString().split('T')[0]},${costCenter},${dept},${glAccount},"${description}"\n`;
  }
  return csv;
}

export function generatePaymentsCSV(): string {
  const headers = ['payment_id', 'vendor_id', 'invoice_id', 'payment_date', 'amount', 'currency', 'payment_method', 'payment_reference', 'created_by_user_id', 'status', 'payee_bank_account_last4'];
  const methods = ['Wire', 'ACH', 'Check', 'Wire', 'ACH'];
  const users = ['U-1001', 'U-1002', 'U-1003', 'SYSTEM', 'SYSTEM'];
  let csv = headers.join(',') + '\n';
  for (let i = 1; i <= 100; i++) {
    const paymentId = `PAY-2024-${String(i).padStart(4, '0')}`;
    const vendorId = `V-${String((i % 20) + 1).padStart(4, '0')}`;
    const invoiceId = `INV-2024-${String(i).padStart(4, '0')}`;
    const isSuspicious = i <= 20;
    const baseDate = new Date(2024, Math.floor(i / 35), (i % 28) + 1);
    if (isSuspicious && i <= 10) baseDate.setDate(baseDate.getDate() + (6 - baseDate.getDay()));
    let amount: number;
    if (isSuspicious && i <= 10) amount = 9900 + Math.floor(Math.random() * 99);
    else amount = Math.floor(Math.random() * 50000) + 500;
    const method = isSuspicious && i <= 8 ? 'Wire' : methods[i % methods.length];
    const reference = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const createdBy = isSuspicious && i <= 12 ? 'U-1001' : users[i % users.length];
    const status = i > 95 ? 'Pending' : 'Completed';
    const bankLast4 = isSuspicious && i <= 5 ? '4455' : String(1000 + Math.floor(Math.random() * 9000));
    csv += `${paymentId},${vendorId},${invoiceId},${baseDate.toISOString().split('T')[0]},${amount.toFixed(2)},USD,${method},${reference},${createdBy},${status},${bankLast4}\n`;
  }
  return csv;
}

export function generateGLEntriesCSV(): string {
  const headers = ['gl_entry_id', 'posting_date', 'document_number', 'account_code', 'debit_amount', 'credit_amount', 'currency', 'source_module', 'created_by_user_id', 'reversal_flag', 'description', 'cost_center_id', 'department'];
  const modules = ['AP', 'AR', 'GL', 'AP', 'AP'];
  const accounts = ['4000', '4100', '4200', '5000', '5100', '6000', '6100', '7000'];
  const users = ['U-1001', 'U-1002', 'U-1003', 'SYSTEM', 'SYSTEM'];
  const departments = ['IT', 'Marketing', 'Operations', 'Finance', 'HR'];
  let csv = headers.join(',') + '\n';
  for (let i = 1; i <= 100; i++) {
    const entryId = `GL-2024-${String(i).padStart(5, '0')}`;
    const isSuspicious = i <= 15;
    const baseDate = new Date(2024, Math.floor(i / 35), (i % 28) + 1);
    if (isSuspicious && i <= 8) baseDate.setHours(3, Math.floor(Math.random() * 60), 0);
    const docNum = `DOC-${10000 + i}`;
    const account = accounts[i % accounts.length];
    const isDebit = i % 2 === 0;
    const amount = isSuspicious && i <= 10 ? (Math.floor(Math.random() * 5) + 1) * 10000 : Math.floor(Math.random() * 25000) + 100;
    const debit = isDebit ? amount.toFixed(2) : '0.00';
    const credit = isDebit ? '0.00' : amount.toFixed(2);
    const module = modules[i % modules.length];
    const createdBy = isSuspicious && i <= 10 ? 'U-1001' : users[i % users.length];
    const reversal = i > 95 ? 'Y' : 'N';
    const description = isSuspicious ? 'Manual Adjustment' : ['Invoice Payment', 'Expense Accrual', 'Revenue Recognition', 'Payroll Entry', 'Depreciation'][i % 5];
    const costCenter = `CC-${100 + (i % 10)}`;
    const dept = departments[i % departments.length];
    csv += `${entryId},${baseDate.toISOString()},${docNum},${account},${debit},${credit},USD,${module},${createdBy},${reversal},"${description}",${costCenter},${dept}\n`;
  }
  return csv;
}
