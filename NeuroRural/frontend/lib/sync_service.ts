import Dexie, { Table } from 'dexie';

export interface OfflineTriageRecord {
  id?: number;
  symptoms: string;
  imageBlob?: Blob;
  status: 'pending' | 'synced';
  timestamp: number;
}

export class AashaDatabase extends Dexie {
  triage_queue!: Table<OfflineTriageRecord>;

  constructor() {
    super('AashaDB');
    this.version(1).stores({
      triage_queue: '++id, status, timestamp'
    });
  }
}

export const db = new AashaDatabase();

export async function queueTriageOffline(symptoms: string, imageBlob?: Blob) {
  await db.triage_queue.add({
    symptoms,
    imageBlob,
    status: 'pending',
    timestamp: Date.now()
  });
}

export async function syncOfflineRecords(apiCall: (s: string, b?: Blob) => Promise<any>) {
  const pending = await db.triage_queue.where('status').equals('pending').toArray();
  
  for (const record of pending) {
    try {
      await apiCall(record.symptoms, record.imageBlob);
      await db.triage_queue.update(record.id!, { status: 'synced' });
    } catch (e) {
      console.error("Sync failed for record", record.id, e);
    }
  }
}
