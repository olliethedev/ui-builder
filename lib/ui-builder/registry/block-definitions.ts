import { ComponentLayer, BlockDefinition, BlockRegistry } from '@/components/ui/ui-builder/types';

// Re-export types for backward compatibility
export type { BlockDefinition, BlockRegistry } from '@/components/ui/ui-builder/types';

/**
 * Helper to create a simple text span layer
 */
const textSpan = (id: string, text: string): ComponentLayer => ({
    id,
    type: "span",
    name: "span",
    props: {},
    children: text,
});

/**
 * Helper to create a div container
 */
const divContainer = (id: string, className: string, children: ComponentLayer[]): ComponentLayer => ({
    id,
    type: "div",
    name: "div",
    props: { className },
    children,
});

// ============================================
// LOGIN BLOCKS
// ============================================
const loginBlocks: BlockDefinition[] = [
    {
        name: "login-01",
        category: "login",
        description: "Simple login form with email and password",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardFooter", "Input", "Button", "Label"],
        template: {
            id: "login-01-root",
            type: "Card",
            name: "Login Form",
            props: { className: "w-full max-w-sm" },
            children: [
                {
                    id: "login-01-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: {},
                    children: [
                        { id: "login-01-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("login-01-title-text", "Login")] },
                        { id: "login-01-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("login-01-desc-text", "Enter your credentials to access your account")] },
                    ],
                },
                {
                    id: "login-01-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "space-y-4" },
                    children: [
                        divContainer("login-01-email-group", "space-y-2", [
                            { id: "login-01-email-label", type: "Label", name: "Label", props: { htmlFor: "email" }, children: "Email" },
                            { id: "login-01-email-input", type: "Input", name: "Input", props: { type: "email", placeholder: "m@example.com", id: "email" }, children: [] },
                        ]),
                        divContainer("login-01-password-group", "space-y-2", [
                            { id: "login-01-password-label", type: "Label", name: "Label", props: { htmlFor: "password" }, children: "Password" },
                            { id: "login-01-password-input", type: "Input", name: "Input", props: { type: "password", id: "password" }, children: [] },
                        ]),
                    ],
                },
                {
                    id: "login-01-footer",
                    type: "CardFooter",
                    name: "CardFooter",
                    props: {},
                    children: [
                        { id: "login-01-button", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("login-01-btn-text", "Sign In")] },
                    ],
                },
            ],
        },
    },
    {
        name: "login-02",
        category: "login",
        description: "Login form with social login options",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardFooter", "Input", "Button", "Label", "Separator"],
        template: {
            id: "login-02-root",
            type: "Card",
            name: "Login Form with Social",
            props: { className: "w-full max-w-sm" },
            children: [
                {
                    id: "login-02-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: { className: "text-center" },
                    children: [
                        { id: "login-02-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("login-02-title-text", "Welcome back")] },
                        { id: "login-02-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("login-02-desc-text", "Sign in to your account")] },
                    ],
                },
                {
                    id: "login-02-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "space-y-4" },
                    children: [
                        { id: "login-02-google-btn", type: "Button", name: "Button", props: { variant: "outline", className: "w-full" }, children: [textSpan("login-02-google-text", "Continue with Google")] },
                        { id: "login-02-github-btn", type: "Button", name: "Button", props: { variant: "outline", className: "w-full" }, children: [textSpan("login-02-github-text", "Continue with GitHub")] },
                        divContainer("login-02-divider", "relative", [
                            { id: "login-02-separator", type: "Separator", name: "Separator", props: {}, children: [] },
                            { id: "login-02-or", type: "span", name: "span", props: { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground" }, children: "OR" },
                        ]),
                        divContainer("login-02-email-group", "space-y-2", [
                            { id: "login-02-email-label", type: "Label", name: "Label", props: { htmlFor: "email" }, children: "Email" },
                            { id: "login-02-email-input", type: "Input", name: "Input", props: { type: "email", placeholder: "m@example.com", id: "email" }, children: [] },
                        ]),
                        divContainer("login-02-password-group", "space-y-2", [
                            { id: "login-02-password-label", type: "Label", name: "Label", props: { htmlFor: "password" }, children: "Password" },
                            { id: "login-02-password-input", type: "Input", name: "Input", props: { type: "password", id: "password" }, children: [] },
                        ]),
                    ],
                },
                {
                    id: "login-02-footer",
                    type: "CardFooter",
                    name: "CardFooter",
                    props: {},
                    children: [
                        { id: "login-02-button", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("login-02-btn-text", "Sign In")] },
                    ],
                },
            ],
        },
    },
    {
        name: "login-03",
        category: "login",
        description: "Two-column login with image",
        requiredComponents: ["Card", "Input", "Button", "Label"],
        template: divContainer("login-03-root", "grid min-h-[400px] grid-cols-2 overflow-hidden rounded-lg border", [
            divContainer("login-03-image", "hidden bg-muted lg:block", [
                { id: "login-03-img", type: "img", name: "img", props: { src: "https://placehold.co/600x400", alt: "Login image", className: "h-full w-full object-cover" }, children: [] },
            ]),
            divContainer("login-03-form", "flex items-center justify-center p-8", [
                divContainer("login-03-form-inner", "w-full max-w-sm space-y-6", [
                    divContainer("login-03-header", "space-y-2 text-center", [
                        { id: "login-03-title", type: "h1", name: "h1", props: { className: "text-2xl font-bold" }, children: "Sign In" },
                        { id: "login-03-subtitle", type: "p", name: "p", props: { className: "text-muted-foreground" }, children: "Enter your email below to sign in" },
                    ]),
                    divContainer("login-03-fields", "space-y-4", [
                        divContainer("login-03-email-group", "space-y-2", [
                            { id: "login-03-email-label", type: "Label", name: "Label", props: { htmlFor: "email" }, children: "Email" },
                            { id: "login-03-email-input", type: "Input", name: "Input", props: { type: "email", placeholder: "m@example.com", id: "email" }, children: [] },
                        ]),
                        divContainer("login-03-password-group", "space-y-2", [
                            { id: "login-03-password-label", type: "Label", name: "Label", props: { htmlFor: "password" }, children: "Password" },
                            { id: "login-03-password-input", type: "Input", name: "Input", props: { type: "password", id: "password" }, children: [] },
                        ]),
                        { id: "login-03-button", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("login-03-btn-text", "Sign In")] },
                    ]),
                ]),
            ]),
        ]),
    },
    {
        name: "login-04",
        category: "login",
        description: "Minimal login form",
        requiredComponents: ["Input", "Button", "Label"],
        template: divContainer("login-04-root", "flex min-h-[350px] items-center justify-center", [
            divContainer("login-04-form", "w-full max-w-sm space-y-6", [
                divContainer("login-04-header", "space-y-2 text-center", [
                    { id: "login-04-title", type: "h1", name: "h1", props: { className: "text-3xl font-bold" }, children: "Login" },
                ]),
                divContainer("login-04-fields", "space-y-4", [
                    { id: "login-04-email-input", type: "Input", name: "Input", props: { type: "email", placeholder: "Email" }, children: [] },
                    { id: "login-04-password-input", type: "Input", name: "Input", props: { type: "password", placeholder: "Password" }, children: [] },
                    { id: "login-04-button", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("login-04-btn-text", "Sign In")] },
                ]),
                divContainer("login-04-footer", "text-center text-sm", [
                    { id: "login-04-footer-text", type: "span", name: "span", props: { className: "text-muted-foreground" }, children: "Don't have an account? " },
                    { id: "login-04-signup-link", type: "a", name: "a", props: { href: "#", className: "underline" }, children: [textSpan("login-04-signup-text", "Sign up")] },
                ]),
            ]),
        ]),
    },
    {
        name: "login-05",
        category: "login",
        description: "Login with remember me and forgot password",
        requiredComponents: ["Card", "Input", "Button", "Label", "Checkbox"],
        template: {
            id: "login-05-root",
            type: "Card",
            name: "Login Form Extended",
            props: { className: "w-full max-w-md" },
            children: [
                {
                    id: "login-05-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: {},
                    children: [
                        { id: "login-05-title", type: "CardTitle", name: "CardTitle", props: { className: "text-2xl" }, children: [textSpan("login-05-title-text", "Login")] },
                        { id: "login-05-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("login-05-desc-text", "Enter your email and password to access your account")] },
                    ],
                },
                {
                    id: "login-05-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "space-y-4" },
                    children: [
                        divContainer("login-05-email-group", "space-y-2", [
                            { id: "login-05-email-label", type: "Label", name: "Label", props: { htmlFor: "email" }, children: "Email" },
                            { id: "login-05-email-input", type: "Input", name: "Input", props: { type: "email", placeholder: "m@example.com", id: "email" }, children: [] },
                        ]),
                        divContainer("login-05-password-group", "space-y-2", [
                            divContainer("login-05-password-header", "flex items-center justify-between", [
                                { id: "login-05-password-label", type: "Label", name: "Label", props: { htmlFor: "password" }, children: "Password" },
                                { id: "login-05-forgot-link", type: "a", name: "a", props: { href: "#", className: "text-sm underline" }, children: [textSpan("login-05-forgot-text", "Forgot password?")] },
                            ]),
                            { id: "login-05-password-input", type: "Input", name: "Input", props: { type: "password", id: "password" }, children: [] },
                        ]),
                        divContainer("login-05-remember", "flex items-center space-x-2", [
                            { id: "login-05-remember-checkbox", type: "Checkbox", name: "Checkbox", props: { id: "remember" }, children: [] },
                            { id: "login-05-remember-label", type: "Label", name: "Label", props: { htmlFor: "remember", className: "text-sm font-normal" }, children: "Remember me" },
                        ]),
                    ],
                },
                {
                    id: "login-05-footer",
                    type: "CardFooter",
                    name: "CardFooter",
                    props: { className: "flex flex-col space-y-4" },
                    children: [
                        { id: "login-05-button", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("login-05-btn-text", "Sign In")] },
                        divContainer("login-05-signup", "text-center text-sm", [
                            { id: "login-05-signup-text", type: "span", name: "span", props: { className: "text-muted-foreground" }, children: "Don't have an account? " },
                            { id: "login-05-signup-link", type: "a", name: "a", props: { href: "#", className: "underline" }, children: [textSpan("login-05-signup-link-text", "Sign up")] },
                        ]),
                    ],
                },
            ],
        },
    },
];

// ============================================
// SIDEBAR BLOCKS
// ============================================
const createSidebarBlock = (num: string, description: string): BlockDefinition => ({
    name: `sidebar-${num}`,
    category: "sidebar",
    description,
    requiredComponents: ["Sidebar", "SidebarHeader", "SidebarContent", "SidebarFooter", "SidebarMenu", "SidebarMenuItem", "SidebarMenuButton"],
    template: {
        id: `sidebar-${num}-root`,
        type: "SidebarProvider",
        name: "Sidebar Layout",
        props: {},
        children: [
            {
                id: `sidebar-${num}-sidebar`,
                type: "Sidebar",
                name: "Sidebar",
                props: {},
                children: [
                    {
                        id: `sidebar-${num}-header`,
                        type: "SidebarHeader",
                        name: "SidebarHeader",
                        props: {},
                        children: [
                            divContainer(`sidebar-${num}-logo`, "flex items-center gap-2 px-4 py-2", [
                                textSpan(`sidebar-${num}-logo-text`, `Sidebar ${num}`),
                            ]),
                        ],
                    },
                    {
                        id: `sidebar-${num}-content`,
                        type: "SidebarContent",
                        name: "SidebarContent",
                        props: {},
                        children: [
                            {
                                id: `sidebar-${num}-group`,
                                type: "SidebarGroup",
                                name: "SidebarGroup",
                                props: {},
                                children: [
                                    { id: `sidebar-${num}-group-label`, type: "SidebarGroupLabel", name: "SidebarGroupLabel", props: {}, children: [textSpan(`sidebar-${num}-gl-text`, "Menu")] },
                                    {
                                        id: `sidebar-${num}-menu`,
                                        type: "SidebarMenu",
                                        name: "SidebarMenu",
                                        props: {},
                                        children: [
                                            {
                                                id: `sidebar-${num}-item-1`,
                                                type: "SidebarMenuItem",
                                                name: "SidebarMenuItem",
                                                props: {},
                                                children: [
                                                    { id: `sidebar-${num}-btn-1`, type: "SidebarMenuButton", name: "SidebarMenuButton", props: {}, children: [textSpan(`sidebar-${num}-btn-1-text`, "Dashboard")] },
                                                ],
                                            },
                                            {
                                                id: `sidebar-${num}-item-2`,
                                                type: "SidebarMenuItem",
                                                name: "SidebarMenuItem",
                                                props: {},
                                                children: [
                                                    { id: `sidebar-${num}-btn-2`, type: "SidebarMenuButton", name: "SidebarMenuButton", props: {}, children: [textSpan(`sidebar-${num}-btn-2-text`, "Settings")] },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: `sidebar-${num}-footer`,
                        type: "SidebarFooter",
                        name: "SidebarFooter",
                        props: {},
                        children: [
                            textSpan(`sidebar-${num}-footer-text`, "Footer"),
                        ],
                    },
                ],
            },
            {
                id: `sidebar-${num}-inset`,
                type: "SidebarInset",
                name: "SidebarInset",
                props: {},
                children: [
                    divContainer(`sidebar-${num}-main`, "p-4", [
                        { id: `sidebar-${num}-trigger`, type: "SidebarTrigger", name: "SidebarTrigger", props: {}, children: [] },
                        textSpan(`sidebar-${num}-main-text`, "Main Content Area"),
                    ]),
                ],
            },
        ],
    },
});

const sidebarBlocks: BlockDefinition[] = [
    createSidebarBlock("01", "Basic sidebar layout"),
    createSidebarBlock("02", "Sidebar with icons"),
    createSidebarBlock("03", "Collapsible sidebar"),
    createSidebarBlock("04", "Sidebar with search"),
    createSidebarBlock("05", "Sidebar with user menu"),
    createSidebarBlock("06", "Multi-level sidebar"),
    createSidebarBlock("07", "Sidebar with badges"),
    createSidebarBlock("08", "Floating sidebar"),
    createSidebarBlock("09", "Inset sidebar"),
    createSidebarBlock("10", "Sidebar with header actions"),
    createSidebarBlock("11", "Grouped sidebar menu"),
    createSidebarBlock("12", "Sidebar with footer actions"),
    createSidebarBlock("13", "Minimal sidebar"),
    createSidebarBlock("14", "Sidebar with notifications"),
    createSidebarBlock("15", "Dark sidebar"),
    createSidebarBlock("16", "Sidebar with logo"),
];

// ============================================
// DASHBOARD BLOCKS
// ============================================
const dashboardBlocks: BlockDefinition[] = [
    {
        name: "dashboard-01",
        category: "dashboard",
        description: "Basic dashboard layout with stats cards",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardTitle", "CardDescription"],
        template: divContainer("dashboard-01-root", "space-y-6", [
            divContainer("dashboard-01-header", "flex items-center justify-between", [
                { id: "dashboard-01-title", type: "h1", name: "h1", props: { className: "text-3xl font-bold" }, children: "Dashboard" },
            ]),
            divContainer("dashboard-01-stats", "grid gap-4 md:grid-cols-2 lg:grid-cols-4", [
                {
                    id: "dashboard-01-stat-1",
                    type: "Card",
                    name: "Card",
                    props: {},
                    children: [
                        {
                            id: "dashboard-01-stat-1-header",
                            type: "CardHeader",
                            name: "CardHeader",
                            props: { className: "pb-2" },
                            children: [
                                { id: "dashboard-01-stat-1-title", type: "CardTitle", name: "CardTitle", props: { className: "text-sm font-medium" }, children: [textSpan("d01-s1-title", "Total Revenue")] },
                            ],
                        },
                        {
                            id: "dashboard-01-stat-1-content",
                            type: "CardContent",
                            name: "CardContent",
                            props: {},
                            children: [
                                { id: "dashboard-01-stat-1-value", type: "p", name: "p", props: { className: "text-2xl font-bold" }, children: "$45,231.89" },
                                { id: "dashboard-01-stat-1-change", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "+20.1% from last month" },
                            ],
                        },
                    ],
                },
                {
                    id: "dashboard-01-stat-2",
                    type: "Card",
                    name: "Card",
                    props: {},
                    children: [
                        {
                            id: "dashboard-01-stat-2-header",
                            type: "CardHeader",
                            name: "CardHeader",
                            props: { className: "pb-2" },
                            children: [
                                { id: "dashboard-01-stat-2-title", type: "CardTitle", name: "CardTitle", props: { className: "text-sm font-medium" }, children: [textSpan("d01-s2-title", "Subscriptions")] },
                            ],
                        },
                        {
                            id: "dashboard-01-stat-2-content",
                            type: "CardContent",
                            name: "CardContent",
                            props: {},
                            children: [
                                { id: "dashboard-01-stat-2-value", type: "p", name: "p", props: { className: "text-2xl font-bold" }, children: "+2,350" },
                                { id: "dashboard-01-stat-2-change", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "+180.1% from last month" },
                            ],
                        },
                    ],
                },
                {
                    id: "dashboard-01-stat-3",
                    type: "Card",
                    name: "Card",
                    props: {},
                    children: [
                        {
                            id: "dashboard-01-stat-3-header",
                            type: "CardHeader",
                            name: "CardHeader",
                            props: { className: "pb-2" },
                            children: [
                                { id: "dashboard-01-stat-3-title", type: "CardTitle", name: "CardTitle", props: { className: "text-sm font-medium" }, children: [textSpan("d01-s3-title", "Sales")] },
                            ],
                        },
                        {
                            id: "dashboard-01-stat-3-content",
                            type: "CardContent",
                            name: "CardContent",
                            props: {},
                            children: [
                                { id: "dashboard-01-stat-3-value", type: "p", name: "p", props: { className: "text-2xl font-bold" }, children: "+12,234" },
                                { id: "dashboard-01-stat-3-change", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "+19% from last month" },
                            ],
                        },
                    ],
                },
                {
                    id: "dashboard-01-stat-4",
                    type: "Card",
                    name: "Card",
                    props: {},
                    children: [
                        {
                            id: "dashboard-01-stat-4-header",
                            type: "CardHeader",
                            name: "CardHeader",
                            props: { className: "pb-2" },
                            children: [
                                { id: "dashboard-01-stat-4-title", type: "CardTitle", name: "CardTitle", props: { className: "text-sm font-medium" }, children: [textSpan("d01-s4-title", "Active Now")] },
                            ],
                        },
                        {
                            id: "dashboard-01-stat-4-content",
                            type: "CardContent",
                            name: "CardContent",
                            props: {},
                            children: [
                                { id: "dashboard-01-stat-4-value", type: "p", name: "p", props: { className: "text-2xl font-bold" }, children: "+573" },
                                { id: "dashboard-01-stat-4-change", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "+201 since last hour" },
                            ],
                        },
                    ],
                },
            ]),
        ]),
    },
];

// ============================================
// CALENDAR BLOCKS (placeholder templates)
// ============================================
const createCalendarBlock = (num: string): BlockDefinition => ({
    name: `calendar-${num}`,
    category: "calendar",
    description: `Calendar variant ${num}`,
    requiredComponents: ["Calendar", "Card"],
    template: {
        id: `calendar-${num}-root`,
        type: "Card",
        name: `Calendar ${num}`,
        props: { className: "w-fit" },
        children: [
            {
                id: `calendar-${num}-content`,
                type: "CardContent",
                name: "CardContent",
                props: { className: "p-4" },
                children: [
                    { id: `calendar-${num}-calendar`, type: "Calendar", name: "Calendar", props: { mode: "single" }, children: [] },
                ],
            },
        ],
    },
});

const calendarBlocks: BlockDefinition[] = Array.from({ length: 32 }, (_, i) => 
    createCalendarBlock(String(i + 1).padStart(2, '0'))
);

// ============================================
// CHART BLOCKS (placeholder templates - require Chart component)
// ============================================
const createChartPlaceholder = (name: string, category: string, description: string): BlockDefinition => ({
    name,
    category,
    description,
    requiredComponents: ["Card", "CardHeader", "CardContent", "CardTitle"],
    template: {
        id: `${name}-root`,
        type: "Card",
        name: `${name}`,
        props: {},
        children: [
            {
                id: `${name}-header`,
                type: "CardHeader",
                name: "CardHeader",
                props: {},
                children: [
                    { id: `${name}-title`, type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan(`${name}-title-text`, description)] },
                ],
            },
            {
                id: `${name}-content`,
                type: "CardContent",
                name: "CardContent",
                props: { className: "h-[300px] flex items-center justify-center" },
                children: [
                    divContainer(`${name}-placeholder`, "text-muted-foreground text-sm", [
                        textSpan(`${name}-placeholder-text`, `[${name} - requires Chart component]`),
                    ]),
                ],
            },
        ],
    },
});

// Chart Area blocks
const chartAreaBlocks: BlockDefinition[] = [
    createChartPlaceholder("chart-area-axes", "chart", "Area chart with axes"),
    createChartPlaceholder("chart-area-default", "chart", "Default area chart"),
    createChartPlaceholder("chart-area-gradient", "chart", "Area chart with gradient"),
    createChartPlaceholder("chart-area-icons", "chart", "Area chart with icons"),
    createChartPlaceholder("chart-area-interactive", "chart", "Interactive area chart"),
    createChartPlaceholder("chart-area-legend", "chart", "Area chart with legend"),
    createChartPlaceholder("chart-area-linear", "chart", "Linear area chart"),
    createChartPlaceholder("chart-area-stacked", "chart", "Stacked area chart"),
    createChartPlaceholder("chart-area-stacked-expand", "chart", "Expanded stacked area chart"),
    createChartPlaceholder("chart-area-step", "chart", "Step area chart"),
];

// Chart Bar blocks
const chartBarBlocks: BlockDefinition[] = [
    createChartPlaceholder("chart-bar-active", "chart", "Bar chart with active state"),
    createChartPlaceholder("chart-bar-default", "chart", "Default bar chart"),
    createChartPlaceholder("chart-bar-horizontal", "chart", "Horizontal bar chart"),
    createChartPlaceholder("chart-bar-interactive", "chart", "Interactive bar chart"),
    createChartPlaceholder("chart-bar-label", "chart", "Bar chart with labels"),
    createChartPlaceholder("chart-bar-label-custom", "chart", "Bar chart with custom labels"),
    createChartPlaceholder("chart-bar-mixed", "chart", "Mixed bar chart"),
    createChartPlaceholder("chart-bar-multiple", "chart", "Multiple bar chart"),
    createChartPlaceholder("chart-bar-negative", "chart", "Bar chart with negative values"),
    createChartPlaceholder("chart-bar-stacked", "chart", "Stacked bar chart"),
];

// Chart Line blocks
const chartLineBlocks: BlockDefinition[] = [
    createChartPlaceholder("chart-line-default", "chart", "Default line chart"),
    createChartPlaceholder("chart-line-dots", "chart", "Line chart with dots"),
    createChartPlaceholder("chart-line-dots-colors", "chart", "Line chart with colored dots"),
    createChartPlaceholder("chart-line-dots-custom", "chart", "Line chart with custom dots"),
    createChartPlaceholder("chart-line-interactive", "chart", "Interactive line chart"),
    createChartPlaceholder("chart-line-label", "chart", "Line chart with labels"),
    createChartPlaceholder("chart-line-label-custom", "chart", "Line chart with custom labels"),
    createChartPlaceholder("chart-line-linear", "chart", "Linear line chart"),
    createChartPlaceholder("chart-line-multiple", "chart", "Multiple line chart"),
    createChartPlaceholder("chart-line-step", "chart", "Step line chart"),
];

// Chart Pie blocks
const chartPieBlocks: BlockDefinition[] = [
    createChartPlaceholder("chart-pie-donut", "chart", "Donut chart"),
    createChartPlaceholder("chart-pie-donut-active", "chart", "Donut chart with active state"),
    createChartPlaceholder("chart-pie-donut-text", "chart", "Donut chart with text"),
    createChartPlaceholder("chart-pie-interactive", "chart", "Interactive pie chart"),
    createChartPlaceholder("chart-pie-label", "chart", "Pie chart with labels"),
    createChartPlaceholder("chart-pie-label-custom", "chart", "Pie chart with custom labels"),
    createChartPlaceholder("chart-pie-label-list", "chart", "Pie chart with label list"),
    createChartPlaceholder("chart-pie-legend", "chart", "Pie chart with legend"),
    createChartPlaceholder("chart-pie-separator-none", "chart", "Pie chart without separator"),
    createChartPlaceholder("chart-pie-simple", "chart", "Simple pie chart"),
    createChartPlaceholder("chart-pie-stacked", "chart", "Stacked pie chart"),
];

// Chart Radar blocks
const chartRadarBlocks: BlockDefinition[] = [
    createChartPlaceholder("chart-radar-default", "chart", "Default radar chart"),
    createChartPlaceholder("chart-radar-dots", "chart", "Radar chart with dots"),
    createChartPlaceholder("chart-radar-grid-circle", "chart", "Radar chart with circle grid"),
    createChartPlaceholder("chart-radar-grid-circle-fill", "chart", "Radar chart with filled circle grid"),
    createChartPlaceholder("chart-radar-grid-circle-no-lines", "chart", "Radar chart circle grid no lines"),
    createChartPlaceholder("chart-radar-grid-custom", "chart", "Radar chart with custom grid"),
    createChartPlaceholder("chart-radar-grid-fill", "chart", "Radar chart with filled grid"),
    createChartPlaceholder("chart-radar-grid-none", "chart", "Radar chart without grid"),
    createChartPlaceholder("chart-radar-icons", "chart", "Radar chart with icons"),
    createChartPlaceholder("chart-radar-label-custom", "chart", "Radar chart with custom labels"),
    createChartPlaceholder("chart-radar-legend", "chart", "Radar chart with legend"),
    createChartPlaceholder("chart-radar-lines-only", "chart", "Radar chart lines only"),
    createChartPlaceholder("chart-radar-multiple", "chart", "Multiple radar chart"),
    createChartPlaceholder("chart-radar-radius", "chart", "Radar chart with radius"),
];

// Chart Radial blocks
const chartRadialBlocks: BlockDefinition[] = [
    createChartPlaceholder("chart-radial-grid", "chart", "Radial chart with grid"),
    createChartPlaceholder("chart-radial-label", "chart", "Radial chart with labels"),
    createChartPlaceholder("chart-radial-shape", "chart", "Radial chart with shapes"),
    createChartPlaceholder("chart-radial-simple", "chart", "Simple radial chart"),
    createChartPlaceholder("chart-radial-stacked", "chart", "Stacked radial chart"),
    createChartPlaceholder("chart-radial-text", "chart", "Radial chart with text"),
];

// Chart Tooltip blocks
const chartTooltipBlocks: BlockDefinition[] = [
    createChartPlaceholder("chart-tooltip-advanced", "chart", "Advanced tooltip chart"),
    createChartPlaceholder("chart-tooltip-default", "chart", "Default tooltip chart"),
    createChartPlaceholder("chart-tooltip-formatter", "chart", "Tooltip with formatter"),
    createChartPlaceholder("chart-tooltip-icons", "chart", "Tooltip with icons"),
    createChartPlaceholder("chart-tooltip-indicator-line", "chart", "Tooltip with line indicator"),
    createChartPlaceholder("chart-tooltip-indicator-none", "chart", "Tooltip without indicator"),
    createChartPlaceholder("chart-tooltip-label-custom", "chart", "Tooltip with custom label"),
    createChartPlaceholder("chart-tooltip-label-formatter", "chart", "Tooltip label formatter"),
    createChartPlaceholder("chart-tooltip-label-none", "chart", "Tooltip without label"),
];

// ============================================
// COMBINE ALL BLOCKS
// ============================================
const allBlocks: BlockDefinition[] = [
    ...loginBlocks,
    ...sidebarBlocks,
    ...dashboardBlocks,
    ...calendarBlocks,
    ...chartAreaBlocks,
    ...chartBarBlocks,
    ...chartLineBlocks,
    ...chartPieBlocks,
    ...chartRadarBlocks,
    ...chartRadialBlocks,
    ...chartTooltipBlocks,
];

/**
 * Block definitions registry - all available blocks indexed by name
 */
export const blockDefinitions: BlockRegistry = allBlocks.reduce((acc, block) => {
    acc[block.name] = block;
    return acc;
}, {} as BlockRegistry);

/**
 * Get blocks by category
 */
export function getBlocksByCategory(category: string): BlockDefinition[] {
    return allBlocks.filter(block => block.category === category);
}

/**
 * Get all unique block categories
 */
export function getBlockCategories(): string[] {
    return Array.from(new Set(allBlocks.map(block => block.category)));
}

/**
 * Get all blocks as an array
 */
export function getAllBlocks(): BlockDefinition[] {
    return allBlocks;
}
