
import { Decision } from '@/types/Decision';
import { migrationService } from './decision/migrationService';
import { reflectionService } from './decision/reflectionService';
import { crudService } from './decision/crudService';

export const secureDecisionService = {
  // CRUD Operations - delegated to crudService
  getDecisions: crudService.getDecisions,
  createDecision: crudService.createDecision,
  updateDecision: crudService.updateDecision,
  deleteDecision: crudService.deleteDecision,

  // Migration - delegated to migrationService
  migrateLocalStorageDecisions: migrationService.migrateLocalStorageDecisions,

  // Get decisions that need reflection
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
