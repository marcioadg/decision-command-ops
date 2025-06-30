
import { useEffect } from 'react';
import { visitTrackingService } from '@/services/visitTrackingService';
import { useAuth } from './useAuth';

export const useVisitTracking = (pageName: string) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && pageName) {
      visitTrackingService.trackPageVisit(pageName);
    }
  }, [user, pageName]);
};
