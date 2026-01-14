'use client';

import { useState, useEffect } from 'react';
import {
  migrateFromLocalStorage,
  isMigrationNeeded,
  MigrationResult
} from '@/services/storage/migration';
import { IndexedDBStorageAdapter } from '@/services/storage/indexeddb-storage';

interface UseStorageMigrationResult {
  isReady: boolean;
  isMigrating: boolean;
  migrationResult: MigrationResult | null;
  error: string | null;
}

/**
 * Hook to handle storage migration on app initialization
 *
 * This hook:
 * 1. Checks if IndexedDB is supported
 * 2. Runs migration from localStorage to IndexedDB if needed
 * 3. Returns migration status for UI feedback
 */
export function useStorageMigration(): UseStorageMigrationResult {
  const [isReady, setIsReady] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initStorage() {
      // Check if IndexedDB is supported
      if (!IndexedDBStorageAdapter.isSupported()) {
        console.warn('IndexedDB not supported, using localStorage');
        setIsReady(true);
        return;
      }

      // Check if migration is needed
      if (isMigrationNeeded()) {
        setIsMigrating(true);

        try {
          const result = await migrateFromLocalStorage();
          setMigrationResult(result);

          if (!result.success) {
            setError(result.error || 'Migration failed');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Migration error');
        } finally {
          setIsMigrating(false);
        }
      }

      setIsReady(true);
    }

    initStorage();
  }, []);

  return { isReady, isMigrating, migrationResult, error };
}
