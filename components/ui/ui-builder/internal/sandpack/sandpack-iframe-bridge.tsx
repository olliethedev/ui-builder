"use client";
import React, { useEffect, useRef, useCallback, MutableRefObject } from "react";
import { ComponentLayer } from "@/components/ui/ui-builder/types";
import { EditorConfig } from "@/components/ui/ui-builder/internal/utils/render-utils";

// Import Penpal for iframe communication
import { connectToChild } from "penpal";

interface SandpackIframeBridgeProps {
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  editorConfig: EditorConfig;
  selectedPage: ComponentLayer;
  componentRegistry: any;
}

interface IframeMethods {
  selectElement: (layerId: string) => void;
  updateLayers: (layers: ComponentLayer[]) => void;
  highlightElement: (layerId: string | null) => void;
  setSelectedElement: (layerId: string | null) => void;
}

export const SandpackIframeBridge: React.FC<SandpackIframeBridgeProps> = ({
  iframeRef,
  editorConfig,
  selectedPage,
  componentRegistry
}) => {
  const connectionRef = useRef<any>(null);
  const iframeMethods = useRef<IframeMethods | null>(null);

  const handleElementClick = useCallback((layerId: string) => {
    editorConfig.onSelectElement(layerId);
  }, [editorConfig]);

  const handleElementHover = useCallback((layerId: string | null) => {
    // Optional: Handle element hover for highlighting
    if (iframeMethods.current) {
      iframeMethods.current.highlightElement(layerId);
    }
  }, []);

  // Initialize Penpal connection
  useEffect(() => {
    if (!iframeRef.current) return;

    const setupConnection = async () => {
      try {
        // Wait for iframe to load
        await new Promise<void>((resolve) => {
          if (iframeRef.current?.contentWindow) {
            const checkLoad = () => {
              if (iframeRef.current?.contentDocument?.readyState === 'complete') {
                resolve();
              } else {
                setTimeout(checkLoad, 100);
              }
            };
            checkLoad();
          }
        });

        // Wait a bit more for Sandpack to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));

        connectionRef.current = connectToChild({
          iframe: iframeRef.current,
          methods: {
            // Methods exposed to the iframe
            onElementClick: handleElementClick,
            onElementHover: handleElementHover,
            onElementSelect: editorConfig.onSelectElement,
            onDuplicateLayer: editorConfig.handleDuplicateLayer,
            onDeleteLayer: editorConfig.handleDeleteLayer,
          },
        });

        const connection = await connectionRef.current.promise;
        iframeMethods.current = connection;

        // Initialize the iframe with current layers
        if (selectedPage.children && Array.isArray(selectedPage.children)) {
          connection.updateLayers(selectedPage.children);
        }

        // Set initially selected element
        if (editorConfig.selectedLayer?.id) {
          connection.setSelectedElement(editorConfig.selectedLayer.id);
        }

      } catch (error) {
        console.error('Failed to establish iframe connection:', error);
      }
    };

    setupConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.destroy?.();
      }
    };
  }, [iframeRef, handleElementClick, handleElementHover, editorConfig]);

  // Update iframe when layers change
  useEffect(() => {
    if (iframeMethods.current && selectedPage.children && Array.isArray(selectedPage.children)) {
      iframeMethods.current.updateLayers(selectedPage.children);
    }
  }, [selectedPage.children]);

  // Update iframe when selected element changes
  useEffect(() => {
    if (iframeMethods.current) {
      iframeMethods.current.setSelectedElement(editorConfig.selectedLayer?.id || null);
    }
  }, [editorConfig.selectedLayer?.id]);

  // Inject bridge script into iframe
  useEffect(() => {
    if (!iframeRef.current) return;

    const injectBridgeScript = () => {
      const iframe = iframeRef.current;
      if (!iframe?.contentDocument) return;

      // Check if Penpal script already exists
      const existingScript = iframe.contentDocument.querySelector('script[src*="penpal"]');
      if (existingScript) return;

      const script = iframe.contentDocument.createElement('script');
      script.textContent = `
        (function() {
          // Import Penpal
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/penpal@7.0.4/dist/penpal.min.js';
          script.onload = function() {
            // Initialize bridge
            let selectedElementId = null;
            let parentMethods = null;

            // Connect to parent
            const connection = Penpal.connectToParent({
              methods: {
                selectElement: (layerId) => {
                  selectedElementId = layerId;
                  updateElementHighlight();
                },
                updateLayers: (layers) => {
                  // Re-render with new layers if needed
                  console.log('Layers updated:', layers);
                },
                highlightElement: (layerId) => {
                  highlightElement(layerId);
                },
                setSelectedElement: (layerId) => {
                  selectedElementId = layerId;
                  updateElementHighlight();
                }
              }
            });

            connection.promise.then((methods) => {
              parentMethods = methods;
              setupEventListeners();
            }).catch(console.error);

            function setupEventListeners() {
              // Add click listeners to all elements with data-layer-id
              document.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const target = e.target.closest('[data-layer-id]');
                if (target && parentMethods) {
                  const layerId = target.getAttribute('data-layer-id');
                  parentMethods.onElementClick(layerId);
                }
              });

              // Add hover listeners
              document.addEventListener('mouseover', (e) => {
                const target = e.target.closest('[data-layer-id]');
                if (target && parentMethods) {
                  const layerId = target.getAttribute('data-layer-id');
                  highlightElement(layerId);
                }
              });

              document.addEventListener('mouseout', (e) => {
                const target = e.target.closest('[data-layer-id]');
                if (target && !target.contains(e.relatedTarget)) {
                  highlightElement(null);
                }
              });
            }

            function highlightElement(layerId) {
              // Remove previous highlights
              document.querySelectorAll('.ui-builder-highlight').forEach(el => {
                el.classList.remove('ui-builder-highlight');
              });

              // Add highlight to new element
              if (layerId) {
                const element = document.querySelector(\`[data-layer-id="\${layerId}"]\`);
                if (element) {
                  element.classList.add('ui-builder-highlight');
                }
              }
            }

            function updateElementHighlight() {
              // Remove all selected classes
              document.querySelectorAll('.ui-builder-selected').forEach(el => {
                el.classList.remove('ui-builder-selected');
              });

              // Add selected class to current element
              if (selectedElementId) {
                const element = document.querySelector(\`[data-layer-id="\${selectedElementId}"]\`);
                if (element) {
                  element.classList.add('ui-builder-selected');
                }
              }
            }

            // Add styles for highlighting and selection
            const style = document.createElement('style');
            style.textContent = \`
              .ui-builder-highlight {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px !important;
              }
              .ui-builder-selected {
                outline: 2px solid #ef4444 !important;
                outline-offset: 2px !important;
              }
              [data-layer-id] {
                cursor: pointer !important;
              }
            \`;
            document.head.appendChild(style);
          };
          document.head.appendChild(script);
        })();
      `;

      iframe.contentDocument.head.appendChild(script);
    };

    // Wait for iframe to load before injecting script
    const iframe = iframeRef.current;
    if (iframe.contentDocument?.readyState === 'complete') {
      setTimeout(injectBridgeScript, 500);
    } else {
      iframe.addEventListener('load', () => {
        setTimeout(injectBridgeScript, 500);
      });
    }
  }, [iframeRef]);

  return null; // This component doesn't render anything
};