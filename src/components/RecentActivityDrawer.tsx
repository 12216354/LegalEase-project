import React from 'react';
import {
  X,
  Clock,
  Trash2,
  MessageSquare,
  Lightbulb,
  FileQuestion,
  FileText,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { ActivityItem } from '../services/storage';

interface RecentActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
  onSelectActivity: (activity: ActivityItem) => void;
  onClear: () => void;
}

export const RecentActivityDrawer: React.FC<RecentActivityDrawerProps> = ({
  isOpen,
  onClose,
  activities,
  onSelectActivity,
  onClear,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'qa':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case 'explain':
        return <Lightbulb className="w-4 h-4 text-amber-600" />;
      case 'quiz':
        return <FileQuestion className="w-4 h-4 text-emerald-600" />;
      case 'summarize':
        return <FileText className="w-4 h-4 text-sky-600" />;
      case 'recommendations':
        return <Compass className="w-4 h-4 text-purple-600" />;
    }
  };

  const getBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'qa':
        return 'Q&A';
      case 'explain':
        return 'Explanation';
      case 'quiz':
        return 'Quiz';
      case 'summarize':
        return 'Summary';
      case 'recommendations':
        return 'Path';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Learning Sessions</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close activity drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No recent activity saved yet.
                <br />
                Your queries and quizzes will be saved here automatically.
              </div>
            ) : (
              activities.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectActivity(item);
                    onClose();
                  }}
                  className="group cursor-pointer bg-slate-50 hover:bg-white hover:border-indigo-300 border border-slate-200 rounded-xl p-4 transition-all shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      {getIcon(item.type)}
                      <span>{getBadge(item.type)}</span>
                    </span>
                    <span>
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.summaryText}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Reopen session</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Clear All */}
          {activities.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">{activities.length} sessions stored</span>
              <button
                onClick={onClear}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
