import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Send,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { saveActivity } from '../services/storage';

interface QAViewProps {
  initialQuestion?: string;
  initialAnswer?: string;
}

export const QAView: React.FC<QAViewProps> = ({
  initialQuestion = '',
  initialAnswer = '',
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(initialAnswer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    "Explain Newton's laws of motion in simple terms with everyday examples.",
    'Why is mitochondria called the powerhouse of the cell?',
    'What is the difference between supervised and unsupervised learning?',
    'How does compound interest work mathematically and in real life?',
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = question.trim();
    if (!clean) {
      setError('Please enter a question before submitting.');
      return;
    }
    if (clean.length > 12000) {
      setError('Your question exceeds the maximum limit of 12,000 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.askQuestion(clean);
      setAnswer(res.answer);
      saveActivity({
        type: 'qa',
        title: clean.slice(0, 70),
        summaryText: res.answer.slice(0, 140) + '...',
        data: { question: clean, answer: res.answer },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong while generating your answer.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion('');
    setAnswer('');
    setError(null);
  };

  const handleCopy = async () => {
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ask EduGenie
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Ask any educational question and get a clear, helpful answer.
            </p>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="qa-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Your Question
              </label>
              <span
                className={`text-xs ${
                  question.length > 11500
                    ? 'text-amber-600 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {question.length.toLocaleString()} / 12,000
              </span>
            </div>

            <textarea
              id="qa-input"
              rows={5}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Example: Explain Newton's laws of motion in simple terms..."
              className="w-full px-4 py-3 text-slate-900 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm leading-relaxed resize-y"
              disabled={loading}
              aria-label="Ask your educational question"
            />
          </div>

          {/* Quick sample chips */}
          <div>
            <span className="text-xs text-slate-500 block mb-1.5 font-medium">
              Try an example question:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuestion(p);
                    setError(null);
                  }}
                  className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg text-left transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || (!question && !answer)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>EduGenie is thinking...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Ask Question</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error State Banner */}
      {error && (
        <div
          role="alert"
          className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Unable to process question</h4>
            <p className="mt-0.5 text-xs text-red-700 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => handleSubmit()}
            className="text-xs font-semibold text-red-700 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-200 animate-spin" />
            <div className="h-4 bg-slate-200 rounded w-48" />
          </div>
          <div className="space-y-2.5 pt-2">
            <div className="h-3.5 bg-slate-200 rounded w-full" />
            <div className="h-3.5 bg-slate-200 rounded w-5/6" />
            <div className="h-3.5 bg-slate-200 rounded w-4/6" />
          </div>
          <div className="h-20 bg-slate-100 rounded-xl mt-4" />
        </div>
      )}

      {/* Answer Output Card */}
      {!loading && answer && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">EduGenie's Answer</h2>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors"
              aria-label="Copy Answer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Answer</span>
                </>
              )}
            </button>
          </div>

          {/* Formatted Content Renderer */}
          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-800 space-y-4 whitespace-pre-wrap font-sans">
            {answer}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !answer && !error && (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white/50">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Ready to learn something new?</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Your AI-generated result will appear here. Enter an educational question above to get started.
          </p>
        </div>
      )}
    </div>
  );
};
