import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

const createMarkdownComponents = () => ({
  h1: ({ children }) => (
    <h1 className="font-dharmik font-bold text-base sm:text-lg text-[#F3CA9D] mt-3 mb-1.5 pb-1 border-b border-[#C58B4E]/30 leading-snug">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-dharmik font-bold text-sm sm:text-base text-[#F3CA9D] mt-2.5 mb-1 leading-snug">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-dharmik font-semibold text-xs sm:text-sm text-[#E0A96D] mt-2 mb-1 leading-snug">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-1.5 text-xs sm:text-sm text-[#F7E7D6] leading-[1.8] font-normal break-words">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-[#F3CA9D] tracking-wide">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-[#E0A96D]/90">
      {children}
    </em>
  ),
  ul: ({ children }) => (
    <ul className="my-2 ml-4 space-y-1 text-xs sm:text-sm list-disc marker:text-[#C58B4E] leading-[1.75]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 ml-4 space-y-1 text-xs sm:text-sm list-decimal marker:text-[#E0A96D] leading-[1.75]">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[#F7E7D6] pl-0.5 leading-[1.75]">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2.5 pl-3 py-1.5 border-l-2 border-[#C58B4E] bg-[#C58B4E]/10 rounded-r-xl italic text-xs sm:text-sm text-[#F3CA9D] leading-[1.8]">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#E0A96D] underline underline-offset-2 hover:text-white transition-colors"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-2.5 border-t border-[#C58B4E]/25" />,
  code: ({ inline, children }) =>
    inline ? (
      <code className="px-1.5 py-0.5 rounded bg-black/60 text-[#F3CA9D] text-[11px] font-mono border border-[#C58B4E]/20">
        {children}
      </code>
    ) : (
      <pre className="p-2.5 my-2 rounded-xl bg-black/70 overflow-x-auto text-[11px] sm:text-xs text-[#F7E7D6] font-mono border border-[#C58B4E]/25">
        <code>{children}</code>
      </pre>
    )
});

const AcharyaMarkdown = React.memo(function AcharyaMarkdown({ content }) {
  const components = useMemo(() => createMarkdownComponents(), []);

  if (!content) return null;

  return (
    <div className="acharya-markdown-content leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export default AcharyaMarkdown;
