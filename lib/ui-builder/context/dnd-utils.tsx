// Helper function to get iframe and its content window
export const getIframeElements = () => {
    const iframe = document.querySelector('[data-testid="auto-frame"]') as HTMLIFrameElement | null;
    if (!iframe) return null;
    
    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframe.contentDocument;
    
    if (!iframeWindow || !iframeDocument) return null;
    
    return {
      iframe,
      window: iframeWindow,
      document: iframeDocument,
      body: iframeDocument.body,
    };
  };