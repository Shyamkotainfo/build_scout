import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResearchExplorer from '../pages/ResearchExplorer';
import * as analysisService from '../services/analysis_service';

vi.mock('../services/analysis_service');

const mockAnalysis = {
  analysis_id: 'test-123',
  status: 'COMPLETED',
  components: [
    { id: 'COMP-1', name: 'Auth', category: 'Security' },
    { id: 'COMP-2', name: 'Database', category: 'Storage' }
  ],
  candidates: [
    { component_id: 'COMP-1', name: 'Auth0', description: 'AuthaaS', url: 'https://auth0.com', license: 'MIT', stars: 5000, metadata: { source: 'tavily', forks: 100 } },
    { component_id: 'COMP-1', name: 'PassportJS', description: 'Local Auth', license: 'MIT', stars: 10000, metadata: { source: 'github', language: 'js' } },
    { component_id: 'COMP-2', name: 'Postgres', description: 'DB', metadata: { source: 'local' } }
  ],
  evaluations: [
    { candidate_name: 'Auth0', component_id: 'COMP-1', score: 95, reasoning: 'Very good', concerns: ['Cost'], missing_evidence: [] }
  ],
  decisions: [
    { component_id: 'COMP-1', decision: 'REUSE', selected_candidate_name: 'Auth0', confidence: 0.9, reason: 'Best fit' }
  ],
  traces: [
    {
      agent_name: 'Research',
      tool_calls: [
        { name: 'search_github', provider: 'MCP', server: 'github' },
        { name: 'check_vulns', provider: 'LOCAL', server: 'security' },
        { name: 'fallback_search', provider: 'FALLBACK', server: 'system' }
      ]
    }
  ]
};

describe('ResearchExplorer Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderResearchExplorer = () => {
    return render(
      <MemoryRouter initialEntries={[`/research/test-123`]}>
        <Routes>
          <Route path="/research/:analysisId" element={<ResearchExplorer />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    analysisService.getAnalysis.mockReturnValue(new Promise(() => {}));
    renderResearchExplorer();
    expect(screen.getByText(/Loading research data/i)).toBeInTheDocument();
  });

  it('handles 404 not found error', async () => {
    const error = new Error('Not Found');
    error.response = { status: 404 };
    analysisService.getAnalysis.mockRejectedValue(error);
    renderResearchExplorer();
    await waitFor(() => {
      expect(screen.getByText(/Analysis not found/i)).toBeInTheDocument();
    });
  });

  it('renders components and summary correctly', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderResearchExplorer();

    await waitFor(() => {
      // Summary
      expect(screen.getAllByText('2')[0]).toBeInTheDocument(); // Components
      expect(screen.getAllByText('3')[0]).toBeInTheDocument(); // Candidates
      expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // Eval & Dec
      
      // Sidebar
      expect(screen.getByText('Auth')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      
      // Default selects first component (COMP-1), showing its candidates
      expect(screen.getByText('Auth0')).toBeInTheDocument();
      expect(screen.getByText('PassportJS')).toBeInTheDocument();
      // COMP-2 candidate should not be visible initially
      expect(screen.queryByText('Postgres')).not.toBeInTheDocument();
    });
  });

  it('changes candidates when selecting a different component', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderResearchExplorer();

    await waitFor(() => {
      expect(screen.getByText('Auth')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Database'));

    await waitFor(() => {
      expect(screen.getByText('Postgres')).toBeInTheDocument();
      expect(screen.queryByText('Auth0')).not.toBeInTheDocument();
    });
  });

  it('filters candidates by search and source', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderResearchExplorer();

    await waitFor(() => {
      expect(screen.getByText('Auth0')).toBeInTheDocument();
      expect(screen.getByText('PassportJS')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search candidates/i);
    fireEvent.change(searchInput, { target: { value: 'Passport' } });

    await waitFor(() => {
      expect(screen.getByText('PassportJS')).toBeInTheDocument();
      expect(screen.queryByText('Auth0')).not.toBeInTheDocument();
    });
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Filter by Source
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'tavily' } });
    
    await waitFor(() => {
      expect(screen.getByText('Auth0')).toBeInTheDocument();
      expect(screen.queryByText('PassportJS')).not.toBeInTheDocument();
    });
  });

  it('opens candidate modal with metadata, eval, and decision', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderResearchExplorer();

    await waitFor(() => {
      expect(screen.getByText('Auth0')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Auth0'));

    await waitFor(() => {
      // Modal content
      expect(screen.getAllByText('AuthaaS').length).toBeGreaterThan(0);
      // Eval
      expect(screen.getAllByText('95').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Excellent').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Very good').length).toBeGreaterThan(0);
      // Decision
      expect(screen.getAllByText('REUSE').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Selected Candidate').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Best fit').length).toBeGreaterThan(0);
    });
  });

  it('handles candidate comparison', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderResearchExplorer();

    await waitFor(() => {
      expect(screen.getByText('Auth0')).toBeInTheDocument();
    });

    // Find and click the comparison checkboxes
    const checkboxes = screen.getAllByTitle('Add to comparison');
    fireEvent.click(checkboxes[0]); // Auth0
    fireEvent.click(checkboxes[1]); // PassportJS

    const compareBtn = screen.getByRole('button', { name: /Compare Candidates/i });
    fireEvent.click(compareBtn);

    await waitFor(() => {
      expect(screen.getByText('Compare Candidates')).toBeInTheDocument();
      const auth0Headings = screen.getAllByText('Auth0');
      expect(auth0Headings.length).toBeGreaterThan(1);
      
      const passportHeadings = screen.getAllByText('PassportJS');
      expect(passportHeadings.length).toBeGreaterThan(1);
    });
  });

  it('renders tools panel with MCP, LOCAL, and FALLBACK providers', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderResearchExplorer();

    await waitFor(() => {
      expect(screen.getByText('search_github')).toBeInTheDocument();
      expect(screen.getByText('MCP')).toBeInTheDocument();
      
      expect(screen.getByText('check_vulns')).toBeInTheDocument();
      expect(screen.getByText('LOCAL')).toBeInTheDocument();
      
      expect(screen.getByText('fallback_search')).toBeInTheDocument();
      expect(screen.getByText('FALLBACK')).toBeInTheDocument();
      expect(screen.getByText(/External MCP unavailable/i)).toBeInTheDocument();
    });
  });
});
