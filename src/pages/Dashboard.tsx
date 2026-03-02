import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskMetrics } from '../components/RiskMetrics';
import { CaseQueue } from '../components/CaseQueue';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Plus, Database, ArrowRight, BarChart3, Shield, FileSearch, Zap } from 'lucide-react';
import { useDataStore } from '../utils/dataStore';

export function Dashboard() {
  const navigate = useNavigate();
  const { loadSampleData } = useDataStore();
  const { isDataLoaded, cases, metrics } = useDataStore();
  // Empty state when no data is loaded
  if (!isDataLoaded) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Investigation Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Overview of active risks and case queue.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-full">
              <Database className="h-12 w-12 text-slate-500" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-200 mb-2">
            No Data Loaded
          </h2>
          <p className="text-slate-400 text-center max-w-md mb-8">
            Upload your financial data to start detecting fraud patterns,
            analyzing risks, and generating investigation cases.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => navigate('/ingestion')} size="lg">
              <Database className="h-4 w-4 mr-2" />
              Go to Data Ingestion
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button onClick={loadSampleData} variant="outline" size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Quick Start with Sample Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-3xl">
            <Card className="text-center p-6 bg-slate-900/50 border-slate-800">
              <div className="p-3 bg-blue-500/10 rounded-lg w-fit mx-auto mb-4">
                <FileSearch className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-medium text-slate-200 mb-2">Upload Data</h3>
              <p className="text-sm text-slate-500">
                Import vendor, invoice, payment, and GL data via CSV
              </p>
            </Card>
            <Card className="text-center p-6 bg-slate-900/50 border-slate-800">
              <div className="p-3 bg-purple-500/10 rounded-lg w-fit mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-medium text-slate-200 mb-2">
                Analyze Patterns
              </h3>
              <p className="text-sm text-slate-500">
                AI detects threshold evasion, shell vendors, and anomalies
              </p>
            </Card>
            <Card className="text-center p-6 bg-slate-900/50 border-slate-800">
              <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="font-medium text-slate-200 mb-2">
                Investigate Cases
              </h3>
              <p className="text-sm text-slate-500">
                Review generated cases with evidence and timelines
              </p>
            </Card>
          </div>
        </div>
      </div>);

  }
  // Data loaded state
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Investigation Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Overview of active risks and case queue.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/reports')}>
            Export Report
          </Button>
          <Button onClick={() => navigate('/cases')}>
            <Plus className="h-4 w-4 mr-2" />
            View All Cases
          </Button>
        </div>
      </div>

      <RiskMetrics metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CaseQueue
            cases={cases.slice(0, 5)}
            onCaseClick={(id) => navigate(`/cases/${id}`)} />

        </div>

        <div className="space-y-6">
          {/* Recent Activity Feed */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {cases.slice(0, 4).map((c, i) =>
              <div
                key={c.id}
                className="flex gap-3 pb-4 border-b border-slate-800 last:border-0 last:pb-0">

                  <div
                  className={`h-2 w-2 mt-2 rounded-full flex-shrink-0 ${c.riskLevel === 'critical' ? 'bg-red-500' : c.riskLevel === 'high' ? 'bg-amber-500' : 'bg-blue-500'}`} />

                  <div>
                    <p className="text-sm text-slate-300">
                      <span className="font-medium text-slate-100">System</span>{' '}
                      generated case{' '}
                      <span className="font-mono text-blue-400">{c.id}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Just now</p>
                  </div>
                </div>
              )}
              {cases.length === 0 &&
              <p className="text-sm text-slate-500 text-center py-4">
                  No recent activity
                </p>
              }
            </div>
          </Card>

          {/* Cases by Type */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Cases by Risk Level
            </h3>
            <div className="space-y-3">
              {[
              {
                label: 'Critical',
                count: cases.filter((c) => c.riskLevel === 'critical').length,
                color: 'bg-red-500'
              },
              {
                label: 'High',
                count: cases.filter((c) => c.riskLevel === 'high').length,
                color: 'bg-amber-500'
              },
              {
                label: 'Medium',
                count: cases.filter((c) => c.riskLevel === 'medium').length,
                color: 'bg-blue-500'
              },
              {
                label: 'Low',
                count: cases.filter((c) => c.riskLevel === 'low').length,
                color: 'bg-slate-500'
              }].
              map((item) => {
                const total = cases.length || 1;
                const percent = Math.round(item.count / total * 100);
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-slate-400">{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{
                          width: `${percent}%`
                        }} />

                    </div>
                  </div>);

              })}
            </div>
          </Card>
        </div>
      </div>
    </div>);

}