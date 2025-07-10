"use client"

import React from 'react';
import { ComponentRegistry } from '@/components/ui/ui-builder/types';
import { z } from 'zod';
import { commonFieldOverrides, classNameFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";

// Card Component
const Card: React.FC<{ 
  title?: string; 
  className?: string; 
  variant?: 'default' | 'bordered' | 'elevated' | 'outlined';
  children?: React.ReactNode; 
}> = ({ 
  title, 
  className = '', 
  variant = 'default',
  children 
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    bordered: 'bg-white border-2 border-gray-300 rounded-lg',
    elevated: 'bg-white border border-gray-200 rounded-lg shadow-lg',
    outlined: 'bg-transparent border-2 border-dashed border-gray-300 rounded-lg'
  };

  return (
    <div className={`${variantClasses[variant]} p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      {children}
    </div>
  );
};

// Panel Component (for sidebars, etc)
const Panel: React.FC<{ 
  position?: 'left' | 'right' | 'top' | 'bottom';
  width?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode; 
}> = ({ 
  position = 'left',
  width = 'md',
  className = '',
  children 
}) => {
  const positionClasses = {
    left: 'border-r border-gray-200',
    right: 'border-l border-gray-200',
    top: 'border-b border-gray-200',
    bottom: 'border-t border-gray-200'
  };

  const widthClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80',
    xl: 'w-96'
  };

  return (
    <div className={`bg-gray-50 ${positionClasses[position]} ${widthClasses[width]} p-4 ${className}`}>
      {children}
    </div>
  );
};

// Modal/Dialog Component
const Modal: React.FC<{ 
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode; 
}> = ({ 
  title,
  size = 'md',
  className = '',
  children 
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation: React.FC<{ 
  orientation?: 'horizontal' | 'vertical';
  variant?: 'pills' | 'underline' | 'buttons';
  className?: string;
  children?: React.ReactNode; 
}> = ({ 
  orientation = 'horizontal',
  variant = 'pills',
  className = '',
  children 
}) => {
  const orientationClasses = {
    horizontal: 'flex flex-row space-x-2',
    vertical: 'flex flex-col space-y-2'
  };

  const variantClasses = {
    pills: 'bg-gray-100 p-1 rounded-lg',
    underline: 'border-b border-gray-200',
    buttons: 'space-x-2'
  };

  return (
    <nav className={`${orientationClasses[orientation]} ${variantClasses[variant]} ${className}`}>
      {children}
    </nav>
  );
};

// List Component
const List: React.FC<{ 
  variant?: 'default' | 'ordered' | 'unstyled' | 'inline';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
  children?: React.ReactNode; 
}> = ({ 
  variant = 'default',
  spacing = 'normal',
  className = '',
  children 
}) => {
  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    loose: 'space-y-4'
  };

  const variantClasses = {
    default: 'list-disc list-inside',
    ordered: 'list-decimal list-inside',
    unstyled: 'list-none',
    inline: 'flex flex-wrap space-x-4 space-y-0'
  };

  const Tag = variant === 'ordered' ? 'ol' : 'ul';

  return (
    <Tag className={`${variantClasses[variant]} ${variant !== 'inline' ? spacingClasses[spacing] : ''} ${className}`}>
      {children}
    </Tag>
  );
};

// Grid Container Component
const GridContainer: React.FC<{ 
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode; 
}> = ({ 
  columns = 3,
  gap = 'md',
  className = '',
  children 
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Flex Container Component  
const FlexContainer: React.FC<{ 
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode; 
}> = ({ 
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 'md',
  className = '',
  children 
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div className={`flex ${directionClasses[direction]} ${justifyClasses[justify]} ${alignClasses[align]} ${wrap ? 'flex-wrap' : ''} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Form Group Component
const FormGroup: React.FC<{ 
  label?: string;
  required?: boolean;
  error?: string;
  layout?: 'vertical' | 'horizontal';
  className?: string;
  children?: React.ReactNode; 
}> = ({ 
  label,
  required = false,
  error,
  layout = 'vertical',
  className = '',
  children 
}) => {
  const layoutClasses = {
    vertical: 'flex flex-col space-y-2',
    horizontal: 'flex flex-row items-center space-x-4'
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
};

// Tab Container Component
const TabContainer: React.FC<{ 
  defaultTab?: string;
  className?: string;
  children?: React.ReactNode; 
}> = ({ 
  defaultTab,
  className = '',
  children 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
};

export const advancedDemoComponentRegistry: ComponentRegistry = {
  Card: {
    component: Card,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      title: z.string().default("Card Title"),
      variant: z.enum(["default", "bordered", "elevated", "outlined"]).default("default"),
    }),
    from: "@/app/platform/advanced-demo-components",
    fieldOverrides: commonFieldOverrides()
  },

  Panel: {
    component: Panel,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      position: z.enum(["left", "right", "top", "bottom"]).default("left"),
      width: z.enum(["sm", "md", "lg", "xl"]).default("md"),
    }),
    from: "@/app/platform/advanced-demo-components",
    fieldOverrides: commonFieldOverrides()
  },

  Modal: {
    component: Modal,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      title: z.string().default("Modal Title"),
      size: z.enum(["sm", "md", "lg", "xl"]).default("md"),
    }),
    from: "@/app/platform/advanced-demo-components",
    fieldOverrides: commonFieldOverrides()
  },

  Navigation: {
    component: Navigation,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
      variant: z.enum(["pills", "underline", "buttons"]).default("pills"),
    }),
    from: "@/app/platform/advanced-demo-components",
    fieldOverrides: commonFieldOverrides()
  },

  List: {
    component: List,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      variant: z.enum(["default", "ordered", "unstyled", "inline"]).default("default"),
      spacing: z.enum(["tight", "normal", "loose"]).default("normal"),
    }),
    from: "@/app/platform/advanced-demo-components",
    fieldOverrides: commonFieldOverrides()
  },

  GridContainer: {
    component: GridContainer,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      columns: z.number().min(1).max(6).default(3),
      gap: z.enum(["sm", "md", "lg", "xl"]).default("md"),
    }),
    from: "@/app/platform/advanced-demo-components",
    fieldOverrides: commonFieldOverrides()
  },

  FlexContainer: {
    component: FlexContainer,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      direction: z.enum(["row", "col", "row-reverse", "col-reverse"]).default("row"),
      justify: z.enum(["start", "center", "end", "between", "around", "evenly"]).default("start"),
      align: z.enum(["start", "center", "end", "stretch", "baseline"]).default("start"),
      wrap: z.boolean().default(false),
      gap: z.enum(["sm", "md", "lg", "xl"]).default("md"),
    }),
    from: "@/app/platform/advanced-demo-components",
    fieldOverrides: commonFieldOverrides()
  },

  FormGroup: {
    component: FormGroup,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      label: z.string().default("Field Label"),
      required: z.boolean().default(false),
      error: z.string().default(""),
      layout: z.enum(["vertical", "horizontal"]).default("vertical"),
    }),
    from: "@/app/platform/advanced-demo-components",
    fieldOverrides: commonFieldOverrides()
  },

  TabContainer: {
    component: TabContainer,
    schema: z.object({
      className: z.string().optional(),
      children: z.any().optional(),
      defaultTab: z.string().default("tab1"),
    }),
    from: "@/app/platform/advanced-demo-components",
    fieldOverrides: commonFieldOverrides()
  }
}; 