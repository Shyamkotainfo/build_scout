import React from 'react';
import { useHealth } from '../contexts/HealthContext';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import { PlusCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import Button from './ui/Button';
import StatusIndicator from './ui/StatusIndicator';

const Navbar = () => {
  const { healthData } = useHealth();
  const { refreshData, isRefreshing, lastRefreshed, refreshError, isCached } = useData();
  const healthStatus = healthData?.status || 'checking';

  return (
    <div className="sticky top-0 z-10 flex h-14 flex-shrink-0 border-b border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)]">
      <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          <span className="text-base font-semibold text-[var(--bs-text-primary)]">BuildScout</span>
          <span className="ml-2 hidden sm:block text-xs text-[var(--bs-text-muted)]">Solution Discovery Platform</span>
        </div>
        <div className="ml-4 flex items-center md:ml-6 gap-4">
          
          {/* Refresh Action Area */}
          <div className="flex flex-col items-end mr-2">
            <div className="flex items-center gap-2">
              {refreshError && (
                <div className="flex items-center text-[var(--bs-status-critical)] text-xs font-medium" title={refreshError}>
                  <AlertTriangle className="w-3 h-3 mr-1" /> Failed
                </div>
              )}
              {isCached && (
                <div className="hidden sm:flex items-center bg-[var(--bs-status-warning-light)] text-[var(--bs-status-warning)] border border-[var(--bs-status-warning-border)] px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase" title="Showing cached analysis history">
                  Cached
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refreshData()}
                disabled={isRefreshing}
                className="bg-[var(--bs-bg-secondary)] border-[var(--bs-border-light)] text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)]"
              >
                <RefreshCw className={`mr-2 h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
            {lastRefreshed && !isRefreshing && (
              <span className="text-[10px] text-[var(--bs-text-muted)] mt-0.5 pr-1">
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-2 rounded-md bg-[var(--bs-bg-secondary)] px-3 py-1.5 border border-[var(--bs-border-light)]">
            <span className="text-xs text-[var(--bs-text-tertiary)]">Backend</span>
            <StatusIndicator
              status={
                healthStatus === 'healthy' || healthStatus === 'connected' || healthStatus === 'degraded' ? 'connected' :
                healthStatus === 'checking' ? 'pending' :
                'unavailable'
              }
              showLabel={true}
              size="sm"
            />
          </div>
          <Link to="/new-analysis">
            <Button variant="primary" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              New Analysis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
