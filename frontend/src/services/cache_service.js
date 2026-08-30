const STORAGE_KEY = 'buildscout.analysis_history.v1';

export const saveHistoryToCache = (analyses) => {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      analyses: analyses
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save analysis history to cache:', err);
  }
};

export const getHistoryFromCache = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    if (!parsed || !parsed.analyses || !Array.isArray(parsed.analyses)) {
      console.warn('Invalid cache format, discarding.');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch (err) {
    console.warn('Failed to read analysis history from cache:', err);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};
