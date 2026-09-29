import React from 'react';
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  Lightbulb,
  FileQuestion,
  FileText,
  Compass,
  Mic,
  Languages,
  Smartphone,
  Trophy,
  Sliders,
  GraduationCap,
  Image,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { ActiveTab } from './Header';

interface AboutViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ setActiveTab }) => {
  const currentFeatures = [
    {
      icon: MessageSquare,
      title: 'AI Question & Answer',
      desc: 'Ask any academic question across STEM, humanities, languages, and social sciences. Receive clear, step-by-step explanations with zero hallucinations.',
      actionTab: 'qa' as ActiveTab,
    },
    {
      icon: Lightbulb,
      title: 'Concept Explanation',
      desc: 'Decompose complex principles into a 7-step pedagogical framework: Simple Definition, Core Concept, Steps, Real-World Example, Key Points, Common Mistakes, and Memory Recap.',
      actionTab: 'explain' as ActiveTab,
    },
    {
      icon: FileQuestion,
      title: 'AI Quiz Generation',
      desc: 'Generate interactive 3-question multiple-choice quizzes with instant scoring, answer validation, and detailed conceptual feedback.',
      actionTab: 'quiz' as ActiveTab,
    },
    {
      icon: FileText,
      title: 'Text & Notes Summarizer',
      desc: 'Condense long chapters, research papers, and lecture notes into main ideas, key bullet points, terminology glossaries, and rapid revision sheets.',
      actionTab: 'summarize' as ActiveTab,
    },
    {
      icon: Compass,
      title: 'Personalized Learning Recommendations',
      desc: 'Formulate adaptive learning roadmaps tailored to your current knowledge level, academic goal, and daily study schedule.',
      actionTab: 'recommendations' as ActiveTab,
    },
  ];

  const upcomingFeatures = [
    {
      icon: Mic,
      title: 'Voice Interaction & Pronunciation',
      status: 'Planned for v1.2',
      desc: 'Two-way conversational audio queries using real-time speech-to-text and auditory tutoring for auditory learners.',
    },
    {
      icon: Languages,
      title: 'Multilingual Study & Translation',
      status: 'Planned for v1.3',
      desc: 'Learn complex subjects in 50+ languages with regional academic terminology alignment.',
    },
    {
      icon: Smartphone,
      title: 'Offline-Ready Mobile PWA App',
      status: 'Planned for v1.4',
      desc: 'Native-feel installable application with local cached quizzes and flashcard revisions.',
    },
    {
      icon: Trophy,
      title: 'Gamification & Study Streaks',
      status: 'Planned for v1.5',
      desc: 'XP points, milestone badges, daily mastery streaks, and study goal celebrations.',
    },
    {
      icon: Sliders,
      title: 'Adaptive Spaced-Repetition Paths',
      status: 'Planned for v1.6',
      desc: 'Automated review schedules based on Ebbinghaus forgetting curve algorithms and past quiz weaknesses.',
    },
    {
      icon: GraduationCap,
      title: 'LMS & Classroom Integrations',
      status: 'Planned for v2.0',
      desc: 'Direct export to Google Classroom, Canvas, Moodle, and Blackboard assignments.',
    },
    {
      icon: Image,
      title: 'Multimodal Image & PDF Input',
      status: 'Planned for v2.0',
      desc: 'Upload diagrams, textbook photos, handwritten math equations, and lecture slides directly.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Mission Hero */}
      <section className="text-center max-w-3xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          About EduGenie
        </h1>
        <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-normal">
          EduGenie is an AI-powered learning assistant designed to help students learn faster and understand concepts more clearly.
        </p>
      </section>

      {/* Core Educational Philosophy */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>Our Educational Philosophy</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 leading-relaxed">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Conceptual First, Memorization Second</h3>
            <p>
              Students often memorize formulas without understanding the root principles. EduGenie breaks down every topic into step-by-step logic before testing recall.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Active Recall & Instant Feedback</h3>
            <p>
              Passive reading creates an illusion of competence. Our targeted 3-question quizzes and immediate analytical explanations turn passive notes into active retention.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Personalized Progression</h3>
            <p>
              Every student learns at a different pace. Our adaptive roadmaps accommodate everything from a 15-minute daily revision to intensive exam bootcamps.
            </p>
          </div>
        </div>
      </section>

      {/* Current Features Overview */}
      <section>
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Available Today
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Active Core Capabilities
          </h2>
        </div>

        <div className="space-y-4">
          {currentFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                    <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab(feat.actionTab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="shrink-0 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Launch Tool
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Future-Ready Roadmap Section */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
            <span>Upcoming Roadmap</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Future-Ready Feature Extensions
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            EduGenie is architected for modular expansion. The following features represent our upcoming product iterations and are clearly labeled as future enhancements:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {upcomingFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
