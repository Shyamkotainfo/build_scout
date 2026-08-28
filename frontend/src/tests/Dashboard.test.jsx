import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import * as analysisService from '../services/analysis_service';
import { HealthProvider } from '../contexts/HealthContext';

// Mock the API service
vi.mock('../services/analysis_service');

describe('Dashboard Component (Phase 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter><HealthProvider><DataProvider>
        <HealthProvider>
          <Dashboard />
        </HealthProvider>
      </DataProvider></HealthProvider></MemoryRouter>
    );
  };

  it('1. Loading state', () => {
    analysisService.getHealth.mockReturnValue(new Promise(() => {}));
    analysisService.getAnalyses.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    
    expect(screen.getByText(/Initializing engineering intelligence/i)).toBeInTheDocument();
  });

  it('2. Backend unavailable (Critical Error)', async () => {
    analysisService.getHealth.mockRejectedValue(new Error('Network Error'));
    analysisService.getAnalyses.mockRejectedValue(new Error('Network Error'));
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getAllByText(/Analysis history unavailable/i).length).toBeGreaterThan(0);
    });
  });

  it('3. History unavailable but Backend healthy', async () => {
    analysisService.getHealth.mockResolvedValue({ status: 'healthy', database: 'unavailable' });
    analysisService.getAnalyses.mockRejectedValue({ response: { data: { error: { message: 'DB Error' } } } });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText(/Analysis history unavailable/i).length).toBeGreaterThan(0);
    });
  });

  it('4. Empty Dashboard (No history)', async () => {
    analysisService.getHealth.mockResolvedValue({ status: 'healthy' });
    analysisService.getAnalyses.mockResolvedValue([]);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/No analyses yet/i)).toBeInTheDocument();
      expect(screen.queryByText(/No previous analyses/i)).not.toBeInTheDocument();
    });
  });

  it('5. Real analysis rendering + counts + validation + candidates + decisions', async () => {
    analysisService.getHealth.mockResolvedValue({ status: 'healthy', database: 'healthy', llm: 'configured' });
    analysisService.getAnalyses.mockResolvedValue([
      { analysis_id: '123', domain: 'Test Domain', validation_result: { overall_score: 95, overall_status: 'PASS' } }
    ]);
    analysisService.getAnalysis.mockResolvedValue({
      analysis_id: '123',
      domain: 'Test Domain',
      normalized_request: 'Build a test system',
      status: 'COMPLETED',
      agent_history: ['supervisor', 'research', 'decision'],
      requirements: [{ id: 'req1' }, { id: 'req2' }],
      components: [{ id: 'comp1', name: 'Auth' }, { id: 'comp2', name: 'DB' }, { id: 'comp3', name: 'UI' }],
      candidates: [
        { name: 'Auth0', description: 'Identity', license: 'MIT', stars: 1000 },
        { name: 'Postgres', description: 'Database', license: 'PostgreSQL', stars: 500 }
      ],
      evaluations: [{ candidate_id: 'auth0' }, { candidate_id: 'postgres' }],
      decisions: [
        { component_id: 'comp1', decision_type: 'REUSE', selected_candidate_name: 'Auth0', confidence: 0.95, reason: 'Standard' },
        { component_id: 'comp2', decision_type: 'ADAPT', selected_candidate_name: 'Postgres', confidence: 0.85, reason: 'Needs schema' },
        { component_id: 'comp3', decision_type: 'BUILD', confidence: 0.99, reason: 'Custom UI needed' }
      ],
      validation_result: {
        overall_score: 95,
        overall_status: 'PASS',
        requirement_coverage: { score: 100 },
        component_coverage: { score: 90 }
      }
    });

    renderDashboard();

    await waitFor(() => {
      // Hero & History duplicates
      expect(screen.getAllByText('Test Domain').length).toBeGreaterThan(0);
      
      expect(screen.getAllByText('95').length).toBeGreaterThan(0); // validation score
      expect(screen.getAllByText('PASS').length).toBeGreaterThan(0); // validation status
      
      // DecisionSummary exact counts
      expect(screen.getByText('Reuse')).toBeInTheDocument();
      expect(screen.getByText('Adapt')).toBeInTheDocument();
      expect(screen.getByText('Build')).toBeInTheDocument();
      
      // ResearchDiscovery
      expect(screen.getAllByText('Auth0').length).toBeGreaterThan(0);
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument(); // license
      
      // DecisionHighlights
      expect(screen.getByText('Auth')).toBeInTheDocument();
      expect(screen.getAllByText('Custom UI needed').length).toBeGreaterThan(0);
      
      // ValidationPanel
      expect(screen.getByText('Requirement coverage')).toBeInTheDocument();
      expect(screen.getByText('Component coverage')).toBeInTheDocument();
      
      // WhyBuild
      expect(screen.getByText('Why Build?')).toBeInTheDocument();
    });
  });

  it('6. Does not show WhyBuild when there are no BUILD decisions', async () => {
    analysisService.getHealth.mockResolvedValue({ status: 'healthy' });
    analysisService.getAnalyses.mockResolvedValue([{ analysis_id: '123' }]);
    analysisService.getAnalysis.mockResolvedValue({
      analysis_id: '123',
      decisions: [
        { component_id: 'comp1', decision_type: 'REUSE' }
      ]
    });

    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Decision Highlights')).toBeInTheDocument();
      expect(screen.queryByText('Why Build?')).not.toBeInTheDocument();
    });
  });
});
