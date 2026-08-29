import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResearchExplorer from '../pages/ResearchExplorer';
import * as analysisService from '../services/analysis_service';

vi.mock('../services/analysis_service');

const mockAnalysis = {
  analysis_id: 'test-123',
  domain: 'Security System',
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

describe('ResearchExplorer Page Phase 4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderResearchExplorer = () => {
    return render(
      <MemoryRouter initialEntries={[`/research/test-123`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/research/:analysisId" element={<ResearchExplorer />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
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
      expect(screen.getByText(/No Analysis Selected/i)).toBeInTheDocument();
    });
  });

  it('renders components and summary correctly', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderResearchExplorer();

    await waitFor(() => {
      // Summary values
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Components
      expect(screen.getAllByText('3').length).toBeGreaterThan(0); // Candidates
      
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

    const searchInput = screen.getByPlaceholderText(/Search solutions/i);
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

  it('opens candidate panel with evidence, eval, and decision', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderResearchExplorer();

    await waitFor(() => {
      expect(screen.getByText('Auth0')).toBeInTheDocument();
    });

    // Click candidate
    fireEvent.click(screen.getByText('Auth0'));

    await waitFor(() => {
      // Panel content
      expect(screen.getAllByText('AuthaaS').length).toBeGreaterThan(0); // Interpretation
      expect(screen.getByText('BuildScout Interpretation')).toBeInTheDocument();
      expect(screen.getByText('Retrieved Evidence (Facts)')).toBeInTheDocument();
      
      // Eval
      expect(screen.getAllByText('95').length).toBeGreaterThan(0); // Score
      
      // Decision
      expect(screen.getAllByText('REUSE').length).toBeGreaterThan(0);
      expect(screen.getByText('Selected')).toBeInTheDocument();
      expect(screen.getAllByText('Best fit').length).toBeGreaterThan(0);
    });
  });

  it('renders explicit missing evidence states', async () => {
    // Modify mock to omit license and url
    const incompleteCandidateMock = {
      ...mockAnalysis,
      candidates: [
        { component_id: 'COMP-1', name: 'UnknownLib', description: 'No facts', metadata: { source: 'tavily' } }
      ]
    };
    analysisService.getAnalysis.mockResolvedValue(incompleteCandidateMock);
    renderResearchExplorer();

    await waitFor(() => {
      expect(screen.getByText('UnknownLib')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('UnknownLib'));

    await waitFor(() => {
      expect(screen.getByText('Not available from retrieved evidence')).toBeInTheDocument();
      expect(screen.getByText('Source URL unavailable')).toBeInTheDocument();
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
