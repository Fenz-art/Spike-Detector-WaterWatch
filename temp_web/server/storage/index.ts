/* Storage Factory */

import type { IStorage } from './types';
import { MemoryStorage } from './memoryStorage';
import { MongoStorage } from './mongoStorage';

let storageInstance: IStorage | null = null;

export function initializeStorage(useMongoStorage: boolean): void {
  if (useMongoStorage) {
    storageInstance = new MongoStorage();
  } else {
    storageInstance = new MemoryStorage();
  }
}

export function getStorage(): IStorage {
  if (!storageInstance) {
    throw new Error('Storage not initialized. Call initializeStorage() first.');
  }
  return storageInstance;
}

export type { IStorage, IUser, IMedicalRecord, IAlert } from './types';
