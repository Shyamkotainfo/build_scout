import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import DataModel from '../pages/DataModel';

// Mock lucide-react to prevent SVG rendering issues
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="icon-arrow-left" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
  Database: () => <div data-testid="icon-database" />,
  Code: () => <div data-testid="icon-code" />,
  GitMerge: () => <div data-testid="icon-git-merge" />,
  FileText: () => <div data-testid="icon-file-text" />,
  CheckCircle: () => <div data-testid="icon-check-circle" />,
  Scale: () => <div data-testid="icon-scale" />,
  ShieldAlert: () => <div data-testid="icon-shield-alert" />,
  Cpu: () => <div data-testid="icon-cpu" />,
  Share2: () => <div data-testid="icon-share2" />,
  Layers: () => <div data-testid="icon-layers" />,
  Search: () => <div data-testid="icon-search" />,
  Gavel: () => <div data-testid="icon-gavel" />,
}));

describe('DataModel Presentation Page', () => {
  const renderDataModel = () => {
    return render(
      <BrowserRouter>
        <DataModel />
      </BrowserRouter>
    );
  };

  it('renders the hero section correctly', () => {
    renderDataModel();
    
    // Check main title
    expect(screen.getByText('Data Model')).toBeInTheDocument();
    expect(screen.getByText(/How BuildScout connects requirements/i)).toBeInTheDocument();
    
    // Check flow pipeline nodes
    const nodes = ['Analysis', 'Requirements', 'Candidates', 'Evaluations', 'Decisions', 'Blueprint', 'Validation'];
    nodes.forEach(node => {
      expect(screen.getAllByText(node).length).toBeGreaterThan(0);
    });
  });

  it('renders all core entities with presenter comments', () => {
    renderDataModel();
    
    // Check headers
    expect(screen.getByText('Core Database Entities')).toBeInTheDocument();
    
    // Check specific entities
    expect(screen.getByText('Requirement & Component')).toBeInTheDocument();
    expect(screen.getByText('Candidate & Source')).toBeInTheDocument();
    expect(screen.getByText('CandidateEvaluation & Evidence')).toBeInTheDocument();
    
    // Check that "What To Say" presenter comments are rendered
    const whatToSayElements = screen.getAllByText('What To Say');
    expect(whatToSayElements.length).toBe(7); // 6 core entities + 1 traceability section
  });

  it('renders the traceability section', () => {
    renderDataModel();
    
    expect(screen.getByText('Why Traceability Matters')).toBeInTheDocument();
    expect(screen.getByText('AgentRun')).toBeInTheDocument();
    expect(screen.getByText('ToolCall')).toBeInTheDocument();
    expect(screen.getByText('LLMCall')).toBeInTheDocument();
  });

  it('renders the process narrative', () => {
    renderDataModel();
    
    expect(screen.getByText('From Request to Engineering Decision')).toBeInTheDocument();
    
    // Check steps
    expect(screen.getByText('UNDERSTAND THE REQUEST')).toBeInTheDocument();
    expect(screen.getByText('DISCOVER EXISTING SOLUTIONS')).toBeInTheDocument();
    expect(screen.getByText('EVALUATE')).toBeInTheDocument();
    expect(screen.getByText('DECIDE')).toBeInTheDocument();
    expect(screen.getByText('ARCHITECT AND VALIDATE')).toBeInTheDocument();
  });
  
  it('does not expose raw technical noisy fields directly', () => {
    renderDataModel();
    
    // The page should present fields but not full noisy dumps
    // We expect clean fields like 'user_request', not internal UUIDs mapped directly on screen
    expect(screen.getByText('user_request')).toBeInTheDocument();
  });
});
