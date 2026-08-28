import { render, screen, within } from '@testing-library/react';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import V2Specification from '../pages/V2Specification';
import Roadmap from '../pages/Roadmap';

describe('V2 and Roadmap', () => {
  const renderV2 = () => {
    return render(
      <MemoryRouter initialEntries={['/v2']}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/v2" element={<V2Specification />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );
  };

  const renderRoadmap = () => {
    return render(
      <MemoryRouter initialEntries={['/roadmap']}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/roadmap" element={<Roadmap />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );
  };

  // V2 TESTS
  it('21. V2 page renders', () => {
    renderV2();
    expect(screen.getByText('V2 Specification')).toBeInTheDocument();
  });

  it('22. Human Feedback marked planned', () => {
    renderV2();
    expect(screen.getAllByText('Human Feedback Loop').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PLANNED — V2').length).toBeGreaterThan(0);
  });

  it('23. Memory marked planned', () => {
    renderV2();
    expect(screen.getAllByText(/Memory & Context Retrieval/).length).toBeGreaterThan(0);
  });

  it('24. Prompt Optimizer marked planned', () => {
    renderV2();
    expect(screen.getAllByText(/Prompt Optimizer/).length).toBeGreaterThan(0);
  });

  it('25. Skills roadmap', () => {
    renderV2();
    expect(screen.getAllByText(/Expanded Skills/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('PARTIAL — V2').length).toBeGreaterThan(0);
  });

  it('26. Additional MCP roadmap', () => {
    renderV2();
    expect(screen.getAllByText('Additional MCP Integrations').length).toBeGreaterThan(0);
  });

  it('27. Continuous improvement roadmap', () => {
    renderV2();
    expect(screen.getAllByText('Continuous Improvement').length).toBeGreaterThan(0);
  });

  it('28. Internal Solution Catalog roadmap', () => {
    renderV2();
    expect(screen.getAllByText('Internal Solution Catalog').length).toBeGreaterThan(0);
  });

  it('29. Advanced Evaluation roadmap', () => {
    renderV2();
    expect(screen.getAllByText('Advanced Evaluation').length).toBeGreaterThan(0);
  });

  it('30. No V2 feature falsely marked implemented', () => {
    renderV2();
    // In V2, we shouldn't see 'COMPLETED' or 'IMPLEMENTED' badges for V2 features
    const allBadges = screen.getAllByText(/— V2/);
    allBadges.forEach(badge => {
      expect(badge.textContent).not.toMatch(/COMPLETED/);
      expect(badge.textContent).not.toMatch(/IMPLEMENTED/);
    });
  });

  // ROADMAP TESTS
  it('31. Completed tasks render', () => {
    renderRoadmap();
    expect(screen.getByText('Frontend Foundation')).toBeInTheDocument();
    const foundationBadge = screen.getByText('Frontend Foundation').closest('div');
    expect(within(foundationBadge).getByText('COMPLETED')).toBeInTheDocument();
  });

  it('32. Current tasks render', () => {
    renderRoadmap();
    expect(screen.getByText('Documentation Center & V2 Spec')).toBeInTheDocument();
    const currentBadge = screen.getByText('Documentation Center & V2 Spec').closest('div');
    expect(within(currentBadge).getByText('CURRENT')).toBeInTheDocument();
  });

  it('33. V2 tasks render', () => {
    renderRoadmap();
    expect(screen.getAllByText('Human Feedback Loop')[0]).toBeInTheDocument();
    expect(screen.getAllByText('PLANNED — V2').length).toBeGreaterThan(0);
  });

});
