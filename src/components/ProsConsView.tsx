import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Tag, 
  TrendingUp, 
  TrendingDown,
  Info,
  Edit2,
  Check
} from "lucide-react";
import { DecisionAnalysis, FactorItem, OptionProsCons } from "../types";

interface ProsConsViewProps {
  analysis: DecisionAnalysis;
  onUpdateFactorWeight: (optionId: string, type: "pro" | "con", factorId: string, newWeight: number) => void;
  onAddFactor: (optionId: string, type: "pro" | "con", factor: Omit<FactorItem, "id">) => void;
  onRemoveFactor: (optionId: string, type: "pro" | "con", factorId: string) => void;
  onSuggestFactors: (optionId: string, optionName: string, type: "pros" | "cons") => Promise<void>;
  isSuggesting: boolean;
}

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  analysis,
  onUpdateFactorWeight,
  onAddFactor,
  onRemoveFactor,
  onSuggestFactors,
  isSuggesting
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    analysis.options[0]?.id || ""
  );

  // New factor input state
  const [isAddingPro, setIsAddingPro] = useState(false);
  const [isAddingCon, setIsAddingCon] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<FactorItem["category"]>("custom");
  const [newImpact, setNewImpact] = useState<number>(3);
  const [newWeight, setNewWeight] = useState<number>(7);

  const activeOption = analysis.options.find((o) => o.id === selectedOptionId) || analysis.options[0];
  const activeProsCons = analysis.prosCons?.find((pc) => pc.optionId === activeOption?.id);

  const handleSaveNewFactor = (type: "pro" | "con") => {
    if (!newTitle.trim() || !activeOption) return;
    onAddFactor(activeOption.id, type, {
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      impactScore: newImpact,
      personalWeight: newWeight,
      isUserAdded: true
    });
    setNewTitle("");
    setNewDescription("");
    setIsAddingPro(false);
    setIsAddingCon(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "financial":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "career":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "lifestyle":
        return "bg-sky-500/20 text-sky-300 border-sky-500/30";
      case "risk":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "relationships":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      default:
        return "bg-white/10 text-slate-300 border-white/10";
    }
  };

  return (
    <div id="pros-cons-view" className="space-y-6 animate-fadeIn">
      {/* Option Selector Switcher */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Option:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {analysis.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedOptionId(opt.id);
                    setIsAddingPro(false);
                    setIsAddingCon(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap backdrop-blur-md transition-all ${
                    selectedOptionId === opt.id
                      ? "bg-indigo-600 text-white shadow-md border border-indigo-400/40"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSuggestFactors(activeOption.id, activeOption.name, "pros")}
              disabled={isSuggesting}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/25 px-3.5 py-1.5 rounded-xl transition-all border border-emerald-500/30 backdrop-blur-md disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              AI More Angles
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Pros & Cons Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PROS COLUMN */}
        <div className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-emerald-500/30 p-6 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-300 font-display">
                  Pros & Upsides ({activeProsCons?.pros?.length || 0})
                </h3>
                <span className="text-xs text-slate-400">Positive drivers & key advantages</span>
              </div>
            </div>

            {!isAddingPro && (
              <button
                onClick={() => {
                  setIsAddingPro(true);
                  setIsAddingCon(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 rounded-xl transition-all border border-emerald-500/40 backdrop-blur-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Pro
              </button>
            )}
          </div>

          {/* Inline Add Pro Form */}
          {isAddingPro && (
            <div className="p-4 rounded-2xl backdrop-blur-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-emerald-300 block">Add Custom Pro:</span>
              <input
                type="text"
                placeholder="Pro title (e.g. Higher equity ceiling)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-100 bg-white/[0.06] border border-white/15 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 placeholder:text-slate-500"
              />
              <textarea
                placeholder="Details or rationale..."
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-100 bg-white/[0.06] border border-white/15 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 placeholder:text-slate-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    Personal Weight: {newWeight}/10
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-emerald-950 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    Category:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-2 py-1 text-xs bg-slate-900 border border-white/15 rounded-md text-slate-200"
                  >
                    <option value="financial">Financial</option>
                    <option value="career">Career / Growth</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="risk">Risk / Safety</option>
                    <option value="relationships">Relationships</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingPro(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNewFactor("pro")}
                  disabled={!newTitle.trim()}
                  className="px-3.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 border border-emerald-400/30 shadow-md"
                >
                  Save Pro
                </button>
              </div>
            </div>
          )}

          {/* Pros List */}
          <div className="space-y-3 flex-1">
            {activeProsCons?.pros?.map((pro) => (
              <div
                key={pro.id}
                className="p-4 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <h4 className="text-sm font-bold text-white">
                        {pro.title}
                      </h4>
                    </div>
                    {pro.description && (
                      <p className="text-xs text-slate-300 leading-relaxed pl-6">
                        {pro.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onRemoveFactor(activeOption.id, "pro", pro.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                    title="Remove factor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Weight & Category Control Bar */}
                <div className="pl-6 pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getCategoryColor(pro.category)}`}>
                      {pro.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Impact: {pro.impactScore}/5
                    </span>
                  </div>

                  {/* Personal Importance Weight Slider */}
                  <div className="flex items-center gap-2 backdrop-blur-md bg-white/[0.06] px-3 py-1 rounded-xl border border-white/10">
                    <span className="text-[11px] font-bold text-emerald-300 whitespace-nowrap">
                      Importance: <span className="text-emerald-400">{pro.personalWeight}/10</span>
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={pro.personalWeight}
                      onChange={(e) =>
                        onUpdateFactorWeight(activeOption.id, "pro", pro.id, Number(e.target.value))
                      }
                      className="w-24 sm:w-28 accent-emerald-400 cursor-pointer h-1.5 bg-emerald-950 rounded-lg"
                      title="Adjust personal weight for this factor"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONS COLUMN */}
        <div className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-rose-500/30 p-6 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-300 font-display">
                  Cons & Drawbacks ({activeProsCons?.cons?.length || 0})
                </h3>
                <span className="text-xs text-slate-400">Risks, friction & trade-offs</span>
              </div>
            </div>

            {!isAddingCon && (
              <button
                onClick={() => {
                  setIsAddingCon(true);
                  setIsAddingPro(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 rounded-xl transition-all border border-rose-500/40 backdrop-blur-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Con
              </button>
            )}
          </div>

          {/* Inline Add Con Form */}
          {isAddingCon && (
            <div className="p-4 rounded-2xl backdrop-blur-xl bg-rose-950/30 border border-rose-500/30 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-rose-300 block">Add Custom Con:</span>
              <input
                type="text"
                placeholder="Con title (e.g. Higher commute friction)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-100 bg-white/[0.06] border border-white/15 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 placeholder:text-slate-500"
              />
              <textarea
                placeholder="Details or rationale..."
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-100 bg-white/[0.06] border border-white/15 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 placeholder:text-slate-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    Personal Weight: {newWeight}/10
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full accent-rose-400 cursor-pointer h-1.5 bg-rose-950 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    Category:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-2 py-1 text-xs bg-slate-900 border border-white/15 rounded-md text-slate-200"
                  >
                    <option value="financial">Financial</option>
                    <option value="career">Career / Growth</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="risk">Risk / Safety</option>
                    <option value="relationships">Relationships</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCon(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNewFactor("con")}
                  disabled={!newTitle.trim()}
                  className="px-3.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg disabled:opacity-50 border border-rose-400/30 shadow-md"
                >
                  Save Con
                </button>
              </div>
            </div>
          )}

          {/* Cons List */}
          <div className="space-y-3 flex-1">
            {activeProsCons?.cons?.map((con) => (
              <div
                key={con.id}
                className="p-4 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-rose-400/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <h4 className="text-sm font-bold text-white">
                        {con.title}
                      </h4>
                    </div>
                    {con.description && (
                      <p className="text-xs text-slate-300 leading-relaxed pl-6">
                        {con.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onRemoveFactor(activeOption.id, "con", con.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                    title="Remove factor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Weight & Category Control Bar */}
                <div className="pl-6 pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getCategoryColor(con.category)}`}>
                      {con.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Severity: {con.impactScore}/5
                    </span>
                  </div>

                  {/* Personal Importance Weight Slider */}
                  <div className="flex items-center gap-2 backdrop-blur-md bg-white/[0.06] px-3 py-1 rounded-xl border border-white/10">
                    <span className="text-[11px] font-bold text-rose-300 whitespace-nowrap">
                      Importance: <span className="text-rose-400">{con.personalWeight}/10</span>
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={con.personalWeight}
                      onChange={(e) =>
                        onUpdateFactorWeight(activeOption.id, "con", con.id, Number(e.target.value))
                      }
                      className="w-24 sm:w-28 accent-rose-400 cursor-pointer h-1.5 bg-rose-950 rounded-lg"
                      title="Adjust personal weight for this factor"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
