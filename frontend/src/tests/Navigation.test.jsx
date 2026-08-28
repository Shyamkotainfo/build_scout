import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalysisResult from '../pages/AnalysisResult';
import ResearchExplorer from '../pages/ResearchExplorer';
import ArchitectureExplorer from '../pages/ArchitectureExplorer';
import AgentTraceExplorer from '../pages/AgentTraceExplorer';
import McpConsole from '../pages/McpConsole';
import LlmMetricsConsole from '../pages/LlmMetricsConsole';
import * as analysisService from '../services/analysis_service';
import { HealthProvider } from '../contexts/HealthContext';

vi.mock('../services/analysis_service');

const mockBasicAnalysis = {
  analysis_id: 'test-nav-123',
  status: 'COMPLETED',
  blueprint: { components: [] },
  traces: [{ agent_name: 'test', status: 'COMPLETED' }]
};

describe('Cross-Page Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analysisService.getAnalysis.mockResolvedValue(mockBasicAnalysis);
  });





  it('28. Architecture links to Trace', async () => {
    render(
      <MemoryRouter initialEntries={[`/architecture/test-nav-123`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/architecture/:analysisId" element={<ArchitectureExplorer />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Trace/i });
      expect(link).toBeInTheDocument();
      expect(link.getAttribute('href')).toBe('/traces/test-nav-123');
    });
  });

  it('29. Trace links to Architecture and Analysis Result', async () => {
    render(
      <MemoryRouter initialEntries={[`/traces/test-nav-123`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/traces/:analysisId" element={<AgentTraceExplorer />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );

    await waitFor(() => {
      const linkArch = screen.getByRole('link', { name: /View Architecture/i });
      expect(linkArch).toBeInTheDocument();
      expect(linkArch.getAttribute('href')).toBe('/architecture/test-nav-123');

      const linkAnalysis = screen.getByRole('link', { name: /Back to Analysis Result/i });
      expect(linkAnalysis).toBeInTheDocument();
      expect(linkAnalysis.getAttribute('href')).toBe('/analyses/test-nav-123');
    });
  });

  it('37. Research -> MCP', async () => {
    render(
      <MemoryRouter initialEntries={[`/research/test-nav-123`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/research/:analysisId" element={<ResearchExplorer />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /View MCP & Tools/i });
      expect(link.getAttribute('href')).toBe('/mcp/test-nav-123');
    });
  });

  it('38. Trace -> Metrics', async () => {
    render(
      <MemoryRouter initialEntries={[`/traces/test-nav-123`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/traces/:analysisId" element={<AgentTraceExplorer />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /View LLM Metrics/i });
      expect(link.getAttribute('href')).toBe('/metrics/test-nav-123');
    });
  });

  it('39. MCP -> Trace', async () => {
    render(
      <MemoryRouter initialEntries={[`/mcp/test-nav-123`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/mcp/:analysisId" element={<McpConsole />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /View Agent Trace/i });
      expect(link.getAttribute('href')).toBe('/traces/test-nav-123');
    });
  });

  it('40. Metrics -> Trace', async () => {
    render(
      <MemoryRouter initialEntries={[`/metrics/test-nav-123`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/metrics/:analysisId" element={<LlmMetricsConsole />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /View Agent Trace/i });
      expect(link.getAttribute('href')).toBe('/traces/test-nav-123');
    });
  });
});
