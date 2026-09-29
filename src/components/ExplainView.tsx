import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  BookOpen,
  ListOrdered,
  FlaskConical,
  Key,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api, ExplanationResponse } from '../services/api';
import { saveActivity } from '../services/storage';

interface ExplainViewProps {
  initialTopic?: string;
  initialData?: ExplanationResponse;
}

export const ExplainView: React.FC<ExplainViewProps> = ({
  initialTopic = '',
  initialData,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [preference, setPreference] = useState<'simple' | 'detailed' | 'example-based'>('simple');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplanationResponse | null>(initialData || null);
  const [copied, setCopied] = useState(false);

  const sampleTopics = [
    'Photosynthesis',
    'Quantum Entanglement',
    'Supply and Demand Curve',
    'DNA Replication',
    'Recursion in Computer Science',
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = topic.trim();
    if (!clean) {
      setError('Please enter a concept or topic to explain.');
      return;
    }
    if (clean.length > 12000) {
      setError('Topic exceeds the maximum limit of 12,000 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.explainConcept(clean, level, preference);
      setResult(res);
      saveActivity({
        type: 'explain',
        title: clean,
        summaryText:
          res.sections?.definition ||
          res.answer.slice(0, 120) + '...',
        data: { topic: clean, result: res },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate concept explanation.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.answer) return;
    try {
      await navigator.clipboard.writeText(result.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explain a Concept
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Understand complex topics through simple, step-by-step explanations.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Topic input */}
          <div>
            <label
              htmlFor="topic-input"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2"
            >
              Topic or Concept
            </label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Example: Photosynthesis, Blockchain, Black Holes, Inflation..."
              className="w-full px-4 py-3 text-slate-900 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-sm"
              disabled={loading}
            />
          </div>

          {/* Sample Topic Chips */}
          <div>
            <span className="text-xs text-slate-500 block mb-1.5 font-medium">
              Popular topics to explore:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTopics.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopic(t);
                    setError(null);
                  }}
                  className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Controls: Level & Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Learning Level */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
                Learning Level
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-2 text-xs font-medium capitalize rounded-lg transition-all ${
                      level === lvl
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation Preference */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
                Explanation Style
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: 'simple' as const, label: 'Simple' },
                  { id: 'detailed' as const, label: 'Detailed' },
                  { id: 'example-based' as const, label: 'Examples' },
                ].map((pref) => (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => setPreference(pref.id)}
                    className={`py-2 text-xs font-medium rounded-lg transition-all ${
                      preference === pref.id
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {pref.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>EduGenie is thinking...</span>
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4" />
                  <span>Explain This</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Explanation Error</h4>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
          <button
            onClick={() => handleSubmit()}
            className="text-xs font-semibold text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="p-6 bg-white rounded-2xl border border-slate-200">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
            <div className="h-3.5 bg-slate-200 rounded w-full mb-2" />
            <div className="h-3.5 bg-slate-200 rounded w-3/4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-32 bg-white rounded-2xl border border-slate-200 p-6" />
            <div className="h-32 bg-white rounded-2xl border border-slate-200 p-6" />
          </div>
        </div>
      )}

      {/* Output 7 Sections Cards */}
      {!loading && result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                7-Step Conceptual Breakdown
              </span>
              <h2 className="text-lg font-bold text-slate-900">{topic}</h2>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Notes</span>
                </>
              )}
            </button>
          </div>

          {result.sections ? (
            <div className="space-y-4">
              {/* 1. Simple Definition */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-indigo-700">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    1. Simple Definition
                  </h3>
                </div>
                <p className="text-base text-slate-800 leading-relaxed font-medium">
                  {result.sections.definition}
                </p>
              </div>

              {/* 2. Core Concept */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-amber-700">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    2. Core Concept
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {result.sections.coreConcept}
                </p>
              </div>

              {/* 3. Step-by-Step Explanation */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-sky-700">
                  <ListOrdered className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    3. Step-by-Step Explanation
                  </h3>
                </div>
                <div className="space-y-3">
                  {result.sections.stepByStep.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-100">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-700 pt-0.5 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Practical Example */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                  <FlaskConical className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    4. Practical Example
                  </h3>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-4 text-sm text-slate-800 leading-relaxed">
                  {result.sections.practicalExample}
                </div>
              </div>

              {/* 5. Important Points & 6. Common Mistakes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 5. Important Points */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-3 text-purple-700">
                    <Key className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      5. Important Points
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {result.sections.importantPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 6. Common Mistakes */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-3 text-rose-700">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      6. Common Mistakes
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {result.sections.commonMistakes.map((mis, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                        <span>{mis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 7. Quick Recap */}
              <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-indigo-200">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    7. Quick Recap
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-indigo-50 leading-relaxed font-medium">
                  {result.sections.quickRecap}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {result.answer}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !result && !error && (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white/50">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Let's make this concept easier.</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Your AI-generated result will appear here. Enter any topic or concept above to see the 7-step breakdown.
          </p>
        </div>
      )}
    </div>
  );
};
