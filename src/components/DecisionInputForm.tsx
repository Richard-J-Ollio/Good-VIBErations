import React, { useState } from "react";
import { Sparkles, Plus, Trash2, ArrowRight, Lightbulb, Compass, Scale, CheckCircle2 } from "lucide-react";
import { DECISION_PRESETS } from "../data/presets";
import { DecisionPreset } from "../types";

interface DecisionInputFormProps {
  onSubmit: (data: {
    title: string;
    context: string;
    options: Array<{ id: string; name: string; description: string }>;
    userPriorities?: string;
  }) => void;
  isLoading: boolean;
}

export const DecisionInputForm: React.FC<DecisionInputFormProps> = ({ onSubmit, isLoading }) => {
  const [decisionType, setDecisionType] = useState<"multi" | "binary">("multi");
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [userPriorities, setUserPriorities] = useState("");
  
  const [options, setOptions] = useState<Array<{ id: string; name: string; description: string }>>([
    { id: "opt_1", name: "Option A", description: "" },
    { id: "opt_2", name: "Option B", description: "" }
  ]);

  const handleDecisionTypeChange = (type: "multi" | "binary") => {
    setDecisionType(type);
    if (type === "binary") {
      setOptions([
        { id: "opt_yes", name: "Yes, Do It / Proceed", description: "Take the leap and embrace the change" },
        { id: "opt_no", name: "No, Pass / Maintain Status Quo", description: "Stay the current course or seek alternative" }
      ]);
    } else {
      setOptions([
        { id: "opt_1", name: "Option A", description: "" },
        { id: "opt_2", name: "Option B", description: "" }
      ]);
    }
  };

  const handleAddOption = () => {
    if (options.length >= 5) return;
    const nextIdx = options.length + 1;
    setOptions([
      ...options,
      { id: `opt_${Date.now()}`, name: `Option ${String.fromCharCode(64 + nextIdx)}`, description: "" }
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, idx) => idx !== index);
    setOptions(updated);
  };

  const handleOptionChange = (index: number, field: "name" | "description", val: string) => {
    const updated = [...options];
    updated[index][field] = val;
    setOptions(updated);
  };

  const handleSelectPreset = (preset: DecisionPreset) => {
    setTitle(preset.title);
    setContext(preset.context);
    setDecisionType("multi");
    setOptions(
      preset.options.map((opt, i) => ({
        id: `opt_${i + 1}`,
        name: opt.name,
        description: opt.description
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Ensure all options have valid names
    const cleanedOptions = options.map((opt, idx) => ({
      ...opt,
      name: opt.name.trim() || `Option ${idx + 1}`
    }));

    onSubmit({
      title: title.trim(),
      context: context.trim(),
      userPriorities: userPriorities.trim(),
      options: cleanedOptions
    });
  };

  return (
    <div id="decision-input-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Intro Hero Box */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3 shadow-lg">
          <Scale className="w-4 h-4 text-indigo-400" />
          Rational Decision Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 font-display">
          Break the Deadlock with <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">The Tiebreaker</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Input any complex choice. AI builds multi-criteria comparison tables, weighted pros & cons, and SWOT matrices tailored to your personal priorities.
        </p>
      </div>

      {/* Preset Quick Chips */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl p-5 border border-white/10 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-3">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Quick Decision Templates (Try One Click):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DECISION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-left px-4 py-3 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-indigo-400/50 hover:bg-white/[0.08] transition-all flex items-start justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">
                  {preset.category}
                </span>
                <span className="text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-white">
                  {preset.title}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-300 shrink-0 ml-2 mt-1 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Primary Input Card */}
      <form onSubmit={handleSubmit} className="backdrop-blur-2xl bg-white/[0.05] rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Decision Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <label htmlFor="decision-mode-select" className="text-sm font-semibold text-white block">
              Decision Structure
            </label>
            <span className="text-xs text-slate-400">Choose between comparing multiple options or a Go/No-Go binary choice.</span>
          </div>
          <div id="decision-mode-select" className="flex p-1 bg-white/[0.06] rounded-xl border border-white/10 self-start sm:self-auto backdrop-blur-md">
            <button
              type="button"
              onClick={() => handleDecisionTypeChange("multi")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                decisionType === "multi"
                  ? "bg-indigo-600 text-white shadow-md border border-indigo-400/40"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Multi-Option Comparison
            </button>
            <button
              type="button"
              onClick={() => handleDecisionTypeChange("binary")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                decisionType === "binary"
                  ? "bg-indigo-600 text-white shadow-md border border-indigo-400/40"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Binary Choice (Yes / No)
            </button>
          </div>
        </div>

        {/* Decision Title Input */}
        <div>
          <label htmlFor="decision-title-input" className="block text-sm font-semibold text-slate-200 mb-2">
            What is the decision you need to make? <span className="text-amber-400">*</span>
          </label>
          <input
            id="decision-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Should I accept the senior role at Acme Corp or stay at TechFlow?"
            className="w-full px-4 py-3 text-sm sm:text-base text-slate-100 bg-white/[0.05] border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder:text-slate-500 backdrop-blur-md"
          />
        </div>

        {/* Options List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-semibold text-slate-200 block">
                Options to Compare ({options.length})
              </label>
              <span className="text-xs text-slate-400">Provide the distinct paths you are weighing.</span>
            </div>
            {decisionType === "multi" && options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 px-3 py-1.5 rounded-xl transition-all border border-indigo-500/40 backdrop-blur-md"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                Add Another Option
              </button>
            )}
          </div>

          <div className="space-y-3">
            {options.map((option, index) => (
              <div
                key={option.id || index}
                className="p-3.5 backdrop-blur-md bg-white/[0.04] rounded-xl border border-white/10 flex flex-col sm:flex-row gap-2.5 sm:items-center hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-2 sm:w-1/3 shrink-0">
                  <span className="w-6 h-6 rounded-md bg-white/10 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 border border-white/10">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    required
                    value={option.name}
                    onChange={(e) => handleOptionChange(index, "name", e.target.value)}
                    placeholder={`Option ${index + 1} Name`}
                    className="w-full px-3 py-1.5 text-sm font-medium text-slate-100 bg-white/[0.06] border border-white/15 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-500"
                  />
                </div>
                <input
                  type="text"
                  value={option.description}
                  onChange={(e) => handleOptionChange(index, "description", e.target.value)}
                  placeholder="Key details (salary, location, terms, prospected upside...)"
                  className="flex-1 px-3 py-1.5 text-xs text-slate-200 bg-white/[0.06] border border-white/15 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-500"
                />
                {decisionType === "multi" && options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors self-end sm:self-center"
                    title="Remove this option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Context & Personal Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="decision-context-input" className="block text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1.5">
              Background Context & Constraints
            </label>
            <textarea
              id="decision-context-input"
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. 5-year career horizon, need flexibility for family, risk tolerance is moderate..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-100 bg-white/[0.05] border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-500 backdrop-blur-md"
            />
          </div>
          <div>
            <label htmlFor="decision-priorities-input" className="block text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1.5">
              Personal Importance / What Matters Most
            </label>
            <textarea
              id="decision-priorities-input"
              rows={3}
              value={userPriorities}
              onChange={(e) => setUserPriorities(e.target.value)}
              placeholder="e.g. I care intensely about mental peace and low commute, compensation is secondary..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-100 bg-white/[0.05] border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-500 backdrop-blur-md"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Full Pros & Cons, Comparison Table, SWOT & Weight Adjusters generated automatically</span>
          </div>
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/30 border border-indigo-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-98"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-indigo-200" />
                Analyzing Trade-offs & Building Matrix...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Run The Tiebreaker
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
