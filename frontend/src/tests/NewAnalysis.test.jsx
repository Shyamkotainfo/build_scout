import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
      <MemoryRouter initialEntries={['/new-analysis']}>
        <Routes>
          <Route path="/new-analysis" element={<NewAnalysis />} />
          <Route path="/analyses/:id" element={<div data-testid="result-page">Result Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders correctly', () => {
    renderNewAnalysis();
    expect(screen.getByText(/New Analysis/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/I want to build an AI customer-support assistant/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
  });

  it('validates empty input', () => {
    renderNewAnalysis();
    const btn = screen.getByRole('button', { name: /Analyze/i });
    fireEvent.click(btn);
    expect(screen.getByText(/Please describe what you want to build/i)).toBeInTheDocument();
    expect(analysisService.createAnalysis).not.toHaveBeenCalled();
  });

  it('clears input and errors', () => {
    renderNewAnalysis();
    const input = screen.getByPlaceholderText(/I want to build/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    
    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearBtn);
    
    expect(input.value).toBe('');
  });

  it('handles successful POST and redirects', async () => {
    analysisService.createAnalysis.mockResolvedValue({ analysis_id: 'test-123' });
    renderNewAnalysis();
    
    const input = screen.getByPlaceholderText(/I want to build/i);
    fireEvent.change(input, { target: { value: 'Test Request' } });
    
    const btn = screen.getByRole('button', { name: /Analyze/i });
    fireEvent.click(btn);
    
    // Check loading state
    expect(screen.getByText(/Running BuildSmart analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Supervisor/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(localStorage.getItem('latest_analysis_id')).toBe('test-123');
      expect(screen.getByTestId('result-page')).toBeInTheDocument();
    });
  });

  it('handles network failure', async () => {
    analysisService.createAnalysis.mockRejectedValue(new Error('Network Error'));
    renderNewAnalysis();
    
    const input = screen.getByPlaceholderText(/I want to build/i);
    fireEvent.change(input, { target: { value: 'Test Request' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Unable to connect to the BuildSmart backend/i)).toBeInTheDocument();
    });
  });

  it('handles 422 validation error from backend', async () => {
    const error = new Error('Validation Error');
    error.response = { status: 422 };
    analysisService.createAnalysis.mockRejectedValue(error);
    renderNewAnalysis();
    
    const input = screen.getByPlaceholderText(/I want to build/i);
    fireEvent.change(input, { target: { value: 'Test Request' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Please describe what you want to build/i)).toBeInTheDocument();
    });
  });

  it('handles 503 error', async () => {
    const error = new Error('Service Unavailable');
    error.response = { status: 503 };
    analysisService.createAnalysis.mockRejectedValue(error);
    renderNewAnalysis();
    
    const input = screen.getByPlaceholderText(/I want to build/i);
    fireEvent.change(input, { target: { value: 'Test Request' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/AI service is temporarily unavailable/i)).toBeInTheDocument();
    });
  });

  it('handles generic 500 error', async () => {
    const error = new Error('Internal Server Error');
    error.response = { status: 500 };
    analysisService.createAnalysis.mockRejectedValue(error);
    renderNewAnalysis();
    
    const input = screen.getByPlaceholderText(/I want to build/i);
    fireEvent.change(input, { target: { value: 'Test Request' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/BuildSmart could not complete this analysis/i)).toBeInTheDocument();
    });
  });
});
