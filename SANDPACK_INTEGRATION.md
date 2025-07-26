# Sandpack Integration for UI Builder

The UI Builder now includes Sandpack integration, allowing users to create custom React components directly within the builder using a live code editor. These custom components are automatically added to the component registry and can be used throughout the UI builder.

## Features

### 🎨 Live Code Editor
- **Sandpack-powered editor** with syntax highlighting and real-time preview
- **React environment** with TypeScript support
- **Live error detection** and validation

### 🛠️ Component Creation
- **Visual component creator** with intuitive interface
- **Zod schema definition** for type-safe props
- **Automatic registry integration** - created components are immediately available
- **Component validation** to ensure proper React component structure

### 📝 Component Management
- **Browse custom components** with creation dates and metadata
- **Edit existing components** in the live editor
- **Delete unwanted components** from the registry
- **Schema validation** for props configuration

## Getting Started

### 1. Access the Component Creator

Navigate to the UI Builder and click on the **"Components"** tab in the left panel. This opens the Sandpack Component Creator interface.

### 2. Create Your First Component

1. **Enter Component Name**: Provide a valid React component name (must start with a capital letter)
2. **Write Component Code**: Use the Sandpack editor to write your React component
3. **Define Schema**: Create a Zod schema to define your component's props
4. **Create Component**: Click the "Create Component" button to add it to the registry

### 3. Use Your Custom Component

Once created, your custom component will be available in the "Add Component" dialog when building your UI. Simply add it like any other component.

## Example Component

Here's an example of a custom component you can create:

### Component Code
```tsx
import React from "react";

interface Props {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  variant?: "default" | "outline" | "filled";
  size?: "sm" | "md" | "lg";
}

export default function CustomCard({ 
  className = "", 
  children, 
  title = "Custom Card",
  variant = "default",
  size = "md"
}: Props) {
  const baseClasses = "rounded-lg border transition-all duration-200";
  const variantClasses = {
    default: "bg-white border-gray-200 shadow-sm",
    outline: "bg-transparent border-gray-300",
    filled: "bg-blue-50 border-blue-200"
  };
  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {title && (
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      <div className="text-gray-700">{children}</div>
    </div>
  );
}
```

### Schema Definition
```typescript
z.object({
  className: z.string().optional(),
  children: z.any().optional(),
  title: z.string().default("Custom Card"),
  variant: z.enum(["default", "outline", "filled"]).default("default"),
  size: z.enum(["sm", "md", "lg"]).default("md"),
})
```

## Component Structure Requirements

Custom components must follow these guidelines:

### Required Elements
- **React import**: `import React from "react"`
- **Default export**: Component must be exported as default
- **Props interface**: Define TypeScript interface for props
- **Function component**: Use function component pattern

### Recommended Props
- **className**: For styling flexibility
- **children**: For content composition
- **Custom props**: Define specific props for your component's functionality

## Technical Implementation

### Safe Code Evaluation
The system uses a secure evaluation context that:
- Limits available globals to React and Zod
- Validates component structure before creation
- Creates placeholder components for safe rendering
- Prevents malicious code execution

### Registry Integration
Custom components are:
- Stored in the editor store with metadata
- Automatically added to the component registry
- Available immediately in the component picker
- Persisted during the session

### Validation System
The system validates:
- **Component names**: Must be valid React component names
- **Component code**: Must follow React component patterns
- **Schema definitions**: Must be valid Zod schemas
- **Uniqueness**: Prevents duplicate component names

## Demo

Try the Sandpack integration at `/examples/sandpack-demo` to see the feature in action.

## Security Considerations

While the current implementation includes basic safety measures, for production use you should consider:

- **Server-side compilation**: Compile components on the server
- **Code sandboxing**: Use more robust sandboxing techniques
- **Input sanitization**: Additional validation for user input
- **Rate limiting**: Prevent abuse of the component creation system

## Future Enhancements

Potential improvements include:
- **Component templates**: Pre-built component templates
- **Export functionality**: Export custom components as files
- **Version control**: Track component changes over time
- **Sharing system**: Share components between users
- **Advanced editor**: More sophisticated code editing features

## Troubleshooting

### Common Issues

**Component not appearing in registry**
- Check that the component name is valid
- Ensure the code follows React component patterns
- Verify the schema is valid Zod syntax

**Schema validation errors**
- Ensure proper Zod syntax
- Check for typos in property names
- Validate enum values and default values

**Component rendering issues**
- Check for syntax errors in the component code
- Ensure all imports are properly included
- Verify prop types match the schema definition