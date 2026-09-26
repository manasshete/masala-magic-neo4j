"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-invert text-sm leading-relaxed [&_h3]:text-white [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5 [&_strong]:text-white [&_p]:my-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
