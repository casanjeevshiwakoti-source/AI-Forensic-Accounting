export interface DetectionThresholds {
  /** Threshold evasion: min/max for $5k limit (e.g. 4900-5000) */
  threshold5kMin: number;
  threshold5kMax: number;
  /** Threshold evasion: min/max for $10k limit */
  threshold10kMin: number;
  threshold10kMax: number;
  /** Threshold evasion: min/max for $25k limit */
  threshold25kMin: number;
  threshold25kMax: number;
  /** Off-hours: start of business (6 = 6 AM) */
  offHoursStart: number;
  /** Off-hours: end of business (22 = 10 PM) */
  offHoursEnd: number;
  /** Round dollar: minimum amount to flag */
  roundDollarMin: number;
  /** Round dollar: minimum count to create case */
  roundDollarMinCount: number;
}

export const DEFAULT_THRESHOLDS: DetectionThresholds = {
  threshold5kMin: 4900,
  threshold5kMax: 5000,
  threshold10kMin: 9800,
  threshold10kMax: 10000,
  threshold25kMin: 24800,
  threshold25kMax: 25000,
  offHoursStart: 6,
  offHoursEnd: 22,
  roundDollarMin: 1000,
  roundDollarMinCount: 4,
};

const STORAGE_KEY = 'forensic-ai-thresholds';

export function loadThresholds(): DetectionThresholds {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DetectionThresholds>;
      return { ...DEFAULT_THRESHOLDS, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_THRESHOLDS };
}

export function saveThresholds(t: Partial<DetectionThresholds>): void {
  const current = loadThresholds();
  const next = { ...current, ...t };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
