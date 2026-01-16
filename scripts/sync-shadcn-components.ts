#!/usr/bin/env npx tsx

/**
 * Sync Shadcn Components Script
 * 
 * This script fetches the latest component and block list from shadcn
 * and can scaffold new component definitions with auto-generated Zod schemas.
 * 
 * Usage:
 *   npx tsx scripts/sync-shadcn-components.ts [--scaffold] [--verbose]
 * 
 * Options:
 *   --scaffold  Generate scaffold code for missing components
 *   --verbose   Show detailed output
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const log = {
    info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
};

interface ShadcnItem {
    name: string;
    type: string;
    registry: string;
    addCommandArgument: string;
}

interface ShadcnListResponse {
    pagination: {
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    };
    items: ShadcnItem[];
}

/**
 * Fetch the list of components and blocks from shadcn
 */
async function fetchShadcnList(): Promise<ShadcnListResponse> {
    log.info('Fetching shadcn component and block list...');
    
    try {
        const output = execSync('npx shadcn@latest list @shadcn --limit 500', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        
        return JSON.parse(output);
    } catch (error) {
        log.error('Failed to fetch shadcn list');
        throw error;
    }
}

/**
 * Get existing component definitions from our registry
 */
function getExistingComponents(): Set<string> {
    const shadcnDefsPath = join(process.cwd(), 'lib/ui-builder/registry/shadcn-component-definitions.ts');
    
    if (!existsSync(shadcnDefsPath)) {
        return new Set();
    }
    
    const content = readFileSync(shadcnDefsPath, 'utf-8');
    const componentMatches = content.matchAll(/^\s{4}(\w+):\s*\{/gm);
    
    return new Set(Array.from(componentMatches).map(m => m[1]));
}

/**
 * Get existing block definitions from our registry
 */
function getExistingBlocks(): Set<string> {
    const blockDefsPath = join(process.cwd(), 'lib/ui-builder/registry/block-definitions.ts');
    
    if (!existsSync(blockDefsPath)) {
        return new Set();
    }
    
    const content = readFileSync(blockDefsPath, 'utf-8');
    
    // Match block names in the definitions
    const blockMatches = content.matchAll(/name:\s*["']([^"']+)["']/g);
    
    return new Set(Array.from(blockMatches).map(m => m[1]));
}

/**
 * Convert a component name to PascalCase
 */
function toPascalCase(str: string): string {
    return str
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

/**
 * Generate scaffold code for a missing component
 */
function generateComponentScaffold(name: string): string {
    const pascalName = toPascalCase(name);
    
    return `
    // TODO: Import ${pascalName} from '@/components/ui/${name}'
    // ${pascalName}: {
    //     component: ${pascalName},
    //     schema: z.object({
    //         className: z.string().optional(),
    //         children: z.any().optional(),
    //     }),
    //     from: "@/components/ui/${name}",
    //     fieldOverrides: commonFieldOverrides()
    // },
`;
}

/**
 * Generate scaffold code for a missing block
 */
function generateBlockScaffold(name: string, category: string): string {
    const id = name.replace(/-/g, '_');
    
    return `
    {
        name: "${name}",
        category: "${category}",
        description: "TODO: Add description for ${name}",
        requiredComponents: [],
        template: {
            id: "${id}-root",
            type: "div",
            name: "${name}",
            props: { className: "" },
            children: [
                { id: "${id}-text", type: "span", name: "span", props: {}, children: "${name}" },
            ],
        },
    },
`;
}

/**
 * Analyze and report on shadcn components and blocks
 */
async function analyzeAndReport(verbose: boolean = false): Promise<{
    missingComponents: string[];
    missingBlocks: string[];
    newComponents: string[];
    newBlocks: string[];
}> {
    const shadcnList = await fetchShadcnList();
    
    const uiComponents = shadcnList.items.filter(item => item.type === 'registry:ui');
    const blocks = shadcnList.items.filter(item => item.type === 'registry:block');
    
    log.info(`Found ${uiComponents.length} UI components and ${blocks.length} blocks in shadcn registry`);
    
    const existingComponents = getExistingComponents();
    const existingBlocks = getExistingBlocks();
    
    log.info(`Our registry has ${existingComponents.size} components and ${existingBlocks.size} blocks`);
    
    // Find missing items
    const missingComponents: string[] = [];
    const newComponents: string[] = [];
    
    for (const comp of uiComponents) {
        const pascalName = toPascalCase(comp.name);
        if (!existingComponents.has(pascalName)) {
            missingComponents.push(comp.name);
        }
    }
    
    // Check for components in our registry that aren't in shadcn (custom additions)
    const shadcnComponentNames = new Set(uiComponents.map(c => toPascalCase(c.name)));
    for (const comp of Array.from(existingComponents)) {
        if (!shadcnComponentNames.has(comp)) {
            newComponents.push(comp);
        }
    }
    
    const missingBlocks: string[] = [];
    const newBlocks: string[] = [];
    
    for (const block of blocks) {
        if (!existingBlocks.has(block.name)) {
            missingBlocks.push(block.name);
        }
    }
    
    // Check for blocks in our registry that aren't in shadcn
    const shadcnBlockNames = new Set(blocks.map(b => b.name));
    for (const block of Array.from(existingBlocks)) {
        if (!shadcnBlockNames.has(block)) {
            newBlocks.push(block);
        }
    }
    
    // Report
    console.log('\n' + '='.repeat(60));
    console.log('SYNC REPORT');
    console.log('='.repeat(60));
    
    if (missingComponents.length > 0) {
        log.warning(`Missing ${missingComponents.length} components from shadcn:`);
        if (verbose) {
            missingComponents.forEach(c => console.log(`  - ${c}`));
        } else {
            console.log(`  ${missingComponents.slice(0, 5).join(', ')}${missingComponents.length > 5 ? `, ... and ${missingComponents.length - 5} more` : ''}`);
        }
    } else {
        log.success('All shadcn UI components are covered!');
    }
    
    if (newComponents.length > 0) {
        log.info(`Custom components (not in shadcn): ${newComponents.length}`);
        if (verbose) {
            newComponents.forEach(c => console.log(`  + ${c}`));
        }
    }
    
    if (missingBlocks.length > 0) {
        log.warning(`Missing ${missingBlocks.length} blocks from shadcn:`);
        if (verbose) {
            missingBlocks.forEach(b => console.log(`  - ${b}`));
        } else {
            console.log(`  ${missingBlocks.slice(0, 5).join(', ')}${missingBlocks.length > 5 ? `, ... and ${missingBlocks.length - 5} more` : ''}`);
        }
    } else {
        log.success('All shadcn blocks are covered!');
    }
    
    if (newBlocks.length > 0) {
        log.info(`Custom blocks (not in shadcn): ${newBlocks.length}`);
        if (verbose) {
            newBlocks.forEach(b => console.log(`  + ${b}`));
        }
    }
    
    console.log('='.repeat(60) + '\n');
    
    return { missingComponents, missingBlocks, newComponents, newBlocks };
}

/**
 * Generate scaffold files for missing components and blocks
 */
async function generateScaffolds(verbose: boolean = false): Promise<void> {
    const { missingComponents, missingBlocks } = await analyzeAndReport(verbose);
    
    if (missingComponents.length === 0 && missingBlocks.length === 0) {
        log.success('Nothing to scaffold - all items are covered!');
        return;
    }
    
    const scaffoldPath = join(process.cwd(), 'scripts/generated');
    
    // Ensure scaffold directory exists
    if (!existsSync(scaffoldPath)) {
        execSync(`mkdir -p ${scaffoldPath}`);
    }
    
    // Generate component scaffolds
    if (missingComponents.length > 0) {
        const componentScaffolds = missingComponents.map(c => generateComponentScaffold(c)).join('\n');
        
        const scaffoldContent = `/**
 * Auto-generated component scaffolds
 * Generated at: ${new Date().toISOString()}
 * 
 * Copy these definitions to shadcn-component-definitions.ts and customize as needed.
 */

import { z } from 'zod';
import { commonFieldOverrides } from "@/lib/ui-builder/registry/form-field-overrides";

// Missing component scaffolds:
${componentScaffolds}
`;
        
        const outputPath = join(scaffoldPath, 'component-scaffolds.ts');
        writeFileSync(outputPath, scaffoldContent);
        log.success(`Generated component scaffolds: ${outputPath}`);
    }
    
    // Generate block scaffolds
    if (missingBlocks.length > 0) {
        const blocksByCategory: Record<string, string[]> = {};
        
        for (const block of missingBlocks) {
            const category = block.split('-')[0];
            if (!blocksByCategory[category]) {
                blocksByCategory[category] = [];
            }
            blocksByCategory[category].push(block);
        }
        
        let blockScaffolds = '';
        for (const [category, blocks] of Object.entries(blocksByCategory)) {
            blockScaffolds += `\n// ${category.toUpperCase()} blocks\n`;
            blockScaffolds += blocks.map(b => generateBlockScaffold(b, category)).join('');
        }
        
        const scaffoldContent = `/**
 * Auto-generated block scaffolds
 * Generated at: ${new Date().toISOString()}
 * 
 * Copy these definitions to block-definitions.ts and customize as needed.
 */

import { BlockDefinition } from '@/lib/ui-builder/registry/block-definitions';

// Missing block scaffolds:
const scaffoldedBlocks: BlockDefinition[] = [${blockScaffolds}
];

export { scaffoldedBlocks };
`;
        
        const outputPath = join(scaffoldPath, 'block-scaffolds.ts');
        writeFileSync(outputPath, scaffoldContent);
        log.success(`Generated block scaffolds: ${outputPath}`);
    }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const shouldScaffold = args.includes('--scaffold');
    const verbose = args.includes('--verbose') || args.includes('-v');
    
    console.log('\n' + colors.cyan + '🔄 Shadcn Component Sync Tool' + colors.reset + '\n');
    
    try {
        if (shouldScaffold) {
            await generateScaffolds(verbose);
        } else {
            await analyzeAndReport(verbose);
            console.log('Run with --scaffold to generate scaffold code for missing items.\n');
        }
    } catch (error) {
        log.error(`Sync failed: ${error}`);
        process.exit(1);
    }
}

main();
