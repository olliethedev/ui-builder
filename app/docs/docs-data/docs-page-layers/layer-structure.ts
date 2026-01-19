import type { ComponentLayer } from "@/components/ui/ui-builder/types";

export const LAYER_STRUCTURE_LAYER = {
    "id": "layer-structure",
    "type": "div",
    "name": "Layer Structure",
    "props": {
      "className": "h-full bg-background px-4 flex flex-col gap-6 min-h-screen",
      "data-group": "layout-persistence"
    },
    "children": [
      {
        "type": "span",
        "children": "Layer Structure",
        "id": "layer-structure-title",
        "name": "Text",
        "props": {
          "className": "text-4xl"
        }
      },
      {
        "id": "layer-structure-intro",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "Understanding layer structure is fundamental to working with UI Builder. Layers define the hierarchical component tree that powers both the visual editor and the rendering system."
      },
      {
        "id": "layer-structure-interface",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## ComponentLayer Interface\n\nEvery element in UI Builder is represented as a `ComponentLayer` with this structure:\n\n```tsx\ninterface ComponentLayer {\n  id: string;                                           // Unique identifier\n  type: string;                                         // Component type from registry\n  name?: string;                                        // Optional display name for editor\n  props: Record<string, any>;                           // Component properties\n  children: ComponentLayer[] | string | VariableReference; // Child layers, text, or variable ref\n}\n```\n\n### Core Fields\n\n- **`id`**: Required unique identifier for each layer\n- **`type`**: Must match a key in your component registry (e.g., 'Button', 'div', 'Card')\n- **`name`**: Optional display name shown in the layers panel\n- **`props`**: Object containing all component properties (className, variant, etc.)\n- **`children`**: Array of child layers, a string for text content, or a VariableReference for dynamic text"
      },
      {
        "id": "layer-structure-examples",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Basic Layer Examples\n\n### Simple Text Layer\n```tsx\nconst textLayer: ComponentLayer = {\n  id: 'heading-1',\n  type: 'h1',\n  name: 'Page Title',\n  props: {\n    className: 'text-3xl font-bold text-center'\n  },\n  children: 'Welcome to My App'\n};\n```\n\n### Button with Icon\n```tsx\nconst buttonLayer: ComponentLayer = {\n  id: 'cta-button',\n  type: 'Button',\n  name: 'CTA Button',\n  props: {\n    variant: 'default',\n    size: 'lg',\n    className: 'w-full max-w-sm'\n  },\n  children: [\n    {\n      id: 'button-text',\n      type: 'span',\n      name: 'Button Text',\n      props: {},\n      children: 'Get Started'\n    },\n    {\n      id: 'button-icon',\n      type: 'Icon',\n      name: 'Arrow Icon',\n      props: {\n        iconName: 'ArrowRight',\n        size: 'medium'\n      },\n      children: []\n    }\n  ]\n};\n```"
      },
      {
        "id": "layer-structure-hierarchy",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Hierarchical Structure\n\nLayers form a tree structure where containers hold other layers:\n\n```tsx\nconst cardLayer: ComponentLayer = {\n  id: 'product-card',\n  type: 'div',\n  name: 'Product Card',\n  props: {\n    className: 'bg-white rounded-lg shadow-md p-6'\n  },\n  children: [\n    {\n      id: 'card-header',\n      type: 'div',\n      name: 'Header',\n      props: { className: 'mb-4' },\n      children: [\n        {\n          id: 'product-title',\n          type: 'h3',\n          name: 'Product Title',\n          props: { className: 'text-xl font-semibold' },\n          children: 'Amazing Product'\n        },\n        {\n          id: 'product-badge',\n          type: 'Badge',\n          name: 'Status Badge',\n          props: { variant: 'secondary' },\n          children: 'New'\n        }\n      ]\n    },\n    {\n      id: 'card-content',\n      type: 'div',\n      name: 'Content',\n      props: { className: 'space-y-3' },\n      children: [\n        {\n          id: 'description',\n          type: 'p',\n          name: 'Description',\n          props: { className: 'text-gray-600' },\n          children: 'This product will change your life.'\n        },\n        {\n          id: 'price',\n          type: 'div',\n          name: 'Price Container',\n          props: { className: 'flex items-center justify-between' },\n          children: [\n            {\n              id: 'price-text',\n              type: 'span',\n              name: 'Price',\n              props: { className: 'text-2xl font-bold text-green-600' },\n              children: '$99.99'\n            },\n            {\n              id: 'buy-button',\n              type: 'Button',\n              name: 'Buy Button',\n              props: { variant: 'default', size: 'sm' },\n              children: 'Add to Cart'\n            }\n          ]\n        }\n      ]\n    }\n  ]\n};\n```"
      },
      {
        "id": "layer-structure-types",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Layer Types\n\n### Container Layers\nLayers that hold and organize other layers:\n\n```tsx\n// Flex container\n{\n  id: 'nav-container',\n  type: 'div',\n  name: 'Navigation',\n  props: {\n    className: 'flex items-center justify-between p-4'\n  },\n  children: [/* nav items */]\n}\n\n// Grid container\n{\n  id: 'grid-layout',\n  type: 'div',\n  name: 'Image Grid',\n  props: {\n    className: 'grid grid-cols-1 md:grid-cols-3 gap-6'\n  },\n  children: [/* grid items */]\n}\n```\n\n### Content Layers\nLayers that display content:\n\n```tsx\n// Text content\n{\n  id: 'paragraph-1',\n  type: 'p',\n  name: 'Description',\n  props: {\n    className: 'text-base leading-relaxed'\n  },\n  children: 'Your content here...'\n}\n\n// Rich content\n{\n  id: 'article-content',\n  type: 'Markdown',\n  name: 'Article Body',\n  props: {},\n  children: '# Article Title\\n\\nThis is **markdown** content.'\n}\n\n// Images\n{\n  id: 'hero-image',\n  type: 'img',\n  name: 'Hero Image',\n  props: {\n    src: '/hero.jpg',\n    alt: 'Hero image',\n    className: 'w-full h-64 object-cover'\n  },\n  children: []\n}\n```\n\n### Interactive Layers\nLayers that users can interact with:\n\n```tsx\n// Buttons\n{\n  id: 'submit-btn',\n  type: 'Button',\n  name: 'Submit Button',\n  props: {\n    type: 'submit',\n    variant: 'default'\n  },\n  children: 'Submit Form'\n}\n\n// Form inputs\n{\n  id: 'email-input',\n  type: 'Input',\n  name: 'Email Field',\n  props: {\n    type: 'email',\n    placeholder: 'Enter your email',\n    className: 'w-full'\n  },\n  children: []\n}\n```"
      },
      {
        "id": "layer-structure-children",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Children Patterns\n\nLayers can have different types of children:\n\n### Text Children\nFor simple text content:\n```tsx\n{\n  id: 'simple-text',\n  type: 'p',\n  name: 'Paragraph',\n  props: {},\n  children: 'This is simple text content' // string\n}\n```\n\n### Component Children\nFor nested components:\n```tsx\n{\n  id: 'container',\n  type: 'div',\n  name: 'Container',\n  props: {},\n  children: [  // array of ComponentLayer objects\n    {\n      id: 'child-1',\n      type: 'span',\n      name: 'First Child',\n      props: {},\n      children: 'Hello'\n    },\n    {\n      id: 'child-2', \n      type: 'span',\n      name: 'Second Child',\n      props: {},\n      children: 'World'\n    }\n  ]\n}\n```\n\n### Variable Reference Children\nFor dynamic text content bound to variables:\n```tsx\n{\n  id: 'dynamic-text',\n  type: 'span',\n  name: 'Dynamic Text',\n  props: {},\n  children: { __variableRef: 'welcomeMessage' } // VariableReference\n}\n```\n\nWhen rendered, the variable reference is resolved to the variable's value.\n\n### Empty Children\nFor self-closing elements:\n```tsx\n{\n  id: 'line-break',\n  type: 'br',\n  name: 'Line Break',\n  props: {},\n  children: [] // empty array\n}\n```"
      },
      {
        "id": "layer-structure-best-practices",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Best Practices\n\n### Unique IDs\nEnsure every layer has a unique `id`:\n```tsx\n// ✅ Good - unique IDs\n{ id: 'header-logo', type: 'img', ... }\n{ id: 'nav-menu', type: 'nav', ... }\n{ id: 'footer-copyright', type: 'p', ... }\n\n// ❌ Bad - duplicate IDs\n{ id: 'button', type: 'Button', ... }\n{ id: 'button', type: 'Button', ... } // Duplicate!\n```\n\n### Meaningful Names\nUse descriptive names for the layers panel:\n```tsx\n// ✅ Good - descriptive names\n{ id: 'hero-cta', name: 'Hero Call-to-Action', type: 'Button', ... }\n{ id: 'product-grid', name: 'Product Grid', type: 'div', ... }\n\n// ❌ Bad - generic names\n{ id: 'button-1', name: 'Button', type: 'Button', ... }\n{ id: 'div-2', name: 'div', type: 'div', ... }\n```\n\n### Component Dependencies\nMake sure all referenced component types exist in your registry:\n```tsx\n// If your Button has span children, include span in registry\nconst registry = {\n  ...primitiveComponentDefinitions, // includes 'span'\n  Button: { /* your button definition */ }\n};\n```\n\n### Semantic Structure\nFollow HTML semantic structure where possible:\n```tsx\n// ✅ Good - semantic structure\n{\n  id: 'article',\n  type: 'article',\n  name: 'Blog Post',\n  children: [\n    { id: 'title', type: 'h1', name: 'Title', ... },\n    { id: 'meta', type: 'div', name: 'Meta Info', ... },\n    { id: 'content', type: 'div', name: 'Content', ... }\n  ]\n}\n```"
      },
      {
        "id": "layer-structure-next-steps",
        "type": "Markdown",
        "name": "Markdown",
        "props": {},
        "children": "## Related Topics\n\n- **[Component Registry](/docs/component-registry)** - Learn how to define which components are available\n- **[Variable Binding](/docs/variable-binding)** - Make your layers dynamic with variables\n- **[Rendering Pages](/docs/rendering-pages)** - Render layers without the editor\n- **[Persistence](/docs/persistence)** - Save and load layer structures"
      }
    ]
  } as const satisfies ComponentLayer; 