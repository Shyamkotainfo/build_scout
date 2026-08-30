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
        className="bg-[var(--bs-bg-tertiary)] text-[var(--bs-navy-800)] px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-[var(--bs-border-light)]"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group rounded-lg overflow-hidden bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] my-5 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bs-bg-tertiary)] border-b border-[var(--bs-border-light)]">
        <span className="text-xs font-mono text-[var(--bs-text-tertiary)]">
          {match ? match[1] : 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--bs-orange-500)] rounded p-1"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} className="text-[var(--bs-status-success)]" /> : <Copy size={14} />}
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
      2: 'text-xl font-bold mt-8 mb-4 text-[var(--bs-navy-900)] border-b border-[var(--bs-border-light)] pb-2',
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
  if (!content) return <div className="text-[var(--bs-text-tertiary)] italic text-sm">Document not available.</div>;

  return (
    <div className="prose prose-slate max-w-none
                    prose-headings:scroll-mt-24
                    prose-a:text-[var(--bs-orange-500)] prose-a:no-underline hover:prose-a:underline
                    prose-p:text-[var(--bs-text-secondary)] prose-p:leading-relaxed prose-p:text-[0.9375rem]
                    prose-li:text-[var(--bs-text-secondary)] prose-ul:my-2
                    prose-strong:text-[var(--bs-navy-900)] prose-strong:font-semibold
                    prose-blockquote:border-l-4 prose-blockquote:border-[var(--bs-orange-400)]
                      prose-blockquote:bg-[var(--bs-bg-secondary)] prose-blockquote:px-4 prose-blockquote:py-2
                      prose-blockquote:rounded-r-md prose-blockquote:text-[var(--bs-text-secondary)]
                      prose-blockquote:not-italic
                    prose-hr:border-[var(--bs-border-light)] prose-hr:my-8"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          h1: HeadingRenderer(1),
          h2: HeadingRenderer(2),
          h3: HeadingRenderer(3),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-[var(--bs-border-light)] shadow-sm">
              <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--bs-bg-secondary)] border-b border-[var(--bs-border-light)] text-[var(--bs-navy-800)]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-[var(--bs-navy-900)] text-xs uppercase tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 border-b border-[var(--bs-border-light)] text-[var(--bs-text-secondary)] text-sm">
              {children}
            </td>
          ),
          a: ({ href, children }) => {
            const isInternal = href?.startsWith('#') || href?.startsWith('/');
            return (
              <a
                href={href}
                className="text-[var(--bs-orange-500)] hover:text-[var(--bs-orange-600)] transition-colors"
                target={isInternal ? '_self' : '_blank'}
                rel={isInternal ? '' : 'noopener noreferrer'}
              >
                {children}
              </a>
            );
          },
          // Style blockquote-like callout boxes when used in docs
          blockquote: ({ children }) => (
            <div className="my-5 p-4 rounded-xl border border-[var(--bs-border-medium)] bg-[var(--bs-bg-secondary)] text-[var(--bs-text-secondary)] text-sm leading-relaxed">
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
