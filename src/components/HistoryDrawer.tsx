import React from "react";
import { X, Clock, Trash2, ArrowRight, Bookmark } from "lucide-react";
import { DecisionAnalysis } from "../types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionAnalysis[];
  onSelectDecision: (decision: DecisionAnalysis) => void;
  onDeleteDecision: (id: string, e: React.MouseEvent) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md backdrop-blur-2xl bg-slate-900/95 shadow-2xl border-l border-white/15 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Bookmark className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white font-display">
                Saved Decisions ({savedDecisions.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="p-5 overflow-y-auto flex-1 space-y-3">
            {savedDecisions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs text-slate-300">No saved decision matrices yet.</p>
                <p className="text-[11px] text-slate-500">Click "Save Matrix" on any decision to access it later.</p>
              </div>
            ) : (
              savedDecisions.map((dec) => (
                <div
                  key={dec.id}
                  onClick={() => {
                    onSelectDecision(dec);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-white/10 hover:border-indigo-400/40 hover:bg-white/[0.07] bg-white/[0.03] backdrop-blur-md transition-all cursor-pointer group space-y-2 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 line-clamp-2 transition-colors">
                      {dec.title}
                    </h4>
                    <button
                      onClick={(e) => onDeleteDecision(dec.id, e)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                      title="Delete saved decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
                    <span>{new Date(dec.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      Load Matrix <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
