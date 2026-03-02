/**
 * AI service - client-side only (React/browser). No backend required; deploys on Vercel.
 * Uses ml-random-forest for training and inference in the browser.
 */

import {
  scoreRecords as scoreRecordsLocal,
  trainModel as trainModelLocal,
  modelExists,
  type TrainResult as LocalTrainResult,
  type AIScores,
} from './aiModel';

export type { AIScores };

export interface ModelStatus {
  model_exists: boolean;
  model_path: string | null;
}

export interface TrainResult {
  success: boolean;
  error?: string;
  records_used?: number;
  train_size?: number;
  test_size?: number;
  accuracy?: number;
  auc_roc?: number;
  model_path?: string;
  feature_importance?: Record<string, number>;
  hf_repo?: string;
  hf_push_error?: string;
}

export function getModelStatus(): Promise<ModelStatus> {
  return Promise.resolve({
    model_exists: modelExists(),
    model_path: modelExists() ? 'local (browser)' : null,
  });
}

export function analyzeWithAI(
  data: {
    vendors: unknown[];
    invoices: unknown[];
    payments: unknown[];
    glEntries: unknown[];
  },
  _options?: { useZeroShot?: boolean; useTabular?: boolean }
): Promise<AIScores | null> {
  return Promise.resolve(scoreRecordsLocal(data));
}

export function trainModel(
  data: {
    vendors: unknown[];
    invoices: unknown[];
    payments: unknown[];
    glEntries: unknown[];
  },
  _options?: { ruleBasedLabels?: boolean; pushToHub?: boolean; hfRepoId?: string }
): Promise<TrainResult> {
  const result: LocalTrainResult = trainModelLocal(data);
  return Promise.resolve({
    success: result.success,
    error: result.error,
    records_used: result.records_used,
    train_size: result.train_size,
    test_size: result.test_size,
    accuracy: result.accuracy,
    feature_importance: result.feature_importance,
  });
}

/** Always true: AI runs in the browser, no backend needed. */
export function isAIBackendAvailable(): Promise<boolean> {
  return Promise.resolve(true);
}
