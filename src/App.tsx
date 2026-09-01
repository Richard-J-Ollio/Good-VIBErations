import React, { useState, useEffect, useMemo } from "react";
import { 
  Scale, 
  Sparkles, 
  Bookmark, 
  History, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  FileText
} from "lucide-react";
import { 
  DecisionAnalysis, 
  AnalysisViewTab, 
  FactorItem, 
  ComparisonCriterion, 
  SwotItem 
} from "./types";
import { calculateDecisionMetrics } from "./utils/calculator";
import { DecisionInputForm } from "./components/DecisionInputForm";
import { AnalysisHeader } from "./components/AnalysisHeader";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { ProsConsView } from "./components/ProsConsView";
import { ComparisonTableView } from "./components/ComparisonTableView";
import { SwotView } from "./components/SwotView";
import { WeightsManagerView } from "./components/WeightsManagerView";
import { BlindspotsView } from "./components/BlindspotsView";
import { ExportModal } from "./components/ExportModal";
import { HistoryDrawer } from "./components/HistoryDrawer";

const STORAGE_KEY = "the_tiebreaker_saved_decisions_v1";

export default function App() {
  const [activeAnalysis, setActiveAnalysis] = useState<DecisionAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisViewTab>("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isResynthesizing, setIsResynthesizing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");

  // Modals & Drawers
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);

  // Load saved history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedDecisions(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load saved decisions from localStorage", e);
    }
  }, []);

  // Sync saved history helper
  const updateSavedDecisions = (updated: DecisionAnalysis[]) => {
    setSavedDecisions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist decisions", e);
    }
  };

  // Calculate live reactive metrics whenever activeAnalysis changes
  const metrics = useMemo(() => {
    if (!activeAnalysis) {
      return calculateDecisionMetrics({} as any);
    }
    return calculateDecisionMetrics(activeAnalysis);
  }, [activeAnalysis]);

  const isCurrentSaved = useMemo(() => {
    if (!activeAnalysis) return false;
    return savedDecisions.some((d) => d.id === activeAnalysis.id);
  }, [activeAnalysis, savedDecisions]);

  // Handle Full AI Analysis Request
  const handleAnalyzeDecision = async (data: {
    title: string;
    context: string;
    options: Array<{ id: string; name: string; description: string }>;
    userPriorities?: string;
  }) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setLoadingStep("Formulating decision matrix...");

    try {
      const timer1 = setTimeout(() => setLoadingStep("Extracting multi-dimensional pros & cons..."), 1500);
      const timer2 = setTimeout(() => setLoadingStep("Constructing comparative criteria table..."), 3500);
      const timer3 = setTimeout(() => setLoadingStep("Evaluating SWOT matrix & blindspots..."), 5500);

      const response = await fetch("/api/analyze-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errText = errorData.error || `Analysis request failed with status ${response.status}`;
        if (typeof errText === "string" && (errText.includes("503") || errText.includes("high demand") || errText.includes("UNAVAILABLE"))) {
          errText = "The AI model is experiencing temporary high demand. The server will automatically use fallback models or local matrix synthesis.";
        }
        throw new Error(errText);
      }

      const result: DecisionAnalysis = await response.json();
      setActiveAnalysis(result);
      setActiveTab("overview");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Decision analysis failed:", error);
      setErrorMessage(error.message || "Failed to analyze decision. Please verify input and retry.");
    } finally {
      setIsAnalyzing(false);
      setLoadingStep("");
    }
  };

  // Factor Weight Updates
  const handleUpdateFactorWeight = (
    optionId: string,
    type: "pro" | "con",
    factorId: string,
    newWeight: number
  ) => {
    if (!activeAnalysis) return;
    const updatedProsCons = activeAnalysis.prosCons.map((pc) => {
      if (pc.optionId !== optionId) return pc;
      return {
        ...pc,
        [type === "pro" ? "pros" : "cons"]: pc[type === "pro" ? "pros" : "cons"].map((item) => {
          if (item.id === factorId) {
            return { ...item, personalWeight: newWeight };
          }
          return item;
        }),
      };
    });

    setActiveAnalysis({
      ...activeAnalysis,
      prosCons: updatedProsCons,
      updatedAt: Date.now(),
    });
  };

  const handleAddFactor = (
    optionId: string,
    type: "pro" | "con",
    factor: Omit<FactorItem, "id">
  ) => {
    if (!activeAnalysis) return;
    const newId = `factor_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newFactorItem: FactorItem = { ...factor, id: newId };

    const updatedProsCons = activeAnalysis.prosCons.map((pc) => {
      if (pc.optionId !== optionId) return pc;
      return {
        ...pc,
        [type === "pro" ? "pros" : "cons"]: [newFactorItem, ...pc[type === "pro" ? "pros" : "cons"]],
      };
    });

    setActiveAnalysis({
      ...activeAnalysis,
      prosCons: updatedProsCons,
      updatedAt: Date.now(),
    });
  };

  const handleRemoveFactor = (optionId: string, type: "pro" | "con", factorId: string) => {
    if (!activeAnalysis) return;
    const updatedProsCons = activeAnalysis.prosCons.map((pc) => {
      if (pc.optionId !== optionId) return pc;
      return {
        ...pc,
        [type === "pro" ? "pros" : "cons"]: pc[type === "pro" ? "pros" : "cons"].filter(
          (item) => item.id !== factorId
        ),
      };
    });

    setActiveAnalysis({
      ...activeAnalysis,
      prosCons: updatedProsCons,
      updatedAt: Date.now(),
    });
  };

  // Comparison Criteria Updates
  const handleUpdateCriterionWeight = (criterionId: string, newWeight: number) => {
    if (!activeAnalysis) return;
    const updatedCriteria = activeAnalysis.comparisonCriteria.map((crit) => {
      if (crit.id === criterionId) {
        return { ...crit, personalWeight: newWeight };
      }
      return crit;
    });

    setActiveAnalysis({
      ...activeAnalysis,
      comparisonCriteria: updatedCriteria,
      updatedAt: Date.now(),
    });
  };

  const handleUpdateCriterionScore = (criterionId: string, optionId: string, newScore: number) => {
    if (!activeAnalysis) return;
    const updatedCriteria = activeAnalysis.comparisonCriteria.map((crit) => {
      if (crit.id === criterionId) {
        const existing = crit.scores[optionId] || { explanation: "" };
        return {
          ...crit,
          scores: {
            ...crit.scores,
            [optionId]: {
              ...existing,
              score: newScore,
            },
          },
        };
      }
      return crit;
    });

    setActiveAnalysis({
      ...activeAnalysis,
      comparisonCriteria: updatedCriteria,
      updatedAt: Date.now(),
    });
  };

  const handleAddCriterion = (criterion: Omit<ComparisonCriterion, "id">) => {
    if (!activeAnalysis) return;
    const newCritId = `crit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCriterion: ComparisonCriterion = {
      ...criterion,
      id: newCritId,
    };

    setActiveAnalysis({
      ...activeAnalysis,
      comparisonCriteria: [newCriterion, ...activeAnalysis.comparisonCriteria],
      updatedAt: Date.now(),
    });
  };

  const handleRemoveCriterion = (criterionId: string) => {
    if (!activeAnalysis) return;
    setActiveAnalysis({
      ...activeAnalysis,
      comparisonCriteria: activeAnalysis.comparisonCriteria.filter((c) => c.id !== criterionId),
      updatedAt: Date.now(),
    });
  };

  // SWOT Updates
  const handleUpdateSwotWeight = (
    optionId: string,
    quadrant: "strengths" | "weaknesses" | "opportunities" | "threats",
    itemId: string,
    newWeight: number
  ) => {
    if (!activeAnalysis) return;
    const updatedSwot = activeAnalysis.swotAnalysis.map((swot) => {
      if (swot.optionId !== optionId) return swot;
      return {
        ...swot,
        [quadrant]: swot[quadrant].map((item) => {
          if (item.id === itemId) {
            return { ...item, personalWeight: newWeight };
          }
          return item;
        }),
      };
    });

    setActiveAnalysis({
      ...activeAnalysis,
      swotAnalysis: updatedSwot,
      updatedAt: Date.now(),
    });
  };

  const handleAddSwotItem = (
    optionId: string,
    quadrant: "strengths" | "weaknesses" | "opportunities" | "threats",
    item: Omit<SwotItem, "id">
  ) => {
    if (!activeAnalysis) return;
    const newItemId = `swot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem: SwotItem = { ...item, id: newItemId };

    const updatedSwot = activeAnalysis.swotAnalysis.map((swot) => {
      if (swot.optionId !== optionId) return swot;
      return {
        ...swot,
        [quadrant]: [newItem, ...swot[quadrant]],
      };
    });

    setActiveAnalysis({
      ...activeAnalysis,
      swotAnalysis: updatedSwot,
      updatedAt: Date.now(),
    });
  };

  const handleRemoveSwotItem = (
    optionId: string,
    quadrant: "strengths" | "weaknesses" | "opportunities" | "threats",
    itemId: string
  ) => {
    if (!activeAnalysis) return;
    const updatedSwot = activeAnalysis.swotAnalysis.map((swot) => {
      if (swot.optionId !== optionId) return swot;
      return {
        ...swot,
        [quadrant]: swot[quadrant].filter((item) => item.id !== itemId),
      };
    });

    setActiveAnalysis({
      ...activeAnalysis,
      swotAnalysis: updatedSwot,
      updatedAt: Date.now(),
    });
  };

  // Bulk Weight Presets
  const handleApplyWeightPreset = (
    presetType: "balanced" | "financial" | "lifestyle" | "career" | "riskAverse"
  ) => {
    if (!activeAnalysis) return;

    // Adjust criteria
    const updatedCriteria = activeAnalysis.comparisonCriteria.map((c) => {
      const lower = `${c.name} ${c.category} ${c.description}`.toLowerCase();
      let w = 5;
      if (presetType === "balanced") w = 5;
      else if (presetType === "financial") {
        w = lower.includes("financ") || lower.includes("comp") || lower.includes("salary") || lower.includes("money") || lower.includes("cost") ? 9 : 4;
      } else if (presetType === "lifestyle") {
        w = lower.includes("life") || lower.includes("stress") || lower.includes("balance") || lower.includes("flex") || lower.includes("commute") ? 9 : 4;
      } else if (presetType === "career") {
        w = lower.includes("career") || lower.includes("growth") || lower.includes("learn") || lower.includes("mastery") || lower.includes("upside") ? 9 : 4;
      } else if (presetType === "riskAverse") {
        w = lower.includes("risk") || lower.includes("safe") || lower.includes("stability") || lower.includes("predict") ? 9 : 4;
      }
      return { ...c, personalWeight: w };
    });

    // Adjust pros & cons
    const updatedProsCons = activeAnalysis.prosCons.map((pc) => ({
      ...pc,
      pros: pc.pros.map((p) => {
        let w = 5;
        if (presetType === "balanced") w = 5;
        else if (presetType === "financial" && p.category === "financial") w = 9;
        else if (presetType === "lifestyle" && p.category === "lifestyle") w = 9;
        else if (presetType === "career" && p.category === "career") w = 9;
        else if (presetType === "riskAverse" && p.category === "risk") w = 3;
        return { ...p, personalWeight: w };
      }),
      cons: pc.cons.map((c) => {
        let w = 5;
        if (presetType === "balanced") w = 5;
        else if (presetType === "riskAverse" && c.category === "risk") w = 10;
        else if (presetType === "lifestyle" && c.category === "lifestyle") w = 9;
        else if (presetType === "financial" && c.category === "financial") w = 9;
        return { ...c, personalWeight: w };
      }),
    }));

    setActiveAnalysis({
      ...activeAnalysis,
      comparisonCriteria: updatedCriteria,
      prosCons: updatedProsCons,
      updatedAt: Date.now(),
    });
  };

  // Re-Synthesize AI Verdict with new weights
  const handleResynthesizeVerdict = async () => {
    if (!activeAnalysis) return;
    setIsResynthesizing(true);
    try {
      const currentWeightsSummary = {
        topCriteriaWeights: activeAnalysis.comparisonCriteria
          .sort((a, b) => b.personalWeight - a.personalWeight)
          .slice(0, 4)
          .map((c) => ({ name: c.name, weight: c.personalWeight })),
        winningRankings: metrics.optionsMetrics.map((m) => ({
          rank: m.rank,
          option: m.optionName,
          score: `${m.overallTiebreakerScore}%`,
        })),
      };

      const response = await fetch("/api/synthesize-verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeAnalysis.title,
          context: activeAnalysis.context,
          currentWeights: currentWeightsSummary,
          scoresSummary: metrics.optionsMetrics,
        }),
      });

      if (!response.ok) throw new Error("Failed to re-synthesize verdict");
      const data = await response.json();

      setActiveAnalysis({
        ...activeAnalysis,
        aiVerdictSummary: data.verdictText || activeAnalysis.aiVerdictSummary,
        keyTradeoff: data.decidingFactor || activeAnalysis.keyTradeoff,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.error("Resynthesize failed:", e);
    } finally {
      setIsResynthesizing(false);
    }
  };

  // AI Suggest Additional Pros/Cons
  const handleSuggestFactors = async (
    optionId: string,
    optionName: string,
    type: "pros" | "cons"
  ) => {
    if (!activeAnalysis) return;
    setIsSuggesting(true);
    try {
      const response = await fetch("/api/suggest-factors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeAnalysis.title,
          context: activeAnalysis.context,
          optionName,
          type,
        }),
      });

      if (!response.ok) throw new Error("Failed to brainstorm factors");
      const data = await response.json();

      if (data.suggestions && Array.isArray(data.suggestions)) {
        const formatted: FactorItem[] = data.suggestions.map((s: any) => ({
          id: `suggested_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: s.title,
          description: s.description,
          category: s.category || "custom",
          impactScore: Number(s.impactScore) || 3,
          personalWeight: Number(s.personalWeight) || 6,
          isUserAdded: true,
        }));

        const updatedProsCons = activeAnalysis.prosCons.map((pc) => {
          if (pc.optionId !== optionId) return pc;
          return {
            ...pc,
            pros: type === "pros" ? [...pc.pros, ...formatted] : pc.pros,
            cons: type === "cons" ? [...pc.cons, ...formatted] : pc.cons,
          };
        });

        setActiveAnalysis({
          ...activeAnalysis,
          prosCons: updatedProsCons,
          updatedAt: Date.now(),
        });
      }
    } catch (e) {
      console.error("Suggest factors error:", e);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Save / Toggle current matrix in history
  const handleToggleSaveCurrent = () => {
    if (!activeAnalysis) return;
    if (isCurrentSaved) {
      const remaining = savedDecisions.filter((d) => d.id !== activeAnalysis.id);
      updateSavedDecisions(remaining);
    } else {
      updateSavedDecisions([activeAnalysis, ...savedDecisions]);
    }
  };

  const handleDeleteSavedDecision = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = savedDecisions.filter((d) => d.id !== id);
    updateSavedDecisions(remaining);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Dynamic Ambient Frosted Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/25 blur-[140px]" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-600/15 blur-[130px]" />
        <div className="absolute top-2/3 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-amber-600/15 blur-[130px]" />
      </div>

      {/* Top Application Bar */}
      <nav className="backdrop-blur-xl bg-slate-900/70 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={() => setActiveAnalysis(null)} 
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight font-display text-white block">
                The Tiebreaker
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-300/80 block">
                Decision Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl transition-all border border-white/10 backdrop-blur-md"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Saved Matrices</span>
              {savedDecisions.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                  {savedDecisions.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl backdrop-blur-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-rose-100 block">Analysis Error:</span>
              <p className="mt-0.5 text-rose-200/90">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 font-bold px-2 py-1 rounded-lg hover:bg-rose-500/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View 1: Decision Input Form (When no active analysis) */}
        {!activeAnalysis && !isAnalyzing && (
          <DecisionInputForm
            onSubmit={handleAnalyzeDecision}
            isLoading={isAnalyzing}
          />
        )}

        {/* Loading State Animation with Step Indicators */}
        {isAnalyzing && (
          <div className="max-w-xl mx-auto py-16 text-center space-y-6 animate-fadeIn">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-ping opacity-30" />
              <div className="w-24 h-24 rounded-2xl backdrop-blur-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                <Scale className="w-12 h-12 text-indigo-400 animate-bounce" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white font-display">
                Weighing Your Decision Factors
              </h2>
              <p className="text-xs text-indigo-300 flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                {loadingStep || "Analyzing trade-offs..."}
              </p>
            </div>

            <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/[0.05] border border-white/10 max-w-md mx-auto text-left text-xs space-y-2.5 shadow-xl">
              <div className="flex items-center gap-2.5 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Balancing multi-criteria scoring vectors</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Constructing SWOT matrices per candidate option</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Identifying cognitive biases and blindspots</span>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Active Decision Intelligence Workspace */}
        {activeAnalysis && !isAnalyzing && (
          <div className="space-y-6">
            <AnalysisHeader
              analysis={activeAnalysis}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onNewDecision={() => setActiveAnalysis(null)}
              onExport={() => setIsExportOpen(true)}
              onSaveHistory={handleToggleSaveCurrent}
              metrics={metrics}
              isSaved={isCurrentSaved}
            />

            {/* Tab: Overview Scoreboard */}
            {activeTab === "overview" && (
              <OverviewDashboard
                analysis={activeAnalysis}
                metrics={metrics}
                onNavigateTab={setActiveTab}
                onApplyWeightPreset={handleApplyWeightPreset}
                onResynthesizeVerdict={handleResynthesizeVerdict}
                isResynthesizing={isResynthesizing}
              />
            )}

            {/* Tab: Weighted Pros & Cons */}
            {activeTab === "pros-cons" && (
              <ProsConsView
                analysis={activeAnalysis}
                onUpdateFactorWeight={handleUpdateFactorWeight}
                onAddFactor={handleAddFactor}
                onRemoveFactor={handleRemoveFactor}
                onSuggestFactors={handleSuggestFactors}
                isSuggesting={isSuggesting}
              />
            )}

            {/* Tab: Comparison Table */}
            {activeTab === "comparison" && (
              <ComparisonTableView
                analysis={activeAnalysis}
                metrics={metrics}
                onUpdateCriterionWeight={handleUpdateCriterionWeight}
                onUpdateCriterionScore={handleUpdateCriterionScore}
                onAddCriterion={handleAddCriterion}
                onRemoveCriterion={handleRemoveCriterion}
              />
            )}

            {/* Tab: SWOT Analysis */}
            {activeTab === "swot" && (
              <SwotView
                analysis={activeAnalysis}
                onUpdateSwotWeight={handleUpdateSwotWeight}
                onAddSwotItem={handleAddSwotItem}
                onRemoveSwotItem={handleRemoveSwotItem}
              />
            )}

            {/* Tab: Weights Manager Matrix */}
            {activeTab === "weights" && (
              <WeightsManagerView
                analysis={activeAnalysis}
                metrics={metrics}
                onUpdateFactorWeight={handleUpdateFactorWeight}
                onUpdateCriterionWeight={handleUpdateCriterionWeight}
                onApplyWeightPreset={handleApplyWeightPreset}
              />
            )}

            {/* Tab: Blindspots & Devil's Advocate */}
            {activeTab === "blindspots" && (
              <BlindspotsView analysis={activeAnalysis} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-slate-900/60 border-t border-white/10 py-6 mt-12 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-300">
            The Tiebreaker — Rational Decision Intelligence
          </span>
          <span className="text-slate-400">
            Adjust weights freely to uncover your true priority alignment.
          </span>
        </div>
      </footer>

      {/* Export Report Modal */}
      {isExportOpen && activeAnalysis && (
        <ExportModal
          analysis={activeAnalysis}
          metrics={metrics}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Saved History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={(dec) => {
          setActiveAnalysis(dec);
          setActiveTab("overview");
        }}
        onDeleteDecision={handleDeleteSavedDecision}
      />
    </div>
  );
}
