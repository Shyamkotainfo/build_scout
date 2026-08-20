import React, { useEffect, useState } from 'react';
import { generateId } from './MarkdownRenderer';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!content) return;

    // A simple regex to extract headings from Markdown
    const regex = /^(#{2,3})\s+(.+)$/gm;
    const extractedHeadings = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = generateId(text);
      extractedHeadings.push({ level, text, id });
    }

    setHeadings(extractedHeadings);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      
      // Find the first heading that is currently near the top of the viewport
      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        // 120 is roughly the top offset / scroll-mt margin
        if (rect.top >= 0 && rect.top <= 150) {
          setActiveId(el.id);
          return;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto w-64 shrink-0 hidden lg:block pb-10 pr-4">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">On this page</h4>
      <ul className="space-y-2 border-l border-slate-700/50">
        {headings.map((heading, i) => (
          <li 
            key={`${heading.id}-${i}`}
            className={`${heading.level === 3 ? 'ml-4' : ''}`}
          >
            <a
              href={`#${heading.id}`}
              className={`block pl-4 py-1 text-sm transition-colors border-l-2 -ml-[1px]
                ${activeId === heading.id 
                  ? 'border-blue-500 text-blue-400 font-medium' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                }`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(heading.id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                  // small delay before setting active so it highlights when clicked
                  setTimeout(() => setActiveId(heading.id), 100);
                  history.pushState(null, null, `#${heading.id}`);
                }
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
