import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ArchitectureExplorer from '../pages/ArchitectureExplorer';
import * as analysisService from '../services/analysis_service';

vi.mock('../services/analysis_service');

const mockAnalysis = {
  analysis_id: 'test-arch-123',
  status: 'COMPLETED',
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
      { name: 'Payment', description: 'Stripe', protocol: 'HTTPS', retries: 3 }
    ],
    implementation_phases: [
      { phase: 'Phase 1', description: 'Setup core' }
    ],
    assumptions: ['User has internet'],
    risks: ['High latency']
  },
  decisions: [
    { component_id: 'COMP-1', decision: 'REUSE', reason: 'Industry standard', risks: ['Vendor lock-in'] },
    { component_id: 'COMP-2', decision: 'BUILD', reason: 'Custom logic needed' }
  ]
};

describe('ArchitectureExplorer Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={[`/architecture/test-arch-123`]}>
        <Routes>
          <Route path="/architecture/:analysisId" element={<ArchitectureExplorer />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('1. Architecture page renders loading state', () => {
    analysisService.getAnalysis.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/Loading architecture blueprint/i)).toBeInTheDocument();
  });

  it('2. Blueprint summary and 3. Architecture style are rendered', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Test solution summary')).toBeInTheDocument();
      expect(screen.getByText('microservices')).toBeInTheDocument();
      expect(screen.getByText(/test-arch-123/)).toBeInTheDocument();
    });
  });

  it('5. REUSE / ADAPT / BUILD summary is accurate', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Reuse
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Adapt
      expect(screen.getAllByText('3').length).toBeGreaterThan(0); // Build
    });
  });

  it('6. Data flow renders sequential nodes', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('API Gateway')).toBeInTheDocument();
      expect(screen.getByText('Microservice')).toBeInTheDocument();
    });
  });

  it('4. Component rendering maps decisions', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Auth')).toBeInTheDocument();
      expect(screen.getByText('REUSE')).toBeInTheDocument();
      expect(screen.getByText('Auth0')).toBeInTheDocument();
      expect(screen.getByText('Industry standard')).toBeInTheDocument();
      expect(screen.getByText('Vendor lock-in')).toBeInTheDocument();
      
      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('BUILD')).toBeInTheDocument();
      expect(screen.getByText('Custom logic needed')).toBeInTheDocument();
    });
  });

  it('7. Integration points map arbitrary keys correctly', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Stripe')).toBeInTheDocument();
      expect(screen.getByText('HTTPS')).toBeInTheDocument();
      expect(screen.getByText(/protocol/i)).toBeInTheDocument(); // Key should be mapped
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
      expect(screen.getByText(/retries/i)).toBeInTheDocument();
    });
  });

  it('8. Implementation phases map to timeline', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Phase 1')).toBeInTheDocument();
      expect(screen.getByText('Setup core')).toBeInTheDocument();
    });
  });

  it('9. Assumptions and 10. Risks are rendered', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('User has internet')).toBeInTheDocument();
      expect(screen.getByText('High latency')).toBeInTheDocument();
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
