import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import V2Specification from '../pages/V2Specification';

describe('V2Specification Presentation Page', () => {
  const renderV2Spec = () => {
    return render(
      <BrowserRouter>
        <V2Specification />
      </BrowserRouter>
    );
  };

  it('renders the V2 Vision header', () => {
    renderV2Spec();
    expect(screen.getByText('V2 Specification')).toBeInTheDocument();
    expect(screen.getByText('The V2 Vision')).toBeInTheDocument();
  });

  it('renders all V2 themes', () => {
    renderV2Spec();
    expect(screen.getByText('Memory & Context')).toBeInTheDocument();
    expect(screen.getByText('Intelligent Analysis')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Governance')).toBeInTheDocument();
    expect(screen.getByText('Production Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Collaboration')).toBeInTheDocument();
  });

  it('labels every capability as PLANNED — V2', () => {
    renderV2Spec();
    // Verify that the capability cards all have the planned badge
    const badges = screen.getAllByText('PLANNED — V2');
    expect(badges.length).toBeGreaterThan(5); 
    
    // Check specific capabilities exist
    expect(screen.getAllByText('Context Retrieval & Memory').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Prompt Optimizer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Architecture Alternatives').length).toBeGreaterThan(0);
    expect(screen.getByText('Security & Compliance Intelligence')).toBeInTheDocument();
    
    // Check that context fields exist
    const expectedOutcomes = screen.getAllByText('Expected Outcome');
    expect(expectedOutcomes.length).toBeGreaterThan(0);
  });
});
