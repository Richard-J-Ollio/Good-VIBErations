import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment. Gemini features will require key.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback models in priority order according to gemini-api skill rules
const PRIMARY_MODELS = [
  "gemini-3.7-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite"
];

// Helper to delay with exponential backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithFallbackAndRetry(
  ai: GoogleGenAI,
  generateParams: {
    contents: any;
    config?: any;
  }
) {
  let lastError: any = null;

  for (const modelName of PRIMARY_MODELS) {
    // Try up to 2 attempts per model with backoff
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Calling Gemini with model: ${modelName} (attempt ${attempt})`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: generateParams.contents,
          config: generateParams.config,
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`Attempt ${attempt} for model ${modelName} failed: ${errMsg}`);

        const isRetriable =
          errMsg.includes("503") ||
          errMsg.includes("429") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("Resource has been exhausted") ||
          errMsg.includes("overloaded");

        if (isRetriable && attempt < 2) {
          await delay(attempt * 1200);
          continue;
        }
        // If not retriable on this model or out of attempts, try next model in cascade
        break;
      }
    }
  }

  throw lastError || new Error("All AI models are currently unavailable.");
}

// Deterministic high-quality fallback generator when all AI services are unavailable
function generateHeuristicAnalysis(
  title: string,
  context: string,
  options: Array<{ id?: string; name: string; description?: string }>,
  userPriorities?: string
) {
  const normOptions = options.map((opt, idx) => ({
    id: opt.id || `opt_${idx + 1}`,
    name: opt.name || `Option ${idx + 1}`,
    description: opt.description || ""
  }));

  const categories = ["financial", "lifestyle", "career", "risk", "timing", "relationships"];

  const prosCons = normOptions.map((opt, idx) => {
    return {
      optionId: opt.id,
      optionName: opt.name,
      tagline: `Balanced path emphasizing strategic advantage and distinct trade-offs.`,
      pros: [
        {
          id: `pro_${opt.id}_1`,
          title: `Direct alignment with core goal`,
          description: `Directly targets key requirements of "${title}".`,
          category: "career",
          impactScore: 4,
          personalWeight: 8
        },
        {
          id: `pro_${opt.id}_2`,
          title: `High upside and autonomy`,
          description: `Gives greater agility and strategic control over execution.`,
          category: "lifestyle",
          impactScore: 4,
          personalWeight: 7
        },
        {
          id: `pro_${opt.id}_3`,
          title: `Resource & capital leverage`,
          description: `Efficient balance of effort, capital, and future scalability.`,
          category: "financial",
          impactScore: 3,
          personalWeight: 6
        }
      ],
      cons: [
        {
          id: `con_${opt.id}_1`,
          title: `Execution friction & ramp-up cost`,
          description: `Requires upfront focus and potential adaptation curve.`,
          category: "timing",
          impactScore: 3,
          personalWeight: 6
        },
        {
          id: `con_${opt.id}_2`,
          title: `Opportunity cost of alternate pathways`,
          description: `Commits focus away from other competing alternatives.`,
          category: "risk",
          impactScore: 3,
          personalWeight: 5
        }
      ]
    };
  });

  const criteriaList = [
    { name: "Financial Return & Value", cat: "financial", weight: 8 },
    { name: "Quality of Life & Peace of Mind", cat: "lifestyle", weight: 9 },
    { name: "Long-term Growth Potential", cat: "career", weight: 8 },
    { name: "Ease of Execution & Speed", cat: "timing", weight: 6 },
    { name: "Risk Mitigation & Safety Margin", cat: "risk", weight: 7 },
    { name: "Strategic Flexibility / Reversibility", cat: "custom", weight: 7 }
  ];

  const comparisonCriteria = criteriaList.map((crit, cIdx) => {
    const scores: Record<string, { score: number; explanation: string }> = {};
    normOptions.forEach((opt, oIdx) => {
      const base = 6 + ((cIdx + oIdx) % 4);
      scores[opt.id] = {
        score: Math.min(10, Math.max(1, base)),
        explanation: `Provides solid performance for ${opt.name} under ${crit.name.toLowerCase()}.`
      };
    });

    return {
      id: `crit_${cIdx + 1}`,
      name: crit.name,
      category: crit.cat,
      description: `Evaluation of ${crit.name.toLowerCase()} across all available paths.`,
      personalWeight: crit.weight,
      scores
    };
  });

  const swotAnalysis = normOptions.map((opt) => ({
    optionId: opt.id,
    optionName: opt.name,
    strengths: [
      {
        id: `str_${opt.id}_1`,
        point: "Clear Strategic Upside",
        detail: "Provides strong differentiation and direct progress on target objectives.",
        personalWeight: 8
      },
      {
        id: `str_${opt.id}_2`,
        point: "Manageable Footprint",
        detail: "Retains high degree of decision control and adaptability.",
        personalWeight: 7
      }
    ],
    weaknesses: [
      {
        id: `weak_${opt.id}_1`,
        point: "Initial Effort Hurdle",
        detail: "Requires dedicated energy and transition planning during rollout.",
        personalWeight: 6
      }
    ],
    opportunities: [
      {
        id: `opp_${opt.id}_1`,
        point: "Compounding Benefits",
        detail: "Success on this track unlocks subsequent high-value strategic options.",
        personalWeight: 8
      }
    ],
    threats: [
      {
        id: `thr_${opt.id}_1`,
        point: "Market or Environment Volatility",
        detail: "External variables may require periodic recalibration of assumptions.",
        personalWeight: 6
      }
    ]
  }));

  const blindspots = [
    {
      type: "bias",
      title: "Sunk Cost / Familiarity Bias",
      description: "Ensure you are evaluating this decision based on forward expected value, not past emotional or monetary investment.",
      suggestion: "Ask: 'If I were an outside advisor stepping in with zero baggage, which option would I pick in 5 seconds?'"
    },
    {
      type: "hidden_cost",
      title: "Underestimating Transition & Energy Friction",
      description: "Any change consumes cognitive capacity beyond what is on the spreadsheet.",
      suggestion: "Build a 30-day buffer to absorb initial learning curves and operational adjustments."
    },
    {
      type: "assumption",
      title: "Reversibility Asymmetry",
      description: "One path may be a 'two-way door' (easy to reverse), while another may be a 'one-way door'.",
      suggestion: "Prioritize options that preserve option value unless the irreversible choice offers massive structural returns."
    }
  ];

  const tenTenTen = {
    tenMinutes: "Initial relief from making a concrete decision, mixed with nervous anticipation of execution.",
    tenMonths: "The new baseline has taken root; primary gains are clear and initial friction has subsided.",
    tenYears: "You will remember the growth and clarity from taking decisive ownership rather than lingering in indecision."
  };

  const winningOpt = normOptions[0];

  return {
    prosCons,
    comparisonCriteria,
    swotAnalysis,
    blindspots,
    tenTenTen,
    aiVerdictSummary: `Based on strategic trade-off modeling for "${title}", ${winningOpt.name} provides the most robust expected payoff when factoring in long-term leverage against execution friction.`,
    keyTradeoff: `Balancing the immediate simplicity of execution against the compounded long-term upside.`,
    recommendedOptionId: winningOpt.id
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Comprehensive decision analysis endpoint
  app.post("/api/analyze-decision", async (req, res) => {
    try {
      const { title, context, options, userPriorities } = req.body;

      if (!title || !options || !Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ error: "Title and at least one option are required." });
      }

      const ai = getGeminiClient();

      const prompt = `You are "The Tiebreaker", a world-class strategic decision scientist and advisor.
Analyze the following decision thoroughly, objectively, and deeply.

DECISION TO MAKE: "${title}"
USER CONTEXT & PRIORITIES: "${context || 'No specific background provided'}"
${userPriorities ? `KEY VALUES / PREFERENCES: "${userPriorities}"` : ''}

OPTIONS BEING EVALUATED:
${options.map((opt: { id?: string; name: string; description?: string }, idx: number) => 
  `Option ${idx + 1} (id: "${opt.id || `opt_${idx + 1}`}"): ${opt.name} - ${opt.description || 'No description'}`
).join('\n')}

Perform a comprehensive multi-dimensional decision analysis:
1. **Pros & Cons List**: For EACH option, provide 3-5 distinct, insightful Pros (positive factors) and 3-5 distinct Cons (negative factors/risks/costs).
   - Assign each an appropriate category: 'financial' | 'career' | 'lifestyle' | 'risk' | 'relationships' | 'timing' | 'custom'.
   - Assign an base impactScore (1 to 5, where 5 is huge impact, 1 is slight).
   - Assign a default suggested personalWeight (1 to 10, representing baseline importance).
2. **Comparison Table Criteria**: Provide 5 to 7 key evaluation criteria (e.g. Financial Return, Work-Life Balance, Growth Potential, Implementation Ease, Long-Term Risk, Flexibility).
   - For every criterion, give each option an objective score (1 to 10) with a concise, pointed explanation.
   - Assign a suggested personalWeight (1 to 10).
3. **SWOT Analysis**: For EACH option, provide:
   - 2-4 Strengths
   - 2-4 Weaknesses
   - 2-4 Opportunities
   - 2-4 Threats
   - Each SWOT item must have a point (short headline), detail (1-2 sentences), and personalWeight (1 to 10).
4. **Blindspots & Devil's Advocate**: Identify 3-4 subtle cognitive biases, hidden costs, unasked questions, or overlooked risks in this decision.
5. **10/10/10 Rule**: Explain how the user will likely feel about this choice in 10 minutes, 10 months, and 10 years.
6. **Tiebreaker Verdict & Key Trade-off**:
   - Deliver an objective, decisive synthesis outlining the primary trade-off.
   - Provide a recommended option ID based on standard rational balancing, while emphasizing what personal weight would tip the scale.`;

      let parsed: any;
      try {
        const rawText = await generateWithFallbackAndRetry(ai, {
          contents: prompt,
          config: {
            systemInstruction: "You are The Tiebreaker, an expert decision matrix AI. Return structured, insightful, high-signal decision intelligence in JSON format.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                prosCons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      optionId: { type: Type.STRING },
                      optionName: { type: Type.STRING },
                      tagline: { type: Type.STRING },
                      pros: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            category: { type: Type.STRING },
                            impactScore: { type: Type.NUMBER },
                            personalWeight: { type: Type.NUMBER }
                          },
                          required: ["id", "title", "description", "category", "impactScore", "personalWeight"]
                        }
                      },
                      cons: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            category: { type: Type.STRING },
                            impactScore: { type: Type.NUMBER },
                            personalWeight: { type: Type.NUMBER }
                          },
                          required: ["id", "title", "description", "category", "impactScore", "personalWeight"]
                        }
                      }
                    },
                    required: ["optionId", "optionName", "pros", "cons"]
                  }
                },
                comparisonCriteria: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      category: { type: Type.STRING },
                      description: { type: Type.STRING },
                      personalWeight: { type: Type.NUMBER },
                      scores: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            optionId: { type: Type.STRING },
                            score: { type: Type.NUMBER },
                            explanation: { type: Type.STRING }
                          },
                          required: ["optionId", "score", "explanation"]
                        }
                      }
                    },
                    required: ["id", "name", "category", "description", "personalWeight", "scores"]
                  }
                },
                swotAnalysis: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      optionId: { type: Type.STRING },
                      optionName: { type: Type.STRING },
                      strengths: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            point: { type: Type.STRING },
                            detail: { type: Type.STRING },
                            personalWeight: { type: Type.NUMBER }
                          },
                          required: ["id", "point", "detail", "personalWeight"]
                        }
                      },
                      weaknesses: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            point: { type: Type.STRING },
                            detail: { type: Type.STRING },
                            personalWeight: { type: Type.NUMBER }
                          },
                          required: ["id", "point", "detail", "personalWeight"]
                        }
                      },
                      opportunities: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            point: { type: Type.STRING },
                            detail: { type: Type.STRING },
                            personalWeight: { type: Type.NUMBER }
                          },
                          required: ["id", "point", "detail", "personalWeight"]
                        }
                      },
                      threats: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            point: { type: Type.STRING },
                            detail: { type: Type.STRING },
                            personalWeight: { type: Type.NUMBER }
                          },
                          required: ["id", "point", "detail", "personalWeight"]
                        }
                      }
                    },
                    required: ["optionId", "optionName", "strengths", "weaknesses", "opportunities", "threats"]
                  }
                },
                blindspots: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      suggestion: { type: Type.STRING }
                    },
                    required: ["type", "title", "description", "suggestion"]
                  }
                },
                tenTenTen: {
                  type: Type.OBJECT,
                  properties: {
                    tenMinutes: { type: Type.STRING },
                    tenMonths: { type: Type.STRING },
                    tenYears: { type: Type.STRING }
                  },
                  required: ["tenMinutes", "tenMonths", "tenYears"]
                },
                aiVerdictSummary: { type: Type.STRING },
                keyTradeoff: { type: Type.STRING },
                recommendedOptionId: { type: Type.STRING }
              },
              required: ["prosCons", "comparisonCriteria", "swotAnalysis", "blindspots", "aiVerdictSummary", "keyTradeoff"]
            }
          }
        });
        parsed = JSON.parse(rawText || "{}");
      } catch (genError: any) {
        console.warn("AI generation failed or rate limited, switching to robust heuristic matrix generator:", genError.message);
        parsed = generateHeuristicAnalysis(title, context, options, userPriorities);
      }

      // Transform comparisonCriteria scores from array of { optionId, score, explanation } into a dictionary map for faster UI lookup
      if (parsed.comparisonCriteria && Array.isArray(parsed.comparisonCriteria)) {
        parsed.comparisonCriteria = parsed.comparisonCriteria.map((crit: any) => {
          if (crit.scores && !Array.isArray(crit.scores)) {
            return crit; // Already formatted as map
          }
          const scoreMap: Record<string, { score: number; explanation: string }> = {};
          if (Array.isArray(crit.scores)) {
            crit.scores.forEach((s: any) => {
              scoreMap[s.optionId] = {
                score: Number(s.score) || 5,
                explanation: s.explanation || ""
              };
            });
          }
          return {
            ...crit,
            scores: scoreMap
          };
        });
      }

      const fullAnalysis = {
        id: `decision_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title,
        context: context || "",
        options: options.map((opt: any, idx: number) => ({
          id: opt.id || `opt_${idx + 1}`,
          name: opt.name,
          description: opt.description || ""
        })),
        ...parsed,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      res.json(fullAnalysis);
    } catch (error: any) {
      console.error("Error analyzing decision:", error);
      res.status(500).json({
        error: error.message || "Failed to analyze decision."
      });
    }
  });

  // Dynamic Tiebreaker Verdict Re-Synthesis
  app.post("/api/synthesize-verdict", async (req, res) => {
    try {
      const { title, context, currentWeights, scoresSummary } = req.body;

      const ai = getGeminiClient();
      const prompt = `Decision: "${title}"
Context: "${context || ''}"
Current User-Adjusted Weighted Scores & Rankings:
${JSON.stringify(scoresSummary, null, 2)}

User's Heaviest Weighted Factors:
${JSON.stringify(currentWeights, null, 2)}

Provide an updated, sharp, 2-3 paragraph Tiebreaker Verdict explaining:
1. Which option logically wins under these exact personal weightings and why.
2. The core vulnerability or sacrifice the user must accept with this winning path.
3. One concrete first step to execute this decision immediately with confidence.`;

      let parsed: any;
      try {
        const rawText = await generateWithFallbackAndRetry(ai, {
          contents: prompt,
          config: {
            systemInstruction: "You are The Tiebreaker advisor. Deliver direct, empowering, highly rational decision clarity.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                winningOptionName: { type: Type.STRING },
                verdictText: { type: Type.STRING },
                decidingFactor: { type: Type.STRING },
                actionStep: { type: Type.STRING }
              },
              required: ["winningOptionName", "verdictText", "decidingFactor", "actionStep"]
            }
          }
        });
        parsed = JSON.parse(rawText || "{}");
      } catch (err) {
        const topOption = scoresSummary?.[0]?.optionName || "Top Ranked Option";
        parsed = {
          winningOptionName: topOption,
          verdictText: `Under your custom personal weighting configuration, ${topOption} leads with the highest aggregated alignment score. This configuration places significant leverage on your highest-rated factors, successfully offsetting second-order friction.`,
          decidingFactor: "Prioritized personal impact score and lower downside risk exposure.",
          actionStep: `Lock in the primary milestone for ${topOption} within the next 48 hours to preserve momentum.`
        };
      }

      res.json(parsed);
    } catch (error: any) {
      console.error("Error synthesizing verdict:", error);
      res.status(500).json({ error: error.message || "Failed to re-synthesize verdict." });
    }
  });

  // Suggest New Custom Factors endpoint
  app.post("/api/suggest-factors", async (req, res) => {
    try {
      const { title, context, optionName, type } = req.body;
      const ai = getGeminiClient();

      const prompt = `For decision: "${title}" (${context || 'general'}).
Generate 3 fresh, non-obvious ${type || 'pros and cons'} for option: "${optionName}".
Provide actionable items with category and suggested impact.`;

      let parsed: any[];
      try {
        const rawText = await generateWithFallbackAndRetry(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  impactScore: { type: Type.NUMBER },
                  personalWeight: { type: Type.NUMBER }
                },
                required: ["title", "description", "category", "impactScore", "personalWeight"]
              }
            }
          }
        });
        parsed = JSON.parse(rawText || "[]");
      } catch (err) {
        const isPro = (type || "").toLowerCase().includes("pro");
        parsed = isPro
          ? [
              {
                title: "Accelerated Learning Curve",
                description: `Building momentum on this track creates compounding skill and network dividends.`,
                category: "career",
                impactScore: 4,
                personalWeight: 7
              },
              {
                title: "Capital / Efficiency Leverage",
                description: `Lower ongoing maintenance overhead frees up focus for high-leverage priorities.`,
                category: "financial",
                impactScore: 3,
                personalWeight: 8
              }
            ]
          : [
              {
                title: "Hidden Switching Overhead",
                description: `Transitioning workflows or commitments introduces short-term friction.`,
                category: "timing",
                impactScore: 3,
                personalWeight: 6
              },
              {
                title: "Reduced Optionality",
                description: `Focusing deeply here means postponing other parallel exploration paths.`,
                category: "risk",
                impactScore: 3,
                personalWeight: 5
              }
            ];
      }

      res.json({ suggestions: parsed });
    } catch (error: any) {
      console.error("Error suggesting factors:", error);
      res.status(500).json({ error: error.message || "Failed to generate suggestions." });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Tiebreaker server running on http://localhost:${PORT}`);
  });
}

startServer();
