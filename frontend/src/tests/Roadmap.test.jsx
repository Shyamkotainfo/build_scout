import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Roadmap from '../pages/Roadmap';

describe('Roadmap Presentation Page', () => {
  const renderRoadmap = () => {
    return render(
      <BrowserRouter>
        <Roadmap />
      </BrowserRouter>
    );
  };

  it('renders the V1 Available Today section and workflow', () => {
    renderRoadmap();
    expect(screen.getByText('V1 — Available Today')).toBeInTheDocument();
    
    // Check V1 Workflow narrative
    expect(screen.getByText('USER REQUEST')).toBeInTheDocument();
    expect(screen.getByText('ENGINEERING DECISION')).toBeInTheDocument();
    
    // Check V1 Capabilities exist
    expect(screen.getByText('Natural-language request')).toBeInTheDocument();
    expect(screen.getByText('Multi-agent analysis')).toBeInTheDocument();
    expect(screen.getByText('Solution discovery')).toBeInTheDocument();
    expect(screen.getByText('Candidate evaluation')).toBeInTheDocument();
    expect(screen.getByText('REUSE / ADAPT / BUILD')).toBeInTheDocument();
    expect(screen.getByText('Architecture blueprint')).toBeInTheDocument();
    expect(screen.getByText('Architecture validation')).toBeInTheDocument();
    expect(screen.getByText('Agent execution trace')).toBeInTheDocument();
  });

  it('renders the Why V2 section and maturity visualization', () => {
    renderRoadmap();
    expect(screen.getByText('From Solution Discovery to Engineering Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Solution Discovery')).toBeInTheDocument();
    expect(screen.getByText('Organizational Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Engineering Decision Platform')).toBeInTheDocument();
  });

  it('renders V2 capability themes and items correctly labeled as PLANNED', () => {
    renderRoadmap();
    expect(screen.getByText('V2 — Future Evolution')).toBeInTheDocument();
    
    // Check themes
    expect(screen.getByText('1. MEMORY & CONTEXT')).toBeInTheDocument();
    expect(screen.getByText('2. INTELLIGENT ANALYSIS')).toBeInTheDocument();
    expect(screen.getByText('3. ENTERPRISE GOVERNANCE')).toBeInTheDocument();
    expect(screen.getByText('4. PRODUCTION INTELLIGENCE')).toBeInTheDocument();
    expect(screen.getByText('5. COLLABORATION')).toBeInTheDocument();
    
    // Check that items are labeled as PLANNED — V2
    const plannedBadges = screen.getAllByText('PLANNED — V2');
    expect(plannedBadges.length).toBeGreaterThan(5); // At least one for each capability
  });
});
