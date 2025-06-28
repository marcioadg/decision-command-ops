
import { useEffect } from 'react';
import { useDecisions } from '@/hooks/useDecisions';

export const useIndexMigration = (hasMigrated: boolean, setHasMigrated: (value: boolean) => void) => {
  const { migrateFromLocalStorage } = useDecisions();

  useEffect(() => {
    const checkForMigration = async () => {
      if (hasMigrated) return;
      
      const savedDecisions = localStorage.getItem('tactical-decisions');
      if (savedDecisions) {
        try {
          const localDecisions = JSON.parse(savedDecisions);
          if (localDecisions.length > 0) {
            const migratedCount = await migrateFromLocalStorage();
            if (migratedCount > 0) {
              setHasMigrated(true);
            }
          }
        } catch (error) {
          console.error('Error checking for migration:', error);
        }
      }
    };

    checkForMigration();
  }, [migrateFromLocalStorage, hasMigrated, setHasMigrated]);
};
