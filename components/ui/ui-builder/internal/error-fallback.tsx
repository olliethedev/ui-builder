import React from "react";
export function ErrorFallback({ error }: { error: Error }) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
  
    return (
      <div className="p-4 border border-red-500 bg-red-100 text-red-700 rounded flex-grow w-full">
        <h3 className="font-bold mb-2">Component Error</h3>
        <p>Error: {error?.message || "Unknown error"}</p>
        <details className="mt-2">
          <summary className="cursor-pointer">Stack trace</summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap">{error?.stack}</pre>
        </details>
      </div>
    );
  }