
export type DecisionCategory = 'People' | 'Capital' | 'Strategy' | 'Product' | 'Timing' | 'Personal';
export type DecisionPriority = 'high' | 'medium' | 'low';
export type DecisionStage = 'backlog' | 'considering' | 'committed' | 'decided';

export interface ReflectionInterval {
  date: Date;
  completed: boolean;
  answers?: string[];
  wasCorrect?: boolean;
}

export interface PreAnalysis {
  upside?: string;
  downside?: string;
  alignment?: string;
}

export interface Decision {
  id: string;
  title: string;
  category: DecisionCategory;
  priority: DecisionPriority;
  stage: DecisionStage;
  confidence: number; // 0-100
  owner?: string; // Made optional
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
  biasCheck?: string;
  archived?: boolean;
  preAnalysis?: PreAnalysis;
  reflection?: {
    thirtyDay?: ReflectionInterval;
    questions?: string[];
  };
}
