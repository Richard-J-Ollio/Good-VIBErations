import React, { useState } from "react";
import { 
  ShieldCheck, 
  AlertOctagon, 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Sliders,
  HelpCircle
} from "lucide-react";
import { DecisionAnalysis, OptionSwot, SwotItem } from "../types";

interface SwotViewProps {
  analysis: DecisionAnalysis;
  onUpdateSwotWeight: (
    optionId: string,
    quadrant: "strengths" | "weaknesses" | "opportunities" | "threats",
    itemId: string,
    newWeight: number
  ) => void;
  onAddSwotItem: (
    optionId: string,
    quadrant: "strengths" | "weaknesses" | "opportunities" | "threats",
    item: Omit<SwotItem, "id">
  ) => void;
  onRemoveSwotItem: (
    optionId: string,
    quadrant: "strengths" | "weaknesses" | "opportunities" | "threats",
    itemId: string
  ) => void;
}

export const SwotView: React.FC<SwotViewProps> = ({
  analysis,
  onUpdateSwotWeight,
  onAddSwotItem,
  onRemoveSwotItem
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    analysis.options[0]?.id || ""
  );

  const [activeQuadrantForAdd, setActiveQuadrantForAdd] = useState<
    "strengths" | "weaknesses" | "opportunities" | "threats" | null
  >(null);
  const [newPoint, setNewPoint] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [newWeight, setNewWeight] = useState(7);

  const activeOption = analysis.options.find((o) => o.id === selectedOptionId) || analysis.options[0];
  const activeSwot = analysis.swotAnalysis?.find((s) => s.optionId === activeOption?.id);

  const handleSaveItem = () => {
    if (!activeQuadrantForAdd || !newPoint.trim() || !activeOption) return;

    onAddSwotItem(activeOption.id, activeQuadrantForAdd, {
      point: newPoint.trim(),
      detail: newDetail.trim(),
      personalWeight: newWeight,
      isUserAdded: true
    });

    setNewPoint("");
    setNewDetail("");
    setActiveQuadrantForAdd(null);
  };

  return (
    <div id="swot-view" className="space-y-6 animate-fadeIn">
      {/* Option Switcher Header */}
      <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Evaluating SWOT for:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {analysis.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedOptionId(opt.id);
                  setActiveQuadrantForAdd(null);
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

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Internal Capabilities vs External Market Realities
        </div>
      </div>

      {/* Inline Add Modal/Drawer */}
      {activeQuadrantForAdd && (
        <div className="backdrop-blur-2xl bg-white/[0.06] rounded-2xl sm:rounded-3xl border border-indigo-500/30 p-6 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Add Item to {activeQuadrantForAdd.toUpperCase()} ({activeOption.name})
            </h4>
            <button
              onClick={() => setActiveQuadrantForAdd(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Headline / Key point"
              value={newPoint}
              onChange={(e) => setNewPoint(e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-100 bg-white/[0.05] border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-500"
            />
            <input
              type="text"
              placeholder="Context / Supporting detail"
              value={newDetail}
              onChange={(e) => setNewDetail(e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-100 bg-white/[0.05] border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <span className="text-[10px] font-bold text-slate-300">Weight: {newWeight}/10</span>
              <input
                type="range"
                min={1}
                max={10}
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveQuadrantForAdd(null)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                disabled={!newPoint.trim()}
                className="px-3.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50 border border-indigo-400/30 shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2x2 SWOT Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STRENGTHS (Internal, Helpful) */}
        <div className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-emerald-500/30 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-300 font-display">
                  Strengths (Internal)
                </h3>
                <span className="text-[11px] text-slate-400">Core assets, skills & structural advantages</span>
              </div>
            </div>
            <button
              onClick={() => setActiveQuadrantForAdd("strengths")}
              className="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all backdrop-blur-md"
              title="Add Strength"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeSwot?.strengths?.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.point}</h4>
                    {item.detail && (
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        {item.detail}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveSwotItem(activeOption.id, "strengths", item.id)}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                  <span className="text-[10px] font-bold text-emerald-300">
                    Weight: <span className="text-emerald-400">{item.personalWeight}/10</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={item.personalWeight}
                    onChange={(e) =>
                      onUpdateSwotWeight(activeOption.id, "strengths", item.id, Number(e.target.value))
                    }
                    className="w-24 accent-emerald-400 cursor-pointer h-1.5 bg-emerald-950 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WEAKNESSES (Internal, Harmful) */}
        <div className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-amber-500/30 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300 font-display">
                  Weaknesses (Internal)
                </h3>
                <span className="text-[11px] text-slate-400">Internal gaps, vulnerabilities & drawbacks</span>
              </div>
            </div>
            <button
              onClick={() => setActiveQuadrantForAdd("weaknesses")}
              className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all backdrop-blur-md"
              title="Add Weakness"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeSwot?.weaknesses?.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-amber-400/40 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.point}</h4>
                    {item.detail && (
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        {item.detail}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveSwotItem(activeOption.id, "weaknesses", item.id)}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                  <span className="text-[10px] font-bold text-amber-300">
                    Weight: <span className="text-amber-400">{item.personalWeight}/10</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={item.personalWeight}
                    onChange={(e) =>
                      onUpdateSwotWeight(activeOption.id, "weaknesses", item.id, Number(e.target.value))
                    }
                    className="w-24 accent-amber-400 cursor-pointer h-1.5 bg-amber-950 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OPPORTUNITIES (External, Helpful) */}
        <div className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-sky-500/30 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-sky-300 font-display">
                  Opportunities (External)
                </h3>
                <span className="text-[11px] text-slate-400">Market tailwinds, network expansion & upside</span>
              </div>
            </div>
            <button
              onClick={() => setActiveQuadrantForAdd("opportunities")}
              className="p-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-all backdrop-blur-md"
              title="Add Opportunity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeSwot?.opportunities?.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-sky-400/40 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.point}</h4>
                    {item.detail && (
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        {item.detail}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveSwotItem(activeOption.id, "opportunities", item.id)}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                  <span className="text-[10px] font-bold text-sky-300">
                    Weight: <span className="text-sky-400">{item.personalWeight}/10</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={item.personalWeight}
                    onChange={(e) =>
                      onUpdateSwotWeight(activeOption.id, "opportunities", item.id, Number(e.target.value))
                    }
                    className="w-24 accent-sky-400 cursor-pointer h-1.5 bg-sky-950 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* THREATS (External, Harmful) */}
        <div className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-rose-500/30 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-300 font-display">
                  Threats (External)
                </h3>
                <span className="text-[11px] text-slate-400">Macro risks, market shifts & competitive pressure</span>
              </div>
            </div>
            <button
              onClick={() => setActiveQuadrantForAdd("threats")}
              className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all backdrop-blur-md"
              title="Add Threat"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeSwot?.threats?.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-rose-400/40 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.point}</h4>
                    {item.detail && (
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        {item.detail}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveSwotItem(activeOption.id, "threats", item.id)}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                  <span className="text-[10px] font-bold text-rose-300">
                    Weight: <span className="text-rose-400">{item.personalWeight}/10</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={item.personalWeight}
                    onChange={(e) =>
                      onUpdateSwotWeight(activeOption.id, "threats", item.id, Number(e.target.value))
                    }
                    className="w-24 accent-rose-400 cursor-pointer h-1.5 bg-rose-950 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
