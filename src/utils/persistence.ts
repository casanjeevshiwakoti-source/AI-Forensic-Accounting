const DB_NAME = 'forensic-ai-db';
const DB_VERSION = 1;
const STORE_NAME = 'app-state';

interface PersistedState {
  uploadedFiles: SerializedUploadedFile[];
  processedData: {
    vendors: unknown[];
    invoices: unknown[];
    payments: unknown[];
    glEntries: unknown[];
  };
  cases: unknown[];
  metrics: unknown[];
  reports: unknown[];
  caseNotes?: Record<string, unknown[]>;
  savedAt: string;
}

interface SerializedUploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  records: number;
  uploadedAt: string;
  status: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveState(state: PersistedState): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = { id: 'current', ...state, savedAt: new Date().toISOString() };
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function loadState(): Promise<PersistedState | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get('current');
    req.onsuccess = () => {
      const row = req.result;
      if (row) {
        const { id, ...rest } = row;
        resolve(rest as PersistedState);
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}
