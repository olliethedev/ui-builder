import React from 'react';
import { z } from 'zod';
import { ComponentRegistry } from '@/components/ui/ui-builder/types';
import { textInputFieldOverrides } from '@/lib/ui-builder/registry/form-field-overrides';

// UserProfile Component - demonstrates immutable user data binding
interface UserProfileProps {
  userId?: string;
  displayName?: string;
  email?: string;
  role?: string;
  avatar?: string;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  userId = "user_123", 
  displayName = "John Doe", 
  email = "john@example.com", 
  role = "Developer", 
  avatar,
  className = ""
}) => {
  return (
    <div className={`flex items-center space-x-4 p-4 bg-card rounded-lg border ${className}`}>
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
        {avatar ? (
          <img src={avatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
        ) : (
          (displayName || "U").charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{displayName}</h3>
        <p className="text-sm text-muted-foreground">{email}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {role}
          </span>
          <span className="text-xs text-muted-foreground">ID: {userId}</span>
        </div>
      </div>
    </div>
  );
};

// BrandedButton Component - demonstrates immutable branding with customizable content
interface BrandedButtonProps {
  text?: string;
  brandColor?: string;
  companyName?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const BrandedButton: React.FC<BrandedButtonProps> = ({
  text = "Click Me",
  brandColor = "#3b82f6",
  companyName = "Acme Corp",
  variant = 'primary',
  size = 'md',
  className = "",
  onClick
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = `font-semibold rounded-lg transition-all duration-200 ${sizeClasses[size]}`;
  
  const variantClasses = variant === 'primary' 
    ? `text-white shadow-lg hover:shadow-xl transform hover:scale-105`
    : `bg-white border-2 shadow-md hover:shadow-lg`;

  const style = variant === 'primary' 
    ? { backgroundColor: brandColor }
    : { borderColor: brandColor, color: brandColor };

  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={style}
      onClick={onClick}
      title={`${text} - Powered by ${companyName}`}
    >
      {text}
      <span className="ml-2 text-xs opacity-75">by {companyName}</span>
    </button>
  );
};

// SystemAlert Component - demonstrates system-wide configurations
interface SystemAlertProps {
  message?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  systemVersion?: string;
  maintenanceMode?: boolean;
  className?: string;
}

export const SystemAlert: React.FC<SystemAlertProps> = ({
  message = "System notification",
  type = "info",
  systemVersion = "1.0.0",
  maintenanceMode = false,
  className = ""
}) => {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  };

  return (
    <div className={`border rounded-lg p-4 ${typeStyles[type]} ${className}`}>
      <div className="flex items-start space-x-3">
        <span className="text-xl">{icons[type]}</span>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          <div className="mt-2 flex items-center justify-between text-xs opacity-75">
            <span>System v{systemVersion}</span>
            {maintenanceMode && <span className="font-semibold">MAINTENANCE MODE</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Registry definitions with immutable bindings
export const demoComponentRegistry: ComponentRegistry = {
  UserProfile: {
    component: UserProfile,
    schema: z.object({
      userId: z.string().default("user_123"),
      displayName: z.string().default("John Doe"),
      email: z.string().email().default("john@example.com"),
      role: z.string().default("Developer"),
      avatar: z.string().optional(),
      className: z.string().optional()
    }),
    from: "app/platform/demo-components",
    defaultVariableBindings: [
      {
        propName: "userId",
        variableId: "current_user_id",
        immutable: true // System data that shouldn't be editable
      },
      {
        propName: "email",
        variableId: "current_user_email", 
        immutable: true // Personal data that's protected
      },
      {
        propName: "role",
        variableId: "current_user_role",
        immutable: true // Security-related data
      },
      {
        propName: "displayName",
        variableId: "current_user_name",
        immutable: false // Can be customized for display purposes
      }
    ],
    fieldOverrides: {
      userId: (layer) => textInputFieldOverrides(layer, true, 'userId'),
      displayName: (layer) => textInputFieldOverrides(layer, true, 'displayName'),
      email: (layer) => textInputFieldOverrides(layer, true, 'email'),
      role: (layer) => textInputFieldOverrides(layer, true, 'role'),
    }
  },

  BrandedButton: {
    component: BrandedButton,
    schema: z.object({
      text: z.string().default("Click Me"),
      brandColor: z.string().default("#3b82f6"),
      companyName: z.string().default("Acme Corp"),
      variant: z.enum(['primary', 'secondary']).default('primary'),
      size: z.enum(['sm', 'md', 'lg']).default('md'),
      className: z.string().optional()
    }),
    from: "app/platform/demo-components",
    defaultVariableBindings: [
      {
        propName: "brandColor",
        variableId: "company_brand_color",
        immutable: true // Brand consistency must be maintained
      },
      {
        propName: "companyName", 
        variableId: "company_name",
        immutable: true // Company identity is protected
      },
      {
        propName: "text",
        variableId: "button_text",
        immutable: false // Content creators can customize button text
      }
    ],
    fieldOverrides: {
      text: (layer) => textInputFieldOverrides(layer, true, 'text'),
      brandColor: (layer) => textInputFieldOverrides(layer, true, 'brandColor'),
      companyName: (layer) => textInputFieldOverrides(layer, true, 'companyName'),
    }
  },

  SystemAlert: {
    component: SystemAlert,
    schema: z.object({
      message: z.string().default("System notification"),
      type: z.enum(['info', 'warning', 'error', 'success']).default('info'),
      systemVersion: z.string().default("1.0.0"),
      maintenanceMode: z.boolean().default(false),
      className: z.string().optional()
    }),
    from: "app/platform/demo-components", 
    defaultVariableBindings: [
      {
        propName: "systemVersion",
        variableId: "system_version",
        immutable: true // System info should not be editable
      },
      {
        propName: "maintenanceMode",
        variableId: "maintenance_mode",
        immutable: true // System state is controlled by admins only
      },
      {
        propName: "message",
        variableId: "alert_message",
        immutable: false // Content can be customized
      }
    ],
    fieldOverrides: {
      message: (layer) => textInputFieldOverrides(layer, true, 'message'),
      systemVersion: (layer) => textInputFieldOverrides(layer, true, 'systemVersion'),
    }
  }
}; 