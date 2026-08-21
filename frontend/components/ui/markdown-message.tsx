"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className = "" }: MarkdownMessageProps) {
  // Strip action card tags if still present
  const cleanedContent = content.replace(/\[ACTION_CARD:[\s\S]*?\]/g, "").trim();

  return (
    <div className={`prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl font-bold text-yellow-400 mt-4 mb-2 pb-1 border-b border-yellow-500/20 flex items-center gap-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-amber-300 mt-3.5 mb-2 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-semibold text-yellow-200 mt-3 mb-1.5 flex items-center gap-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-semibold text-emerald-400 mt-2.5 mb-1 flex items-center gap-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-1.5 text-gray-200 leading-relaxed font-normal">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-yellow-300">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-300">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="my-2 ml-4 list-disc space-y-1 text-gray-200 marker:text-yellow-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-4 list-decimal space-y-1 text-gray-200 marker:text-amber-400 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 text-gray-200">
              {children}
            </li>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-white/10 shadow-md">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-yellow-500/15 border-b border-yellow-500/30 text-yellow-300 font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5 bg-black/20">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/5 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2 font-semibold text-yellow-300 text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-gray-300 text-xs">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-yellow-500/60 bg-yellow-500/10 pl-3.5 py-1.5 my-2.5 rounded-r-lg italic text-gray-200">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <div className="my-2.5 rounded-xl bg-[#090f1f] p-3 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  <code>{children}</code>
                </div>
              );
            }
            return (
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-yellow-300 border border-white/10">
                {children}
              </code>
            );
          },
          hr: () => <hr className="my-3 border-white/10" />,
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}
