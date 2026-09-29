import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { ActiveTab } from './Header';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  systemStatus?: { online: boolean; text: string };
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, systemStatus }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">EduGenie</span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              An intelligent, student-first learning companion powered by Google Gemini.
              Master difficult subjects through step-by-step reasoning, interactive quizzes,
              smart summaries, and personalized study paths.
            </p>
            {systemStatus && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    systemStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span>Service status: {systemStatus.text}</span>
              </div>
            )}
          </div>

          {/* Quick Learning Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Learning Suite
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('qa');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Ask a Question (Q&A)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('explain');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Concept Explanation
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('quiz');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  AI Quiz Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('summarize');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Text & Notes Summarizer
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('recommendations');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Personalized Learning Path
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & About */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              About EduGenie
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Pedagogy & Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-indigo-600 transition-colors text-left"
                >
                  Future Roadmap
                </button>
              </li>
              <li>
                <span className="text-slate-400">Powered by Google Gemini</span>
              </li>
              <li>
                <span className="text-slate-400">Version 1.0.0</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} EduGenie – AI Learning Assistant. Built for students worldwide.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Designed for clarity, accessibility & deep understanding</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
