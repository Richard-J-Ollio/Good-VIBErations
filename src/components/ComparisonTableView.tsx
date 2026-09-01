import React, { useState } from "react";
import { Plus, Trash2, Sliders, Info, Edit3, Check, Star } from "lucide-react";
import { ComparisonCriterion, DecisionAnalysis } from "../types";
import { DecisionOverallMetrics } from "../utils/calculator";

interface ComparisonTableViewProps {
  analysis: DecisionAnalysis;
  metrics: DecisionOverallMetrics;
  onUpdateCriterionWeight: (criterionId: string, newWeight: number) => void;
  onUpdateCriterionScore: (criterionId: string, optionId: string, newScore: number) => void;
  onAddCriterion: (criterion: Omit<ComparisonCriterion, "id">) => void;
  onRemoveCriterion: (criterionId: string) => void;
}

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({
  analysis,
  metrics,
  onUpdateCriterionWeight,
  onUpdateCriterionScore,
  onAddCriterion,
  onRemoveCriterion
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Strategic Fit");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState(7);
  const [optionScores, setOptionScores] = useState<Record<string, number>>({});

  const handleOpenAdd = () => {
    const initialScores: Record<string, number> = {};
    analysis.options.forEach((opt) => {
      initialScores[opt.id] = 5;
    });
    setOptionScores(initialScores);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const scoresMap: Record<string, { score: number; explanation: string }> = {};
    analysis.options.forEach((opt) => {
      scoresMap[opt.id] = {
        score: optionScores[opt.id] || 5,
        explanation: "User added criterion"
      };
    });

    onAddCriterion({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      personalWeight: weight,
      scores: scoresMap,
      isUserAdded: true
    });

    setName("");
    setDescription("");
    setIsAdding(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "backdrop-blur-md bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    if (score >= 6) return "backdrop-blur-md bg-sky-500/20 text-sky-300 border-sky-500/40";
    if (score >= 4) return "backdrop-blur-md bg-amber-500/20 text-amber-300 border-amber-500/40";
    return "backdrop-blur-md bg-rose-500/20 text-rose-300 border-rose-500/40";
  };

  return (
    <div id="comparison-table-view" className="space-y-6 animate-fadeIn">
      {/* Table Header Card */}
      <div className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-display">
            Multi-Option Comparison Table
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side criteria evaluation. Adjust personal importance weights to see real-time weighted scoring.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600/80 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all border border-indigo-400/40 backdrop-blur-md shadow-lg shadow-indigo-500/20 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Criterion
          </button>
        )}
      </div>

      {/* Inline Add Modal/Card */}
      {isAdding && (
        <div className="backdrop-blur-2xl bg-white/[0.06] rounded-2xl sm:rounded-3xl border border-indigo-500/30 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Add New Comparison Criterion</h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Criterion Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Remote Flexibility, Equity Ceiling..."
                className="w-full px-3 py-1.5 text-xs text-slate-100 bg-white/[0.05] border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Lifestyle, Compensation"
                className="w-full px-3 py-1.5 text-xs text-slate-100 bg-white/[0.05] border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Personal Importance Weight: {weight}/10
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
              Initial Scores (1 = Terrible, 10 = Outstanding):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {analysis.options.map((opt) => (
                <div key={opt.id} className="p-3 backdrop-blur-md bg-white/[0.04] border border-white/10 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span>{opt.name}</span>
                    <span className="font-bold text-indigo-400">{optionScores[opt.id] ?? 5}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={optionScores[opt.id] ?? 5}
                    onChange={(e) =>
                      setOptionScores({
                        ...optionScores,
                        [opt.id]: Number(e.target.value)
                      })
                    }
                    className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50 border border-indigo-400/30 shadow-md"
            >
              Save Criterion
            </button>
          </div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      <div className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="backdrop-blur-xl bg-white/[0.06] border-b border-white/10">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-300 w-1/3 min-w-[220px]">
                  Evaluation Criterion & Weight
                </th>
                {analysis.options.map((opt) => {
                  const optMetric = metrics.optionsMetrics.find((m) => m.optionId === opt.id);
                  return (
                    <th key={opt.id} className="p-4 text-xs font-bold text-white min-w-[200px] border-l border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-sm line-clamp-1">{opt.name}</span>
                        {optMetric?.isLeader && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold shrink-0 shadow-md">
                            Leader
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                        Weighted Avg: <span className="font-bold text-indigo-300">{optMetric?.comparisonWeightedAvg}/10</span>
                      </div>
                    </th>
                  );
                })}
                <th className="p-4 text-xs font-bold uppercase text-slate-400 w-12 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {analysis.comparisonCriteria.map((crit) => (
                <tr key={crit.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Criterion Info & Personal Weight Slider */}
                  <td className="p-4 align-top space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {crit.name}
                      </span>
                      {crit.category && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-slate-300 border border-white/10">
                          {crit.category}
                        </span>
                      )}
                    </div>
                    {crit.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {crit.description}
                      </p>
                    )}

                    {/* Personal Weight Slider on table row */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold text-indigo-300 whitespace-nowrap">
                        Weight: <span className="text-indigo-400">{crit.personalWeight}/10</span>
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={crit.personalWeight}
                        onChange={(e) => onUpdateCriterionWeight(crit.id, Number(e.target.value))}
                        className="w-28 accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        title="Adjust importance weight of this criterion"
                      />
                    </div>
                  </td>

                  {/* Option Scores & Explanations */}
                  {analysis.options.map((opt) => {
                    const scoreObj = crit.scores[opt.id] || { score: 5, explanation: "" };
                    return (
                      <td key={opt.id} className="p-4 align-top border-l border-white/10 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${getScoreColor(scoreObj.score)}`}>
                            {scoreObj.score} / 10
                          </div>

                          {/* Quick Score Adjuster */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onUpdateCriterionScore(crit.id, opt.id, Math.max(1, scoreObj.score - 1))}
                              className="w-5 h-5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center justify-center transition-colors border border-white/10"
                              title="Decrease score"
                            >
                              -
                            </button>
                            <button
                              onClick={() => onUpdateCriterionScore(crit.id, opt.id, Math.min(10, scoreObj.score + 1))}
                              className="w-5 h-5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center justify-center transition-colors border border-white/10"
                              title="Increase score"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {scoreObj.explanation && (
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {scoreObj.explanation}
                          </p>
                        )}
                      </td>
                    );
                  })}

                  {/* Remove Button */}
                  <td className="p-4 align-top text-center">
                    <button
                      onClick={() => onRemoveCriterion(crit.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete criterion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
