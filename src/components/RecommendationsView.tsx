import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Clock,
  Target,
  BookOpen,
  Award,
  Layers,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { api, LearningRecommendation } from '../services/api';
import { saveActivity } from '../services/storage';

interface RecommendationsViewProps {
  initialTopic?: string;
  initialRecommendations?: LearningRecommendation[];
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  initialTopic = '',
  initialRecommendations,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [goal, setGoal] = useState<
    'exam preparation' | 'academic learning' | 'skill development' | 'interview preparation' | 'general understanding'
  >('skill development');
  const [studyTime, setStudyTime] = useState<
    '15 minutes/day' | '30 minutes/day' | '1 hour/day' | '2+ hours/day'
  >('30 minutes/day');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[] | null>(
    initialRecommendations || null
  );

  const sampleTopics = [
    'Machine Learning',
    'Organic Chemistry',
    'Calculus & Linear Algebra',
    'Full-Stack Web Development',
    'Cognitive Psychology',
  ];

  const goalsList = [
    { id: 'skill development' as const, label: 'Skill Development' },
    { id: 'exam preparation' as const, label: 'Exam Preparation' },
    { id: 'academic learning' as const, label: 'Academic Learning' },
    { id: 'interview preparation' as const, label: 'Interview Preparation' },
    { id: 'general understanding' as const, label: 'General Understanding' },
  ];

  const timeSlots = [
    '15 minutes/day',
    '30 minutes/day',
    '1 hour/day',
    '2+ hours/day',
  ] as const;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = topic.trim();
    if (!clean) {
      setError('Please enter a topic to create your learning path.');
      return;
    }
    if (clean.length > 12000) {
      setError('Topic exceeds the maximum limit of 12,000 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.getRecommendations(clean, level, goal, studyTime);
      setRecommendations(res.recommendations);
      saveActivity({
        type: 'recommendations',
        title: `Path: ${clean}`,
        summaryText: `${res.recommendations.length} steps for ${goal} (${studyTime})`,
        data: { topic: clean, level, goal, studyTime, recommendations: res.recommendations },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate recommendations.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTopic('');
    setRecommendations(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your Personalized Learning Path
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Tell EduGenie what you are learning and receive recommended next topics.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Topic */}
          <div>
            <label
              htmlFor="path-topic"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2"
            >
              Current Subject / Topic
            </label>
            <input
              id="path-topic"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Example: Machine Learning, Data Structures, Modern Physics, Microeconomics..."
              className="w-full px-4 py-3 text-slate-900 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm"
              disabled={loading}
            />
          </div>

          {/* Sample Topic Chips */}
          <div>
            <span className="text-xs text-slate-500 block mb-1.5 font-medium">
              Popular subjects to roadmap:
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

          {/* Grid: Level, Goal, Study Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Knowledge Level */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
                Current Level
              </label>
              <div className="space-y-1.5">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`w-full py-2 px-3 text-xs font-medium capitalize rounded-xl border text-left flex items-center justify-between transition-all ${
                      level === lvl
                        ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span>{lvl}</span>
                    {level === lvl && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Goal */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
                Learning Goal
              </label>
              <div className="space-y-1.5">
                {goalsList.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`w-full py-2 px-3 text-xs font-medium rounded-xl border text-left flex items-center justify-between transition-all ${
                      goal === g.id
                        ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="truncate">{g.label}</span>
                    {goal === g.id && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Study Time */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
                Daily Study Time
              </label>
              <div className="space-y-1.5">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setStudyTime(time)}
                    className={`w-full py-2 px-3 text-xs font-medium rounded-xl border text-left flex items-center justify-between transition-all ${
                      studyTime === time
                        ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span>{time}</span>
                    {studyTime === time && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Designing your roadmap...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Generate Learning Path</span>
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
            <h4 className="font-semibold">Roadmap Error</h4>
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
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
            <div className="h-3.5 bg-slate-200 rounded w-full" />
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2" />
            <div className="h-3.5 bg-slate-200 rounded w-4/5" />
          </div>
        </div>
      )}

      {/* Structured Roadmap Results */}
      {!loading && recommendations && recommendations.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                Personalized Curriculum
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {topic} · {studyTime} ({goal})
              </h2>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Path</span>
            </button>
          </div>

          {/* Sequential Timeline / Topic Cards */}
          <div className="space-y-4">
            {recommendations.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative hover:border-purple-300 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                    {step.stage}
                  </span>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {step.estimatedLearningTime}
                    </span>
                    <span
                      className={`font-semibold ${
                        step.difficulty === 'Advanced'
                          ? 'text-rose-600'
                          : step.difficulty === 'Intermediate'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {step.difficulty}
                    </span>
                  </div>
                </div>

                {/* Topic Name */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.topicName}</h3>

                {/* Why it matters */}
                <div className="mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                    Why it matters:
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">{step.whyItMatters}</p>
                </div>

                {/* Learning Objectives if present */}
                {step.keyLearningObjectives && step.keyLearningObjectives.length > 0 && (
                  <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-600 block mb-1">
                      Key Competencies Mastered:
                    </span>
                    <ul className="space-y-1">
                      {step.keyLearningObjectives.map((obj, oIdx) => (
                        <li key={oIdx} className="text-xs text-slate-700 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-purple-500 shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Topic link */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500">Next milestone:</span>
                  <span className="text-purple-700 font-medium">{step.suggestedNextTopic}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !recommendations && !error && (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white/50">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Build your next learning step.</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Your personalized curriculum will appear here. Enter any subject above to generate a structured roadmap.
          </p>
        </div>
      )}
    </div>
  );
};
