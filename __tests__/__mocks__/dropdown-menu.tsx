import React from 'react';

// Mock for dropdown menu components that always renders content
export const DropdownMenu = ({ children, onOpenChange }: { children: React.ReactNode; onOpenChange?: (open: boolean) => void }) => {
  return <div data-testid="dropdown-menu" data-state="open">{children}</div>;
};

export const DropdownMenuTrigger = ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [key: string]: any }) => {
  // Always render the trigger
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return <div {...props}>{children}</div>;
};

export const DropdownMenuContent = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
  // Always render the content inline (no portal)
  return (
    <div data-testid="dropdown-menu-content" data-state="open" {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: any }) => {
  return (
    <div role="menuitem" onClick={onClick} {...props}>
      {children}
    </div>
  );
};

// Additional exports that might be used
export const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuSubContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuCheckboxItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuRadioItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuSeparator = () => <div />;
export const DropdownMenuShortcut = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;