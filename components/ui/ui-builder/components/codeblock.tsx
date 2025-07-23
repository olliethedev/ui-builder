"use client";
import React, { memo, useCallback, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  language: string;
  value: string;
}

interface languageMap {
  [key: string]: string | undefined;
}

export const programmingLanguages: languageMap = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css",
  tsx: ".tsx",
  // add more file extensions here
};

export const CodeBlock = memo(function CodeBlock({
  language,
  value,
}: CodeBlockProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = useCallback(() => {
    if (isCopied) return;
    copyToClipboard(value);
  }, [isCopied, copyToClipboard, value]);

  const customStyle = useMemo(() => ({
    margin: 0,
    width: "100%",
    background: "transparent",
    padding: "1.5rem 1rem",
  }), []);

  const codeTagProps = useMemo(() => ({
    style: {
      fontSize: "0.9rem",
      fontFamily: "var(--font-mono)",
    },
  }), []);

  const highlighted = useMemo(
    () => (
      <SyntaxHighlighter
        language={language}
        style={coldarkDark}
        PreTag="div"
        showLineNumbers
        customStyle={customStyle}
        codeTagProps={codeTagProps}
      >
        {value}
      </SyntaxHighlighter>
    ),
    [language, value, customStyle, codeTagProps]
  );

  return (
    <div className="codeblock relative w-full font-sans border border-border rounded-md" data-testid={`codeblock-${language}`}>
      <div className="flex w-full items-center justify-between bg-background px-6 py-2 pr-4 text-foreground border-b border-border rounded-t-sm">
        <span className="text-md uppercase font-semibold">{language}</span>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopy}
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </div>
      {highlighted}
    </div>
  );
});
