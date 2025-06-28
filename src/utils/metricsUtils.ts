
import { Decision } from '@/types/Decision';

export const calculateDecisionMetrics = (decisions: Decision[]) => {
  // Filter out archived decisions for all counts
  const activeDecisions = decisions.filter(d => !d.archived);
  
  const avgConfidence = activeDecisions.length > 0 
    ? Math.round(activeDecisions.reduce((sum, d) => sum + d.confidence, 0) / activeDecisions.length)
    : 0;

  const decidedCount = activeDecisions.filter(d => d.stage === 'decided').length;
  const clarityScore = activeDecisions.length > 0 
    ? Math.round((decidedCount / activeDecisions.length) * 100)
    : 0;

  return {
    avgConfidence,
    clarityScore
  };
};
