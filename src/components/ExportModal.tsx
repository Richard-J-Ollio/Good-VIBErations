import React, { useState } from "react";
import { X, Copy, Check, Download, Printer, FileText } from "lucide-react";
import { DecisionAnalysis } from "../types";
import { DecisionOverallMetrics } from "../utils/calculator";

interface ExportModalProps {
  analysis: DecisionAnalysis;
  metrics: DecisionOverallMetrics;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ analysis, metrics, onClose }) => {
  const [copied, setCopied] = useState(false);

  const generateMarkdownReport = () => {
    const winner = metrics.winningOption;
    let md = `# Decision Intelligence Brief: ${analysis.title}\n\n`;
    md += `**Date:** ${new Date(analysis.createdAt).toLocaleDateString()}\n`;
    md += `**Context:** ${analysis.context || "N/A"}\n\n`;
    
    md += `## 🏆 The Tiebreaker Verdict\n`;
    md += `**Winning Choice:** ${winner?.optionName} (Score: ${winner?.overallTiebreakerScore}%)\n\n`;
    md += `${analysis.aiVerdictSummary}\n\n`;
    md += `**Key Trade-off:** ${analysis.keyTradeoff}\n\n`;

    md += `## 📊 Standings Breakdown\n`;
    metrics.optionsMetrics.forEach((m) => {
      md += `- **#${m.rank} ${m.optionName}**: ${m.overallTiebreakerScore}% (Criteria Avg: ${m.comparisonWeightedAvg}/10, Net Pros/Cons: ${m.netProsConsScore > 0 ? `+${m.netProsConsScore}` : m.netProsConsScore})\n`;
    });
    md += `\n`;

    md += `## ⚖️ Pros & Cons Breakdown\n`;
    analysis.prosCons?.forEach((pc) => {
      md += `### ${pc.optionName}\n`;
      md += `**Pros:**\n`;
      pc.pros?.forEach((p) => {
        md += `- [Weight: ${p.personalWeight}/10] **${p.title}**: ${p.description}\n`;
      });
      md += `**Cons:**\n`;
      pc.cons?.forEach((c) => {
        md += `- [Weight: ${c.personalWeight}/10] **${c.title}**: ${c.description}\n`;
      });
      md += `\n`;
    });

    md += `## 🔍 Key Comparison Criteria\n`;
    analysis.comparisonCriteria?.forEach((crit) => {
      md += `### ${crit.name} (Personal Weight: ${crit.personalWeight}/10)\n`;
      analysis.options.forEach((opt) => {
        const sc = crit.scores[opt.id];
        md += `- **${opt.name}**: ${sc?.score || 5}/10 — ${sc?.explanation || ''}\n`;
      });
      md += `\n`;
    });

    md += `## 🛡️ SWOT Analysis Highlights\n`;
    analysis.swotAnalysis?.forEach((swot) => {
      md += `### ${swot.optionName}\n`;
      md += `- **Strengths:** ${swot.strengths?.map((s) => s.point).join("; ")}\n`;
      md += `- **Weaknesses:** ${swot.weaknesses?.map((w) => w.point).join("; ")}\n`;
      md += `- **Opportunities:** ${swot.opportunities?.map((o) => o.point).join("; ")}\n`;
      md += `- **Threats:** ${swot.threats?.map((t) => t.point).join("; ")}\n\n`;
    });

    if (analysis.blindspots?.length) {
      md += `## 👁️ Blindspots & Devil's Advocate\n`;
      analysis.blindspots.forEach((b, i) => {
        md += `${i + 1}. **${b.title}** (${b.type}): ${b.description}\n   *Mitigation:* ${b.suggestion}\n\n`;
      });
    }

    return md;
  };

  const handleCopyMarkdown = () => {
    const text = generateMarkdownReport();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify({ analysis, metrics }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tiebreaker-${analysis.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="backdrop-blur-2xl bg-slate-900/90 w-full max-w-3xl rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-display">
              Export Decision Brief & Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Preview */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs text-slate-300">
            Share this strategic decision brief with teammates, mentors, or archive it for future reflection.
          </p>

          <pre className="p-4 bg-black/40 border border-white/10 text-slate-200 rounded-2xl text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-96 leading-relaxed">
            {generateMarkdownReport()}
          </pre>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-white/[0.03] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 shadow-md transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Copied Markdown!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  Copy Markdown
                </>
              )}
            </button>

            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 shadow-md transition-all"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Download JSON
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md border border-indigo-400/40 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
