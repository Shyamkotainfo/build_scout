import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, ChevronRight, Book, ArrowLeft } from 'lucide-react';
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
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full overflow-y-auto hidden md:flex">
        <div className="p-6">
          <Link to="/" className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1 mb-6 w-fit">
            <ArrowLeft size={16} /> Back to App
          </Link>
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-wide mb-6">
            <Book size={20} className="text-blue-400" />
            BuildSmart Docs
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Navigation */}
          {searchQuery.trim().length > 1 ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Results</h3>
              {isSearching ? (
                <div className="text-sm text-slate-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <ul className="space-y-2">
                  {searchResults.map(result => (
                    <li key={`search-${result.id}`}>
                      <Link
                        to={`/docs/${result.id}`}
                        onClick={() => setSearchQuery('')}
                        className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                      >
                        <div className="font-medium">{result.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5 capitalize">Matches {result.matchType}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500">No results found for "{searchQuery}"</div>
              )}
            </div>
          ) : (
            <nav className="space-y-6">
              {Object.entries(categories).map(([category, docs]) => (
                <div key={category}>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">{category}</h3>
                  <ul className="space-y-1">
                    {docs.map(doc => (
                      <li key={doc.id}>
                        <Link
                          to={`/docs/${doc.id}`}
                          className={`flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors ${
                            documentId === doc.id
                              ? 'bg-blue-500/10 text-blue-400 font-medium'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {doc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Future</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/v2"
                      className="flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      <span>V2 Specification</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">PLANNED</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/roadmap"
                      className="flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      <span>Product Roadmap</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-slate-950 scroll-smooth" id="docs-content-container">
        {activeDocument ? (
          <div className="max-w-[1200px] w-full mx-auto px-6 lg:px-12 py-12 flex items-start gap-12">
            
            {/* Markdown Content */}
            <div className="flex-1 min-w-0 pb-24">
              <div className="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <span>Docs</span>
                <ChevronRight size={14} />
                <span>{activeDocument.category}</span>
                <ChevronRight size={14} />
                <span className="text-slate-300">{activeDocument.title}</span>
              </div>

              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-8">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">{activeDocument.title}</h1>
                <div className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {activeDocument.category}
                </div>
              </div>

              <MarkdownRenderer content={content} />

              {/* Prev/Next Footer */}
              <div className="mt-20 pt-8 border-t border-slate-800 flex justify-between items-center">
                {prevDoc ? (
                  <Link 
                    to={`/docs/${prevDoc.id}`}
                    className="flex flex-col items-start p-4 rounded-lg border border-slate-800 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-800 transition-all min-w-[200px]"
                  >
                    <span className="text-xs text-slate-500 mb-1">Previous</span>
                    <span className="text-sm font-medium text-blue-400 flex items-center gap-1">
                      <ArrowLeft size={16} />
                      {prevDoc.title}
                    </span>
                  </Link>
                ) : <div />}
                
                {nextDoc ? (
                  <Link 
                    to={`/docs/${nextDoc.id}`}
                    className="flex flex-col items-end p-4 rounded-lg border border-slate-800 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-800 transition-all min-w-[200px]"
                  >
                    <span className="text-xs text-slate-500 mb-1">Next</span>
                    <span className="text-sm font-medium text-blue-400 flex items-center gap-1">
                      {nextDoc.title}
                      <ChevronRight size={16} />
                    </span>
                  </Link>
                ) : <div />}
              </div>
            </div>

            {/* Table of Contents Sidebar */}
            <TableOfContents content={content} />

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-400 flex-col">
            <Book size={48} className="text-slate-700 mb-4" />
            <h2 className="text-xl font-bold text-slate-200 mb-2">Document not available.</h2>
            <p className="text-sm text-slate-500 max-w-md text-center">
              The requested document is either not explicitly allowlisted or does not exist. 
              Please select a document from the sidebar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationExplorer;
