import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import DocumentationExplorer from '../pages/DocumentationExplorer';

// Mock registry for test predictability
vi.mock('../docs/registry', () => ({
  documentRegistry: [
    {
      id: 'overview',
      title: 'Overview',
      category: 'Getting Started',
      load: vi.fn().mockResolvedValue('# Test Overview\n\nThis is a test doc.\n\n## Subheading\n\n- item 1\n- item 2')
    },
    {
      id: 'architecture',
      title: 'Architecture',
      category: 'Architecture',
      load: vi.fn().mockResolvedValue('## Architecture Details\n\n```javascript\nconst a = 1;\n```')
    }
  ],
  getDocumentById: vi.fn((id) => {
    if (id === 'overview') return {
      id: 'overview',
      title: 'Overview',
      category: 'Getting Started',
      load: vi.fn().mockResolvedValue('# Test Overview\n\nThis is a test doc.\n\n## Subheading\n\n- item 1\n- item 2')
    };
    if (id === 'architecture') return {
      id: 'architecture',
      title: 'Architecture',
      category: 'Architecture',
      load: vi.fn().mockResolvedValue('## Architecture Details\n\n```javascript\nconst a = 1;\n```')
    };
    return undefined;
  }),
  searchDocuments: vi.fn().mockResolvedValue([
    {
      id: 'architecture',
      title: 'Architecture',
      category: 'Architecture',
      matchType: 'title'
    }
  ])
}));

describe('DocumentationExplorer', () => {

  const renderPage = (initialRoute = '/docs/overview') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}><HealthProvider><DataProvider>
        <Routes>
          <Route path="/docs/:documentId" element={<DocumentationExplorer />} />
          <Route path="/docs" element={<DocumentationExplorer />} />
          <Route path="/v2" element={<div data-testid="v2-page" />} />
          <Route path="/roadmap" element={<div data-testid="roadmap-page" />} />
        </Routes>
      </DataProvider></HealthProvider></MemoryRouter>
    );
  };

  it('1. Documentation page renders', async () => {
    renderPage('/docs/overview');
    await waitFor(() => {
      expect(screen.getByText('BuildSmart Docs')).toBeInTheDocument();
    });
  });

  it('2. Document list renders', async () => {
    renderPage('/docs/overview');
    await waitFor(() => {
      expect(screen.getAllByText('Overview')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Architecture').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Getting Started')[0]).toBeInTheDocument();
    });
  });

  it('4. Markdown headings', async () => {
    renderPage('/docs/overview');
    await waitFor(() => {
      expect(screen.getByText('Test Overview')).toBeInTheDocument();
      expect(screen.getByText('Subheading')).toBeInTheDocument();
    });
  });

  it('5. Markdown lists', async () => {
    renderPage('/docs/overview');
    await waitFor(() => {
      expect(screen.getByText('item 1')).toBeInTheDocument();
      expect(screen.getByText('item 2')).toBeInTheDocument();
    });
  });

  it('7. Markdown code blocks', async () => {
    renderPage('/docs/architecture');
    await waitFor(() => {
      expect(screen.getByText('const a = 1;')).toBeInTheDocument();
    });
  });

  it('10. Table of contents', async () => {
    renderPage('/docs/overview');
    await waitFor(() => {
      expect(screen.getByText('On this page')).toBeInTheDocument();
      // 'Subheading' should appear twice, once in the doc, once in the TOC
      expect(screen.getAllByText('Subheading').length).toBe(2);
    });
  });

  it('12. Documentation search', async () => {
    renderPage('/docs/overview');
    const input = screen.getByPlaceholderText('Search docs...');
    fireEvent.change(input, { target: { value: 'arch' } });
    
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText('Matches title')).toBeInTheDocument();
    });
  });

  it('14. Missing document', async () => {
    renderPage('/docs/missing-doc-123');
    await waitFor(() => {
      expect(screen.getByText('Document not available.')).toBeInTheDocument();
    });
  });

  it('15. Previous/next navigation', async () => {
    renderPage('/docs/overview');
    await waitFor(() => {
      expect(screen.getAllByText('Next').length).toBeGreaterThan(0);
    });
    
    renderPage('/docs/architecture');
    await waitFor(() => {
      expect(screen.getAllByText('Previous').length).toBeGreaterThan(0);
    });
  });

  // SECURITY TESTS
  it('16. Path traversal blocked', async () => {
    renderPage('/docs/..%2F..%2F.env');
    await waitFor(() => {
      expect(screen.getByText('Document not available.')).toBeInTheDocument();
    });
  });
  
  it('17. .env blocked', async () => {
    renderPage('/docs/.env');
    await waitFor(() => {
      expect(screen.getByText('Document not available.')).toBeInTheDocument();
    });
  });
  
  it('18. arbitrary filesystem path blocked', async () => {
    renderPage('/docs/etc%2Fpasswd');
    await waitFor(() => {
      expect(screen.getByText('Document not available.')).toBeInTheDocument();
    });
  });

  it('20. unregistered document blocked', async () => {
    renderPage('/docs/unregistered-doc');
    await waitFor(() => {
      expect(screen.getByText('Document not available.')).toBeInTheDocument();
    });
  });
});
