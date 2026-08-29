import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
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
  status: 'COMPLETED',
  agent_history: ['Supervisor', 'ResearchAgent', 'DecisionAgent', 'ValidationAgent'],
  llm_metrics: { total_calls: 5, total_tokens: 15000, total_latency_ms: 12000 },
  traces: [
    {
      agent_name: 'Supervisor',
      status: 'COMPLETED',
      execution_order: 1,
      duration_ms: 1500,
      llm_calls_count: 1,
      total_tokens: 300,
      input_tokens: 200,
      output_tokens: 100,
      retry_count: 0
    },
    {
      agent_name: 'ResearchAgent',
      status: 'COMPLETED',
      execution_order: 2,
      duration_ms: 2500,
      llm_calls_count: 2,
      total_tokens: 1500,
      input_tokens: 1000,
      output_tokens: 500,
      retry_count: 1,
      tool_calls: [
        {
          tool_name: 'search_web',
          provider: 'MCP',
          status: 'SUCCESS',
          arguments: { query: 'Node.js auth solutions' },
          latency_ms: 500
        },
        {
          tool_name: 'search_local',
          provider: 'LOCAL',
          status: 'SUCCESS',
          arguments: { query: 'react libs' },
          latency_ms: 100
        }
      ]
    },
    {
      agent_name: 'DecisionAgent',
      status: 'FAILED',
      execution_order: 3,
      duration_ms: 500,
      llm_calls_count: 0,
      total_tokens: 0,
      retry_count: 0,
      error_message: 'API rate limit exceeded'
    },
    {
      agent_name: 'ValidationAgent',
      status: 'UNKNOWN'
    }
  ]
};

describe('AgentTraceExplorer Page Redesign', () => {
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

  it('1. Renders loading state', () => {
    analysisService.getAnalysis.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/Loading agent traces/i)).toBeInTheDocument();
  });

  it('2. Pipeline renders correctly with agents mapped to stages', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockTraceAnalysis);
    renderPage();
    await waitFor(() => {
      // Pipeline Stages
      expect(screen.getByText('PROMPT')).toBeInTheDocument();
      expect(screen.getByText('DISCOVER')).toBeInTheDocument();
      expect(screen.getByText('EVALUATE')).toBeInTheDocument();
      expect(screen.getByText('DECIDE')).toBeInTheDocument();
      
      // Agents mapped to the pipeline
      expect(screen.getAllByText('ResearchAgent').length).toBeGreaterThan(0);
      expect(screen.getAllByText('DecisionAgent').length).toBeGreaterThan(0);
    });
  });

  it('3. Agent Cards expand to show details and tool tables', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockTraceAnalysis);
    renderPage();
    await waitFor(() => {
      // The summary "What it did" description should be rendered
      expect(screen.getByText(/Selected REUSE, ADAPT, or BUILD/i)).toBeInTheDocument();
    });

    // Expand ResearchAgent card (clicking the container)
    const researchAgentCard = screen.getByTestId('expand-ResearchAgent');
    await act(async () => {
      fireEvent.click(researchAgentCard);
    });

    await waitFor(() => {
      // Tool table appears
      expect(screen.getByText(/Execution Metrics & Tools/i)).toBeInTheDocument();
      expect(screen.getAllByText(/search_web/i).length).toBeGreaterThan(0);
    });
  });

  it('4. Handles FAILED states correctly and displays error reason', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockTraceAnalysis);
    renderPage();
    await waitFor(() => {
      // Error in the collapsed state
      expect(screen.getAllByText('Agent failed to complete.').length).toBeGreaterThan(0);
    });

    // Expand DecisionAgent
    const decisionAgentCard = screen.getByTestId('expand-DecisionAgent');
    fireEvent.click(decisionAgentCard);

    await waitFor(() => {
      // Expanded error state
      expect(screen.getByText('Error Reason')).toBeInTheDocument();
      expect(screen.getByText('API rate limit exceeded')).toBeInTheDocument();
    });
  });

  it('5. Final Execution Summary computes correctly', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockTraceAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('15,000')).toBeInTheDocument(); // Tokens
      expect(screen.getAllByText('12.0s').length).toBeGreaterThan(0); // Latency 12000ms
      expect(screen.getAllByText('5').length).toBeGreaterThan(0); // Total LLM
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Total Tools
    });
  });

  it('6. Handles missing traces gracefully', async () => {
    analysisService.getAnalysis.mockResolvedValue({ analysis_id: '123' });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No agent execution traces found in this analysis.')).toBeInTheDocument();
    });
  });
});
