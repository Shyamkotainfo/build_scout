import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ArchitectureExplorer from '../pages/ArchitectureExplorer';
import * as analysisService from '../services/analysis_service';

vi.mock('../services/analysis_service');

const mockAnalysis = {
  analysis_id: 'test-arch-123',
  status: 'COMPLETED',
  requirements: [{}],
  candidates: [{}, {}],
  decisions: [
    { component_id: 'COMP-1', decision: 'REUSE', reason: 'Industry standard', risks: ['Vendor lock-in'] },
    { component_id: 'COMP-2', decision: 'BUILD', reason: 'Custom logic needed' }
  ],
  blueprint: {
    solution_summary: 'Test solution summary',
    architecture_style: 'microservices',
    reuse_summary: { reuse: 2, adapt: 1, build: 3 },
    data_flow: ['Frontend', 'API Gateway', 'Microservice'],
    components: [
      { component_id: 'COMP-1', component_name: 'Auth', technology: 'Auth0', responsibility: 'Login', integration: 'REST' },
      { component_id: 'COMP-2', component_name: 'API', technology: 'FastAPI', responsibility: 'Routing', integration: 'Internal' }
    ],
    integration_points: [
      { name: 'Payment', description: 'Stripe integration', type: 'External', protocol: 'HTTPS', retries: 3 }
    ],
    implementation_phases: [
      { phase: 'Phase 1', description: 'Setup core', components: ['Auth', 'API'] }
    ],
    risks: [
      { risk: 'High latency', severity: 'CRITICAL', mitigation: 'CDN' }
    ]
  }
};

describe('ArchitectureExplorer Page - Phase 6', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={[`/architecture/test-arch-123`]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/architecture/:analysisId" element={<ArchitectureExplorer />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );
  };

  it('1. Renders loading state', () => {
    analysisService.getAnalysis.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/Loading architecture/i)).toBeInTheDocument();
  });

  it('2. Architecture Header Metrics are rendered', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('microservices')).toBeInTheDocument();
      // Test metrics grid length bindings
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // 2 Components
    });
  });

  it('3. Architecture Trust Signal counts', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Trust & Traceability/i)).toBeInTheDocument();
      // Components (2), Candidates (2), Decisions (2)
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });
  });

  it('4. REUSE / ADAPT / BUILD summary is accurate', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Reuse
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Adapt
      expect(screen.getAllByText('3').length).toBeGreaterThan(0); // Build
    });
  });

  it('5. Component Cards render with correct data', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Auth').length).toBeGreaterThan(0);
      expect(screen.getAllByText('REUSE').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Auth0').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Login').length).toBeGreaterThan(0); // Responsibility summary
      expect(screen.getByText('Industry standard')).toBeInTheDocument(); // Reason
    });
  });

  it('6. Data Flow chain renders', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('API Gateway')).toBeInTheDocument();
      expect(screen.getByText('Microservice')).toBeInTheDocument();
    });
  });

  it('7. Integration Map renders keys and badges', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Stripe integration')).toBeInTheDocument();
      expect(screen.getByText('HTTPS')).toBeInTheDocument();
      expect(screen.getByText('External')).toBeInTheDocument();
      expect(screen.getByText(/protocol/i)).toBeInTheDocument();
      expect(screen.getByText(/retries/i)).toBeInTheDocument();
    });
  });

  it('8. Implementation Plan renders timeline', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Phase 1')).toBeInTheDocument();
      expect(screen.getByText('Setup core')).toBeInTheDocument();
      // Components sub-list
      expect(screen.getAllByText('Auth').length).toBeGreaterThan(0);
    });
  });

  it('9. Risks panel renders explicit severities', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('High latency')).toBeInTheDocument();
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
      expect(screen.getByText('CDN')).toBeInTheDocument(); // mitigation
    });
  });

  it('10. Observability and Validation CTAs exist', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      // Find links specifically to avoid matching headings (like Trust & Traceability)
      const links = screen.getAllByRole('link');
      expect(links.some(l => l.textContent.includes('Trace'))).toBe(true);
      expect(links.some(l => l.textContent.includes('Metrics'))).toBe(true);
      expect(links.some(l => l.textContent.includes('MCP'))).toBe(true);
      expect(links.some(l => l.textContent.includes('Validation') || l.textContent.includes('Validate Architecture'))).toBe(true);
    });
  });

  it('11. Handles missing blueprint gracefully', async () => {
    analysisService.getAnalysis.mockResolvedValue({ analysis_id: 'test-arch-123', status: 'COMPLETED' });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No architecture blueprint is available for this analysis.')).toBeInTheDocument();
    });
  });
});
