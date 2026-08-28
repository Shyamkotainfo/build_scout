import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getAnalyses, getAnalysis, getHealth } from '../services/analysis_service';
import { useHealth } from './HealthContext';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisCache, setAnalysisCache] = useState({});
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  
  const { checkHealth } = useHealth();

  const refreshData = async (forceAnalysisId = null) => {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      // 1. Health
      await checkHealth();
      
      // 2. History
      const histData = await getAnalyses();
      const loadedHistory = Array.isArray(histData) ? histData : (histData?.analyses || []);
      setHistory(loadedHistory);
      
      // 3. Update Cache & Current Analysis
      let analysisIdToFetch = forceAnalysisId;
      if (!analysisIdToFetch && currentAnalysis) {
        analysisIdToFetch = currentAnalysis.analysis_id || currentAnalysis.id;
      } else if (!analysisIdToFetch && loadedHistory.length > 0) {
        analysisIdToFetch = loadedHistory[0].analysis_id;
      }
      
      if (analysisIdToFetch) {
        const latestData = await getAnalysis(analysisIdToFetch);
        setAnalysisCache(prev => ({ ...prev, [analysisIdToFetch]: latestData }));
        setCurrentAnalysis(latestData);
      }
      
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Refresh failed:', err);
      setRefreshError(err?.message || 'Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper to lazily load a specific analysis if not cached, WITHOUT aggressive polling
  const loadSpecificAnalysis = useCallback(async (analysisId) => {
    if (!analysisId) return null;
    
    // Use cache if available
    if (analysisCache[analysisId]) {
      if (currentAnalysis?.analysis_id !== analysisId && currentAnalysis?.id !== analysisId) {
        setCurrentAnalysis(analysisCache[analysisId]);
      }
      return analysisCache[analysisId];
    }
    
    // Otherwise fetch once explicitly
    setIsRefreshing(true);
    try {
      const data = await getAnalysis(analysisId);
      setAnalysisCache(prev => ({ ...prev, [analysisId]: data }));
      setCurrentAnalysis(data);
      return data;
    } catch (err) {
      console.error('Failed to load specific analysis:', err);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [analysisCache, currentAnalysis]);

  return (
    <DataContext.Provider
      value={{
        history,
        currentAnalysis,
        lastRefreshed,
        isRefreshing,
        refreshError,
        refreshData,
        loadSpecificAnalysis,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
