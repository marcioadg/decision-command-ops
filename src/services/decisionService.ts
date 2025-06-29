
import { Decision } from '@/types/Decision';
import { secureDecisionService } from './secureDecisionService'; // Using secure service
import { migrationService } from './decision/migrationService';
import { reflectionService } from './decision/reflectionService';

// Updated to use secure decision service for all operations
export const decisionService = {
  // CRUD Operations - now using secure service
  getDecisions: secureDecisionService.getDecisions,
  createDecision: secureDecisionService.createDecision,
  updateDecision: secureDecisionService.updateDecision,
  deleteDecision: secureDecisionService.deleteDecision,

  // Migration - using secure service
  migrateLocalStorageDecisions: secureDecisionService.migrateLocalStorageDecisions,

  // Reflections
  async getReflectionsDue(): Promise<{
    overdue: Decision[];
    dueToday: Decision[];
    dueThisWeek: Decision[];
  }> {
    try {
      const decisions = await this.getDecisions();
      return reflectionService.getReflectionsDue(decisions);
    } catch (error) {
      console.error('Error getting reflections due:', error);
      return { overdue: [], dueToday: [], dueThisWeek: [] };
    }
  }
};
