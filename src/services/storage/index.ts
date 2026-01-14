export type { StorageAdapter } from './storage-adapter';
export { createStorageAdapter } from './storage-adapter';
export { LocalStorageAdapter } from './local-storage';
export { IndexedDBStorageAdapter } from './indexeddb-storage';
export {
  migrateFromLocalStorage,
  isMigrationNeeded,
  resetMigrationFlag
} from './migration';
export type { MigrationResult } from './migration';
