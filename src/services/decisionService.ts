
import { Decision } from '@/types/Decision';
import { crudOperations } from './decision/crudOperations';
import { migrationService } from './decision/migrationService';
import { reflectionService } from './decision/reflectionService';

export const decisionService = {
  // CRUD Operations
  getDecisions: crudOperations.getDecisions,
  createDecision: crudOperations.createDecision,
  updateDecision: crudOperations.updateDecision,
  deleteDecision: crudOperations.deleteDecision,

  // Migration
  migrateLocalStorageDecisions: migrationService.migrateLocalStorageDecisions,

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
