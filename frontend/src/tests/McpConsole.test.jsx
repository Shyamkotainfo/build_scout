import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import McpConsole from '../pages/McpConsole';
import * as analysisService from '../services/analysis_service';

vi.mock('../services/analysis_service');

const mockMcpAnalysis = {
  analysis_id: 'test-mcp-123',
  traces: [
    {
      agent_name: 'Research',
      tool_calls: [
        {
          name: 'search_repositories',
          provider: 'MCP',
          server: 'github',
          status: 'SUCCESS',
          latency_ms: 1200,
          arguments: { q: 'react' }
        },
        {
          name: 'fallback_search',
          provider: 'FALLBACK',
          server: 'local_sys',
          status: 'COMPLETED',
          latency_ms: 300,
          arguments: { q: 'react text' }
        },
        {
          name: 'security.get',
          provider: 'LOCAL',
          server: 'native',
          status: 'FAILED',
          latency_ms: 150,
          arguments: { check: true }
        }
      ]
    }
  ]
};

const emptyAnalysis = {
  analysis_id: 'empty-123',
  traces: []
};

describe('McpConsole Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (id = 'test-mcp-123') => {
    return render(
      <MemoryRouter initialEntries={[`/mcp/${id}`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/mcp/:analysisId" element={<McpConsole />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );
  };

  it('1. MCP page renders', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMcpAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('MCP & Tool Console')).toBeInTheDocument();
    });
  });

  it('2. Tool architecture renders', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMcpAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Available BuildSmart Tool Architecture')).toBeInTheDocument();
      expect(screen.getByText('Unified Tool Gateway')).toBeInTheDocument();
    });
  });

  it('3. Capability registry renders', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMcpAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Registered Capabilities')).toBeInTheDocument();
      expect(screen.getByText('github.search')).toBeInTheDocument();
      expect(screen.getByText('web.search')).toBeInTheDocument();
    });
  });

  it('4. Actual MCP calls render and 5. LOCAL tools render and 6. FALLBACK renders', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMcpAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('search_repositories')).toBeInTheDocument();
      expect(screen.getByText('fallback_search')).toBeInTheDocument();
      expect(screen.getAllByText('security.get')[0]).toBeInTheDocument();

      expect(screen.getAllByText('MCP').length).toBeGreaterThan(0);
      expect(screen.getAllByText('LOCAL').length).toBeGreaterThan(0);
      expect(screen.getAllByText('FALLBACK').length).toBeGreaterThan(0);
    });
  });

  it('7. No false fallback', async () => {
    analysisService.getAnalysis.mockResolvedValue({
      analysis_id: 'no-fallback',
      traces: [{
        agent_name: 'Research',
        tool_calls: [{ provider: 'MCP', name: 'test_tool', status: 'SUCCESS' }]
      }]
    });
    renderPage('no-fallback');
    await waitFor(() => {
      expect(screen.queryByText(/External MCP unavailable/i)).not.toBeInTheDocument();
    });
  });

  it('8. Tool latency and 9. Tool status', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMcpAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('1200ms')).toBeInTheDocument();
      expect(screen.getByText('300ms')).toBeInTheDocument();
      expect(screen.getByText('150ms')).toBeInTheDocument();
      
      expect(screen.getAllByText('SUCCESS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('FAILED').length).toBeGreaterThan(0);
    });
  });

  it('10. Masked arguments', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMcpAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/"q":\s*"react"/)).toBeInTheDocument();
      expect(screen.getByText(/"check":\s*true/)).toBeInTheDocument();
    });
  });

  it('12. MCP unavailable (unknown status)', async () => {
    analysisService.getAnalysis.mockResolvedValue(emptyAnalysis);
    renderPage('empty-123');
    await waitFor(() => {
      // It should display Unknown for MCP runtime status
      expect(screen.getAllByText('Unknown')[0]).toBeInTheDocument();
    });
  });

  it('14. Empty tool trace', async () => {
    analysisService.getAnalysis.mockResolvedValue(emptyAnalysis);
    renderPage('empty-123');
    await waitFor(() => {
      expect(screen.getByText('No Tools Executed')).toBeInTheDocument();
      expect(screen.getByText('Tool execution data is unknown or unavailable for this analysis.')).toBeInTheDocument();
    });
  });
});
