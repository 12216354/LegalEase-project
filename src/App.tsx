/**
 * EduGenie – AI Learning Assistant
 * Main Application Component
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { LearnWorkspace, TaskType } from './components/LearnWorkspace';
import { QAView } from './components/QAView';
import { ExplainView } from './components/ExplainView';
import { QuizView } from './components/QuizView';
import { SummarizeView } from './components/SummarizeView';
import { RecommendationsView } from './components/RecommendationsView';
import { AboutView } from './components/AboutView';
import { RecentActivityDrawer } from './components/RecentActivityDrawer';
import { api } from './services/api';
import {
  getRecentActivities,
  clearActivities,
  ActivityItem,
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTabState] = useState<ActiveTab>('home');
  const [currentTask, setCurrentTask] = useState<TaskType>('qa');
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const [systemStatus, setSystemStatus] = useState<{
    online: boolean;
    text: string;
  }>({
    online: true,
    text: 'Operational',
  });

  // Sync state with browser location
  const syncRouteFromPath = () => {
    const path = window.location.pathname.toLowerCase().replace(/^\//, '');
    if (path === 'qa') {
      setActiveTabState('qa');
      setCurrentTask('qa');
    } else if (path === 'explain') {
      setActiveTabState('explain');
      setCurrentTask('explain');
    } else if (path === 'quiz') {
      setActiveTabState('quiz');
      setCurrentTask('quiz');
    } else if (path === 'summarize') {
      setActiveTabState('summarize');
      setCurrentTask('summarize');
    } else if (path === 'recommendations' || path === 'learn/recommendations') {
      setActiveTabState('recommendations');
      setCurrentTask('recommendations');
    } else if (path === 'learn') {
      setActiveTabState('learn');
    } else if (path === 'about') {
      setActiveTabState('about');
    } else {
      setActiveTabState('home');
    }
  };

  useEffect(() => {
    syncRouteFromPath();
    window.addEventListener('popstate', syncRouteFromPath);
    setRecentActivities(getRecentActivities());

    // Check health endpoint
    api
      .checkHealth()
      .then((res) => {
        setSystemStatus({
          online: true,
          text: res.gemini_configured
            ? 'Operational (Gemini AI active)'
            : 'Operational',
        });
      })
      .catch(() => {
        setSystemStatus({
          online: false,
          text: 'Backend connecting...',
        });
      });

    return () => {
      window.removeEventListener('popstate', syncRouteFromPath);
    };
  }, []);

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (tab === 'qa' || tab === 'explain' || tab === 'quiz' || tab === 'summarize' || tab === 'recommendations') {
      setCurrentTask(tab as TaskType);
    }
    const targetPath = tab === 'home' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const handleSelectTaskInWorkspace = (task: TaskType) => {
    setCurrentTask(task);
    setActiveActivity(null);
    window.history.pushState(null, '', `/${task}`);
  };

  const handleSelectActivity = (activity: ActivityItem) => {
    setActiveActivity(activity);
    if (activity.type === 'qa') {
      setActiveTab('qa');
    } else if (activity.type === 'explain') {
      setActiveTab('explain');
    } else if (activity.type === 'quiz') {
      setActiveTab('quiz');
    } else if (activity.type === 'summarize') {
      setActiveTab('summarize');
    } else if (activity.type === 'recommendations') {
      setActiveTab('recommendations');
    }
  };

  const handleClearActivities = () => {
    clearActivities();
    setRecentActivities([]);
    setActiveActivity(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        onOpenHistory={() => {
          setRecentActivities(getRecentActivities());
          setHistoryDrawerOpen(true);
        }}
        historyCount={recentActivities.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <Hero
            setActiveTab={setActiveTab}
            recentActivities={recentActivities}
            onSelectActivity={handleSelectActivity}
            onClearActivities={handleClearActivities}
          />
        )}

        {activeTab === 'learn' && (
          <LearnWorkspace
            currentTask={currentTask}
            onSelectTask={handleSelectTaskInWorkspace}
            activeActivity={activeActivity}
          />
        )}

        {activeTab === 'qa' && (
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

        {activeTab === 'explain' && (
          <ExplainView
            initialTopic={
              activeActivity?.type === 'explain'
                ? (activeActivity.data as { topic?: string })?.topic
                : undefined
            }
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            initialTopic={
              activeActivity?.type === 'quiz'
                ? (activeActivity.data as { topic?: string })?.topic
                : undefined
            }
          />
        )}

        {activeTab === 'summarize' && (
          <SummarizeView
            initialText={
              activeActivity?.type === 'summarize'
                ? (activeActivity.data as { text?: string })?.text
                : undefined
            }
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            initialTopic={
              activeActivity?.type === 'recommendations'
                ? (activeActivity.data as { topic?: string })?.topic
                : undefined
            }
          />
        )}

        {activeTab === 'about' && <AboutView setActiveTab={setActiveTab} />}
      </main>

      {/* History Slide-over Drawer */}
      <RecentActivityDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        activities={recentActivities}
        onSelectActivity={handleSelectActivity}
        onClear={handleClearActivities}
      />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} systemStatus={systemStatus} />
    </div>
  );
}
