/**
 * Client-side ML model: train, predict, save/load (runs in browser, deployable on Vercel).
 */

import { RandomForestClassifier } from 'ml-random-forest';
import { buildTrainingData, buildScoreInput } from './aiFeatures';

const FEATURE_NAMES = [
  'amount_log',
  'threshold_evasion',
  'self_approval',
  'round_dollar',
  'vendor_risk',
  'weekend_payment',
  'off_hours_entry',
] as const;

/** Fallback when the RF library returns no feature importance: use mean-difference with label. */
function computeFallbackFeatureImportance(
  X: number[][],
  y: number[],
  featureNames: readonly string[]
): Record<string, number> {
  const n = X.length;
  const nFeat = featureNames.length;
  if (n === 0 || nFeat === 0) return {};

  const sum1 = new Array(nFeat).fill(0);
  const sum0 = new Array(nFeat).fill(0);
  let count1 = 0;
  let count0 = 0;

  for (let i = 0; i < n; i++) {
    const row = X[i];
    const isOne = y[i] === 1;
    if (isOne) count1++;
    else count0++;
    for (let j = 0; j < nFeat && j < row.length; j++) {
      const v = Number(row[j]) || 0;
      if (isOne) sum1[j] += v;
      else sum0[j] += v;
    }
  }

  const diff: number[] = [];
  for (let j = 0; j < nFeat; j++) {
    const mean1 = count1 > 0 ? sum1[j] / count1 : 0;
    const mean0 = count0 > 0 ? sum0[j] / count0 : 0;
    diff.push(Math.abs(mean1 - mean0));
  }

  const total = diff.reduce((a, b) => a + b, 0);
  const out: Record<string, number> = {};
  featureNames.forEach((name, i) => {
    out[name] = total > 0 ? diff[i]! / total : 1 / nFeat;
  });
  return out;
}

const STORAGE_KEY = 'forensic-ai-model-v1';

let cachedClassifier: RandomForestClassifier | null = null;

function loadFromStorage(): RandomForestClassifier | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const model = JSON.parse(raw);
    if (!model?.baseModel) return null;
    return RandomForestClassifier.load(model);
  } catch {
    return null;
  }
}

function saveToStorage(classifier: RandomForestClassifier): void {
  try {
    const json = classifier.toJSON();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  } catch (e) {
    console.warn('Failed to save model to localStorage', e);
  }
}

export function getModel(): RandomForestClassifier | null {
  if (cachedClassifier) return cachedClassifier;
  cachedClassifier = loadFromStorage();
  return cachedClassifier;
}

export function clearModel(): void {
  cachedClassifier = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export interface TrainResult {
  success: boolean;
  error?: string;
  records_used?: number;
  train_size?: number;
  test_size?: number;
  accuracy?: number;
  feature_importance?: Record<string, number>;
}

export function trainModel(data: {
  vendors: unknown[];
  invoices: unknown[];
  payments: unknown[];
  glEntries: unknown[];
}): TrainResult {
  try {
    const { X, y } = buildTrainingData(data as Parameters<typeof buildTrainingData>[0]);

    if (X.length < 10) {
      return { success: false, error: 'Insufficient data. Need at least 10 records to train.', records_used: X.length };
    }

    const distinct = new Set(y);
    if (distinct.size < 2) {
      return {
        success: false,
        error: 'Need both fraudulent and legitimate examples. Add more diverse data.',
        records_used: X.length,
      };
    }

    const split = Math.max(1, Math.floor(X.length * 0.8));
    const XTrain = X.slice(0, split);
    const yTrain = y.slice(0, split);
    const XTest = X.slice(split);
    const yTest = y.slice(split);

    const classifier = new RandomForestClassifier({
      seed: 42,
      maxFeatures: 0.8,
      replacement: true,
      nEstimators: 50,
      noOOB: true,
    });
    classifier.train(XTrain, yTrain);

    const pred = classifier.predict(XTest);
    let correct = 0;
    for (let i = 0; i < pred.length; i++) {
      if (pred[i] === yTest[i]) correct++;
    }
    const accuracy = pred.length ? correct / pred.length : 0;

    cachedClassifier = classifier;
    saveToStorage(classifier);

    let featureImportance: Record<string, number> = {};
    try {
      const fn = (classifier as unknown as { featureImportance?: () => number[] }).featureImportance;
      const arr = typeof fn === 'function' ? fn.call(classifier) : null;
      if (Array.isArray(arr) && arr.length >= FEATURE_NAMES.length) {
        FEATURE_NAMES.forEach((name, i) => {
          const v = arr[i];
          featureImportance[name] = typeof v === 'number' && Number.isFinite(v) ? v : 0;
        });
      }
    } catch {
      // ignore
    }

    // If library returned all zeros or failed, use fallback: importance from mean-diff with label
    const sum = Object.values(featureImportance).reduce((a, b) => a + b, 0);
    if (sum <= 0 || !Number.isFinite(sum)) {
      featureImportance = computeFallbackFeatureImportance(XTrain, yTrain, FEATURE_NAMES);
    }

    return {
      success: true,
      records_used: X.length,
      train_size: XTrain.length,
      test_size: XTest.length,
      accuracy,
      feature_importance: featureImportance,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Training failed',
    };
  }
}

export interface AIScores {
  invoices?: number[];
  payments?: number[];
  glEntries?: number[];
}

export function scoreRecords(data: {
  vendors: unknown[];
  invoices: unknown[];
  payments: unknown[];
  glEntries: unknown[];
}): AIScores | null {
  const classifier = getModel();
  if (!classifier) return null;

  try {
    const { invoices, payments, glEntries } = buildScoreInput(data as Parameters<typeof buildScoreInput>[0]);

    const scores: AIScores = {};

    const sanitize = (arr: number[]): number[] =>
      arr.map((v) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.5));

    if (invoices.length > 0) {
      try {
        const raw = classifier.predictProbability(invoices, 1) as number[];
        scores.invoices = sanitize(Array.isArray(raw) ? raw : invoices.map(() => 0.5));
      } catch {
        scores.invoices = invoices.map(() => 0.5);
      }
    }
    if (payments.length > 0) {
      try {
        const raw = classifier.predictProbability(payments, 1) as number[];
        scores.payments = sanitize(Array.isArray(raw) ? raw : payments.map(() => 0.5));
      } catch {
        scores.payments = payments.map(() => 0.5);
      }
    }
    if (glEntries.length > 0) {
      try {
        const raw = classifier.predictProbability(glEntries, 1) as number[];
        scores.glEntries = sanitize(Array.isArray(raw) ? raw : glEntries.map(() => 0.5));
      } catch {
        scores.glEntries = glEntries.map(() => 0.5);
      }
    }

    return scores.invoices || scores.payments || scores.glEntries ? scores : null;
  } catch {
    return null;
  }
}

export function modelExists(): boolean {
  return getModel() !== null;
}
