import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getHealth } from '../services/analysis_service';

const HealthContext = createContext();

export const useHealth = () => {
  return useContext(HealthContext);
};

export const HealthProvider = ({ children }) => {
  const [healthData, setHealthData] = useState({ status: 'checking' });

  const fetchHealth = useCallback(async () => {
    try {
      const data = await getHealth();
      setHealthData(data);
    } catch (error) {
      setHealthData({ status: 'unavailable' });
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <HealthContext.Provider value={{ healthData, fetchHealth }}>
      {children}
    </HealthContext.Provider>
  );
};
