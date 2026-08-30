import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ArrowRight } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import LatestAnalysisCard from '../components/dashboard/LatestAnalysisCard';
import AgentWorkflowVisualizer from '../components/dashboard/AgentWorkflowVisualizer';
import DecisionHighlights from '../components/dashboard/DecisionHighlights';
import HistorySection from '../components/dashboard/HistorySection';
import { useData } from '../contexts/DataContext';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const { history, currentAnalysis: analysis, isRefreshing, refreshError, lastRefreshed, refreshData } = useData();

  if (refreshError && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 px-4">
        <ErrorState 
          title="No analysis history available" 
          message="Backend is currently unavailable and no previously synchronized history is stored on this browser." 
          onRetry={refreshData} 
        />
      </div>
    );
  }

  // Determine States
  // It is empty if we have no history and are not actively refreshing.
  const isEmptyState = !analysis && history.length === 0 && lastRefreshed !== null;
  // If we haven't refreshed yet, we show the static empty state as well instead of infinite spinner.
  const isInitialLoad = lastRefreshed === null && !isRefreshing;

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      <DashboardHeader />
      
      {isRefreshing && !lastRefreshed ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingState message="Initializing engineering intelligence..." />
        </div>
      ) : (isEmptyState || isInitialLoad) ? (
        // GETTING STARTED EMPTY STATE
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-[var(--bs-bg-primary)] rounded-lg border border-[var(--bs-border-light)] text-center shadow-sm">
          <h2 className="text-2xl font-bold text-[var(--bs-text-primary)] mb-4">No analyses yet</h2>
          <p className="text-[var(--bs-text-secondary)] max-w-lg mb-8 leading-relaxed">
            {isInitialLoad 
              ? "Click 'Refresh Data' in the top bar to load your workspace, or start a new analysis." 
              : "Start with a system you are planning to build. BuildScout will:"}
          </p>
          <div className="flex flex-col items-start text-left bg-[var(--bs-bg-secondary)] p-6 rounded-lg mb-8 w-full max-w-md border border-[var(--bs-border-light)]">
            <ol className="space-y-4 text-sm font-medium text-[var(--bs-text-primary)]">
              <li className="flex items-center"><span className="text-[var(--bs-orange-500)] mr-3 font-bold text-lg">1.</span> Decompose the problem</li>
              <li className="flex items-center"><span className="text-[var(--bs-orange-500)] mr-3 font-bold text-lg">2.</span> Search existing solutions</li>
              <li className="flex items-center"><span className="text-[var(--bs-orange-500)] mr-3 font-bold text-lg">3.</span> Evaluate evidence</li>
              <li className="flex items-center"><span className="text-[var(--bs-orange-500)] mr-3 font-bold text-lg">4.</span> Recommend REUSE / ADAPT / BUILD</li>
              <li className="flex items-center"><span className="text-[var(--bs-orange-500)] mr-3 font-bold text-lg">5.</span> Generate and validate an architecture</li>
            </ol>
          </div>
          
          <div className="w-full max-w-4xl mb-10">
            <AgentWorkflowVisualizer />
          </div>

          <Link to="/new-analysis">
            <Button variant="primary" size="lg">
              <PlusCircle className="mr-2 h-5 w-5" aria-hidden="true" />
              Start New Analysis
            </Button>
          </Link>
        </div>
      ) : (
        // DASHBOARD WITH DATA
        <div className="flex flex-col gap-6 pb-6">
          
          {/* Top Row: Hero */}
          <div className="grid grid-cols-1 gap-6 animate-fade-in-up stagger-1">
            <div className="col-span-1">
              <LatestAnalysisCard analysis={analysis} />
            </div>
          </div>
          
          {/* Agent Workflow (Static Visual) */}
          <div className="animate-fade-in-up stagger-2">
            <AgentWorkflowVisualizer />
          </div>
          
          {/* Decision Highlights & History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up stagger-3">
            <DecisionHighlights analysis={analysis} />
            <div>
              <HistorySection 
                history={history.filter(h => h.analysis_id !== analysis?.analysis_id && h.id !== analysis?.id)} 
                isLoading={isRefreshing} 
                error={refreshError} 
              />
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default Dashboard;
