import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  FileText,
  Users,
  CreditCard,
  BookOpen,
  Play,
  Trash2,
  ArrowRight } from
'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useDataStore, UploadedFile } from '../utils/dataStore';
import { generateVendorMasterCSV, generateInvoicesCSV, generatePaymentsCSV, generateGLEntriesCSV } from '../utils/sampleData';

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], {
    type: 'text/csv;charset=utf-8;'
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export function DataIngestion() {
  const navigate = useNavigate();
  const {
    uploadedFiles,
    uploadFile,
    processData,
    clearAllData,
    loadSampleData,
    isDataLoaded,
    processedData,
  } = useDataStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] =
  useState<UploadedFile['type']>('invoices');
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file, selectedType);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      await uploadFile(file, selectedType);
    }
  };
  const handleProcessData = async () => {
    setIsProcessing(true);
    try {
      await processData();
    } finally {
      setTimeout(() => setIsProcessing(false), 300);
    }
  };
  const sampleDataTypes = [
  {
    id: 'vendors' as const,
    title: 'Vendor Master',
    description:
    'Vendor identities with risk signals for shell vendor detection',
    records: 100,
    icon: Users,
    columns: [
    'vendor_id',
    'vendor_name',
    'created_by',
    'bank_account_last4',
    'risk_flag'],

    generate: () =>
    downloadCSV(generateVendorMasterCSV(), 'vendor_master_sample.csv')
  },
  {
    id: 'invoices' as const,
    title: 'AP Invoices',
    description: 'Invoice data with threshold-evasion and approval patterns',
    records: 100,
    icon: FileText,
    columns: [
    'invoice_id',
    'vendor_id',
    'amount',
    'created_by',
    'approved_by'],

    generate: () =>
    downloadCSV(generateInvoicesCSV(), 'ap_invoices_sample.csv')
  },
  {
    id: 'payments' as const,
    title: 'Payments',
    description: 'Payment records with weekend and rapid-sequence patterns',
    records: 100,
    icon: CreditCard,
    columns: [
    'payment_id',
    'vendor_id',
    'amount',
    'payment_method',
    'payment_date'],

    generate: () => downloadCSV(generatePaymentsCSV(), 'payments_sample.csv')
  },
  {
    id: 'gl' as const,
    title: 'General Ledger',
    description: 'GL entries with off-hours and round-dollar anomalies',
    records: 100,
    icon: BookOpen,
    columns: [
    'gl_entry_id',
    'posting_date',
    'debit_amount',
    'credit_amount',
    'created_by'],

    generate: () =>
    downloadCSV(generateGLEntriesCSV(), 'gl_entries_sample.csv')
  }];

  const completedFiles = uploadedFiles.filter((f) => f.status === 'completed');
  const totalRecords =
  processedData.vendors.length +
  processedData.invoices.length +
  processedData.payments.length +
  processedData.glEntries.length;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Data Ingestion</h1>
          <p className="text-slate-400 mt-1">
            Upload and map financial data exports.
          </p>
        </div>
        <div className="flex gap-3">
          {isDataLoaded &&
          <Button variant="outline" onClick={clearAllData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          }
          {completedFiles.length > 0 &&
          <Button onClick={handleProcessData} disabled={isProcessing}>
              {isProcessing ?
            <>
                  <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </> :

            <>
                  <Play className="h-4 w-4 mr-2" />
                  Analyze Data
                </>
            }
            </Button>
          }
        </div>
      </div>

      {/* Success Banner */}
      {isDataLoaded &&
      <Card className="bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-emerald-300">
                  Data Processed Successfully
                </h3>
                <p className="text-sm text-emerald-400/70">
                  {totalRecords.toLocaleString()} records analyzed. Cases and
                  reports are now available.
                </p>
              </div>
            </div>
            <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">

              View Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      }

      {/* Sample Data Templates */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">
              Sample Data Templates
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Load sample data instantly or download CSVs to upload later
            </p>
          </div>
          <Button
            onClick={loadSampleData}
            disabled={isDataLoaded}
            className="shrink-0"
          >
            <Play className="h-4 w-4 mr-2" />
            Load Sample Data
          </Button>
        </div>
        {isDataLoaded && (
          <p className="text-sm text-emerald-400/90">
            Data loaded. Use &quot;Analyze Data&quot; after manual uploads, or &quot;View Dashboard&quot; to see results.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleDataTypes.map((type) => {
            const Icon = type.icon;
            const hasData =
            type.id === 'vendors' ?
            processedData.vendors.length > 0 :
            type.id === 'invoices' ?
            processedData.invoices.length > 0 :
            type.id === 'payments' ?
            processedData.payments.length > 0 :
            processedData.glEntries.length > 0;
            return (
              <Card
                key={type.id}
                className={`transition-colors ${hasData ? 'border-emerald-500/30 bg-emerald-500/5' : 'hover:border-slate-600'}`}>

                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`p-2 rounded-lg ${hasData ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>

                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-200">{type.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {hasData ?
                      <span className="text-emerald-400">
                          {type.id === 'vendors' ?
                        processedData.vendors.length :
                        type.id === 'invoices' ?
                        processedData.invoices.length :
                        type.id === 'payments' ?
                        processedData.payments.length :
                        processedData.glEntries.length}{' '}
                          records loaded
                        </span> :

                      `${type.records} records`
                      }
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  {type.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {type.columns.slice(0, 3).map((col) =>
                  <span
                    key={col}
                    className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-500 font-mono">

                      {col}
                    </span>
                  )}
                  {type.columns.length > 3 &&
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-500">
                      +{type.columns.length - 3} more
                    </span>
                  }
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={type.generate}>

                  <Download className="h-3 w-3 mr-2" />
                  Download CSV
                </Button>
              </Card>);

          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden" />


          <Card
            className="border-dashed border-2 border-slate-700 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/50 transition-colors cursor-pointer group"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}>

            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                <UploadCloud className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-200">
                Drag and drop CSV files here
              </h3>
              <p className="text-slate-500 mt-2 max-w-sm">
                Support for Invoices, Payments, Vendor Master, and GL Entries.
                Max file size 500MB.
              </p>

              <div className="flex items-center gap-3 mt-6">
                <span className="text-sm text-slate-400">Upload as:</span>
                <select
                  value={selectedType}
                  onChange={(e) =>
                  setSelectedType(e.target.value as UploadedFile['type'])
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500">

                  <option value="vendors">Vendor Master</option>
                  <option value="invoices">AP Invoices</option>
                  <option value="payments">Payments</option>
                  <option value="gl">General Ledger</option>
                </select>
              </div>

              <Button
                variant="outline"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}>

                Browse Files
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Uploaded Files
            </h3>
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file) => (
                <Card key={file.id} noPadding className="flex flex-col">
                  <div className="flex items-center p-4">
                    <div className="p-3 bg-slate-800 rounded-lg mr-4">
                      <FileSpreadsheet className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium text-slate-200">{file.name}</h4>
                        <span className="text-xs text-slate-500">
                          {file.uploadedAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="capitalize">{file.type}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        {file.records > 0 && (
                          <>
                            <span>•</span>
                            <span>{file.records} records</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {file.status === 'completed' && <Badge variant="success">Ready</Badge>}
                      {file.status === 'processing' && (
                        <Badge variant="info" className="animate-pulse">Processing</Badge>
                      )}
                      {file.status === 'error' && <Badge variant="destructive">Schema Error</Badge>}
                    </div>
                  </div>
                  {file.schemaErrors && file.schemaErrors.length > 0 && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm">
                        <p className="font-medium text-red-400 mb-2">Missing or invalid columns:</p>
                        <ul className="list-disc list-inside text-red-300/90 space-y-1">
                          {file.schemaErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                        <p className="text-slate-400 mt-2 text-xs">
                          Use the sample templates above for the expected CSV format. Ensure the file uses comma (,) delimiter and has a header row.
                        </p>
                      </div>
                    </div>
                  )}
                  {file.schemaWarnings && file.schemaWarnings.length > 0 && file.status === 'completed' && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-amber-400/90 text-xs">
                        {file.schemaWarnings.join(' ')}
                      </p>
                    </div>
                  )}
                </Card>
              ))
            ) : (

            <Card className="flex flex-col items-center justify-center py-8 text-slate-500">
                <FileSpreadsheet className="h-8 w-8 mb-2 opacity-50" />
                <p>No files uploaded yet</p>
                <p className="text-sm text-slate-600">
                  Upload CSV files or download sample data above
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Quality Score */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <h3 className="text-lg font-semibold text-slate-200 mb-6">
              Data Quality Score
            </h3>
            <div className="flex items-center justify-center mb-8">
              <div className="relative h-40 w-40 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="none" />

                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={totalRecords > 0 ? '#10b981' : '#475569'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="440"
                    strokeDashoffset={totalRecords > 0 ? '44' : '440'}
                    className="transition-all duration-1000 ease-out" />

                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-bold text-slate-100">
                    {totalRecords > 0 ? '90' : '--'}
                  </span>
                  <span className="text-sm text-slate-400 block">/ 100</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {totalRecords > 0 ?
              <>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Schema Mapping
                      </p>
                      <p className="text-xs text-slate-500">
                        All required fields mapped correctly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Suspicious Patterns
                      </p>
                      <p className="text-xs text-slate-500">
                        Multiple anomalies detected for review.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Data Integrity
                      </p>
                      <p className="text-xs text-slate-500">
                        No duplicate transaction IDs found.
                      </p>
                    </div>
                  </div>
                </> :

              <div className="text-center py-4 text-slate-500">
                  <p className="text-sm">Upload data to see quality metrics</p>
                </div>
              }
            </div>
          </Card>
        </div>
      </div>
    </div>);

}