import React, { useState } from "react";
import { Sliders, Filter, ArrowUpDown, Sparkles, Scale, Info } from "lucide-react";
import { DecisionAnalysis } from "../types";
import { DecisionOverallMetrics } from "../utils/calculator";

interface WeightsManagerViewProps {
  analysis: DecisionAnalysis;
  metrics: DecisionOverallMetrics;
  onUpdateFactorWeight: (optionId: string, type: "pro" | "con", factorId: string, newWeight: number) => void;
  onUpdateCriterionWeight: (criterionId: string, newWeight: number) => void;
  onApplyWeightPreset: (presetType: "balanced" | "financial" | "lifestyle" | "career" | "riskAverse") => void;
}

export const WeightsManagerView: React.FC<WeightsManagerViewProps> = ({
  analysis,
  metrics,
  onUpdateFactorWeight,
  onUpdateCriterionWeight,
  onApplyWeightPreset
}) => {
  const [filterType, setFilterType] = useState<"all" | "criteria" | "pros" | "cons">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Aggregate all weightable items into a clean flat list
  const allWeightableItems: Array<{
    id: string;
    title: string;
    description: string;
    type: "criterion" | "pro" | "con";
    optionId?: string;
    optionName?: string;
    weight: number;
    category?: string;
  }> = [];

  // Criteria
  analysis.comparisonCriteria?.forEach((crit) => {
    allWeightableItems.push({
      id: crit.id,
      title: crit.name,
      description: crit.description,
      type: "criterion",
      weight: crit.personalWeight,
      category: crit.category
    });
  });

  // Pros & Cons
  analysis.prosCons?.forEach((pc) => {
    const optName = analysis.options.find((o) => o.id === pc.optionId)?.name || pc.optionName;
    pc.pros?.forEach((p) => {
      allWeightableItems.push({
        id: p.id,
        title: p.title,
        description: p.description,
        type: "pro",
        optionId: pc.optionId,
        optionName: optName,
        weight: p.personalWeight,
        category: p.category
      });
    });
    pc.cons?.forEach((c) => {
      allWeightableItems.push({
        id: c.id,
        title: c.title,
        description: c.description,
        type: "con",
        optionId: pc.optionId,
        optionName: optName,
        weight: c.personalWeight,
        category: c.category
      });
    });
  });

  // Filter & sort
  const filtered = allWeightableItems
    .filter((item) => {
      if (filterType === "criteria" && item.type !== "criterion") return false;
      if (filterType === "pros" && item.type !== "pro") return false;
      if (filterType === "cons" && item.type !== "con") return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          (item.optionName && item.optionName.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => b.weight - a.weight);

  const handleSliderChange = (item: typeof allWeightableItems[0], newWeight: number) => {
    if (item.type === "criterion") {
      onUpdateCriterionWeight(item.id, newWeight);
    } else if (item.type === "pro" && item.optionId) {
      onUpdateFactorWeight(item.optionId, "pro", item.id, newWeight);
    } else if (item.type === "con" && item.optionId) {
      onUpdateFactorWeight(item.optionId, "con", item.id, newWeight);
    }
  };

  return (
    <div id="weights-manager-view" className="space-y-6 animate-fadeIn">
      {/* Header & Quick Presets */}
      <div className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Personal Importance Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fine-tune the exact leverage of every individual factor. Factors with a 10/10 weight have maximum pull on the Tiebreaker score.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400">Quick Profile:</span>
            <button
              onClick={() => onApplyWeightPreset("balanced")}
              className="px-3 py-1 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-xl border border-white/10 backdrop-blur-md transition-all"
            >
              Balanced
            </button>
            <button
              onClick={() => onApplyWeightPreset("financial")}
              className="px-3 py-1 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl border border-emerald-500/30 backdrop-blur-md transition-all"
            >
              Money
            </button>
            <button
              onClick={() => onApplyWeightPreset("lifestyle")}
              className="px-3 py-1 text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-xl border border-sky-500/30 backdrop-blur-md transition-all"
            >
              Lifestyle
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10">
          <input
            type="text"
            placeholder="Search specific factors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs text-slate-100 bg-white/[0.05] border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-500"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-md transition-all ${
                filterType === "all"
                  ? "bg-indigo-600 text-white border border-indigo-400/40 shadow-md"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              All ({allWeightableItems.length})
            </button>
            <button
              onClick={() => setFilterType("criteria")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-md transition-all ${
                filterType === "criteria"
                  ? "bg-indigo-600 text-white border border-indigo-400/40 shadow-md"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              Criteria
            </button>
            <button
              onClick={() => setFilterType("pros")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-md transition-all ${
                filterType === "pros"
                  ? "bg-emerald-600 text-white border border-emerald-400/40 shadow-md"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              Pros
            </button>
            <button
              onClick={() => setFilterType("cons")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-md transition-all ${
                filterType === "cons"
                  ? "bg-rose-600 text-white border border-rose-400/40 shadow-md"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              Cons
            </button>
          </div>
        </div>
      </div>

      {/* Factors Sliders List */}
      <div className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl divide-y divide-white/10 overflow-hidden">
        {filtered.map((item) => {
          const typeBadgeColor =
            item.type === "criterion"
              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
              : item.type === "pro"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-rose-500/20 text-rose-300 border-rose-500/30";

          return (
            <div
              key={`${item.type}_${item.id}_${item.optionId || ""}`}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="space-y-1 sm:max-w-xl">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${typeBadgeColor}`}>
                    {item.type}
                  </span>
                  {item.optionName && (
                    <span className="text-[11px] font-semibold text-slate-400">
                      • {item.optionName}
                    </span>
                  )}
                  {item.category && (
                    <span className="text-[10px] text-slate-500">
                      ({item.category})
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Slider Controller */}
              <div className="flex items-center gap-3 backdrop-blur-md bg-white/[0.05] p-3 rounded-2xl border border-white/10 self-end sm:self-auto shrink-0 min-w-[240px]">
                <div className="text-left w-24">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight</span>
                  <span className="text-xs font-extrabold text-indigo-300">{item.weight} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={item.weight}
                  onChange={(e) => handleSliderChange(item, Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
