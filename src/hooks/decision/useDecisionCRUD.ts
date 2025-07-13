
import { useCallback } from 'react';
import { Decision } from '@/types/Decision';
import { secureDecisionService } from '@/services/secureDecisionService'; // Using secure service
import { useToast } from '@/hooks/use-toast';

interface UseDecisionCRUDProps {
  isRealTimeConnected: boolean;
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
  pauseRealtimeForDecision?: (decisionId: string, duration?: number) => void;
  onImmediateUpdate?: (decision: Decision) => void;
}

// Input sanitization helper
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+="[^"]*"/gi, '') // Remove inline event handlers
    .trim();
};

export const useDecisionCRUD = ({ 
  isRealTimeConnected, 
  setDecisions, 
  pauseRealtimeForDecision,
  onImmediateUpdate 
}: UseDecisionCRUDProps) => {
  const { toast } = useToast();

  const createDecision = useCallback(async (decision: Omit<Decision, 'id' | 'createdAt'>) => {
    try {
      console.log('Creating decision:', decision.title);
      
      // Sanitize user input
      const sanitizedDecision = {
        ...decision,
        title: sanitizeInput(decision.title),
        notes: decision.notes ? sanitizeInput(decision.notes) : undefined,
        biasCheck: decision.biasCheck ? sanitizeInput(decision.biasCheck) : undefined
      };

      // Validate input on client side before sending to server
      if (sanitizedDecision.title.length < 3 || sanitizedDecision.title.length > 200) {
        throw new Error('Decision title must be between 3 and 200 characters');
      }

      if (sanitizedDecision.confidence < 1 || sanitizedDecision.confidence > 100) {
        throw new Error('Confidence must be between 1 and 100');
      }
      
      // Create optimistic decision for immediate UI update
      const optimisticDecision: Decision = {
        ...sanitizedDecision,
        id: `temp-${Date.now()}`, // Temporary ID
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Apply immediate update for optimistic UI
      if (onImmediateUpdate) {
        console.log('Applying immediate optimistic update for new decision');
        onImmediateUpdate(optimisticDecision);
      }

      // If not connected to real-time, update local state immediately
      if (!isRealTimeConnected) {
        setDecisions(prev => [optimisticDecision, ...prev]);
      }
      
      const newDecision = await secureDecisionService.createDecision(sanitizedDecision);
      
      // Replace optimistic decision with real one
      if (onImmediateUpdate) {
        console.log('Replacing optimistic decision with real decision');
        onImmediateUpdate(newDecision);
      }

      // Update local state with real decision if not using real-time
      if (!isRealTimeConnected) {
        setDecisions(prev => prev.map(d => 
          d.id === optimisticDecision.id ? newDecision : d
        ));
      }
      
      return newDecision;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create decision';
      console.error('Error creating decision:', err);
      toast({
        title: "Error Creating Decision",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, isRealTimeConnected, setDecisions, onImmediateUpdate]);

  const updateDecision = useCallback(async (decision: Decision) => {
    try {
      console.log('Updating decision:', decision.id, 'with preAnalysis:', decision.preAnalysis);
      
      // Sanitize user input
      const sanitizedDecision = {
        ...decision,
        title: sanitizeInput(decision.title),
        notes: decision.notes ? sanitizeInput(decision.notes) : decision.notes,
        biasCheck: decision.biasCheck ? sanitizeInput(decision.biasCheck) : decision.biasCheck
      };

      // Validate input on client side
      if (sanitizedDecision.title.length < 3 || sanitizedDecision.title.length > 200) {
        throw new Error('Decision title must be between 3 and 200 characters');
      }

      if (sanitizedDecision.confidence < 1 || sanitizedDecision.confidence > 100) {
        throw new Error('Confidence must be between 1 and 100');
      }
      
      // Apply immediate update for optimistic UI
      if (onImmediateUpdate) {
        console.log('Applying immediate optimistic update for decision update');
        onImmediateUpdate(sanitizedDecision);
      }
      
      // Pause real-time updates for this decision to prevent conflicts - extended timeout
      if (pauseRealtimeForDecision) {
        console.log('Pausing real-time updates for decision:', sanitizedDecision.id);
        pauseRealtimeForDecision(sanitizedDecision.id, 8000); // Increased from 3 to 8 seconds
      }
      
      console.log('Sending decision update to database:', sanitizedDecision.id, 'stage:', sanitizedDecision.stage);
      const updatedDecision = await secureDecisionService.updateDecision(sanitizedDecision);
      console.log('Decision updated successfully in database:', {
        id: updatedDecision.id,
        stage: updatedDecision.stage,
        preAnalysis: updatedDecision.preAnalysis
      });
      
      if (!isRealTimeConnected) {
        setDecisions(prev => 
          prev.map(d => d.id === updatedDecision.id ? updatedDecision : d)
        );
      }
      
      return updatedDecision;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update decision';
      console.error('Error updating decision:', err);
      toast({
        title: "Error Updating Decision",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, isRealTimeConnected, setDecisions, pauseRealtimeForDecision, onImmediateUpdate]);

  const deleteDecision = useCallback(async (id: string) => {
    try {
      console.log('Deleting decision:', id);
      await secureDecisionService.deleteDecision(id);
      
      if (!isRealTimeConnected) {
        setDecisions(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete decision';
      console.error('Error deleting decision:', err);
      toast({
        title: "Error Deleting Decision",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, isRealTimeConnected, setDecisions]);

  return {
    createDecision,
    updateDecision,
    deleteDecision
  };
};
