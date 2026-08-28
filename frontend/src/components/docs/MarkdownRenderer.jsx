import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

// Utility to generate URL-safe IDs for headings
export const generateId = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
};

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code
        className="bg-slate-100 text-[var(--bs-navy-800)] px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-slate-200"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group rounded-lg overflow-hidden bg-slate-50 border border-slate-200 my-5 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <span className="text-xs font-mono text-slate-500">
          {match ? match[1] : 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--bs-orange-500)] rounded p-1"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <code className="text-sm font-mono text-[var(--bs-navy-800)] block min-w-max" {...props}>
          {children}
        </code>
      </div>
    </div>
  );
};

const HeadingRenderer = (level) => {
  return ({ children }) => {
    // Extract text for ID generation
    const text = React.Children.toArray(children).reduce((acc, child) => {
      return acc + (typeof child === 'string' ? child : '');
    }, '');

    const id = generateId(text);
    const Tag = `h${level}`;

    const sizes = {
      1: 'text-2xl font-bold mt-10 mb-5 text-[var(--bs-navy-900)] tracking-tight',
      2: 'text-xl font-bold mt-8 mb-4 text-[var(--bs-navy-900)] border-b border-slate-200 pb-2',
      3: 'text-base font-semibold mt-6 mb-3 text-[var(--bs-navy-800)]',
    };

    return (
      <Tag id={id} className={`${sizes[level]} scroll-mt-24`}>
        {children}
      </Tag>
    );
  };
};

const MarkdownRenderer = ({ content }) => {
  if (!content) return <div className="text-slate-400 italic text-sm">Document not available.</div>;

  return (
    <div className="prose prose-slate max-w-none
                    prose-headings:scroll-mt-24
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                    prose-p:text-[var(--bs-text-secondary)] prose-p:leading-relaxed prose-p:text-[0.9375rem]
                    prose-li:text-[var(--bs-text-secondary)] prose-ul:my-2
                    prose-strong:text-[var(--bs-navy-900)] prose-strong:font-semibold
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-400
                      prose-blockquote:bg-blue-50 prose-blockquote:px-4 prose-blockquote:py-2
                      prose-blockquote:rounded-r-md prose-blockquote:text-slate-600
                      prose-blockquote:not-italic
                    prose-hr:border-slate-200 prose-hr:my-8"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          h1: HeadingRenderer(1),
          h2: HeadingRenderer(2),
          h3: HeadingRenderer(3),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 border-b border-slate-200 text-[var(--bs-navy-800)]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-[var(--bs-navy-900)] text-xs uppercase tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 border-b border-slate-100 text-[var(--bs-text-secondary)] text-sm">
              {children}
            </td>
          ),
          a: ({ href, children }) => {
            const isInternal = href?.startsWith('#') || href?.startsWith('/');
            return (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-700 transition-colors"
                target={isInternal ? '_self' : '_blank'}
                rel={isInternal ? '' : 'noopener noreferrer'}
              >
                {children}
              </a>
            );
          },
          // Style blockquote-like callout boxes when used in docs
          blockquote: ({ children }) => (
            <div className="my-5 p-4 rounded-xl border border-blue-100 bg-blue-50 text-slate-700 text-sm leading-relaxed">
              {children}
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
