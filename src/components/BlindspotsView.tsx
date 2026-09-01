import React from "react";
import { Eye, AlertTriangle, HelpCircle, ShieldAlert, CheckCircle2, Compass } from "lucide-react";
import { BlindspotInsight, DecisionAnalysis } from "../types";

interface BlindspotsViewProps {
  analysis: DecisionAnalysis;
}

export const BlindspotsView: React.FC<BlindspotsViewProps> = ({ analysis }) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case "bias":
        return <Eye className="w-5 h-5 text-purple-600" />;
      case "risk":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "assumption":
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-sky-600" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "bias":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "risk":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "assumption":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-sky-50 text-sky-800 border-sky-200";
    }
  };

  return (
    <div id="blindspots-view" className="space-y-6 animate-fadeIn">
      {/* Intro Box */}
      <div className="backdrop-blur-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/70 to-purple-950/60 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          The Devil's Advocate & Risk Auditor
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display mb-2">
          Cognitive Blindspots & Hidden Assumptions
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          High-stakes decisions often fail not from lack of data, but from subconscious cognitive biases, wishful thinking, or unexamined assumptions. Review these audit points before locking your choice.
        </p>
      </div>

      {/* Blindspot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {analysis.blindspots?.map((spot, idx) => (
          <div
            key={idx}
            className="backdrop-blur-2xl bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4 hover:border-indigo-400/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10">
                    {getIconForType(spot.type)}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getBadgeColor(spot.type)}`}>
                    {spot.type}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500">#0{idx + 1}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {spot.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {spot.description}
                </p>
              </div>
            </div>

            {/* Suggested Countermeasure */}
            <div className="p-3.5 backdrop-blur-md bg-white/[0.04] rounded-xl border border-white/10 text-xs space-y-1">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Strategic Counter-Question / Remedy:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {spot.suggestion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
