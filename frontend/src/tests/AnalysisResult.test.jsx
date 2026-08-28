import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalysisResult from '../pages/AnalysisResult';
import * as analysisService from '../services/analysis_service';

vi.mock('../services/analysis_service');

describe('AnalysisResult Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAnalysisResult = (analysisId = 'test-123') => {
    return render(
      <MemoryRouter initialEntries={[`/analyses/${analysisId}`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/analyses/:analysisId" element={<AnalysisResult />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    analysisService.getAnalysis.mockReturnValue(new Promise(() => {}));
    renderAnalysisResult();
    expect(screen.getByText(/Loading analysis details/i)).toBeInTheDocument();
  });

  it('handles 404 not found error', async () => {
    const error = new Error('Not Found');
    error.response = { status: 404 };
    analysisService.getAnalysis.mockRejectedValue(error);
    renderAnalysisResult();

    await waitFor(() => {
      expect(screen.getByText(/Analysis Details Unavailable/i)).toBeInTheDocument();
    });
  });

  it('handles network failure', async () => {
    analysisService.getAnalysis.mockRejectedValue(new Error('Network Error'));
    renderAnalysisResult();

    await waitFor(() => {
      expect(screen.getByText(/Analysis Details Unavailable/i)).toBeInTheDocument();
    });
  });

  it('renders fully populated analysis result correctly', async () => {
    analysisService.getAnalysis.mockResolvedValue({
      analysis_id: 'test-123',
      status: 'COMPLETED',
      domain: 'E-commerce',
      user_request: 'Build a cart',
      normalized_request: 'E-commerce shopping cart',
      requirements: [{ id: 'REQ-1', description: 'User login', priority: 'HIGH' }],
      components: [{ id: 'COMP-1', name: 'Auth', category: 'Security', description: 'Auth system', dependencies: [] }],
      candidates: [{ component_id: 'COMP-1', name: 'Auth0', description: 'SaaS', license: 'MIT', stars: 100, metadata: { forks: 10 } }],
      evaluations: [{ candidate_name: 'Auth0', component_id: 'COMP-1', score: 95, reasoning: 'Good', concerns: [], missing_evidence: [] }],
      decisions: [{ component_id: 'COMP-1', decision: 'REUSE', selected_candidate_name: 'Auth0', confidence: 0.9, reason: 'Best fit', risks: [], implementation_notes: [] }],
      blueprint: { solution_summary: 'Uses Auth0', architecture_style: 'Microservices', components: [], data_flow: [], integration_points: [], implementation_phases: [], assumptions: [], risks: [] },
      validation_result: { overall_status: 'PASS', overall_score: 95, requirement_coverage: { status: 'PASS', score: 100, findings: [] } },
      agent_history: ['Supervisor'],
      traces: [],
      llm_metrics: { total_calls: 10, total_cost: 0.05 }
    });

    renderAnalysisResult();

    await waitFor(() => {
      // Header
      expect(screen.getAllByText(/E-commerce/i).length).toBeGreaterThan(0);
      // Req
      expect(screen.getAllByText(/REQ-1/i).length).toBeGreaterThan(0);
      // Component
      expect(screen.getAllByText(/Auth/i).length).toBeGreaterThan(0);
      // Candidate
      expect(screen.getAllByText(/Auth0/i).length).toBeGreaterThan(0);
      // Eval counts (from Candidates section)
      expect(screen.getAllByText(/1/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/candidates evaluated/i).length).toBeGreaterThan(0);
      // Decision
      expect(screen.getAllByText(/REUSE/i).length).toBeGreaterThan(0);
      // Blueprint
      expect(screen.getAllByText(/Uses Auth0/i).length).toBeGreaterThan(0);
      // Validation
      expect(screen.getAllByText(/PASS/i).length).toBeGreaterThan(0);
      // Agent Trace
      expect(screen.getAllByText(/Supervisor/i).length).toBeGreaterThan(0);
    });
  });
});
