"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: string }) {
  if (!children) return null;

  // Unescape literal \n and normalize headings/bullets
  const formatted = children
    .replace(/\\n/g, "\n")
    .replace(/([^\n])\s*(###\s+[^\n]+)/g, "$1\n\n$2\n\n")
    .replace(/([^\n])\s*(\*\*(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^*]*\*\*)/gi, "$1\n\n$2\n")
    .replace(/([^\n])\s*([⚡•\-*]\s*\*\*\d{1,2}:\d{2})/g, "$1\n\n$2")
    .replace(/([^\n])\s*(\*\*[A-Z][a-zA-Z\s]+:\*\*)/g, "$1\n\n$2");

  return (
    <div className="prose-invert text-sm leading-relaxed space-y-2 whitespace-pre-line [&_h3]:text-white [&_h3]:font-semibold [&_h3]:text-[15px] [&_h3]:mt-3.5 [&_h3]:mb-2 [&_h3]:pb-1 [&_h3]:border-b [&_h3]:border-[rgba(255,255,255,0.08)] [&_h4]:text-[rgba(240,235,248,0.95)] [&_h4]:font-medium [&_h4]:text-sm [&_h4]:mt-2.5 [&_h4]:mb-1 [&_p]:my-1.5 [&_p]:text-[rgba(240,235,248,0.88)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:space-y-1 [&_li]:text-[rgba(240,235,248,0.85)] [&_strong]:text-white [&_strong]:font-semibold [&_em]:text-[rgba(216,180,254,0.9)] [&_hr]:border-[rgba(255,255,255,0.08)] [&_hr]:my-3.5 [&_blockquote]:border-l-2 [&_blockquote]:border-[#8b5cf6] [&_blockquote]:pl-3.5 [&_blockquote]:py-1 [&_blockquote]:bg-[rgba(139,92,246,0.06)] [&_blockquote]:rounded-r-lg [&_blockquote]:my-2.5 [&_blockquote]:text-[rgba(240,235,248,0.8)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatted}</ReactMarkdown>
    </div>
  );
}
