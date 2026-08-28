import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, ChevronRight, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { documentRegistry, getDocumentById, searchDocuments } from '../docs/registry';
import MarkdownRenderer from '../components/docs/MarkdownRenderer';
import TableOfContents from '../components/docs/TableOfContents';

const DocumentationExplorer = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Redirect to default doc if none selected
  useEffect(() => {
    if (!documentId) {
      navigate('/docs/overview', { replace: true });
    }
  }, [documentId, navigate]);

  const activeDocument = documentId ? getDocumentById(documentId) : null;

  useEffect(() => {
    if (activeDocument) {
      activeDocument.load()
        .then(md => setContent(md))
        .catch(() => setContent('Failed to load document content.'));
    } else if (documentId) {
      setContent('');
    }
  }, [activeDocument, documentId]);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        const results = await searchDocuments(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Group registry by category for sidebar
  const categories = documentRegistry.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  // Find prev/next docs for footer navigation
  const currentIndex = documentRegistry.findIndex(d => d.id === documentId);
  const prevDoc = currentIndex > 0 ? documentRegistry[currentIndex - 1] : null;
  const nextDoc = currentIndex < documentRegistry.length - 1 ? documentRegistry[currentIndex + 1] : null;

  return (
    /* Full-bleed docs layout — overrides the Layout's p-6 padding */
    <div className="flex -m-6 min-h-[calc(100vh-3.5rem)] bg-white">

      {/* ── Doc Secondary Sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50 overflow-y-auto">
        <div className="p-5 border-b border-slate-200">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[var(--bs-orange-500)] mb-4 transition-colors"
          >
            <ArrowLeft size={13} /> Back to App
          </Link>

          {/* Docs branding */}
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[var(--bs-orange-500)]" />
            <span className="font-bold text-[var(--bs-navy-900)] text-base tracking-tight">BuildSmart Docs</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-sm text-[var(--bs-navy-900)] placeholder-slate-400 focus:outline-none focus:border-[var(--bs-orange-500)] focus:ring-1 focus:ring-[var(--bs-orange-500)] transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {searchQuery.trim().length > 1 ? (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Search Results
              </p>
              {isSearching ? (
                <p className="text-xs text-slate-400 px-2">Searching...</p>
              ) : searchResults.length > 0 ? (
                <ul className="space-y-0.5">
                  {searchResults.map(result => (
                    <li key={`search-${result.id}`}>
                      <Link
                        to={`/docs/${result.id}`}
                        onClick={() => setSearchQuery('')}
                        className="block px-3 py-1.5 rounded-md text-sm text-slate-600 hover:text-[var(--bs-navy-900)] hover:bg-slate-100 transition-colors"
                      >
                        <div className="font-medium">{result.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 capitalize">
                          Matches {result.matchType}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 px-2">No results for "{searchQuery}"</p>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(categories).map(([category, docs]) => (
                <div key={category}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                    {category}
                  </p>
                  <ul className="space-y-0.5">
                    {docs.map(doc => (
                      <li key={doc.id}>
                        <Link
                          to={`/docs/${doc.id}`}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                            documentId === doc.id
                              ? 'bg-[var(--bs-orange-50)] text-[var(--bs-orange-600)] font-semibold border-l-2 border-[var(--bs-orange-500)] pl-[10px]'
                              : 'text-slate-600 hover:text-[var(--bs-navy-900)] hover:bg-slate-100'
                          }`}
                        >
                          {doc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Future section */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  Future
                </p>
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      to="/v2"
                      className="flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-slate-600 hover:text-[var(--bs-navy-900)] hover:bg-slate-100 transition-colors"
                    >
                      <span>V2 Specification</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                        PLANNED
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/roadmap"
                      className="flex items-center px-3 py-1.5 rounded-md text-sm text-slate-600 hover:text-[var(--bs-navy-900)] hover:bg-slate-100 transition-colors"
                    >
                      Product Roadmap
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto bg-white scroll-smooth"
        id="docs-content-container"
      >
        {activeDocument ? (
          <div className="max-w-[1100px] w-full mx-auto px-6 lg:px-16 py-10 flex items-start gap-12">

            {/* Document body */}
            <article className="flex-1 min-w-0 pb-24">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 font-medium">
                <Link to="/docs" className="hover:text-[var(--bs-orange-500)] transition-colors">Docs</Link>
                <ChevronRight size={12} />
                <span>{activeDocument.category}</span>
                <ChevronRight size={12} />
                <span className="text-[var(--bs-navy-900)]">{activeDocument.title}</span>
              </nav>

              {/* Page header */}
              <div className="mb-8 pb-6 border-b border-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-extrabold text-[var(--bs-navy-900)] tracking-tight leading-tight">
                    {activeDocument.title}
                  </h1>
                  <span className="shrink-0 mt-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--bs-orange-50)] text-[var(--bs-orange-600)] border border-[var(--bs-orange-200)]">
                    {activeDocument.category}
                  </span>
                </div>
              </div>

              {/* Markdown content */}
              <MarkdownRenderer content={content} />

              {/* Prev / Next footer */}
              <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center gap-4">
                {prevDoc ? (
                  <Link
                    to={`/docs/${prevDoc.id}`}
                    className="flex flex-col items-start p-4 rounded-xl border border-slate-200 hover:border-[var(--bs-orange-300)] hover:bg-[var(--bs-orange-50)] transition-all min-w-[180px] group"
                  >
                    <span className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                      <ArrowLeft size={11} /> Previous
                    </span>
                    <span className="text-sm font-semibold text-[var(--bs-navy-900)] group-hover:text-[var(--bs-orange-600)] transition-colors">
                      {prevDoc.title}
                    </span>
                  </Link>
                ) : <div />}

                {nextDoc ? (
                  <Link
                    to={`/docs/${nextDoc.id}`}
                    className="flex flex-col items-end p-4 rounded-xl border border-slate-200 hover:border-[var(--bs-orange-300)] hover:bg-[var(--bs-orange-50)] transition-all min-w-[180px] group"
                  >
                    <span className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                      Next <ArrowRight size={11} />
                    </span>
                    <span className="text-sm font-semibold text-[var(--bs-navy-900)] group-hover:text-[var(--bs-orange-600)] transition-colors">
                      {nextDoc.title}
                    </span>
                  </Link>
                ) : <div />}
              </div>
            </article>

            {/* Table of Contents */}
            <TableOfContents content={content} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-32 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-[var(--bs-navy-900)] mb-2">Document not available.</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              The requested document does not exist or is not yet available. Select a document from the sidebar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationExplorer;
