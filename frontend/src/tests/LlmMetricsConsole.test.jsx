import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LlmMetricsConsole from '../pages/LlmMetricsConsole';
import * as analysisService from '../services/analysis_service';

vi.mock('../services/analysis_service');

const mockMetrics = {
  analysis_id: 'test-metrics-123',
  llm_metrics: {
    total_calls: 25,
    successful_calls: 24,
    failed_calls: 1,
    total_retries: 2,
    total_input_tokens: 100000,
    total_output_tokens: 20000,
    total_tokens: 120000,
    total_latency_ms: 15000,
    average_latency_ms: 600,
    context_compactions: 1,
    total_cost: 0.045,
    per_agent: [
      { agent: 'Research', calls: 10, inputTokens: 50000, outputTokens: 10000, totalTokens: 60000, retries: 1, latencyMs: 5000, status: 'SUCCESS' }
    ],
    per_model: [
      { model: 'gpt-4o', calls: 25, inputTokens: 100000, outputTokens: 20000, totalTokens: 120000, latencyMs: 15000, cost: 0.045 }
    ]
  }
};

describe('LlmMetricsConsole Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (id = 'test-metrics-123') => {
    return render(
      <MemoryRouter initialEntries={[`/metrics/${id}`]}>
        <Routes>
          <Route path="/metrics/:analysisId" element={<LlmMetricsConsole />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('16. Metrics page renders', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMetrics);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('LLM Observability Console')).toBeInTheDocument();
    });
  });

  it('17. Total calls, 18. Successful, 19. Failed, 20. Retries render', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMetrics);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('25')[0]).toBeInTheDocument();
      expect(screen.getAllByText('24')[0]).toBeInTheDocument();
      expect(screen.getAllByText('1')[0]).toBeInTheDocument();
      expect(screen.getAllByText('2')[0]).toBeInTheDocument();
    });
  });

  it('21. Input tokens, 22. Output tokens, 23. Total tokens render (31. Viz)', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMetrics);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('100,000')[0]).toBeInTheDocument();
      expect(screen.getAllByText('20,000')[0]).toBeInTheDocument();
      expect(screen.getAllByText('120,000')[0]).toBeInTheDocument();
    });
  });

  it('24. Average latency, 25. Total latency, 27. Cost render', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMetrics);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('600ms')).toBeInTheDocument();
      expect(screen.getByText('15.00s')).toBeInTheDocument();
      expect(screen.getAllByText('$0.0450')[0]).toBeInTheDocument();
    });
  });

  it('26. Context compactions render', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMetrics);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('1 oversized LLM request(s) were compacted before retry.')).toBeInTheDocument();
    });
  });

  it('28. Per-agent metrics render', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMetrics);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('LLM Usage by Agent')).toBeInTheDocument();
      expect(screen.getAllByText('Research').length).toBeGreaterThan(0);
      expect(screen.getByText('50,000')).toBeInTheDocument();
    });
  });

  it('29. Per-model metrics render', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockMetrics);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('LLM Usage by Model').length).toBeGreaterThan(0);
      expect(screen.getByText('gpt-4o')).toBeInTheDocument();
    });
  });

  it('32. Empty metrics render graceful zeros', async () => {
    analysisService.getAnalysis.mockResolvedValue({ analysis_id: 'empty-123', llm_metrics: {} });
    renderPage('empty-123');
    await waitFor(() => {
      // Should handle empty object safely
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      expect(screen.getByText('Token usage unavailable for this analysis.')).toBeInTheDocument();
      expect(screen.getByText('Per-model metrics are not available for this analysis.')).toBeInTheDocument();
    });
  });
});
