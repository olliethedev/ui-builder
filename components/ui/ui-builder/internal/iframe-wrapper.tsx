import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

interface IframeWrapperProps extends React.HTMLAttributes<HTMLIFrameElement> {
  children: React.ReactNode;
  frameId?: string;
}

export const IframeWrapper: React.FC<IframeWrapperProps> = React.memo(
  ({ children, frameId, ...props }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeRoot, setIframeRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const handleLoad = () => {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        // Create a div inside the iframe for mounting React components
        const mountNode = iframeDoc.createElement("div");
        iframeDoc.body.appendChild(mountNode);

        iframeDoc.body.style.backgroundColor = "transparent";

        // Function to inject stylesheets into the iframe
        const injectStylesheets = () => {
          // Select all linked stylesheets in the parent document
          const links = Array.from(
            document.querySelectorAll('link[rel="stylesheet"]')
          );
          // Select all style tags in the parent document
          const styles = Array.from(document.querySelectorAll("style"));

          // Inject linked stylesheets
          links.forEach((link) => {
            const clonedLink = iframeDoc.createElement("link");
            clonedLink.rel = "stylesheet";
            clonedLink.href = (link as HTMLLinkElement).href;
            iframeDoc.head.appendChild(clonedLink);
          });

          // Inject inline styles
          styles.forEach((style) => {
            const clonedStyle = iframeDoc.createElement("style");
            clonedStyle.textContent = style.textContent || "";
            iframeDoc.head.appendChild(clonedStyle);
          });
        };

        // Inject styles on initial load
        injectStylesheets();

        const updateIframeHeight = () => {
            const newHeight =
              iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
            iframe.style.height = `${newHeight}px`;
          };

        // Initial height setting
        updateIframeHeight();

        const resizeObserver = new ResizeObserver(() => {
          updateIframeHeight();
        });

        resizeObserver.observe(iframeDoc.documentElement);

        const iframeResizeObserver = new ResizeObserver(() => {
          updateIframeHeight();
        });
        iframeResizeObserver.observe(iframe);
        setIframeRoot(mountNode);

        // Optional: Observe for dynamic additions to the parent stylesheets
        //   const observer = new MutationObserver((mutations) => {
        //     mutations.forEach((mutation) => {
        //       if (mutation.type === 'childList') {
        //         mutation.addedNodes.forEach((node) => {
        //           if (node.nodeType === Node.ELEMENT_NODE) {
        //             const element = node as HTMLElement;
        //             if (element.tagName === 'LINK' && element.rel === 'stylesheet') {
        //               const clonedLink = iframeDoc.createElement('link');
        //               clonedLink.rel = 'stylesheet';
        //               clonedLink.href = (element as HTMLLinkElement).href;
        //               iframeDoc.head.appendChild(clonedLink);
        //             } else if (element.tagName === 'STYLE') {
        //               const clonedStyle = iframeDoc.createElement('style');
        //               clonedStyle.textContent = element.textContent || '';
        //               iframeDoc.head.appendChild(clonedStyle);
        //             }
        //           }
        //         });
        //       }
        //     });
        //   });

        //   // Start observing the parent document for stylesheet changes
        //   observer.observe(document.head, { childList: true });

        setIframeRoot(mountNode);

        // Cleanup observer on unmount
        return () => {
          // observer.disconnect();
          resizeObserver.disconnect();
          iframeResizeObserver.disconnect();
        };
      };

      // Attach the load event listener
      iframe.addEventListener("load", handleLoad);

      // If the iframe is already loaded, trigger the handler
      if (iframe.contentDocument?.readyState === "complete") {
        handleLoad();
      }

      // Cleanup event listener on unmount
      return () => {
        iframe.removeEventListener("load", handleLoad);
      };
    }, []);

    return (
      <iframe id={frameId} ref={iframeRef} {...props}>
        {iframeRoot && ReactDOM.createPortal(children, iframeRoot)}
      </iframe>
    );
  }
);

IframeWrapper.displayName = "IframeWrapper";
