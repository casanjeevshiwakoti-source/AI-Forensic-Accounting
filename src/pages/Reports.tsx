import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  FileBarChart,
  ShieldCheck,
  Plus,
  MoreHorizontal,
  Database,
  ArrowRight,
  FileX } from
'lucide-react';
import { useDataStore } from '../utils/dataStore';
export function Reports() {
  const navigate = useNavigate();
  const { isDataLoaded, reports, cases, processedData, downloadReport, generateReportByType } = useDataStore();
  const templates = [
  {
    id: 'audit' as const,
    title: 'Audit Ready Report',
    description: 'Comprehensive case summary with evidence trail, timestamps, and investigator notes suitable for external audit.',
    icon: ShieldCheck,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    available: cases.length > 0,
  },
  {
    id: 'executive' as const,
    title: 'Executive Summary',
    description: 'High-level overview of risk exposure, detection rates, and key findings for leadership review.',
    icon: FileBarChart,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    available: cases.length > 0,
  },
  {
    id: 'evidence' as const,
    title: 'Evidence Bundle',
    description: 'Full export of all linked documents, transaction logs, and entity graphs from your uploaded CSV data.',
    icon: FileText,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    available: processedData.invoices.length > 0 || processedData.payments.length > 0 || processedData.vendors.length > 0,
  },
  ];

  // Empty state when no data is loaded
  if (!isDataLoaded) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Reports & Exports
          </h1>
          <p className="text-slate-400 mt-1">
            Generate audit-ready reports and export investigation data.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative p-5 bg-slate-800 rounded-full">
              <FileX className="h-10 w-10 text-slate-500" />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-slate-200 mb-2">
            No Reports Available
          </h2>
          <p className="text-slate-400 text-center max-w-md mb-6">
            Upload and process your financial data first. Reports will be
            automatically generated based on detected cases and analysis
            results.
          </p>

          <Button onClick={() => navigate('/ingestion')}>
            <Database className="h-4 w-4 mr-2" />
            Upload Data
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Card>
      </div>);

  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Reports & Exports</h1>
        <p className="text-slate-400 mt-1">
          Generate audit-ready reports and export investigation data.
        </p>
      </div>

      {/* Templates */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Report Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((t, i) => {
            const Icon = t.icon;
            return (
              <Card
                key={i}
                className={`transition-colors ${t.available ? 'hover:border-slate-600 cursor-pointer' : 'opacity-60'} group`}>

                <div
                  className={`w-12 h-12 rounded-lg ${t.bg} ${t.color} flex items-center justify-center mb-4 ${t.available ? 'group-hover:scale-110' : ''} transition-transform`}>

                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{t.title}</h3>
                <p className="text-sm text-slate-400 mb-6">{t.description}</p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!t.available}
                  onClick={() => t.available && generateReportByType(t.id)}
                >
                  {t.available ? 'Generate & Download' : 'No Data Available'}
                </Button>
              </Card>);

          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Exports */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-200">
              Recent Exports
            </h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <Card noPadding>
            {reports.length > 0 ?
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3">Report Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Generated By</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Size</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {reports.map((r) =>
                  <tr
                    key={r.id}
                    className="hover:bg-slate-800/50 transition-colors">

                        <td className="px-6 py-4 font-medium text-slate-200">
                          {r.name}
                        </td>
                        <td className="px-6 py-4 text-slate-400">{r.type}</td>
                        <td className="px-6 py-4 text-slate-400">
                          {r.generatedBy}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{r.date}</td>
                        <td className="px-6 py-4 text-right font-mono text-slate-400">
                          {r.size}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={r.status === 'Expired'}
                            onClick={() => downloadReport(r.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div> :

            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <FileText className="h-8 w-8 mb-3 opacity-50" />
                <p>No reports generated yet</p>
                <p className="text-sm text-slate-600 mt-1">
                  Process your data to generate reports
                </p>
              </div>
            }
          </Card>
        </section>

        {/* Scheduled Reports */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-200">Scheduled</h2>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Card>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-slate-800">
                <div className="p-2 bg-slate-800 rounded text-slate-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-200">
                    Weekly Risk Summary
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Every Monday at 9:00 AM
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Email</Badge>
                    <Badge variant="secondary">Slack</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded text-slate-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-200">
                    Monthly Audit Log
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    1st of every month
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">S3 Bucket</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>);

}