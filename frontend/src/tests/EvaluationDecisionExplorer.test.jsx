import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EvaluationDecisionExplorer from '../pages/EvaluationDecisionExplorer';
import * as analysisService from '../services/analysis_service';

vi.mock('../services/analysis_service');

const mockAnalysis = {
  analysis_id: 'test-dec-123',
  domain: 'Enterprise Cloud',
  status: 'COMPLETED',
  components: [
    { id: 'COMP-1', name: 'Auth', category: 'Security' },
    { id: 'COMP-2', name: 'Database', category: 'Storage' },
    { id: 'COMP-3', name: 'UI', category: 'Frontend' }
  ],
  candidates: [
    { component_id: 'COMP-1', name: 'Auth0', url: 'https://auth0.com', license: 'MIT', stars: 5000, metadata: { source: 'tavily' } },
    { component_id: 'COMP-1', name: 'PassportJS', license: 'MIT', stars: 10000, metadata: { source: 'github' } },
    { component_id: 'COMP-2', name: 'Postgres', metadata: { source: 'local' } }
  ],
  evaluations: [
    { 
      candidate_name: 'Auth0', 
      component_id: 'COMP-1', 
      score: 95, 
      relevance_score: 92,
      compatibility_score: 84,
      health_score: 90,
      license_score: 100,
      // no security score provided to test null handling
      reasoning: 'Auth0 is a robust authaas solution.', 
      missing_evidence: ['Detailed pricing'] 
    },
    {
      candidate_name: 'PassportJS',
      component_id: 'COMP-1',
      score: null, // Test not evaluated
    }
  ],
  decisions: [
    { component_id: 'COMP-1', decision: 'REUSE', selected_candidate_name: 'Auth0', confidence: 0.9, reason: 'Best fit for enterprise scale' },
    { component_id: 'COMP-2', decision: 'ADAPT', selected_candidate_name: 'Postgres', confidence: 0.8, reason: 'Requires custom extensions' },
    { component_id: 'COMP-3', decision: 'BUILD', selected_candidate_name: null, confidence: 0.95, reason: 'Custom UI needed' }
  ]
};

describe('EvaluationDecisionExplorer Page (Phase 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={[`/decisions/test-dec-123`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/decisions/:analysisId" element={<EvaluationDecisionExplorer />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    analysisService.getAnalysis.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/Loading evaluation data/i)).toBeInTheDocument();
  });

  it('renders REUSE, ADAPT, BUILD counts and percentages', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('EVALUATION & DECISION')).toBeInTheDocument();
      expect(screen.getByText('test-dec-123')).toBeInTheDocument();
    });

    const counts = screen.getAllByText('1');
    expect(counts.length).toBeGreaterThanOrEqual(3);
    
    const percentages = screen.getAllByText('33.3%');
    expect(percentages.length).toBeGreaterThanOrEqual(3);
  });

  it('renders components and candidates for selected component', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Auth')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      
      const auth0s = screen.getAllByText('Auth0');
      expect(auth0s.length).toBeGreaterThan(0);
      
      const passports = screen.getAllByText('PassportJS');
      expect(passports.length).toBeGreaterThan(0);
      
      expect(screen.queryByText('Postgres')).not.toBeInTheDocument();
    });
  });

  it('changes component and updates matrix and decision panel', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Auth')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Database'));

    await waitFor(() => {
      expect(screen.getByText('Decision for Database')).toBeInTheDocument();
      expect(screen.getAllByText('ADAPT').length).toBeGreaterThan(0);
      expect(screen.getByText('Requires custom extensions')).toBeInTheDocument();
      
      const postgres = screen.getAllByText('Postgres');
      expect(postgres.length).toBeGreaterThan(0);
      expect(screen.queryByText('Auth0')).not.toBeInTheDocument();
    });
  });

  it('renders null scores correctly in matrix', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Auth0').length).toBeGreaterThan(0);
    });

    const notEvaluatedElements = screen.getAllByText('Not evaluated');
    expect(notEvaluatedElements.length).toBeGreaterThan(0);
  });



  it('renders BUILD custom implementation without alternatives gracefully', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('UI')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('UI'));

    await waitFor(() => {
      expect(screen.getByText('Decision for UI')).toBeInTheDocument();
      expect(screen.getByText('Custom Implementation')).toBeInTheDocument();
      expect(screen.getByText('Custom UI needed')).toBeInTheDocument();
    });
  });
});
