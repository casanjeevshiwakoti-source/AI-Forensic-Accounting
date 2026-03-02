import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '../utils/dataStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { TimelineViewer } from '../components/TimelineViewer';
import { EntityGraph } from '../components/EntityGraph';
import { EvidenceTable } from '../components/EvidenceTable';
import {
  ArrowLeft,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { cn } from '../utils/cn';
import type { CaseEntity } from '../utils/types';
import { mockTimeline, mockTransactions } from '../utils/mockData';
import { CaseNotes } from '../components/CaseNotes';

export function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { cases, caseNotes, addCaseNote } = useDataStore();
  const [activeTab, setActiveTab] = useState<
    'timeline' | 'graph' | 'evidence' | 'notes'
  >('timeline');

  const caseData = caseId ? cases.find((c) => c.id === caseId) : undefined;
  const evidence = caseData?.evidence;
  const timeline = evidence?.timeline?.length ? evidence.timeline : mockTimeline;
  const transactions =
    evidence?.transactions?.length ? evidence.transactions : mockTransactions;
  const entities = evidence?.entities ?? [];

  const tabs = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'graph', label: 'Entity Graph' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'notes', label: 'Notes' },
  ];

  const handleExportReport = () => {
    if (!caseData) return;
    const report = {
      case: caseData,
      timeline,
      transactions,
      entities,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-${caseData.id}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!caseData) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/cases')}
          className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Card className="p-12 text-center">
          <p className="text-slate-400">Case not found. Upload and process data to generate cases.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate('/cases')}
          className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Cases</span>
          <span>/</span>
          <span className="text-slate-300">{caseData.id}</span>
        </div>
      </div>

      {/* Case Header Card */}
      <Card
        className={cn(
          'border-l-4',
          caseData.riskLevel === 'critical'
            ? 'border-l-red-500'
            : caseData.riskLevel === 'high'
            ? 'border-l-amber-500'
            : 'border-l-blue-500'
        )}
      >
        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-100">
                {caseData.title}
              </h1>
              <Badge variant="destructive" className="text-sm px-3 py-1">
                RISK SCORE: {caseData.riskScore}/100
              </Badge>
            </div>
            <p className="text-slate-400 max-w-3xl leading-relaxed">
              {caseData.description}
            </p>

            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Type
                  </p>
                  <p className="font-medium text-slate-200">{caseData.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Status
                  </p>
                  <p className="font-medium text-slate-200 capitalize">
                    {caseData.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Assignee
                  </p>
                  <p className="font-medium text-slate-200">
                    {caseData.assignee || 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 min-w-[200px]">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Total Exposure
              </p>
              <p className="text-3xl font-mono font-bold text-slate-100">
                ${caseData.exposureAmount.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TimelineViewer events={timeline} />
            </div>
            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold text-slate-200 mb-4">
                  Key Entities
                </h3>
                <div className="space-y-4">
                  {entities.length > 0 ? (
                    entities.slice(0, 8).map((e: CaseEntity) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold',
                              e.type === 'vendor'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            )}
                          >
                            {e.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">
                              {e.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {e.subLabel ?? e.type}
                            </p>
                          </div>
                        </div>
                        {e.riskLevel && (
                          <Badge
                            variant={
                              e.riskLevel === 'critical' ? 'destructive' : 'warning'
                            }
                          >
                            {e.riskLevel}
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No entities identified for this case
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'graph' && <EntityGraph entities={entities} />}

        {activeTab === 'evidence' && <EvidenceTable transactions={transactions} />}

        {activeTab === 'notes' && caseId && (
          <Card className="p-6">
            <CaseNotes
              caseId={caseId}
              notes={caseNotes[caseId] ?? []}
              onAddNote={(content) => addCaseNote(caseId, content)}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
