/**
 * Auto-generated component scaffolds
 * Generated at: 2026-01-17T01:20:44.724Z
 * 
 * Copy these definitions to shadcn-component-definitions.ts and customize as needed.
 * 
 * For each component:
 * 1. Install the component: npx shadcn@latest add <component-name>
 * 2. Import the actual component at the top of the file
 * 3. Replace "null as unknown as React.ComponentType<any>" with the real component
 * 4. Update the Zod schema with the component's actual props
 */

import React from 'react';
import { z } from 'zod';
import { ComponentRegistry } from '@/components/ui/ui-builder/types';
import { commonFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";

// TODO: Add actual component imports here, e.g.:
// import { Chart, Form, InputOtp, Resizable, Sonner, Toast } from "@/components/ui/...";

const scaffoldedComponents: ComponentRegistry = {

    // TODO: Import actual component and update schema with real props
    Chart: {
        component: null as unknown as React.ComponentType<any>, // Replace with: Chart
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/chart",
        fieldOverrides: commonFieldOverrides()
    },

    // TODO: Import actual component and update schema with real props
    Form: {
        component: null as unknown as React.ComponentType<any>, // Replace with: Form
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/form",
        fieldOverrides: commonFieldOverrides()
    },

    // TODO: Import actual component and update schema with real props
    InputOtp: {
        component: null as unknown as React.ComponentType<any>, // Replace with: InputOtp
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/input-otp",
        fieldOverrides: commonFieldOverrides()
    },

    // TODO: Import actual component and update schema with real props
    Resizable: {
        component: null as unknown as React.ComponentType<any>, // Replace with: Resizable
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/resizable",
        fieldOverrides: commonFieldOverrides()
    },

    // TODO: Import actual component and update schema with real props
    Sonner: {
        component: null as unknown as React.ComponentType<any>, // Replace with: Sonner
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/sonner",
        fieldOverrides: commonFieldOverrides()
    },

    // TODO: Import actual component and update schema with real props
    Toast: {
        component: null as unknown as React.ComponentType<any>, // Replace with: Toast
        schema: z.object({
            className: z.string().optional(),
            children: z.any().optional(),
        }),
        from: "@/components/ui/toast",
        fieldOverrides: commonFieldOverrides()
    },

};

export { scaffoldedComponents };
