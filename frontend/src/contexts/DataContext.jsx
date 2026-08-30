import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getAnalyses, getAnalysis, getHealth } from '../services/analysis_service';
import { saveHistoryToCache, getHistoryFromCache } from '../services/cache_service';
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
  const [isCached, setIsCached] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(null);
  const initialLoadDone = useRef(false);
  
  const { fetchHealth } = useHealth();

  const refreshData = async (forceAnalysisId = null) => {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      // 1. Health
      await fetchHealth();
      
      // 2. History
      const histData = await getAnalyses();
      const loadedHistory = Array.isArray(histData) ? histData : (histData?.analyses || []);
      
      setHistory(loadedHistory);
      setIsCached(false);
      
      const now = new Date();
      setLastSyncTimestamp(now);
      saveHistoryToCache(loadedHistory);
      
      // 3. Update Cache & Current Analysis
      let analysisIdToFetch = forceAnalysisId;
      if (!analysisIdToFetch && currentAnalysis) {
        analysisIdToFetch = currentAnalysis.analysis_id || currentAnalysis.id;
      } else if (!analysisIdToFetch && loadedHistory.length > 0) {
        analysisIdToFetch = loadedHistory[0].analysis_id;
      }
      
      if (analysisIdToFetch) {
        // Wrap in try-catch so failing to load a single analysis doesn't crash the list refresh
        try {
          const latestData = await getAnalysis(analysisIdToFetch);
          setAnalysisCache(prev => ({ ...prev, [analysisIdToFetch]: latestData }));
          setCurrentAnalysis(latestData);
        } catch (detailErr) {
          console.error('Failed to fetch detailed analysis:', detailErr);
          // If we can't load it (e.g. backend went down immediately after list fetch), clear current
          // Only clear if the current analysis matches the one we failed to fetch
          if (currentAnalysis && (currentAnalysis.analysis_id === analysisIdToFetch || currentAnalysis.id === analysisIdToFetch)) {
            setCurrentAnalysis(null);
          }
        }
      }
      
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Refresh failed:', err);
      
      // Fallback to cache if backend fails
      if (history.length === 0) {
        const cachedData = getHistoryFromCache();
        if (cachedData && cachedData.analyses && cachedData.analyses.length > 0) {
          setHistory(cachedData.analyses);
          setLastSyncTimestamp(new Date(cachedData.timestamp));
          setIsCached(true);
          // Do not set fatal refresh error if we have cache, just let it render the cache
        } else {
          setRefreshError(err?.message || 'Failed to refresh data');
        }
      } else {
        // We already have history in memory, just keep it. 
        // We don't throw away the history.
        // Also don't show full-screen error.
      }
      setLastRefreshed(new Date());
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

  // Initial hydration on mount
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      // Fire and forget hydration fetch
      refreshData();
    }
  }, []);

  // Add or update an analysis directly (e.g. immediately after NewAnalysis succeeds)
  const addAnalysis = useCallback((newAnalysis) => {
    if (!newAnalysis) return;
    
    const targetId = newAnalysis.analysis_id || newAnalysis.id;
    if (!targetId) return;

    setHistory((prevHistory) => {
      const exists = prevHistory.some(item => (item.analysis_id || item.id) === targetId);
      if (exists) {
        // Replace existing
        const newHistory = prevHistory.map(item => 
          (item.analysis_id || item.id) === targetId ? newAnalysis : item
        );
        saveHistoryToCache(newHistory);
        return newHistory;
      } else {
        // Insert new at top
        const newHistory = [newAnalysis, ...prevHistory];
        saveHistoryToCache(newHistory);
        return newHistory;
      }
    });

    setAnalysisCache(prev => ({ ...prev, [targetId]: newAnalysis }));
    setCurrentAnalysis(newAnalysis);
  }, []);

  return (
    <DataContext.Provider
      value={{
        history,
        currentAnalysis,
        lastRefreshed,
        isRefreshing,
        refreshError,
        isCached,
        lastSyncTimestamp,
        refreshData,
        loadSpecificAnalysis,
        addAnalysis,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
