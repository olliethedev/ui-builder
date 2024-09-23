"use client";

import React, { FC, memo } from "react";
import ReactMarkdown, { Options, ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "@/components/ui/ui-builder/codeblock";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <MemoizedReactMarkdown
      className={cn(
        "prose min-w-full break-words prose-p:leading-relaxed prose-pre:p-0",
        className
      )}
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        a({ children, href }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          if (match) {
            return (
              <CodeBlock
                key={Math.random()}
                language={(match && match[1]) || ""}
                value={String(children).replace(/\n$/, "")}
                {...props}
              />
            );
          }

          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </MemoizedReactMarkdown>
  );
}

const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);
