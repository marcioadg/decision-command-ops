
export type DecisionCategory = 'People' | 'Capital' | 'Strategy' | 'Product' | 'Timing' | 'Personal';
export type DecisionImpact = 'high' | 'medium' | 'low';
export type DecisionUrgency = 'high' | 'medium' | 'low';
export type DecisionStage = 'backlog' | 'considering' | 'committed' | 'decided' | 'lessons';

export interface Decision {
  id: string;
  title: string;
  category: DecisionCategory;
  impact: DecisionImpact;
  urgency: DecisionUrgency;
  stage: DecisionStage;
  confidence: number; // 1-5
  owner: string;
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
  biasCheck?: string;
  archived?: boolean;
  reflection?: {
    reminderDate: Date;
    questions: string[];
    answers?: string[];
  };
}
