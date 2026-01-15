import React from "react";
import type { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ error }: FallbackProps) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
    
    // Handle error as unknown type (react-error-boundary v5+)
    // Check for null/undefined first, then instanceof Error, then convert to string
    const errorMessage = error == null 
      ? undefined 
      : error instanceof Error 
        ? error.message 
        : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
  
    return (
      <div className="p-4 border border-red-500 bg-red-100 text-red-700 rounded flex-grow w-full">
        <h3 className="font-bold mb-2">Component Error</h3>
        <p>Error: {errorMessage || "Unknown error"}</p>
        <details className="mt-2">
          <summary className="cursor-pointer">Stack trace</summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap">{errorStack}</pre>
        </details>
      </div>
    );
  }