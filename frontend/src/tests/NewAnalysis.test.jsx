import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewAnalysis from '../pages/NewAnalysis';
import * as analysisService from '../services/analysis_service';

vi.mock('../services/analysis_service');

describe('NewAnalysis Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderNewAnalysis = () => {
    return render(
      <MemoryRouter initialEntries={['/new-analysis']}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/new-analysis" element={<NewAnalysis />} />
          <Route path="/analyses/:id" element={<div data-testid="result-page">Result Page</div>} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );
  };

  it('renders correctly', () => {
    renderNewAnalysis();
    expect(screen.getByText(/New Analysis/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Build an AI document intelligence platform/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
  });

  it('validates empty input by disabling button', () => {
    renderNewAnalysis();
    const btn = screen.getByRole('button', { name: /Analyze/i });
    expect(btn).toBeDisabled();
    expect(analysisService.createAnalysis).not.toHaveBeenCalled();
  });

  it('clears input and errors', () => {
    renderNewAnalysis();
    const input = screen.getByPlaceholderText(/Build an AI document intelligence platform/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    
    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearBtn);
    
    expect(input.value).toBe('');
  });

  it('handles successful POST and redirects', async () => {
    analysisService.createAnalysis.mockResolvedValue({ analysis_id: 'test-123' });
    renderNewAnalysis();
    
    const input = screen.getByPlaceholderText(/Build an AI document intelligence platform/i);
    fireEvent.change(input, { target: { value: 'Test Request' } });
    
    const btn = screen.getByRole('button', { name: /Analyze/i });
    fireEvent.click(btn);
    
    await waitFor(() => {
      expect(localStorage.getItem('latest_analysis_id')).toBe('test-123');
      expect(screen.getByTestId('result-page')).toBeInTheDocument();
    });
  });

  it('handles network failure', async () => {
    analysisService.createAnalysis.mockRejectedValue({ code: 'NETWORK_FAILURE', status: 0, message: 'Network Error' });
    renderNewAnalysis();
    
    const input = screen.getByPlaceholderText(/Build an AI document intelligence platform/i);
    fireEvent.change(input, { target: { value: 'Test Request' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Unable to connect to the BuildScout backend/i)).toBeInTheDocument();
    });
  });

  it('handles 422 validation error from backend', async () => {
    analysisService.createAnalysis.mockRejectedValue({ code: 'VALIDATION_ERROR', status: 422, message: 'Validation Error' });
    renderNewAnalysis();
    
    const input = screen.getByPlaceholderText(/Build an AI document intelligence platform/i);
    fireEvent.change(input, { target: { value: 'Test Request' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Please provide a valid description of what you want to build/i)).toBeInTheDocument();
    });
  });

  it('handles 503 error', async () => {
    analysisService.createAnalysis.mockRejectedValue({ code: 'SERVICE_UNAVAILABLE', status: 503, message: 'Service Unavailable' });
    renderNewAnalysis();
    
    const input = screen.getByPlaceholderText(/Build an AI document intelligence platform/i);
    fireEvent.change(input, { target: { value: 'Test Request' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Service Unavailable/i, { selector: 'p' })).toBeInTheDocument();
    });
  });

  it('handles generic 500 error', async () => {
    analysisService.createAnalysis.mockRejectedValue({ code: 'UNKNOWN_ERROR', status: 500, message: 'Internal Server Error' });
    renderNewAnalysis();
    
    const input = screen.getByPlaceholderText(/Build an AI document intelligence platform/i);
    fireEvent.change(input, { target: { value: 'Test Request' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Internal Server Error/i, { selector: 'p' })).toBeInTheDocument();
    });
  });
});
