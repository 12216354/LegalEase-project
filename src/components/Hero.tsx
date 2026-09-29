import React from 'react';
import {
  MessageSquare,
  Lightbulb,
  FileQuestion,
  FileText,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
} from 'lucide-react';
import { ActiveTab } from './Header';
import { ActivityItem } from '../services/storage';

interface HeroProps {
  setActiveTab: (tab: ActiveTab) => void;
  recentActivities: ActivityItem[];
  onSelectActivity: (activity: ActivityItem) => void;
  onClearActivities: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  setActiveTab,
  recentActivities,
  onSelectActivity,
  onClearActivities,
}) => {
  const featureCards = [
    {
      id: 'qa' as ActiveTab,
      icon: MessageSquare,
      title: 'Ask Anything',
      description: 'Get clear AI-powered answers to your questions.',
      tag: 'Q&A Assistant',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      id: 'explain' as ActiveTab,
      icon: Lightbulb,
      title: 'Explain a Concept',
      description: 'Understand difficult concepts with simple explanations.',
      tag: '7-Step Breakdown',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      id: 'quiz' as ActiveTab,
      icon: FileQuestion,
      title: 'Generate Quiz',
      description: 'Test your knowledge with AI-generated quizzes.',
      tag: '3 Interactive Qs',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      id: 'summarize' as ActiveTab,
      icon: FileText,
      title: 'Summarize',
      description: 'Turn long study material into concise key points.',
      tag: 'Revision Points',
      color: 'text-sky-600 bg-sky-50 border-sky-100',
    },
    {
      id: 'recommendations' as ActiveTab,
      icon: Compass,
      title: 'Learning Path',
      description: 'Get personalized recommendations for what to learn next.',
      tag: 'Structured Roadmap',
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Choose a learning task',
      description: 'Select between asking a question, understanding a concept, generating a quiz, summarizing notes, or a learning path.',
    },
    {
      num: '02',
      title: 'Enter your topic or notes',
      description: 'Input any academic topic, question, or study text you want to understand or test yourself on.',
    },
    {
      num: '03',
      title: 'EduGenie processes with AI',
      description: 'Our tuned Gemini AI model decomposes the material into structured educational principles.',
    },
    {
      num: '04',
      title: 'Receive clear learning results',
      description: 'Review structured explanations, take interactive quizzes with immediate feedback, or read bulleted summaries.',
    },
    {
      num: '05',
      title: 'Continue with recommendations',
      description: 'Follow personalized next steps and milestone prerequisites to master the complete curriculum.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-8 sm:pb-12 text-center max-w-4xl mx-auto px-4">
        {/* Anti-slop subtle kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Google Gemini-Powered Educational Companion</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Learn Smarter with <span className="text-indigo-600">EduGenie</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
          Your AI-powered learning assistant for questions, explanations, quizzes, summaries, and personalized learning.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <button
            onClick={() => {
              setActiveTab('learn');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 group text-base"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => {
              setActiveTab('quiz');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold rounded-xl shadow-sm transition-all text-base"
          >
            Try a Quiz
          </button>
        </div>
      </section>

      {/* Five Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Everything You Need to Master Any Subject
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Five specialized learning tools built into one unified student workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => {
                  setActiveTab(feat.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between ${
                  index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How EduGenie Works Section */}
      <section className="bg-slate-50 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              How EduGenie Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              A proven 5-step loop designed for retention, conceptual clarity, and academic progress.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-lg">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      {recentActivities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pick up where you left off from your recent learning sessions.
              </p>
            </div>
            <button
              onClick={onClearActivities}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-1 rounded"
              title="Clear all saved history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentActivities.slice(0, 6).map((activity) => (
              <div
                key={activity.id}
                onClick={() => onSelectActivity(activity)}
                className="group cursor-pointer bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-indigo-600">
                    {activity.type === 'qa'
                      ? 'Q&A'
                      : activity.type === 'explain'
                      ? 'Concept'
                      : activity.type === 'quiz'
                      ? 'Quiz'
                      : activity.type === 'summarize'
                      ? 'Summary'
                      : 'Learning Path'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {new Date(activity.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {activity.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {activity.summaryText}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
