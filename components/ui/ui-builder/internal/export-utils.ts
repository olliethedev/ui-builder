import JSZip from "jszip";
import { saveAs } from "file-saver";
import globalCss from "../../../../styles/globals.css?raw";
import { primitiveComponentDefinitions } from "@/lib/ui-builder/registry/primitive-component-definitions";
import { complexComponentDefinitions } from "@/lib/ui-builder/registry/complex-component-definitions";
import { Layer } from "../ExportButton";

interface PageLayer {
  id: string;
  name?: string;
  type: "_page_";
  path?: string | undefined;
  props: Record<string, any>;
  children: Layer[];
}

interface ComponentLayer {
  id: string;
  name?: string;
  type: string;
  props: Record<string, any>;
  path?: string | undefined;
  children: Layer[] | string;
}

interface ExportProjectOptions {
  projectName?: string;
  assets?: Record<string, string>;
  pages?: ComponentLayer[];
}

const DEFAULT_OPTIONS: ExportProjectOptions = {
  projectName: "casino-ui",
};

const generatePackageJson = () => `{
  "name": "casino-ui",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "react-scripts": "5.0.1",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "react-responsive-carousel": "^3.2.23"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`;

const generateGlobalCss = ({ fetchedCss }: { fetchedCss: string }) => {
  return fetchedCss;
};

const generateTailwindConfig =
  () => `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            "code::before": { content: '""' },
            "code::after": { content: '""' },
            code: {
              background: "#f3f3f3",
              wordWrap: "break-word",
              padding: ".1rem .2rem",
              borderRadius: ".2rem",
            },
          },
        },
      },
    },
  },
  plugins: [],
}
`;
const generatePostCSSConfig = () => `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

const generateIndexHtml = () => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <title>Casino UI</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;

const generateIndexJs = () => `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

const generateAppJs = (
  pages: ComponentLayer[] | undefined
) => `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RenderComponent from './components/builder/RenderComponent';
import './index.css';
import "./globals.css";

function App() {
  return (
    <Router>
      <Routes>
        ${pages
          ?.map(
            (page) => `
        <Route 
          key="${page.id}" 
          path="/${
            page.name?.toLowerCase() == "home"
              ? ""
              : " " + page.name?.toLowerCase()
          }" 
          element={<RenderComponent componentData={${JSON.stringify(
            page,
            null,
            2
          )}} />}
        />`
          )
          .join("")}
      </Routes>
    </Router>
  );
}

export default App;
`;

const generateIndexCSS = () => `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

const generateComponentRegistry = (
  primitiveComponents: Record<string, any>,
  complexComponents: Record<string, any>
) => {
  // Generate primitive components (HTML elements)
  const primitiveComponentsCode = Object.keys(primitiveComponents)
    .map((name) => {
      return `  ${name}: ({ children, className, ...props }) => React.createElement('${name}', { className, ...props }, children)`;
    })
    .join(",\n");

  // Generate complex components (React components)
  const complexComponentsCode = Object.entries(complexComponents)
    .map(([name, definition]) => {
      if (definition.component) {
        // For components with routing logic (like Button)
        if (name === "Button") {
          return `  ${name}: ({ children, action, ...props }) => {
    const router = useNavigate();
    
    const handleClick = (e) => {
      if (props?.variant === "link" && props?.routing?.length > 0) {
        e.preventDefault();
        router("/".concat(props?.routing)); 
      }
    };

    return React.createElement('button', { ...props, onClick: handleClick }, children);
  }`;
        }

        // For Flexbox component
        if (name === "Flexbox") {
          return `  ${name}: ({ children, direction, justify, align, wrap, gap, className, ...props }) => 
    React.createElement('div', {
      className,
      style: {
        display: 'flex',
        flexDirection: direction || 'row',
        justifyContent: justify || 'flex-start',
        alignItems: align || 'flex-start',
        flexWrap: wrap || 'nowrap',
        gap: gap ? \`\${gap}px\` : '4',
        ...props.style
      },
      ...props
    }, children)`;
        }

        // For Grid component
        if (name === "Grid") {
          return `  ${name}: ({ children, columns, autoRows, justify, align, templateRows, gap, className, ...props }) => 
    React.createElement('div', {
      className: \`grid \${className || ''}\`,
      style: {
        gridTemplateColumns: columns === 'auto' ? 'auto' : \`repeat(\${columns}, 1fr)\`,
        gridAutoRows: autoRows === 'none' ? 'auto' : autoRows,
        justifyContent: justify || 'start',
        alignItems: align || 'start',
        gridTemplateRows: templateRows === 'none' ? 'none' : \`repeat(\${templateRows}, 1fr)\`,
        gap: gap ? \`\${gap}px\` : '0',
        ...props.style
      },
      ...props
    }, children)`;
        }

        // For Carousel component
        if (name === "Carousel") {
          return `  ${name}: ({ images, className, ...props }) => 
    React.createElement(ResponsiveCarousel, {
      className,
      showThumbs: false,
      infiniteLoop: true,
      autoPlay: true,
      interval: 3000,
      showStatus: false,
      ...props
    }, images?.map((img, i) => 
      React.createElement('img', { key: i, src: img, alt: \`Slide \${i}\` })
    ))`;
        }

        // For Markdown component
        if (name === "Markdown") {
          return `  ${name}: ({ children, className, ...props }) => 
    React.createElement('div', { 
      className: \`prose \${className || ''}\`,
      dangerouslySetInnerHTML: { __html: children || '' },
      ...props 
    })`;
        }

        // For Icon component
        if (name === "Icon") {
          return `  ${name}: ({ iconName, size, color, rotate, className, ...props }) => {
    const sizeMap = { small: 16, medium: 24, large: 32 };
    const rotateMap = { none: 0, '90': 90, '180': 180, '270': 270 };
    
    return React.createElement('div', {
      className: \`inline-flex items-center justify-center \${className || ''}\`,
      style: {
        width: sizeMap[size] || 24,
        height: sizeMap[size] || 24,
        transform: \`rotate(\${rotateMap[rotate] || 0}deg)\`,
        color: color ? \`var(--\${color})\` : 'currentColor'
      },
      ...props
    }, iconName || '🖼️');
  }`;
        }

        // Default component wrapper
        return `  ${name}: ({ children, className, ...props }) => 
    React.createElement('div', { className, ...props }, children)`;
      }

      // Fallback for components without component property
      return `  ${name}: ({ children, className, ...props }) => 
    React.createElement('div', { className, ...props }, children)`;
    })
    .join(",\n");

  return `import React from 'react';
import { Carousel as ResponsiveCarousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";

// Primitive Components (HTML elements)
const primitiveComponentRegistry = {
${primitiveComponentsCode}
};

// Complex Components (React components)
const complexComponentRegistry = {
${complexComponentsCode}
};

const componentRegistry = {
  ...primitiveComponentRegistry,
  ...complexComponentRegistry,
  _page_: ({ children, className, ...props }) => (
    React.createElement('div', { className, ...props }, children)
  )
};

export const registerComponent = (name, component) => {
  componentRegistry[name] = component;
};

export const getComponent = (name) => {
  if (!componentRegistry[name]) {
    console.warn(\`Component \${name} not found in registry. Using div as fallback.\`);
    return componentRegistry._page_;
  }
  return componentRegistry[name];
};

export default componentRegistry;
`;
};

const generateRenderComponent = () => `import React from 'react';
import { getComponent } from './ComponentRegistry';
import { Carousel as ResponsiveCarousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const RenderComponent = ({ componentData }) => {
  if (!componentData) return null;

  const { id, type, children, props = {} } = componentData;
  const Component = getComponent(type);

  // Special handling for different component types
  switch (type) {
    case 'img':
      return <Component key={id} {...props} />;
    
    case 'span':
      return typeof children === 'string' ? (
        <Component key={id} {...props}>{children}</Component>
      ) : (
        <Component key={id} {...props} />
      );
     case "Carousel":
      return <Component {...props} />;

    
    default:
      if (typeof children === 'string') {
        return <Component key={id} {...props}>{children}</Component>;
      }
      
      if (Array.isArray(children)) {
        return (
          <Component key={id} {...props}>
            {children.map((child) => (
              <RenderComponent key={child.id} componentData={child} />
            ))}
          </Component>
        );
      }
      
      return <Component key={id} {...props} />;
  }
};

export default RenderComponent;
`;

export const exportAsReactProject = async (
  options: ExportProjectOptions = {}
) => {
  // Fetch CSS from API instead of using imported raw CSS
  let fetchedCss = "";
  try {
    const response = await fetch("/getCss");
    const data = await response.json();
    fetchedCss = data.css;
    console.log(fetchedCss, "fetchedCss from API");
  } catch (error) {
    console.error("Failed to fetch CSS from API:", error);
    fetchedCss = globalCss;
  }
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  console.log(mergedOptions, "mergedOptions");

  const zip = new JSZip();

  // Create folder structure
  const src = zip.folder("src");
  const pages = src?.folder("pages");
  const publicFolder = zip.folder("public");
  const components = src?.folder("components");
  const builder = components?.folder("builder");

  // Add config files
  zip.file("tailwind.config.js", generateTailwindConfig());
  zip.file("postcss.config.js", generatePostCSSConfig());
  zip.file("package.json", generatePackageJson());

  // Add public files
  publicFolder?.file("index.html", generateIndexHtml());

  // Add src files
  src?.file("index.js", generateIndexJs());
  src?.file("index.css", generateIndexCSS());
  src?.file("App.js", generateAppJs(mergedOptions.pages));
  src?.file("globals.css", generateGlobalCss({ fetchedCss }));
  console.log(mergedOptions.pages, "mergedOptions.pages");
  // Add component files
  builder?.file(
    "ComponentRegistry.js",
    generateComponentRegistry(
      primitiveComponentDefinitions,
      complexComponentDefinitions
    )
  );
  builder?.file("RenderComponent.js", generateRenderComponent());
  // Add individual page files
  mergedOptions?.pages?.forEach((page) => {
    pages?.file(
      `${page.name?.replace(/\s+/g, "") || page.id}.js`,
      `import RenderComponent from '../components/builder/RenderComponent';

const ${page.name?.replace(/\s+/g, "") || "Page_" + page.id} = () => {
  const pageData = ${JSON.stringify(page, null, 2)};
  
  return (
    <RenderComponent componentData={pageData} />
  );
};

export default ${page.name?.replace(/\s+/g, "") || "Page_" + page.id};
`
    );
  });
  // Add assets if provided
  if (mergedOptions.assets) {
    const assetsFolder = publicFolder?.folder("assets");
    Object.entries(mergedOptions.assets).forEach(([path, data]) => {
      assetsFolder?.file(path, data, { base64: true });
    });
  }

  // Generate the ZIP file
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${mergedOptions.projectName}.zip`);
};
