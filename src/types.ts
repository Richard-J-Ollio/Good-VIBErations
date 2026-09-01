export interface FactorItem {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'career' | 'lifestyle' | 'risk' | 'relationships' | 'timing' | 'custom';
  impactScore: number; // 1 to 5 or -1 to -5 (or positive magnitude)
  personalWeight: number; // 1 to 10 (user-adjustable importance)
  isUserAdded?: boolean;
}

export interface OptionProsCons {
  optionId: string;
  optionName: string;
  tagline?: string;
  pros: FactorItem[];
  cons: FactorItem[];
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  category: string;
  description: string;
  personalWeight: number; // 1 to 10
  scores: Record<string, {
    score: number; // 1 to 10
    explanation: string;
  }>;
  isUserAdded?: boolean;
}

export interface SwotItem {
  id: string;
  point: string;
  detail: string;
  personalWeight: number; // 1 to 10
  categoryTag?: string;
  isUserAdded?: boolean;
}

export interface OptionSwot {
  optionId: string;
  optionName: string;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

export interface BlindspotInsight {
  type: 'bias' | 'risk' | 'question' | 'assumption';
  title: string;
  description: string;
  suggestion: string;
}

export interface TenTenTenRule {
  tenMinutes: string;
  tenMonths: string;
  tenYears: string;
}

export interface DecisionAnalysis {
  id: string;
  title: string;
  context: string;
  options: Array<{ id: string; name: string; description?: string }>;
  prosCons: OptionProsCons[];
  comparisonCriteria: ComparisonCriterion[];
  swotAnalysis: OptionSwot[];
  blindspots: BlindspotInsight[];
  tenTenTen?: TenTenTenRule;
  aiVerdictSummary: string;
  keyTradeoff: string;
  recommendedOptionId?: string;
  createdAt: number;
  updatedAt: number;
}

export type AnalysisViewTab = 'overview' | 'pros-cons' | 'comparison' | 'swot' | 'blindspots' | 'weights';

export interface DecisionPreset {
  id: string;
  title: string;
  category: string;
  context: string;
  options: Array<{ name: string; description: string }>;
}
