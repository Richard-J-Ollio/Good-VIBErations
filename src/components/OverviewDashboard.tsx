import React, { useState } from "react";
import { 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  Flame, 
  Sliders, 
  RefreshCw,
  Zap,
  TrendingUp,
  Layers
} from "lucide-react";
import confetti from "canvas-confetti";
import { DecisionAnalysis, AnalysisViewTab } from "../types";
import { DecisionOverallMetrics } from "../utils/calculator";

interface OverviewDashboardProps {
  analysis: DecisionAnalysis;
  metrics: DecisionOverallMetrics;
  onNavigateTab: (tab: AnalysisViewTab) => void;
  onApplyWeightPreset: (presetType: "balanced" | "financial" | "lifestyle" | "career" | "riskAverse") => void;
  onResynthesizeVerdict: () => Promise<void>;
  isResynthesizing: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  analysis,
  metrics,
  onNavigateTab,
  onApplyWeightPreset,
  onResynthesizeVerdict,
  isResynthesizing
}) => {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    setHasTriggeredConfetti(true);
  };

  const winner = metrics.winningOption;
  const runnerUp = metrics.optionsMetrics.length > 1 ? metrics.optionsMetrics[1] : null;

  return (
    <div id="overview-dashboard" className="space-y-6 animate-fadeIn">
      {/* Primary Tiebreaker Winner Box */}
      <div className="backdrop-blur-2xl bg-gradient-to-br from-amber-500/15 via-indigo-900/30 to-slate-900/60 rounded-2xl sm:rounded-3xl border border-amber-400/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Scale className="w-64 h-64 text-amber-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30 shadow-md">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              {metrics.isDeadHeat ? "Dead Heat / Close Call" : "Clear Winner by Weighted Points"}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
              {metrics.isDeadHeat ? (
                <>Statistical Tie: <span className="text-amber-300">{winner?.optionName}</span> vs <span className="text-slate-300">{runnerUp?.optionName}</span></>
              ) : (
                <>The Winning Path: <span className="text-amber-300 underline decoration-amber-400/60 decoration-wavy underline-offset-4">{winner?.optionName}</span></>
              )}
            </h2>

            <p className="text-sm text-slate-200 leading-relaxed">
              {metrics.isDeadHeat ? (
                `Both options score within ${metrics.scoreDifference.toFixed(1)} points of each other. Adjust the personal weight sliders in the Importance tab to resolve the tie.`
              ) : (
                `Based on your current factor weights, "${winner?.optionName}" outperforms the closest alternative by a ${metrics.scoreDifference.toFixed(1)}% margin.`
              )}
            </p>
          </div>

          {/* Quick Score Badge & Confetti trigger */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 backdrop-blur-xl bg-white/[0.08] p-5 rounded-2xl border border-white/15 shadow-xl">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Composite Score
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 font-display">
                {winner?.overallTiebreakerScore}%
              </span>
            </div>

            <button
              onClick={handleCelebrate}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 flex items-center gap-1.5 border border-amber-300/40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Celebrate Pick
            </button>
          </div>
        </div>
      </div>

      {/* Quick Weight Sensitivity Presets */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Test Priority Scenarios (Quick Weight Presets)
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              See how the winning option shifts instantly when you change your core priorities:
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("weights")}
            className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 hover:underline self-start sm:self-auto flex items-center gap-1"
          >
            Custom Weight Sliders <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => onApplyWeightPreset("balanced")}
            className="p-3 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-indigo-400/40 hover:bg-white/[0.08] text-left transition-all text-xs font-semibold text-slate-200 group"
          >
            <Scale className="w-4 h-4 text-slate-400 mb-1.5 group-hover:text-indigo-400" />
            <span className="block font-bold text-white">Equally Weighted</span>
            <span className="text-[10px] text-slate-400 font-normal">All factors equal (5/10)</span>
          </button>

          <button
            onClick={() => onApplyWeightPreset("financial")}
            className="p-3 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.08] text-left transition-all text-xs font-semibold text-slate-200 group"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400 mb-1.5" />
            <span className="block font-bold text-white">Financial Upside</span>
            <span className="text-[10px] text-slate-400 font-normal">Max compensation & ROI</span>
          </button>

          <button
            onClick={() => onApplyWeightPreset("lifestyle")}
            className="p-3 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-sky-400/40 hover:bg-white/[0.08] text-left transition-all text-xs font-semibold text-slate-200 group"
          >
            <Zap className="w-4 h-4 text-sky-400 mb-1.5" />
            <span className="block font-bold text-white">Peace & Lifestyle</span>
            <span className="text-[10px] text-slate-400 font-normal">Work-life & low stress</span>
          </button>

          <button
            onClick={() => onApplyWeightPreset("career")}
            className="p-3 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-purple-400/40 hover:bg-white/[0.08] text-left transition-all text-xs font-semibold text-slate-200 group"
          >
            <Flame className="w-4 h-4 text-purple-400 mb-1.5" />
            <span className="block font-bold text-white">Growth & Mastery</span>
            <span className="text-[10px] text-slate-400 font-normal">Learning & career speed</span>
          </button>

          <button
            onClick={() => onApplyWeightPreset("riskAverse")}
            className="p-3 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.08] text-left transition-all text-xs font-semibold text-slate-200 group"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 mb-1.5" />
            <span className="block font-bold text-white">Risk-Averse</span>
            <span className="text-[10px] text-slate-400 font-normal">Safety & predictability</span>
          </button>
        </div>
      </div>

      {/* Scoreboard Ranking Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Option Standings & Breakdown
          </h3>
          <span className="text-xs text-slate-400">Calculated from weighted criteria, pros/cons delta & SWOT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.optionsMetrics.map((opt) => {
            const isFirst = opt.rank === 1;
            return (
              <div
                key={opt.optionId}
                className={`rounded-2xl p-5 sm:p-6 backdrop-blur-xl border transition-all ${
                  isFirst
                    ? "bg-white/[0.08] border-indigo-400/40 shadow-2xl ring-1 ring-indigo-400/30"
                    : "bg-white/[0.04] border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        isFirst ? "bg-indigo-500 text-white shadow-md" : "bg-white/10 text-slate-300 border border-white/10"
                      }`}>
                        #{opt.rank}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-white font-display">
                        {opt.optionName}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      {opt.overallTiebreakerScore}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFirst
                        ? "bg-gradient-to-r from-indigo-500 via-indigo-400 to-amber-300"
                        : "bg-slate-500"
                    }`}
                    style={{ width: `${opt.overallTiebreakerScore}%` }}
                  />
                </div>

                {/* Mini Stat Grid */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
                  <div className="p-2.5 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Criteria Avg</span>
                    <span className="text-xs font-bold text-white">{opt.comparisonWeightedAvg}/10</span>
                  </div>
                  <div className="p-2.5 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Net Pros/Cons</span>
                    <span className={`text-xs font-bold ${opt.netProsConsScore >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {opt.netProsConsScore >= 0 ? `+${opt.netProsConsScore}` : opt.netProsConsScore} pts
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">SWOT Balance</span>
                    <span className={`text-xs font-bold ${opt.swotNetBalance >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                      {opt.swotNetBalance >= 0 ? "Favorable" : "Caution"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Tiebreaker Synthesis & Core Trade-off */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Strategic Verdict & Trade-off Synthesis
            </div>
            <button
              onClick={onResynthesizeVerdict}
              disabled={isResynthesizing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
              title="Recalculate AI written verdict based on your latest slider adjustments"
            >
              <RefreshCw className={`w-3 h-3 text-indigo-400 ${isResynthesizing ? "animate-spin" : ""}`} />
              Update AI Verdict
            </button>
          </div>

          <div className="prose prose-invert text-sm leading-relaxed text-slate-200 backdrop-blur-md bg-white/[0.03] rounded-2xl p-5 border border-white/10">
            <p className="whitespace-pre-line">
              {analysis.aiVerdictSummary}
            </p>
          </div>

          {/* Key Trade-off Callout */}
          <div className="p-4 rounded-2xl backdrop-blur-md bg-indigo-500/10 border border-indigo-400/30 text-xs text-indigo-200 flex items-start gap-3">
            <Scale className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-[11px] text-indigo-300">
                The Non-Negotiable Trade-off:
              </span>
              <p className="mt-0.5 text-slate-200 leading-relaxed font-medium">
                {analysis.keyTradeoff}
              </p>
            </div>
          </div>
        </div>

        {/* Pivot Factor & 10/10/10 Perspective */}
        <div className="space-y-4">
          {metrics.topLeverageFactor && (
            <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
                <Flame className="w-4 h-4" />
                Highest Leverage Factor
              </div>
              <p className="text-xs text-slate-400 mb-2.5">
                This factor carries the highest personal weight ({metrics.topLeverageFactor.weight}/10) and has the greatest mathematical influence on the outcome:
              </p>
              <div className="p-3.5 backdrop-blur-md bg-rose-500/10 border border-rose-500/30 rounded-xl">
                <span className="text-xs font-bold text-rose-200 block">
                  {metrics.topLeverageFactor.name}
                </span>
                <span className="text-[11px] text-rose-400">
                  {metrics.topLeverageFactor.type.toUpperCase()} {metrics.topLeverageFactor.optionName ? `• ${metrics.topLeverageFactor.optionName}` : ''}
                </span>
              </div>
            </div>
          )}

          {/* 10/10/10 Rule Card */}
          {analysis.tenTenTen && (
            <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                <Clock className="w-4 h-4" />
                The 10/10/10 Perspective
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10">
                  <span className="font-bold text-white block text-[11px]">In 10 Minutes:</span>
                  <span className="text-slate-300">{analysis.tenTenTen.tenMinutes}</span>
                </div>
                <div className="p-3 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10">
                  <span className="font-bold text-white block text-[11px]">In 10 Months:</span>
                  <span className="text-slate-300">{analysis.tenTenTen.tenMonths}</span>
                </div>
                <div className="p-3 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10">
                  <span className="font-bold text-white block text-[11px]">In 10 Years:</span>
                  <span className="text-slate-300">{analysis.tenTenTen.tenYears}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
