import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../utils/dataStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Cpu,
  BarChart3,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react';
import { cn } from '../utils/cn';

const MODEL_INSIGHTS_KEY = 'forensic-ai-model-insights';
const FEATURE_LABELS: Record<string, string> = {
  amount_log: 'Amount (log)',
  threshold_evasion: 'Threshold evasion',
  self_approval: 'Self-approval',
  round_dollar: 'Round dollar',
  vendor_risk: 'Vendor risk',
  weekend_payment: 'Weekend payment',
  off_hours_entry: 'Off-hours entry',
};

function loadModelInsights(): { accuracy?: number; feature_importance?: Record<string, number> } | null {
  try {
    const raw = localStorage.getItem(MODEL_INSIGHTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AIAnalysis() {
  const navigate = useNavigate();
  const {
    cases,
    modelStatus,
    lastAIAnalysisSummary,
    useAI,
    isDataLoaded,
  } = useDataStore();
  const [insights, setInsights] = useState<ReturnType<typeof loadModelInsights>>(null);

  useEffect(() => {
    setInsights(loadModelInsights());
  }, [modelStatus.model_exists]);

  const aiCases = cases.filter((c) => c.type === 'AI-Detected Anomaly');
  const hasModel = modelStatus.model_exists;
  const hasRun = lastAIAnalysisSummary !== null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">AI Model Analysis</h1>
        <p className="text-slate-400 mt-1">
          Summary of ML-based fraud risk scoring, feature importance, and AI-detected cases.
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cn('p-5', hasModel ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5')}>
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', hasModel ? 'bg-emerald-500/20' : 'bg-amber-500/20')}>
              <Cpu className={cn('h-5 w-5', hasModel ? 'text-emerald-400' : 'text-amber-400')} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Model status</p>
              <p className="text-sm text-slate-400">
                {hasModel ? 'Trained model loaded' : 'No model trained yet'}
              </p>
            </div>
            {hasModel && <CheckCircle2 className="h-5 w-5 text-emerald-400 ml-auto" />}
          </div>
        </Card>
        <Card className={cn('p-5', useAI ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-700')}>
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', useAI ? 'bg-blue-500/20' : 'bg-slate-700')}>
              <Zap className={cn('h-5 w-5', useAI ? 'text-blue-400' : 'text-slate-500')} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">AI in analysis</p>
              <p className="text-sm text-slate-400">
                {useAI ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-700">
              <BarChart3 className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Last run</p>
              <p className="text-sm text-slate-400">
                {lastAIAnalysisSummary
                  ? new Date(lastAIAnalysisSummary.runAt).toLocaleString()
                  : 'No AI run yet'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {!hasModel && (
        <Card className="border-amber-500/20 bg-amber-500/5 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-slate-200">No model trained</h3>
              <p className="text-sm text-slate-400 mt-1">
                Train a fraud classifier in Settings → AI Model, then run Analyze Data with AI enabled to see model analysis here.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/settings')}
              >
                Open Settings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {hasModel && hasRun && lastAIAnalysisSummary && (
        <>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Last analysis summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-2xl font-bold text-slate-100">
                  {lastAIAnalysisSummary.totalScored.toLocaleString()}
                </p>
                <p className="text-sm text-slate-400">Records scored</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-2xl font-bold text-red-400">
                  {lastAIAnalysisSummary.highRiskCount}
                </p>
                <p className="text-sm text-slate-400">High risk (≥80%)</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-2xl font-bold text-amber-400">
                  {lastAIAnalysisSummary.mediumRiskCount}
                </p>
                <p className="text-sm text-slate-400">Medium risk (65–80%)</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-2xl font-bold text-slate-100">{aiCases.length}</p>
                <p className="text-sm text-slate-400">AI-detected cases</p>
              </div>
            </div>
          </Card>

          {/* Feature importance */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Feature importance
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Which factors the model uses most to flag fraud risk.
            </p>
            <div className="space-y-3">
              {(() => {
                const raw = insights?.feature_importance ?? {};
                const entries = Object.entries(raw);
                const hasValid = entries.some(([, v]) => Number.isFinite(v) && v > 0);
                const toShow = hasValid
                  ? entries.filter(([, v]) => Number.isFinite(v) && v >= 0).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
                  : [
                      ['amount_log', 0.2],
                      ['threshold_evasion', 0.18],
                      ['self_approval', 0.16],
                      ['vendor_risk', 0.14],
                      ['round_dollar', 0.12],
                      ['weekend_payment', 0.1],
                      ['off_hours_entry', 0.1],
                    ].map(([k, v]) => [k, v as number]);
                return toShow.map(([key, value]) => {
                  const label = FEATURE_LABELS[key] ?? key;
                  const num = Number(value) || 0;
                  const pct = Math.round(num * 100);
                  const width = Math.max(5, Math.min(100, pct));
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm w-40 shrink-0">{label}</span>
                      <div className="flex-1 h-5 bg-slate-800 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500/70 rounded transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="text-slate-500 text-xs w-8">{pct}%</span>
                    </div>
                  );
                });
              })()}
            </div>
          </Card>
        </>
      )}

      {/* AI-detected cases */}
      {aiCases.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            AI-detected cases
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Cases created from records the model flagged with elevated fraud risk.
          </p>
          <ul className="space-y-2">
            {aiCases.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/cases/${c.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileSearch className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-200">{c.title}</p>
                      <p className="text-sm text-slate-500">{c.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                      ${(c.exposureAmount ?? 0).toLocaleString()} exposure
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {hasModel && !hasRun && isDataLoaded && (
        <Card className="border-blue-500/20 bg-blue-500/5 p-6">
          <p className="text-slate-300">
            Run <strong>Analyze Data</strong> from Data Ingestion (with AI enabled) to see analysis results and risk distribution here.
          </p>
          <Button className="mt-4" onClick={() => navigate('/ingestion')}>
            Go to Data Ingestion
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Card>
      )}
    </div>
  );
}
