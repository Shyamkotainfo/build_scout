import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ValidationExplorer from '../pages/ValidationExplorer';
import * as analysisService from '../services/analysis_service';

vi.mock('../services/analysis_service');

const mockAnalysis = {
  analysis_id: 'test-valid-123',
  status: 'COMPLETED',
  domain: 'Financial Services',
  requirements: [
    { name: 'Req 1', description: 'Secure auth' },
    { name: 'Req 2', description: 'Fast processing' }
  ],
  candidates: [{}, {}, {}],
  decisions: [{}, {}],
  blueprint: { components: [{}, {}] },
  validation_result: {
    overall_status: 'WARN',
    overall_score: 84,
    reasoning: 'The proposed architecture satisfies most requirements but has areas that should be reviewed before implementation.',
    critical_issues: [],
    warnings: ['Security review recommended'],
    requirement_coverage: { status: 'PASS' },
    architecture_consistency: { status: 'WARN' }
  }
};

describe('ValidationExplorer Page - Phase 7', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (analysisId = 'test-valid-123') => {
    return render(
      <MemoryRouter initialEntries={[`/validation/${analysisId}`]}>
        <HealthProvider>
          <DataProvider>
            <Routes>
              <Route path="/validation/:analysisId" element={<ValidationExplorer />} />
            </Routes>
          </DataProvider>
        </HealthProvider>
      </MemoryRouter>
    );
  };

  it('1. Renders loading state', () => {
    analysisService.getAnalysis.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/Loading validation data/i)).toBeInTheDocument();
  });

  it('2. Validation Header and Workflow Indicator render correctly', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Architecture Validation')).toBeInTheDocument();
      expect(screen.getByText('Financial Services')).toBeInTheDocument();
      expect(screen.getAllByText('VALIDATE').length).toBeGreaterThan(0);
    });
  });

  it('3. Overall Validation Result displays real score and status', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('84 / 100')).toBeInTheDocument();
      expect(screen.getAllByText('WARNING').length).toBeGreaterThan(0);
      expect(screen.getByText(/BuildScout identified areas that should be reviewed before implementation/i)).toBeInTheDocument();
    });
  });

  it('4. Score Explanation displays reasoning', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Why this score?')).toBeInTheDocument();
      expect(screen.getByText(/The proposed architecture satisfies most requirements/i)).toBeInTheDocument();
    });
  });

  it('5. Validation Checks map real categories', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Requirements Coverage').length).toBeGreaterThan(0);
      expect(screen.getByText('Architecture Consistency')).toBeInTheDocument();
      expect(screen.getByText('Passed')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
    });
  });

  it('6. Requirements Coverage renders actual requirements', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('2 / 2 requirements addressed')).toBeInTheDocument();
      expect(screen.getByText('Secure auth')).toBeInTheDocument();
      expect(screen.getByText('Fast processing')).toBeInTheDocument();
    });
  });

  it('7. Warnings block renders real warnings', async () => {
    analysisService.getAnalysis.mockResolvedValue(mockAnalysis);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Review Before Implementation')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Security review recommended')).toBeInTheDocument();
    });
  });

  it('8. Handles PASS state properly', async () => {
    const passAnalysis = JSON.parse(JSON.stringify(mockAnalysis));
    passAnalysis.validation_result.overall_status = 'PASS';
    passAnalysis.validation_result.overall_score = 100;
    passAnalysis.validation_result.warnings = [];
    analysisService.getAnalysis.mockResolvedValue(passAnalysis);
    renderPage('pass-123');
    await waitFor(() => {
      expect(screen.getByText('100 / 100')).toBeInTheDocument();
      expect(screen.getAllByText('PASS').length).toBeGreaterThan(0);
      expect(screen.getByText(/BuildScout found the proposed architecture consistent/i)).toBeInTheDocument();
      expect(screen.getByText('No validation warnings identified')).toBeInTheDocument();
    });
  });

  it('9. Handles missing score properly (N/A)', async () => {
    const missingAnalysis = JSON.parse(JSON.stringify(mockAnalysis));
    missingAnalysis.validation_result.overall_score = null;
    analysisService.getAnalysis.mockResolvedValue(missingAnalysis);
    renderPage('missing-123');
    await waitFor(() => {
      expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    });
  });

  it('10. Handles NOT AVAILABLE state properly', async () => {
    const noValAnalysis = JSON.parse(JSON.stringify(mockAnalysis));
    noValAnalysis.validation_result = null; 
    analysisService.getAnalysis.mockResolvedValue(noValAnalysis);
    renderPage('noval-123');
    await waitFor(() => {
      expect(screen.getByText('Validation results are not available for this analysis.')).toBeInTheDocument();
    });
  });

});
