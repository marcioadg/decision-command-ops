
import { useEffect } from 'react';
import { useDecisions } from '@/hooks/useDecisions';
import { Decision } from '@/types/Decision';

interface UseIndexMigrationProps {
  user: any;
  hasMigrated: boolean;
  setHasMigrated: (value: boolean) => void;
  setLocalDecisions: (decisions: Decision[]) => void;
}

export const useIndexMigration = ({
  user,
  hasMigrated,
  setHasMigrated,
  setLocalDecisions
}: UseIndexMigrationProps) => {
  const { migrateFromLocalStorage } = useDecisions();

  useEffect(() => {
    if (!user) return;
    
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
              // Refresh decisions after migration
              setLocalDecisions([]);
            }
          }
        } catch (error) {
          console.error('Error checking for migration:', error);
        }
      }
    };

    checkForMigration();
  }, [user, migrateFromLocalStorage, hasMigrated, setHasMigrated, setLocalDecisions]);
};
