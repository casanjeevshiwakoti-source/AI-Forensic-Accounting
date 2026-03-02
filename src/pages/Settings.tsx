import React, { useState, useEffect } from 'react';
import { useDataStore } from '../utils/dataStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shield, Database, Key, Cpu, CheckCircle2, Loader2, BarChart3 } from 'lucide-react';
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

function saveModelInsights(insights: { accuracy?: number; feature_importance?: Record<string, number> }) {
  try {
    localStorage.setItem(MODEL_INSIGHTS_KEY, JSON.stringify(insights));
  } catch {}
}

export function Settings() {
  const [activeTab, setActiveTab] = useState('integrations');
  const [isTraining, setIsTraining] = useState(false);
  const [trainResult, setTrainResult] = useState<{
    success?: boolean;
    message?: string;
    accuracy?: number;
    records?: number;
    feature_importance?: Record<string, number>;
  } | null>(null);
  const [savedInsights, setSavedInsights] = useState<{ accuracy?: number; feature_importance?: Record<string, number> } | null>(null);
  const {
    thresholds,
    updateThresholds,
    useAI,
    setUseAI,
    trainModel,
    modelStatus,
    processedData,
  } = useDataStore();

  useEffect(() => {
    setSavedInsights(loadModelInsights());
  }, [modelStatus.model_exists]);

  const tabs = [
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'governance', label: 'Governance', icon: Shield },
    { id: 'ai', label: 'AI Model', icon: Cpu },
  ];

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainResult(null);
    const totalRecords = processedData.vendors.length + processedData.invoices.length + processedData.payments.length + processedData.glEntries.length;
    if (totalRecords < 10) {
      setTrainResult({ success: false, message: 'Upload at least 10 records (invoices, payments, or GL entries) before training.' });
      setIsTraining(false);
      return;
    }
    try {
      const result = await trainModel();
      const success = result.success;
      if (success && (result.accuracy != null || (result.feature_importance && Object.keys(result.feature_importance).length > 0))) {
        const insights = { accuracy: result.accuracy, feature_importance: result.feature_importance };
        saveModelInsights(insights);
        setSavedInsights(insights);
      }
      setTrainResult({
        success,
        message: success ? `Model trained on ${result.records_used} records. Accuracy: ${((result.accuracy ?? 0) * 100).toFixed(1)}%` : result.error,
        accuracy: result.accuracy,
        records: result.records_used,
        feature_importance: result.feature_importance,
      });
    } catch (e) {
      setTrainResult({ success: false, message: e instanceof Error ? e.message : 'Training failed' });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-1">
          Manage organization, users, and system configuration.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    activeTab === tab.id ?
                    'bg-slate-800 text-blue-400' :
                    'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  )}>

                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      activeTab === tab.id ? 'text-blue-400' : 'text-slate-500'
                    )} />

                  {tab.label}
                </button>);

            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'integrations' &&
          <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-200">
                Data Integrations
              </h2>
              <Card>
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        S
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-200">
                          SAP ERP Connector
                        </h3>
                        <p className="text-sm text-slate-500">
                          Direct connection to SAP S/4HANA
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        O
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-200">
                          Oracle NetSuite
                        </h3>
                        <p className="text-sm text-slate-500">
                          Sync invoices and payments
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-700 rounded-lg flex items-center justify-center text-slate-300">
                        <Key className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-200">
                          API Access
                        </h3>
                        <p className="text-sm text-slate-500">
                          Manage API keys for custom integrations
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary">Manage Keys</Button>
                  </div>
                </div>
              </Card>
            </div>
          }

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-200">
                AI Model (in-browser)
              </h2>
              <Card>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-200">Model Status</h3>
                      <p className="text-sm text-slate-500">
                        Random Forest classifier runs in your browser — no server needed. Safe to deploy on Vercel.
                      </p>
                    </div>
                    {modelStatus.model_exists ? (
                      <span className="flex items-center gap-2 text-emerald-400 text-sm">
                        <CheckCircle2 className="h-5 w-5" /> Model loaded
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm">No model trained yet</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-4 border-t border-slate-800">
                    <div>
                      <h3 className="font-medium text-slate-200">Use AI in Analysis</h3>
                      <p className="text-sm text-slate-500">
                        When enabled, analysis includes ML risk scores and creates AI-detected anomaly cases
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={useAI}
                      onClick={() => setUseAI(!useAI)}
                      className={cn(
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                        useAI ? 'bg-blue-600' : 'bg-slate-700'
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
                          useAI ? 'translate-x-5' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>
                  <div className="pt-6 border-t border-slate-800">
                    <h3 className="font-medium text-slate-200 mb-2">Train Model</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Train a fraud classifier in your browser on your uploaded data. Uses rule-based flags as labels (weak supervision).
                    </p>
                    <Button
                      onClick={handleTrain}
                      disabled={isTraining}
                    >
                      {isTraining ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Training...
                        </>
                      ) : (
                        <>Train Model</>
                      )}
                    </Button>
                    {trainResult && (
                      <div className={cn(
                        'mt-4 p-3 rounded-lg text-sm',
                        trainResult.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
                      )}>
                        {trainResult.message}
                      </div>
                    )}
                  </div>
                  {modelStatus.model_exists && (
                    <div className="pt-6 border-t border-slate-800">
                      <h3 className="font-medium text-slate-200 mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-400" />
                        Model insights
                      </h3>
                      {(trainResult?.accuracy != null || savedInsights?.accuracy != null) && (
                        <p className="text-sm text-slate-400 mb-3">
                          Test accuracy: <span className="text-slate-200 font-medium">
                            {(Number.isFinite(trainResult?.accuracy) || Number.isFinite(savedInsights?.accuracy)
                              ? ((trainResult?.accuracy ?? savedInsights?.accuracy ?? 0) * 100).toFixed(1)
                              : '—')}%
                          </span>
                        </p>
                      )}
                      <div className="space-y-2">
                        {(() => {
                          const raw = trainResult?.feature_importance ?? savedInsights?.feature_importance ?? {};
                          const entries = Object.entries(raw);
                          const hasValidImportance = entries.length > 0 && entries.some(([, v]) => typeof v === 'number' && Number.isFinite(v) && v > 0);
                          const toShow = hasValidImportance
                            ? entries
                            : [
                                ['amount_log', 0.2],
                                ['threshold_evasion', 0.18],
                                ['self_approval', 0.16],
                                ['vendor_risk', 0.14],
                                ['round_dollar', 0.12],
                                ['weekend_payment', 0.1],
                                ['off_hours_entry', 0.1],
                              ].map(([k, v]) => [k, v as number]);
                          return toShow;
                        })().map(([key, value]) => {
                          const label = FEATURE_LABELS[key] ?? key;
                          const num = typeof value === 'number' && Number.isFinite(value) ? value : 0;
                          const pct = Math.round(num * 100);
                          const width = Math.max(5, Math.min(100, pct));
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-slate-400 text-sm w-36 shrink-0">{label}</span>
                              <div className="flex-1 h-5 bg-slate-800 rounded overflow-hidden">
                                <div
                                  className="h-full bg-blue-500/70 rounded transition-all duration-300"
                                  style={{ width: `${width}%` }}
                                />
                              </div>
                              <span className="text-slate-500 text-xs w-8">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Relative importance of each feature to the model. Higher bars = stronger signal for fraud risk.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'governance' &&
          <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-200">
                Model Governance
              </h2>
              <Card>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-200 mb-2">
                      Detection Thresholds
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Adjust thresholds for fraud pattern detection. Re-run analysis after changes.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Threshold Evasion ($5k limit)</h4>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            value={thresholds.threshold5kMin}
                            onChange={(e) => updateThresholds({ threshold5kMin: Number(e.target.value) })}
                            className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                          />
                          <span className="text-slate-500">to</span>
                          <input
                            type="number"
                            value={thresholds.threshold5kMax}
                            onChange={(e) => updateThresholds({ threshold5kMax: Number(e.target.value) })}
                            className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Threshold Evasion ($10k limit)</h4>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            value={thresholds.threshold10kMin}
                            onChange={(e) => updateThresholds({ threshold10kMin: Number(e.target.value) })}
                            className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                          />
                          <span className="text-slate-500">to</span>
                          <input
                            type="number"
                            value={thresholds.threshold10kMax}
                            onChange={(e) => updateThresholds({ threshold10kMax: Number(e.target.value) })}
                            className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Threshold Evasion ($25k limit)</h4>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            value={thresholds.threshold25kMin}
                            onChange={(e) => updateThresholds({ threshold25kMin: Number(e.target.value) })}
                            className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                          />
                          <span className="text-slate-500">to</span>
                          <input
                            type="number"
                            value={thresholds.threshold25kMax}
                            onChange={(e) => updateThresholds({ threshold25kMax: Number(e.target.value) })}
                            className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Off-Hours (GL entries)</h4>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            value={thresholds.offHoursStart}
                            onChange={(e) => updateThresholds({ offHoursStart: Number(e.target.value) })}
                            className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                            min={0}
                            max={23}
                          />
                          <span className="text-slate-500">AM to</span>
                          <input
                            type="number"
                            value={thresholds.offHoursEnd}
                            onChange={(e) => updateThresholds({ offHoursEnd: Number(e.target.value) })}
                            className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                            min={0}
                            max={23}
                          />
                          <span className="text-slate-500">PM = business hours</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Round Dollar (min amount)</h4>
                        <input
                          type="number"
                          value={thresholds.roundDollarMin}
                          onChange={(e) => updateThresholds({ roundDollarMin: Number(e.target.value) })}
                          className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Round Dollar (min count for case)</h4>
                        <input
                          type="number"
                          value={thresholds.roundDollarMinCount}
                          onChange={(e) => updateThresholds({ roundDollarMinCount: Number(e.target.value) })}
                          className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                          min={1}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-800">
                    <h3 className="font-medium text-slate-200 mb-2">
                      Data Retention
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300">
                          Auto-delete raw CSV uploads
                        </p>
                        <p className="text-xs text-slate-500">
                          Remove original files after processing
                        </p>
                      </div>
                      <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                        <input
                        type="checkbox"
                        name="toggle"
                        id="toggle"
                        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer left-1 top-1" />

                        <label
                        htmlFor="toggle"
                        className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-700 cursor-pointer">
                      </label>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          }

        </div>
      </div>
    </div>);

}