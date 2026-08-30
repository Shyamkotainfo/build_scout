import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import * as analysisService from '../services/analysis_service';

// Mock the API service
vi.mock('../services/analysis_service');

describe('Dashboard Component (Phase 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <HealthProvider>
          <DataProvider>
            <Dashboard />
          </DataProvider>
        </HealthProvider>
      </MemoryRouter>
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
      expect(screen.getAllByText(/No analysis history available/i).length).toBeGreaterThan(0);
    });
  });

  it('3. History unavailable but Backend healthy', async () => {
    analysisService.getHealth.mockResolvedValue({ status: 'healthy' });
    analysisService.getAnalyses.mockRejectedValue(new Error('Failed to load history'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText(/No analysis history available/i).length).toBeGreaterThan(0);
    });
  });

  it('4. Backend and History unavailable', async () => {
    analysisService.getHealth.mockRejectedValue(new Error('Network Error'));
    analysisService.getAnalyses.mockRejectedValue(new Error('Network Error'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText(/No analysis history available/i).length).toBeGreaterThan(0);
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
      { analysis_id: '123', domain: 'Test Domain 1', validation_result: { overall_score: 95, overall_status: 'PASS' } },
      { analysis_id: '124', domain: 'Test Domain 2', validation_result: { overall_score: 80, overall_status: 'WARNING' } },
      { analysis_id: '125', domain: 'Test Domain 3', validation_result: { overall_score: 50, overall_status: 'FAIL' } },
      { analysis_id: '126', domain: 'Test Domain 4' },
      { analysis_id: '127', domain: 'Test Domain 5' },
    ]);
    analysisService.getAnalysis.mockResolvedValue({
      analysis_id: '123',
      domain: 'Test Domain 1',
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
        { component_id: 'comp1', decision: 'REUSE', selected_candidate_name: 'Auth0', confidence: 0.95, reason: 'Standard' },
        { component_id: 'comp2', decision: 'ADAPT', selected_candidate_name: 'Postgres', confidence: 0.85, reason: 'Needs schema' },
        { component_id: 'comp3', decision: 'BUILD', confidence: 0.99, reason: 'Custom UI needed' }
      ],
      validation_result: {
        overall_score: 95,
        overall_status: 'PASS',
        requirement_coverage: { score: 100 },
        component_coverage: { score: 90 }
      }
    });

    renderDashboard();

    // Wait for the main analysis to load and loaders to disappear
    await waitFor(() => {
      expect(screen.queryByLabelText(/Initializing engineering intelligence/i)).not.toBeInTheDocument();
      expect(screen.queryAllByText(/Test Domain 1/i).length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('6. Handles missing decision safely', async () => {
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
    });
  });
});
