import React, { useState } from 'react';
import {
  FileQuestion,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Award,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { api, QuizQuestion } from '../services/api';
import { saveActivity } from '../services/storage';

interface QuizViewProps {
  initialTopic?: string;
  initialQuestions?: QuizQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({
  initialTopic = '',
  initialQuestions,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active quiz state
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(initialQuestions || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sampleTopics = [
    'Python Functions',
    'World War II Key Events',
    'Cellular Respiration',
    'Basic Microeconomics',
    'JavaScript Async/Await',
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = topic.trim();
    if (!clean) {
      setError('Please enter a quiz topic.');
      return;
    }
    if (clean.length > 12000) {
      setError('Topic exceeds the maximum limit of 12,000 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const res = await api.generateQuiz(clean, difficulty);
      if (!res.questions || res.questions.length !== 3) {
        throw new Error('Received invalid quiz structure from server.');
      }
      setQuestions(res.questions);
      saveActivity({
        type: 'quiz',
        title: `Quiz: ${clean} (${difficulty})`,
        summaryText: `3 questions on ${clean}.`,
        data: { topic: clean, difficulty, questions: res.questions },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate quiz questions.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };

  const handleNext = () => {
    if (!questions) return;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    // Scroll to top of results
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleTryAgain = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const handleNewQuiz = () => {
    setQuestions(null);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setError(null);
  };

  // Score calculation
  const calculateScore = () => {
    if (!questions) return { score: 0, total: 3, percentage: 0 };
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (selected && selected.toLowerCase() === q.answer.toLowerCase()) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    return { score: correctCount, total: questions.length, percentage };
  };

  const currentQ = questions ? questions[currentQuestionIndex] : null;
  const currentAnswer = selectedAnswers[currentQuestionIndex];
  const allAnswered = questions ? questions.every((_, i) => selectedAnswers[i]) : false;
  const { score, total, percentage } = calculateScore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Quiz Generator
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Test your understanding with an AI-generated quiz.
            </p>
          </div>
        </div>
      </div>

      {/* Generator Form (Only visible when not playing or can generate new) */}
      {!questions && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-8">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label
                htmlFor="quiz-topic"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2"
              >
                Quiz Topic
              </label>
              <input
                id="quiz-topic"
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Example: Python Functions, World War II, Cellular Respiration..."
                className="w-full px-4 py-3 text-slate-900 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                disabled={loading}
              />
            </div>

            {/* Quick topics */}
            <div>
              <span className="text-xs text-slate-500 block mb-1.5 font-medium">
                Try a popular quiz topic:
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

            {/* Difficulty selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
                Quiz Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2 max-w-sm p-1 bg-slate-100 rounded-xl">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 text-xs font-medium capitalize rounded-lg transition-all ${
                      difficulty === diff
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>EduGenie is generating 3 questions...</span>
                  </>
                ) : (
                  <>
                    <FileQuestion className="w-4 h-4" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Quiz Error</h4>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
          <button
            onClick={() => handleGenerate()}
            className="text-xs font-semibold text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-5 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-6 bg-slate-200 rounded w-4/5" />
          <div className="grid grid-cols-1 gap-3 pt-4">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
        </div>
      )}

      {/* Interactive Quiz Mode (In-Progress) */}
      {questions && !isSubmitted && currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
          {/* Quiz Header & Step Indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                {topic} · {difficulty.toUpperCase()}
              </span>
              <h2 className="text-sm font-semibold text-slate-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    idx === currentQuestionIndex
                      ? 'bg-emerald-600 ring-4 ring-emerald-100'
                      : selectedAnswers[idx]
                      ? 'bg-emerald-300'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* 4 Selectable Options */}
          <div className="space-y-3 mb-8" role="radiogroup" aria-label="Quiz answer options">
            {currentQ.options.map((option, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = currentAnswer === option;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  role="radio"
                  aria-checked={isSelected}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3.5 group cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-medium leading-relaxed flex-1">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!currentAnswer}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Submit Quiz</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Results Screen */}
      {questions && isSubmitted && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Score Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quiz Completed
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 mb-2">
              Your Score: {score} / {total}
            </h2>
            <div className="text-2xl font-bold text-emerald-600 mb-4">{percentage}%</div>

            {/* Visual Score Indicator Bar */}
            <div className="w-full max-w-md mx-auto bg-slate-100 rounded-full h-3 overflow-hidden mb-6">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  percentage >= 80
                    ? 'bg-emerald-500'
                    : percentage >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6">
              {percentage === 100
                ? 'Outstanding! You have mastered this concept completely.'
                : percentage >= 66
                ? 'Great job! Review the explanations below to cement your knowledge.'
                : 'Good effort! Review the questions and try again to improve your score.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleTryAgain}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={handleNewQuiz}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate New Quiz</span>
              </button>
            </div>
          </div>

          {/* Question Breakdown and Explanations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 px-1">
              Detailed Question Review
            </h3>

            {questions.map((q, idx) => {
              const selected = selectedAnswers[idx];
              const isCorrect = selected && selected.toLowerCase() === q.answer.toLowerCase();

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs ${
                    isCorrect ? 'border-emerald-200' : 'border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Question {idx + 1}
                      </span>
                    </div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Incorrect
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-4">{q.question}</h4>

                  {/* Options with Answer Highlights */}
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, optIdx) => {
                      const wasChosen = selected === opt;
                      const isTargetAnswer = opt.toLowerCase() === q.answer.toLowerCase();

                      let optClasses = 'border-slate-200 bg-white text-slate-700';
                      if (isTargetAnswer) {
                        optClasses =
                          'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                      } else if (wasChosen && !isCorrect) {
                        optClasses =
                          'border-rose-400 bg-rose-50/80 text-rose-950 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-sm flex items-center justify-between ${optClasses}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-slate-400">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isTargetAnswer && (
                            <span className="text-xs font-bold text-emerald-700 shrink-0">
                              ✓ Correct Answer
                            </span>
                          )}
                          {wasChosen && !isTargetAnswer && (
                            <span className="text-xs font-bold text-rose-700 shrink-0">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Card */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900 block mb-0.5">
                      Explanation:
                    </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !questions && !error && (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white/50">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Test what you know.</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Your AI-generated quiz will appear here. Enter any topic above to challenge yourself with 3 questions.
          </p>
        </div>
      )}
    </div>
  );
};
