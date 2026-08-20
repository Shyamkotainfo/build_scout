import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import PlatformOverview from '../components/dashboard/PlatformOverview';
import LatestAnalysisCard from '../components/dashboard/LatestAnalysisCard';
import AgentWorkflowVisualizer from '../components/dashboard/AgentWorkflowVisualizer';
import DecisionSummary from '../components/dashboard/DecisionSummary';
import CandidatePreview from '../components/dashboard/CandidatePreview';
import SystemStatusPanel from '../components/dashboard/SystemStatusPanel';
import HistorySection from '../components/dashboard/HistorySection';
import { getAnalysis, getHealth } from '../services/analysis_service';
import { RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState('checking');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Check health
      await getHealth();
      setHealthStatus('connected');

      // 2. Load latest analysis from local storage
      const latestId = localStorage.getItem('latest_analysis_id');
      if (latestId) {
        try {
          const data = await getAnalysis(latestId);
          setAnalysis(data);
        } catch (analysisErr) {
          console.warn('Could not load latest analysis, it may have been deleted or backend restarted', analysisErr);
          setAnalysis(null);
        }
      } else {
        setAnalysis(null);
      }
    } catch (err) {
      console.error(err);
      setHealthStatus('unavailable');
      setError('BuildSmart backend is currently unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300">
        <div className="bg-slate-800 border border-red-900/50 p-8 rounded-lg text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="inline-flex items-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader />
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <PlatformOverview analysis={analysis} />
            <LatestAnalysisCard analysis={analysis} />
            <AgentWorkflowVisualizer analysis={analysis} />
            <DecisionSummary analysis={analysis} />
            <CandidatePreview analysis={analysis} />
          </div>
          
          <div className="xl:col-span-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
            {/* Sidebar info area */}
            <SystemStatusPanel healthStatus={healthStatus} />
            <HistorySection />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
