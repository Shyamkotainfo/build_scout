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
      const container = document.getElementById('docs-content-container');
      if (!container) return;
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);

      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= 150) {
          setActiveId(el.id);
          return;
        }
      }
    };

    const container = document.getElementById('docs-content-container');
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-10 max-h-[calc(100vh-6rem)] overflow-y-auto w-52 shrink-0 hidden xl:block pb-10">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
        On this page
      </h4>
      <ul className="space-y-0.5 border-l border-slate-200">
        {headings.map((heading, i) => (
          <li
            key={`${heading.id}-${i}`}
            className={heading.level === 3 ? 'ml-3' : ''}
          >
            <a
              href={`#${heading.id}`}
              className={`block pl-3 py-1 text-[0.8125rem] transition-colors border-l-2 -ml-px leading-snug
                ${activeId === heading.id
                  ? 'border-[var(--bs-orange-500)] text-[var(--bs-orange-600)] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-[var(--bs-navy-900)] hover:border-slate-300'
                }`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(heading.id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
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
