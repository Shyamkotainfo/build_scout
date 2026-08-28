import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AgentTraceExplorer from '../pages/AgentTraceExplorer';
import * as analysisService from '../services/analysis_service';
import { DataProvider } from '../contexts/DataContext';
import { HealthProvider } from '../contexts/HealthContext';

vi.mock('../services/analysis_service');

const mockTraceAnalysis = {
  analysis_id: 'test-trace-123',
  domain: 'E-commerce API',
  traces: [
    {
      id: 'TRACE-1',
      agent_name: 'supervisor',
      role: 'System Architect',
      timestamp: '2026-08-25T10:00:00Z',
      input: 'Decompose the E-commerce API request',
      output: 'Identified 3 components: Auth, Product, Cart',
      status: 'SUCCESS',
      execution_time_ms: 1500,
      tokens_used: 1200
    },
    {
      id: 'TRACE-2',
      agent_name: 'research',
      role: 'Research Specialist',
      timestamp: '2026-08-25T10:01:00Z',
      input: 'Research Auth component options',
      output: 'Found Auth0, PassportJS',
      status: 'SUCCESS',
      execution_time_ms: 2500,
      tokens_used: 3500,
      tool_calls: [
        {
          name: 'search_web',
          provider: 'MCP',
          status: 'SUCCESS',
          args: { query: 'Node.js auth solutions' },
          result: 'Auth0 is top rated. PassportJS is open source.'
        }
      ]
    },
    {
      id: 'TRACE-3',
      agent_name: 'decision',
      role: 'Principal Engineer',
      timestamp: '2026-08-25T10:02:00Z',
      input: 'Evaluate Auth options',
      output: 'Decided on Auth0 (REUSE)',
      status: 'FAILED',
      error: 'API rate limit exceeded',
      execution_time_ms: 500,
      tokens_used: 400
    }
  ]
};

describe('AgentTraceExplorer Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (analysisId = 'test-trace-123') => {
    return render(
      <MemoryRouter initialEntries={[`/traces/${analysisId}`]}>
        <HealthProvider>
          <DataProvider>
            <Routes>
              <Route path="/traces/:analysisId" element={<AgentTraceExplorer />} />
            </Routes>
          </DataProvider>
        </HealthProvider>
      </MemoryRouter>
    );
  };

  it('12. Trace page renders loading', () => {
    analysisService.getAnalysis.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/Loading agent traces/i)).toBeInTheDocument();
  });

  it('13. Agent sequence and 15. Execution order rendered in timeline', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockTraceAnalysis);
    renderPage();
    await waitFor(() => {
      // Timeline checks
      expect(screen.getAllByText('Supervisor').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Research').length).toBeGreaterThan(0);
      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('02')).toBeInTheDocument();
    });
  });

  it('14. Agent statuses map correctly (22. Failed, 23. Unknown)', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockTraceAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('COMPLETED').length).toBeGreaterThan(0);
      expect(screen.getAllByText('FAILED').length).toBeGreaterThan(0);
      expect(screen.getAllByText('UNKNOWN').length).toBeGreaterThan(0);
    });
  });

  it('24. LLM metrics rendered when available', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockTraceAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('gpt-4o')).toBeInTheDocument();
      expect(screen.getByText('15,000')).toBeInTheDocument();
      expect(screen.getByText('1200ms')).toBeInTheDocument();
    });
  });

  it('16. Tool calls displayed for selected agent', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockTraceAnalysis);
    renderPage();
    await waitFor(() => {
      // It auto-selects Supervisor first (has no tool calls)
      expect(screen.getByText('No tool calls were recorded for this agent.')).toBeInTheDocument();
    });

    // Click Research
    fireEvent.click(screen.getByText('Research'));

    await waitFor(() => {
      expect(screen.getByText('search_web')).toBeInTheDocument();
      expect(screen.getByText('search_local')).toBeInTheDocument();
      expect(screen.getByText('fallback_search')).toBeInTheDocument();
    });
  });

  it('17. MCP, 18. LOCAL, 19. FALLBACK badges display properly', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockTraceAnalysis);
    renderPage();
    await waitFor(() => {
      fireEvent.click(screen.getByText('Research'));
    });

    await waitFor(() => {
      expect(screen.getAllByText('MCP').length).toBeGreaterThan(0);
      expect(screen.getAllByText('LOCAL').length).toBeGreaterThan(0);
      expect(screen.getAllByText('FALLBACK').length).toBeGreaterThan(0);
      
      // Fallback specific message
      expect(screen.getByText('External MCP unavailable — local fallback used')).toBeInTheDocument();
    });
  });

  it('20. Masked arguments are displayed safely', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockTraceAnalysis);
    renderPage();
    await waitFor(() => {
      fireEvent.click(screen.getByText('Research'));
    });

    await waitFor(() => {
      // Check that stringified arguments render
      expect(screen.getByText(/"query":\s*"react libs"/)).toBeInTheDocument();
      expect(screen.getByText(/"q":\s*"safe fallback"/)).toBeInTheDocument();
    });
  });

  it('21. Handles missing traces gracefully', async () => {
    analysisService.getAnalysis.mockResolvedValue({ analysis_id: '123' });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No agent trace data is available for this analysis.')).toBeInTheDocument();
    });
  });
});
