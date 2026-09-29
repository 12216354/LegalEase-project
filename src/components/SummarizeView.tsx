import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  List,
  Tag,
  Info,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api, SummaryResponse } from '../services/api';
import { saveActivity } from '../services/storage';

interface SummarizeViewProps {
  initialText?: string;
  initialData?: SummaryResponse;
}

export const SummarizeView: React.FC<SummarizeViewProps> = ({
  initialText = '',
  initialData,
}) => {
  const [text, setText] = useState(initialText);
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResponse | null>(initialData || null);
  const [copied, setCopied] = useState(false);

  const samplePassages = [
    {
      title: 'Mitochondria & Cellular Respiration',
      snippet:
        'Cellular respiration is a metabolic pathway that breaks down glucose and produces ATP. The stages of cellular respiration include glycolysis, pyruvate oxidation, the citric acid or Krebs cycle, and oxidative phosphorylation. Glycolysis occurs in the cytosol, while the subsequent reactions happen inside the mitochondrion. During oxidative phosphorylation, electrons move down the electron transport chain, generating a proton gradient across the inner mitochondrial membrane that drives ATP synthesis via ATP synthase.',
    },
    {
      title: 'The Industrial Revolution',
      snippet:
        'The Industrial Revolution was the transition to new manufacturing processes in Great Britain, continental Europe, and the United States, that occurred during the period from around 1760 to about 1840. This transition included going from hand production methods to machines; new chemical manufacturing and iron production processes; the increasing use of steam power and water power; the development of machine tools and the rise of the mechanized factory system.',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = text.trim();
    if (!clean) {
      setError('Please paste or write study material to summarize.');
      return;
    }
    if (clean.length > 12000) {
      setError('Text exceeds the maximum limit of 12,000 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.summarizeText(clean, length);
      setResult(res);
      saveActivity({
        type: 'summarize',
        title: clean.slice(0, 60) + '...',
        summaryText: res.sections?.mainIdea || res.summary.slice(0, 120),
        data: { text: clean, length, result: res },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to summarize your text.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.summary) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Summarize Your Study Material
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Paste your notes, article, or study material and get the important points.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="summarize-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Study Material / Notes
              </label>
              <span
                className={`text-xs ${
                  text.length > 11500 ? 'text-amber-600 font-bold' : 'text-slate-400'
                }`}
              >
                {text.length.toLocaleString()} / 12,000
              </span>
            </div>

            <textarea
              id="summarize-input"
              rows={6}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste your study material here..."
              className="w-full px-4 py-3 text-slate-900 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-sm leading-relaxed resize-y"
              disabled={loading}
            />
          </div>

          {/* Quick sample insertion */}
          <div>
            <span className="text-xs text-slate-500 block mb-1.5 font-medium">
              Or test with sample study notes:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePassages.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setText(p.snippet);
                    setError(null);
                  }}
                  className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium text-left"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Length Selector and Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Summary Length:
              </span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                {(['short', 'medium', 'detailed'] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setLength(len)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize rounded-lg transition-all ${
                      length === len
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                disabled={loading || (!text && !result)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Summarize</span>
                  </>
                )}
              </button>
            </div>
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
            <h4 className="font-semibold">Summarization Error</h4>
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="h-20 bg-slate-100 rounded-xl" />
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
        </div>
      )}

      {/* Structured Output Cards */}
      {!loading && result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                Key Points & Revision Card
              </span>
              <h2 className="text-base font-bold text-slate-900">Study Summary</h2>
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
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>

          {result.sections ? (
            <div className="space-y-4">
              {/* 1. Main Idea */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-sky-700">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Main Idea</h3>
                </div>
                <p className="text-base text-slate-800 leading-relaxed font-medium">
                  {result.sections.mainIdea}
                </p>
              </div>

              {/* 2. Key Points */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-indigo-700">
                  <List className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Key Points</h3>
                </div>
                <ul className="space-y-2.5">
                  {result.sections.keyPoints.map((kp, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Important Terms Glossary & 4. Important Facts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Terms */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-3 text-purple-700">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Important Terms
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {result.sections.importantTerms.map((termObj, idx) => (
                      <div key={idx} className="text-xs sm:text-sm">
                        <span className="font-bold text-slate-900">{termObj.term}: </span>
                        <span className="text-slate-600 leading-relaxed">
                          {termObj.definition}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facts */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-3 text-emerald-700">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Important Facts & Data
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {result.sections.importantFacts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                        <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 5. Quick Revision Summary */}
              <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-sky-200">
                  <Clock className="w-4 h-4 text-sky-300" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Quick Revision Summary
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-sky-50 leading-relaxed font-medium">
                  {result.sections.quickRevision}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {result.summary}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !result && !error && (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white/50">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">
            Turn your notes into quick revision material.
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Your AI-generated summary will appear here. Paste any study notes or chapter text above.
          </p>
        </div>
      )}
    </div>
  );
};
