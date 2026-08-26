import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import * as analysisService from '../services/analysis_service';

// Mock the API service
vi.mock('../services/analysis_service');

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  };

  it('1. Health request succeeds -> Connected', async () => {
    analysisService.getHealth.mockResolvedValue({ status: 'healthy' });
    renderDashboard();
    await waitFor(() => {
      // The presence of "System Status" means it rendered
      expect(screen.getByText(/System Status/i)).toBeInTheDocument();
    });
    // Connected is shown if health request succeeded
    expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
  });

  it('2. Health request returns 500 -> Unavailable', async () => {
    analysisService.getHealth.mockRejectedValue({ status: 500, message: 'Server error' });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/BuildSmart backend is currently unavailable/i)).toBeInTheDocument();
    });
  });

  it('3. Network failure -> Unavailable', async () => {
    analysisService.getHealth.mockRejectedValue(new Error('Network error'));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/BuildSmart backend is currently unavailable/i)).toBeInTheDocument();
    });
  });

  it('4. Health request pending -> Checking (loading state)', () => {
    // Return a never-resolving promise to keep it in loading state
    analysisService.getHealth.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByRole('heading', { name: /BuildSmart/i })).toBeInTheDocument();
    // In Dashboard, the loading spinner is rendered while pending
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty state when no latest_analysis_id in localStorage', async () => {
    analysisService.getHealth.mockResolvedValue({ status: 'healthy' });
    renderDashboard();

    await waitFor(() => {
      // PlatformOverview should show empty state
      expect(screen.getAllByText(/Awaiting analysis data/i)).toHaveLength(4);
      // LatestAnalysisCard empty state
      expect(screen.getByText(/No analyses yet/i)).toBeInTheDocument();
      // Workflow Visualizer empty state
      expect(screen.getByText(/No agent trace available/i)).toBeInTheDocument();
      // DecisionSummary empty state
      expect(screen.getByText(/No decisions available/i)).toBeInTheDocument();
      // CandidatePreview empty state
      expect(screen.getByText(/No candidate data available/i)).toBeInTheDocument();
    });

    // Check system status panel
    expect(screen.getByText(/System Status/i)).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('renders data when latest_analysis_id exists and is fetched', async () => {
    localStorage.setItem('latest_analysis_id', 'test-123');
    analysisService.getHealth.mockResolvedValue({ status: 'healthy' });
    analysisService.getAnalysis.mockResolvedValue({
      analysis_id: 'test-123',
      status: 'COMPLETED',
      domain: 'E-commerce',
      normalized_request: 'Build a shopping cart',
      agent_history: [{ node: 'Supervisor' }, { node: 'Decomposition' }],
      decisions: [
        { type: 'REUSE', component: 'Auth', selected_candidate: 'Auth0', confidence: 0.95, reason: 'Good' },
        { type: 'BUILD', component: 'Cart', selected_candidate: null, confidence: 0.80, reason: 'Custom logic' }
      ],
      candidates: [
        { name: 'Auth0', repository_url: 'https://auth0.com', metadata: { stars: 1000, license: 'MIT' } }
      ]
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText(/Auth/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Cart/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Custom Build/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/test/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/E-commerce/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Build a shopping cart/i).length).toBeGreaterThan(0);
    });
  });
});
