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
      <code className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-700" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative group rounded-lg overflow-hidden bg-slate-900 border border-slate-700 my-4 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400">
          {match ? match[1] : 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <code className="text-sm font-mono text-slate-300 block min-w-max" {...props}>
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
      1: 'text-3xl font-bold mt-10 mb-6 text-white tracking-tight',
      2: 'text-2xl font-bold mt-8 mb-4 text-slate-100 border-b border-slate-700/50 pb-2',
      3: 'text-xl font-semibold mt-6 mb-3 text-slate-200',
    };

    return (
      <Tag id={id} className={`${sizes[level]} scroll-mt-24`}>
        {children}
      </Tag>
    );
  };
};

const MarkdownRenderer = ({ content }) => {
  if (!content) return <div className="text-slate-500 italic">Document not available.</div>;

  return (
    <div className="prose prose-invert prose-slate max-w-none 
                    prose-headings:scroll-mt-24 
                    prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                    prose-p:text-slate-300 prose-p:leading-relaxed
                    prose-li:text-slate-300 prose-ul:my-2
                    prose-strong:text-white prose-strong:font-semibold
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-slate-800/30 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r prose-blockquote:text-slate-400 prose-blockquote:not-italic
                    prose-hr:border-slate-700/50 prose-hr:my-8"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          h1: HeadingRenderer(1),
          h2: HeadingRenderer(2),
          h3: HeadingRenderer(3),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-slate-700">
              <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-800/50 border-b border-slate-700 text-slate-300">{children}</thead>,
          th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 border-b border-slate-800/50 text-slate-400">{children}</td>,
          a: ({ href, children }) => {
            const isInternal = href?.startsWith('#') || href?.startsWith('/');
            return (
              <a 
                href={href} 
                className="text-blue-400 hover:text-blue-300 transition-colors"
                target={isInternal ? '_self' : '_blank'}
                rel={isInternal ? '' : 'noopener noreferrer'}
              >
                {children}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
