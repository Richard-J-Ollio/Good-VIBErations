import React from "react";
import { 
  BarChart3, 
  CheckSquare, 
  Table2, 
  Grid2X2, 
  Sliders, 
  Eye, 
  ArrowLeft, 
  Download, 
  Share2, 
  Bookmark, 
  Sparkles,
  Trophy
} from "lucide-react";
import { AnalysisViewTab, DecisionAnalysis } from "../types";
import { DecisionOverallMetrics } from "../utils/calculator";

interface AnalysisHeaderProps {
  analysis: DecisionAnalysis;
  activeTab: AnalysisViewTab;
  onTabChange: (tab: AnalysisViewTab) => void;
  onNewDecision: () => void;
  onExport: () => void;
  onSaveHistory: () => void;
  metrics: DecisionOverallMetrics;
  isSaved?: boolean;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  analysis,
  activeTab,
  onTabChange,
  onNewDecision,
  onExport,
  onSaveHistory,
  metrics,
  isSaved = false
}) => {
  const tabs: Array<{ id: AnalysisViewTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "overview", label: "Tiebreaker Scoreboard", icon: Trophy },
    { id: "pros-cons", label: "Pros & Cons", icon: CheckSquare },
    { id: "comparison", label: "Comparison Table", icon: Table2 },
    { id: "swot", label: "SWOT Analysis", icon: Grid2X2 },
    { id: "weights", label: "Importance Weights", icon: Sliders },
    { id: "blindspots", label: "Blindspots & Devil's Advocate", icon: Eye }
  ];

  const winner = metrics.winningOption;

  return (
    <header className="backdrop-blur-2xl bg-slate-900/80 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl sticky top-20 z-30 space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onNewDecision}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all border border-white/10 backdrop-blur-md"
            title="Start a new decision analysis"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
            New Decision
          </button>
          <div className="h-4 w-px bg-white/15 hidden sm:block" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block">
              Active Decision Matrix
            </span>
            <h1 className="text-base sm:text-lg font-bold text-white line-clamp-1 font-display">
              {analysis.title}
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {winner && (
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 backdrop-blur-md bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Leading Choice: <span className="font-bold text-white">{winner.optionName}</span> ({winner.overallTiebreakerScore}%)
            </div>
          )}

          <button
            onClick={onSaveHistory}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all ${
              isSaved
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-400 text-emerald-400" : "text-slate-400"}`} />
            {isSaved ? "Saved" : "Save Matrix"}
          </button>

          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 px-4 py-1.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap backdrop-blur-md transition-all ${
                isActive
                  ? "bg-indigo-500/20 text-white border border-indigo-400/40 shadow-lg shadow-indigo-500/10 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-300" : "text-slate-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
