import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  forwardRef,
} from "react";
import hash from "object-hash";
import { createPortal } from "react-dom";

const styleSelector = 'style, link[rel="stylesheet"]';

const collectStyles = (doc: Document) => {
  const collected: HTMLElement[] = [];

  doc.querySelectorAll(styleSelector).forEach((style) => {
    collected.push(style as HTMLElement);
  });

  return collected;
};

const getStyleSheet = (el: HTMLElement) => {
  return Array.from(document.styleSheets).find((ss) => {
    const ownerNode = ss.ownerNode as HTMLLinkElement;

    return ownerNode.href === (el as HTMLLinkElement).href;
  });
};

const getStyles = (styleSheet?: CSSStyleSheet) => {
  if (styleSheet) {
    try {
      return Array.from(styleSheet.cssRules)
        .map((rule) => rule.cssText)
        .join("");
    } catch (e: any) {
      console.warn(
        "Access to stylesheet %s is denied. Ignoring…",
        styleSheet.href,
        e.message
      );
    }
  }

  return "";
};

// Sync attributes from parent window to iFrame
const syncAttributes = (sourceElement: Element, targetElement: Element) => {
  const attributes = sourceElement.attributes;
  if (attributes?.length > 0) {
    Array.from(attributes).forEach((attribute: Attr) => {
      targetElement.setAttribute(attribute.name, attribute.value);
    });
  }
};

const defer = (fn: () => void) => setTimeout(fn, 0);

const CopyHostStyles = ({
  children,
  debug = false,
  onStylesLoaded = () => null,
}: {
  children: ReactNode;
  debug?: boolean;
  onStylesLoaded?: () => void;
}) => {
  const { document: doc, window: win } = useFrame();

  useEffect(() => {
    if (!win || !doc) {
      return () => {};
    }

    const elements: { original: HTMLElement; mirror: HTMLElement }[] = [];
    const hashes: Record<string, boolean> = {};

    const lookupEl = (el: HTMLElement) =>
      elements.findIndex((elementMap) => elementMap.original === el);

    const mirrorEl = async (el: HTMLElement, inlineStyles = false) => {
      let mirror: HTMLStyleElement;

      if (el.nodeName === "LINK" && inlineStyles) {
        mirror = document.createElement("style") as HTMLStyleElement;
        mirror.type = "text/css";

        let styleSheet = getStyleSheet(el);

        if (!styleSheet) {
          await new Promise<void>((resolve) => {
            const fn = () => {
              resolve();
              el.removeEventListener("load", fn);
            };

            el.addEventListener("load", fn);
          });
          styleSheet = getStyleSheet(el);
        }

        const styles = getStyles(styleSheet);

        if (!styles) {
          if (debug) {
            console.warn(
              `Tried to load styles for link element, but couldn't find them. Skipping...`
            );
          }

          return;
        }

        mirror.innerHTML = styles;

        mirror.setAttribute("data-href", el.getAttribute("href")!);
      } else {
        mirror = el.cloneNode(true) as HTMLStyleElement;
      }

      return mirror;
    };

    const addEl = async (el: HTMLElement) => {
      const index = lookupEl(el);
      if (index > -1) {
        if (debug)
          console.log(
            `Tried to add an element that was already mirrored. Updating instead...`
          );

        elements[index].mirror.innerText = el.innerText;

        return;
      }

      const mirror = await mirrorEl(el);

      if (!mirror) {
        return;
      }

      const elHash = hash(mirror.outerHTML);

      if (hashes[elHash]) {
        if (debug)
          console.log(
            `iframe already contains element that is being mirrored. Skipping...`
          );

        return;
      }

      hashes[elHash] = true;

      doc.head.append(mirror as HTMLElement);
      elements.push({ original: el, mirror: mirror });

      if (debug) console.log(`Added style node ${el.outerHTML}`);
    };

    const removeEl = (el: HTMLElement) => {
      const index = lookupEl(el);
      if (index === -1) {
        if (debug)
          console.log(
            `Tried to remove an element that did not exist. Skipping...`
          );

        return;
      }

      const elHash = hash(el.outerHTML);

      elements[index]?.mirror?.remove();
      delete hashes[elHash];

      if (debug) console.log(`Removed style node ${el.outerHTML}`);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (
              node.nodeType === Node.TEXT_NODE ||
              node.nodeType === Node.ELEMENT_NODE
            ) {
              const el =
                node.nodeType === Node.TEXT_NODE
                  ? node.parentElement
                  : (node as HTMLElement);

              if (el && el.matches(styleSelector)) {
                defer(() => addEl(el));
              }
            }
          });

          mutation.removedNodes.forEach((node) => {
            if (
              node.nodeType === Node.TEXT_NODE ||
              node.nodeType === Node.ELEMENT_NODE
            ) {
              const el =
                node.nodeType === Node.TEXT_NODE
                  ? node.parentElement
                  : (node as HTMLElement);

              if (el && el.matches(styleSelector)) {
                defer(() => removeEl(el));
              }
            }
          });
        }
      });
    });

    const parentDocument = win!.parent.document;

    const collectedStyles = collectStyles(parentDocument);
    const hrefs: string[] = [];
    let stylesLoaded = 0;

    // Sync attributes for the HTML tag
    const parentHtml = parentDocument.getElementsByTagName("html")[0];
    syncAttributes(parentHtml, doc.documentElement);

    // Sync attributes for the Body tag
    const parentBody = parentDocument.getElementsByTagName("body")[0];
    syncAttributes(parentBody, doc.body);

    // Set iframe body background to transparent
    doc.body.style.backgroundColor = "transparent";

    // Copy CSS custom properties (variables) from parent html element
    const parentComputedStyle = win.parent.getComputedStyle(parentHtml);
    for (let i = 0; i < parentComputedStyle.length; i++) {
      const property = parentComputedStyle[i];
      if (property.startsWith("--")) {
        const value = parentComputedStyle.getPropertyValue(property);
        doc.documentElement.style.setProperty(property, value);
        doc.body.style.setProperty(property, value);
      }
    }

    // Copy font-related classes from parent body
    parentBody.classList.forEach((className) => {
      if (
        className.includes("font-") ||
        className === "antialiased" ||
        className.includes("__variable")
      ) {
        doc.body.classList.add(className);
      }
    });

    Promise.all(
      collectedStyles.map(async (styleNode) => {
        if (styleNode.nodeName === "LINK") {
          const linkHref = (styleNode as HTMLLinkElement).href;

          // Don't process link elements with identical hrefs more than once
          if (hrefs.indexOf(linkHref) > -1) {
            return;
          }

          hrefs.push(linkHref);
        }

        const mirror = await mirrorEl(styleNode);

        if (!mirror) return;

        elements.push({ original: styleNode, mirror });

        return mirror;
      })
    ).then((mirrorStyles) => {
      const filtered = mirrorStyles.filter(
        (el) => typeof el !== "undefined"
      ) as HTMLStyleElement[];

      filtered.forEach((mirror) => {
        mirror.onload = () => {
          stylesLoaded = stylesLoaded + 1;

          if (stylesLoaded >= elements.length) {
            onStylesLoaded();
          }
        };
        mirror.onerror = () => {
          console.warn(`AutoFrame couldn't load a stylesheet`);
          stylesLoaded = stylesLoaded + 1;

          if (stylesLoaded >= elements.length) {
            onStylesLoaded();
          }
        };
      });

      // Reset HTML (inside the promise) so in case running twice (i.e. for React Strict mode)
      doc.head.innerHTML = "";

      // Inject initial values in bulk
      doc.head.append(...filtered);

      observer.observe(parentDocument.head, { childList: true, subtree: true });

      filtered.forEach((el) => {
        const elHash = hash(el.outerHTML);

        hashes[elHash] = true;
      });
    });

    return () => {
      observer.disconnect();
    };
  }, [debug, doc, onStylesLoaded, win]);

  return <>{children}</>;
};

export type AutoFrameProps = {
  children: ReactNode;
  className: string;
  debug?: boolean;
  id?: string;
  onReady?: () => void;
  onNotReady?: () => void;
  style?: React.CSSProperties;
  pointerEventsEnabled?: boolean;
} & React.IframeHTMLAttributes<HTMLIFrameElement>;

type AutoFrameContext = {
  document?: Document;
  window?: Window;
};

export const autoFrameContext = createContext<AutoFrameContext>({});

export const useFrame = () => useContext(autoFrameContext);

const AutoFrame = forwardRef<HTMLIFrameElement, AutoFrameProps>(({
  children,
  className,
  debug,
  id,
  onReady = () => {},
  onNotReady = () => {},
  style,
  pointerEventsEnabled = true,
  ...props
}, ref) => {
  const [loaded, setLoaded] = useState(false);
  const [ctx, setCtx] = useState<AutoFrameContext>({});
  const [mountTarget, setMountTarget] = useState<HTMLElement | null>();
  const [stylesLoaded, setStylesLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleStylesLoaded = useCallback(() => {
    setStylesLoaded(true);
  }, []);

  const iframeStyle = useMemo(
    () => ({
      pointerEvents: pointerEventsEnabled
        ? ("all" as const)
        : ("none" as const),
      ...style,
    }),
    [pointerEventsEnabled, style]
  );

  useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      const doc = ref.current.contentDocument;
      const win = ref.current.contentWindow;

      setCtx({
        document: doc || undefined,
        window: win || undefined,
      });

      setMountTarget(
        ref.current.contentDocument?.getElementById("frame-root")
      );

      if (doc && win && stylesLoaded) {
        onReady();
      } else {
        onNotReady();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, loaded, stylesLoaded]);

  return (
    <iframe
      {...props}
      className={className}
      id={id}
      data-testid="auto-frame"
      srcDoc='<!DOCTYPE html><html><head></head><body><div id="frame-root" data-autoform-entry style="display: contents;"></div></body></html>'
      ref={ref}
      style={iframeStyle}
      onLoad={handleLoad}
    >
      <autoFrameContext.Provider value={ctx}>
        {loaded && mountTarget && (
          <CopyHostStyles debug={debug} onStylesLoaded={handleStylesLoaded}>
            {createPortal(children, mountTarget)}
          </CopyHostStyles>
        )}
      </autoFrameContext.Provider>
    </iframe>
  );
});

AutoFrame.displayName = "AutoFrame";

export default AutoFrame;
