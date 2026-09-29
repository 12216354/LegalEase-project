import React from 'react';
import {
  MessageSquare,
  Lightbulb,
  FileQuestion,
  FileText,
  Compass,
} from 'lucide-react';
import { QAView } from './QAView';
import { ExplainView } from './ExplainView';
import { QuizView } from './QuizView';
import { SummarizeView } from './SummarizeView';
import { RecommendationsView } from './RecommendationsView';
import { ActivityItem } from '../services/storage';

export type TaskType = 'qa' | 'explain' | 'quiz' | 'summarize' | 'recommendations';

interface LearnWorkspaceProps {
  currentTask: TaskType;
  onSelectTask: (task: TaskType) => void;
  activeActivity?: ActivityItem | null;
}

export const LearnWorkspace: React.FC<LearnWorkspaceProps> = ({
  currentTask,
  onSelectTask,
  activeActivity,
}) => {
  const tasks = [
    {
      id: 'qa' as TaskType,
      label: 'Ask a Question',
      shortLabel: 'Q&A',
      icon: MessageSquare,
      color: 'indigo',
    },
    {
      id: 'explain' as TaskType,
      label: 'Explain a Concept',
      shortLabel: 'Explain',
      icon: Lightbulb,
      color: 'amber',
    },
    {
      id: 'quiz' as TaskType,
      label: 'Generate a Quiz',
      shortLabel: 'Quiz',
      icon: FileQuestion,
      color: 'emerald',
    },
    {
      id: 'summarize' as TaskType,
      label: 'Summarize Text',
      shortLabel: 'Summarize',
      icon: FileText,
      color: 'sky',
    },
    {
      id: 'recommendations' as TaskType,
      label: 'Learning Path',
      shortLabel: 'Path',
      icon: Compass,
      color: 'purple',
    },
  ];

  return (
    <div className="py-6 sm:py-8">
      {/* Workspace Header */}
      <div className="max-w-4xl mx-auto px-4 mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          How can EduGenie help you today?
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Select a learning task below to begin. Switch between tools anytime.
        </p>

        {/* Task Selector Tabs / Segmented Control */}
        <div className="mt-6 flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
          {tasks.map((task) => {
            const Icon = task.icon;
            const isSelected = currentTask === task.id;

            return (
              <button
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`flex-1 min-w-[100px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
                aria-pressed={isSelected}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                />
                <span className="hidden sm:inline">{task.label}</span>
                <span className="sm:hidden">{task.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tool Content */}
      <div className="transition-opacity duration-200">
        {currentTask === 'qa' && (
          <QAView
            initialQuestion={
              activeActivity?.type === 'qa'
                ? (activeActivity.data as { question?: string })?.question
                : undefined
            }
            initialAnswer={
              activeActivity?.type === 'qa'
                ? (activeActivity.data as { answer?: string })?.answer
                : undefined
            }
          />
        )}
        {currentTask === 'explain' && (
          <ExplainView
            initialTopic={
              activeActivity?.type === 'explain'
                ? (activeActivity.data as { topic?: string })?.topic
                : undefined
            }
          />
        )}
        {currentTask === 'quiz' && (
          <QuizView
            initialTopic={
              activeActivity?.type === 'quiz'
                ? (activeActivity.data as { topic?: string })?.topic
                : undefined
            }
          />
        )}
        {currentTask === 'summarize' && (
          <SummarizeView
            initialText={
              activeActivity?.type === 'summarize'
                ? (activeActivity.data as { text?: string })?.text
                : undefined
            }
          />
        )}
        {currentTask === 'recommendations' && (
          <RecommendationsView
            initialTopic={
              activeActivity?.type === 'recommendations'
                ? (activeActivity.data as { topic?: string })?.topic
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
};
