import { DecisionAnalysis, OptionProsCons, ComparisonCriterion, OptionSwot } from "../types";

export interface OptionCalculatedMetrics {
  optionId: string;
  optionName: string;
  // Pros & Cons metrics
  totalProsScore: number;
  totalConsScore: number;
  netProsConsScore: number;
  prosCount: number;
  consCount: number;
  
  // Comparison Table metrics
  comparisonWeightedAvg: number; // 0 - 10
  comparisonTotalWeightedPoints: number;
  comparisonTotalWeight: number;

  // SWOT balance
  swotPositiveWeight: number;
  swotNegativeWeight: number;
  swotNetBalance: number;

  // Composite Normalized Score (0 - 100)
  overallTiebreakerScore: number;
  rank: number;
  isLeader: boolean;
}

export interface DecisionOverallMetrics {
  optionsMetrics: OptionCalculatedMetrics[];
  winningOption: OptionCalculatedMetrics | null;
  scoreDifference: number;
  isDeadHeat: boolean; // within 3% score difference
  topLeverageFactor: {
    name: string;
    type: 'pro' | 'con' | 'criterion' | 'swot';
    weight: number;
    optionName?: string;
  } | null;
  categoryDistribution: Record<string, number>;
}

export function calculateDecisionMetrics(analysis: DecisionAnalysis): DecisionOverallMetrics {
  if (!analysis || !analysis.options || analysis.options.length === 0) {
    return {
      optionsMetrics: [],
      winningOption: null,
      scoreDifference: 0,
      isDeadHeat: false,
      topLeverageFactor: null,
      categoryDistribution: {}
    };
  }

  let highestWeight = 0;
  let topLeverage: DecisionOverallMetrics['topLeverageFactor'] = null;
  const categoryDistribution: Record<string, number> = {};

  const metrics: OptionCalculatedMetrics[] = analysis.options.map((opt) => {
    // 1. Calculate Pros & Cons
    const pc = analysis.prosCons?.find((p) => p.optionId === opt.id);
    let totalPros = 0;
    let totalCons = 0;
    const prosCount = pc?.pros?.length || 0;
    const consCount = pc?.cons?.length || 0;

    if (pc?.pros) {
      pc.pros.forEach((p) => {
        const factorWeight = p.personalWeight ?? 5;
        const impact = p.impactScore ?? 3;
        const weightedVal = impact * factorWeight;
        totalPros += weightedVal;

        if (factorWeight > highestWeight) {
          highestWeight = factorWeight;
          topLeverage = {
            name: p.title,
            type: 'pro',
            weight: factorWeight,
            optionName: opt.name
          };
        }

        const cat = p.category || 'general';
        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + factorWeight;
      });
    }

    if (pc?.cons) {
      pc.cons.forEach((c) => {
        const factorWeight = c.personalWeight ?? 5;
        const impact = c.impactScore ?? 3;
        const weightedVal = impact * factorWeight;
        totalCons += weightedVal;

        if (factorWeight > highestWeight) {
          highestWeight = factorWeight;
          topLeverage = {
            name: c.title,
            type: 'con',
            weight: factorWeight,
            optionName: opt.name
          };
        }

        const cat = c.category || 'general';
        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + factorWeight;
      });
    }

    const netProsCons = totalPros - totalCons;

    // 2. Calculate Comparison Criteria
    let compWeightedPoints = 0;
    let compTotalWeight = 0;

    if (analysis.comparisonCriteria && analysis.comparisonCriteria.length > 0) {
      analysis.comparisonCriteria.forEach((crit) => {
        const weight = crit.personalWeight ?? 5;
        const optScoreObj = crit.scores?.[opt.id];
        const score = optScoreObj ? optScoreObj.score : 5;

        compWeightedPoints += score * weight;
        compTotalWeight += weight;

        if (weight > highestWeight) {
          highestWeight = weight;
          topLeverage = {
            name: crit.name,
            type: 'criterion',
            weight: weight
          };
        }
      });
    }

    const compWeightedAvg = compTotalWeight > 0 ? compWeightedPoints / compTotalWeight : 5;

    // 3. Calculate SWOT
    const swot = analysis.swotAnalysis?.find((s) => s.optionId === opt.id);
    let swotPos = 0;
    let swotNeg = 0;

    if (swot) {
      swot.strengths?.forEach((s) => (swotPos += (s.personalWeight ?? 5) * 1.5));
      swot.opportunities?.forEach((o) => (swotPos += (o.personalWeight ?? 5) * 1.2));
      swot.weaknesses?.forEach((w) => (swotNeg += (w.personalWeight ?? 5) * 1.5));
      swot.threats?.forEach((t) => (swotNeg += (t.personalWeight ?? 5) * 1.2));
    }

    const swotNet = swotPos - swotNeg;

    // 4. Calculate Composite Tiebreaker Score (0 to 100 scale)
    // Base is the Comparison table avg (which is 0-10 -> 0-100) adjusted by net pros/cons ratio
    const compPart = compWeightedAvg * 10; // 0 - 100
    const pcBonus = Math.max(-25, Math.min(25, netProsCons * 0.8));
    const swotBonus = Math.max(-15, Math.min(15, swotNet * 0.3));

    let composite = compPart + pcBonus + swotBonus;
    composite = Math.max(5, Math.min(99, Math.round(composite)));

    return {
      optionId: opt.id,
      optionName: opt.name,
      totalProsScore: totalPros,
      totalConsScore: totalCons,
      netProsConsScore: netProsCons,
      prosCount,
      consCount,
      comparisonWeightedAvg: Number(compWeightedAvg.toFixed(1)),
      comparisonTotalWeightedPoints: compWeightedPoints,
      comparisonTotalWeight: compTotalWeight,
      swotPositiveWeight: swotPos,
      swotNegativeWeight: swotNeg,
      swotNetBalance: swotNet,
      overallTiebreakerScore: composite,
      rank: 1,
      isLeader: false
    };
  });

  // Sort descending by overallTiebreakerScore
  const sorted = [...metrics].sort((a, b) => b.overallTiebreakerScore - a.overallTiebreakerScore);

  sorted.forEach((item, idx) => {
    item.rank = idx + 1;
    item.isLeader = idx === 0;
  });

  const winningOption = sorted.length > 0 ? sorted[0] : null;
  const runnerUp = sorted.length > 1 ? sorted[1] : null;
  const scoreDifference = winningOption && runnerUp ? winningOption.overallTiebreakerScore - runnerUp.overallTiebreakerScore : 0;
  const isDeadHeat = scoreDifference <= 3;

  return {
    optionsMetrics: sorted,
    winningOption,
    scoreDifference,
    isDeadHeat,
    topLeverageFactor: topLeverage,
    categoryDistribution
  };
}
