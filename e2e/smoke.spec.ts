import { test, expect, type Page } from '@playwright/test';

/**
 * UI Builder Smoke Tests
 * 
 * Essential functionality tests for the UI Builder component.
 * Chrome/Desktop only.
 */

// Helper to wait for the builder to fully load
async function waitForBuilderReady(page: Page) {
  await expect(page.getByTestId('component-editor')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('page-config-panel')).toBeVisible();
  // Wait for loading skeleton to disappear
  await expect(page.getByTestId('loading-skeleton')).not.toBeVisible({ timeout: 10000 });
}

// Helper to open the add component popover
async function openAddComponentPopover(page: Page) {
  const addButtons = page.locator('button:has([class*="lucide-plus"])');
  await addButtons.first().click();
  await page.waitForTimeout(500);
}

test.describe('UI Builder Smoke Tests', () => {
  
  test.describe('Empty Builder (/smoke/new)', () => {
    
    test('loads without errors and displays main panels', async ({ page }) => {
      await page.goto('/smoke/new');
      
      await waitForBuilderReady(page);
      
      // Verify main panels are present
      await expect(page.getByTestId('page-config-panel')).toBeVisible();
      await expect(page.getByTestId('auto-frame').first()).toBeVisible();
      
      // Verify layers tree is visible
      await expect(page.getByTestId('layers-tree')).toBeVisible();
    });
    
    test('can add a component via the add button', async ({ page }) => {
      await page.goto('/smoke/new');
      
      await waitForBuilderReady(page);
      
      // Find the add button in the layers panel - it's the + icon
      const addButtons = page.locator('button:has([class*="lucide-plus"])');
      await addButtons.first().click();
      
      // Wait for the component picker popover/dialog
      await page.waitForTimeout(500);
      
      // Components are grouped by category in tabs. Button is under the "Ui" tab 
      // which contains @/components/ui components. Click on that tab first.
      // The tab has name "Ui @/components/ui" - we need to avoid matching "Ui Builder"
      const uiTab = page.getByRole('tab', { name: 'Ui @/components/ui' });
      await uiTab.click();
      await page.waitForTimeout(300);
      
      // Now search for Button within the Ui tab
      const searchInput = page.getByPlaceholder(/find components/i);
      await searchInput.fill('Button');
      await page.waitForTimeout(300);
      
      // Find and click Button in the filtered list (use getByRole with exact name)
      // The option has a preview that renders "Button" and a label "Button"
      const buttonItem = page.getByRole('option', { name: /^Button/ }).first();
      await buttonItem.click();
      
      // Wait for component to be added
      await page.waitForTimeout(500);
      
      // Verify Button appears in the layers tree
      await expect(page.getByTestId('layers-tree')).toContainText('Button');
    });
    
  });
  
  test.describe('Populated Builder (/smoke/populated)', () => {
    
    test('loads and shows Page in layers tree', async ({ page }) => {
      await page.goto('/smoke/populated');
      
      await waitForBuilderReady(page);
      
      // Verify layers tree contains the page
      const layersTree = page.getByTestId('layers-tree');
      await expect(layersTree).toContainText('Page');
    });
    
    test('can expand layers and see children', async ({ page }) => {
      await page.goto('/smoke/populated');
      
      await waitForBuilderReady(page);
      
      // Click on Page to expand it (using chevron)
      const expandButton = page.getByTestId('layers-tree').locator('button:has(svg[class*="lucide-chevron"])').first();
      
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(300);
      }
      
      // After expanding, we should see child layers
      await expect(page.getByTestId('layers-tree')).toContainText('Header');
    });
    
    test('can select the Page layer and view its properties', async ({ page }) => {
      await page.goto('/smoke/populated');
      
      await waitForBuilderReady(page);
      
      // The layers tree contains the Page layer - we need to click on it in the tree
      // First, make sure we're on the Layers tab
      const layersTab = page.getByRole('tab', { name: /layers/i });
      await layersTab.click();
      await page.waitForTimeout(300);
      
      // Find the Page layer in the tree (inside the layers-tree testid container)
      const layersTree = page.getByTestId('layers-tree');
      const pageLayer = layersTree.getByRole('button', { name: 'Page' });
      await pageLayer.click();
      
      // Wait for props panel to update
      await page.waitForTimeout(500);
      
      // After selecting Page, check that the props panel shows the Duplicate Page button
      await expect(page.getByRole('button', { name: /duplicate page/i })).toBeVisible({ timeout: 5000 });
    });
    
    test('can open export dialog and view generated code', async ({ page }) => {
      await page.goto('/smoke/populated');
      
      await waitForBuilderReady(page);
      
      // Click the Export button (FileUp icon)
      const exportButton = page.locator('button').filter({ has: page.locator('[class*="lucide-file-up"]') }).first();
      await exportButton.click();
      
      // Wait for the export dialog
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
      
      // Verify "Generated Code" title
      await expect(page.getByText('Generated Code')).toBeVisible();
      
      // Verify React tab is present
      await expect(page.getByRole('tab', { name: /react/i })).toBeVisible();
      
      // Close the dialog
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    });
    
    test('can navigate between tabs in config panel', async ({ page }) => {
      await page.goto('/smoke/populated');
      
      await waitForBuilderReady(page);
      
      // Verify Layers tab content is visible
      await expect(page.getByTestId('layers-tree')).toBeVisible();
      
      // Click Appearance tab
      const appearanceTab = page.getByRole('tab', { name: /appearance/i });
      await appearanceTab.click();
      await page.waitForTimeout(300);
      
      // Verify appearance content is visible - look for the Name input field
      await expect(page.getByRole('textbox', { name: /name/i })).toBeVisible();
      
      // Click Data tab
      const dataTab = page.getByRole('tab', { name: /data/i });
      await dataTab.click();
      await page.waitForTimeout(300);
      
      // Verify variables panel shows the variable name
      await expect(page.getByText('Username')).toBeVisible();
    });
    
    test('can preview the page', async ({ page }) => {
      await page.goto('/smoke/populated');
      
      await waitForBuilderReady(page);
      
      // Click the Preview button (Eye icon)
      const previewButton = page.locator('button').filter({ has: page.locator('[class*="lucide-eye"]') }).first();
      await previewButton.click();
      
      // Wait for the preview dialog
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
      
      // Verify preview content shows the page title
      await expect(page.getByText('Page Preview')).toBeVisible();
      
      // Close the dialog
      await page.keyboard.press('Escape');
    });
    
    test('undo button is initially disabled', async ({ page }) => {
      await page.goto('/smoke/populated');
      
      await waitForBuilderReady(page);
      
      // Find the Undo button
      const undoButton = page.locator('button').filter({ has: page.locator('[class*="lucide-undo"]') }).first();
      
      // Undo should be disabled when there's no history
      await expect(undoButton).toBeDisabled();
    });
    
  });
  
  test.describe('Panel Visibility', () => {
    
    test('can toggle left panel visibility', async ({ page }) => {
      await page.goto('/smoke/populated');
      
      await waitForBuilderReady(page);
      
      // Left panel should be visible by default
      await expect(page.getByTestId('page-config-panel')).toBeVisible();
      
      // Click toggle left panel button (PanelLeft icon)
      const toggleLeftButton = page.locator('button').filter({ has: page.locator('[class*="lucide-panel-left"]') }).first();
      await toggleLeftButton.click();
      
      // Wait for panel to hide
      await page.waitForTimeout(500);
      
      // Verify left panel is hidden
      await expect(page.getByTestId('page-config-panel')).not.toBeVisible();
      
      // Toggle back
      await toggleLeftButton.click();
      await page.waitForTimeout(500);
      
      // Verify left panel is visible again
      await expect(page.getByTestId('page-config-panel')).toBeVisible();
    });
    
  });
  
  test.describe('Theme Toggle', () => {
    
    test('can open theme dropdown', async ({ page }) => {
      await page.goto('/smoke/populated');
      
      await waitForBuilderReady(page);
      
      // Click the theme toggle button (sun/moon icon)
      const themeButton = page.locator('button').filter({ has: page.locator('[class*="lucide-sun"], [class*="lucide-moon"]') }).first();
      await themeButton.click();
      
      // Verify dropdown menu appears with theme options
      await expect(page.getByRole('menuitem', { name: /light/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /dark/i })).toBeVisible();
      
      // Close by pressing escape
      await page.keyboard.press('Escape');
    });
    
  });
  
  test.describe('Serialized Tab', () => {
    
    test('can view serialized JSON in export dialog', async ({ page }) => {
      await page.goto('/smoke/populated');
      
      await waitForBuilderReady(page);
      
      // Open export dialog
      const exportButton = page.locator('button').filter({ has: page.locator('[class*="lucide-file-up"]') }).first();
      await exportButton.click();
      
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
      
      // Click Serialized tab
      const serializedTab = page.getByRole('tab', { name: /serialized/i });
      await serializedTab.click();
      
      // Verify JSON content is visible (should contain "Layers" text)
      await expect(page.getByText('Layers').first()).toBeVisible();
      
      // Close dialog
      await page.keyboard.press('Escape');
    });
    
  });
  
});

test.describe('Blocks Functionality', () => {
  
  test.describe('Builder with Blocks (/smoke/with-blocks)', () => {
    
    test('loads without errors and displays main panels', async ({ page }) => {
      await page.goto('/smoke/with-blocks');
      
      await waitForBuilderReady(page);
      
      // Verify main panels are present
      await expect(page.getByTestId('page-config-panel')).toBeVisible();
      await expect(page.getByTestId('auto-frame').first()).toBeVisible();
    });
    
    test('shows Components and Blocks toggle when blocks are provided', async ({ page }) => {
      await page.goto('/smoke/with-blocks');
      
      await waitForBuilderReady(page);
      
      // Open the add component popover
      await openAddComponentPopover(page);
      
      // Should show both Components and Blocks toggle buttons
      await expect(page.getByRole('button', { name: 'Components' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Blocks' })).toBeVisible();
    });
    
    test('can switch to Blocks tab and see block categories', async ({ page }) => {
      await page.goto('/smoke/with-blocks');
      
      await waitForBuilderReady(page);
      
      // Open the add component popover
      await openAddComponentPopover(page);
      
      // Click the Blocks toggle
      await page.getByRole('button', { name: 'Blocks' }).click();
      await page.waitForTimeout(300);
      
      // Should show block category tabs (login, sidebar, dashboard, etc.)
      // Check for at least one category tab
      const loginTab = page.getByRole('tab', { name: /login/i });
      const sidebarTab = page.getByRole('tab', { name: /sidebar/i });
      const dashboardTab = page.getByRole('tab', { name: /dashboard/i });
      
      // At least one of these should be visible
      const hasLoginTab = await loginTab.isVisible().catch(() => false);
      const hasSidebarTab = await sidebarTab.isVisible().catch(() => false);
      const hasDashboardTab = await dashboardTab.isVisible().catch(() => false);
      
      expect(hasLoginTab || hasSidebarTab || hasDashboardTab).toBe(true);
    });
    
    test('can search for blocks', async ({ page }) => {
      await page.goto('/smoke/with-blocks');
      
      await waitForBuilderReady(page);
      
      // Open the add component popover
      await openAddComponentPopover(page);
      
      // Click the Blocks toggle
      await page.getByRole('button', { name: 'Blocks' }).click();
      await page.waitForTimeout(300);
      
      // Find the search input and type a search term
      const searchInput = page.getByPlaceholder(/find blocks/i);
      await searchInput.fill('login');
      await page.waitForTimeout(300);
      
      // Should filter to show login-related blocks
      // The command list should still contain items
      const commandList = page.locator('[cmdk-list]');
      await expect(commandList).toBeVisible();
    });
    
    test('can add a block to the canvas', async ({ page }) => {
      await page.goto('/smoke/with-blocks');
      
      await waitForBuilderReady(page);
      
      // Open the add component popover
      await openAddComponentPopover(page);
      
      // Click the Blocks toggle
      await page.getByRole('button', { name: 'Blocks' }).click();
      await page.waitForTimeout(300);
      
      // Click on the first available block
      const blockItem = page.locator('[cmdk-item]').first();
      if (await blockItem.isVisible()) {
        await blockItem.click();
        await page.waitForTimeout(500);
        
        // The layers tree should now contain more than just the Page
        const layersTree = page.getByTestId('layers-tree');
        const layerButtons = layersTree.locator('button');
        const buttonCount = await layerButtons.count();
        
        // Should have more than 1 layer button now (Page + block contents)
        expect(buttonCount).toBeGreaterThan(1);
      }
    });
    
    test('can switch between Components and Blocks tabs', async ({ page }) => {
      await page.goto('/smoke/with-blocks');
      
      await waitForBuilderReady(page);
      
      // Open the add component popover
      await openAddComponentPopover(page);
      
      // Verify Components is active by default
      const componentsButton = page.getByRole('button', { name: 'Components' });
      const blocksButton = page.getByRole('button', { name: 'Blocks' });
      
      // Switch to Blocks
      await blocksButton.click();
      await page.waitForTimeout(300);
      
      // Verify blocks content is visible (search for blocks)
      await expect(page.getByPlaceholder(/find blocks/i)).toBeVisible();
      
      // Switch back to Components
      await componentsButton.click();
      await page.waitForTimeout(300);
      
      // Verify components content is visible (search for components)
      await expect(page.getByPlaceholder(/find components/i)).toBeVisible();
    });
    
  });
  
  test.describe('Builder with Blocks on smoke/new', () => {
    
    test('shows Blocks toggle on smoke/new page (now has blocks enabled)', async ({ page }) => {
      await page.goto('/smoke/new');
      
      await waitForBuilderReady(page);
      
      // Open the add component popover
      await openAddComponentPopover(page);
      
      // Should show both Components and Blocks toggle buttons since blocks are now enabled
      await expect(page.getByRole('button', { name: 'Components' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Blocks' })).toBeVisible();
    });
    
  });
  
});

test.describe('childOf Constraint Filtering', () => {
  
  test('hides child-only components when parent type does not match', async ({ page }) => {
    await page.goto('/smoke/populated');
    
    await waitForBuilderReady(page);
    
    // Open the add component popover (adds to Page by default)
    await openAddComponentPopover(page);
    
    // Navigate to the "Ui" tab which contains shadcn components
    const uiTab = page.getByRole('tab', { name: 'Ui @/components/ui' });
    await uiTab.click();
    await page.waitForTimeout(300);
    
    // Search for Accordion-related components
    const searchInput = page.getByPlaceholder(/find components/i);
    await searchInput.fill('Accordion');
    await page.waitForTimeout(300);
    
    // "Accordion" (parent component with no childOf constraint) should be visible
    await expect(page.getByRole('option', { name: /^Accordion/ }).first()).toBeVisible();
    
    // "AccordionItem" has childOf: ["Accordion"], so when adding to Page (not Accordion),
    // it should NOT be visible in the popover since parent is Page, not Accordion
    // Note: The search results are filtered by the childOf constraint
    const accordionItemOption = page.getByRole('option', { name: /AccordionItem/ });
    await expect(accordionItemOption).not.toBeVisible();
    
    // Similarly, AccordionTrigger and AccordionContent should not be visible
    await expect(page.getByRole('option', { name: /AccordionTrigger/ })).not.toBeVisible();
    await expect(page.getByRole('option', { name: /AccordionContent/ })).not.toBeVisible();
  });
  
});

test.describe('Drag and Drop from Editor Popover', () => {
  
  test('shows drag handle on component items in editor popover only', async ({ page }) => {
    await page.goto('/smoke/new');
    
    await waitForBuilderReady(page);
    
    // Open the add component popover from the editor panel (bottom-left + button)
    // This popover should have drag handles
    // Use .first() to handle case where multiple matching buttons exist
    const editorAddButton = page.locator('button.absolute.bottom-4.left-4').first();
    await editorAddButton.click();
    await page.waitForTimeout(500);
    
    // Navigate to the "Ui" tab
    const uiTab = page.getByRole('tab', { name: 'Ui @/components/ui' });
    await uiTab.click();
    await page.waitForTimeout(300);
    
    // Look for drag handles (GripVertical icon) in the component items
    const dragHandles = page.locator('[aria-label*="Drag"][aria-label*="to canvas"]');
    
    // Should have at least one drag handle visible in editor popover
    await expect(dragHandles.first()).toBeVisible();
    
    // Close the popover
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  test('tree panel popover does not show drag handles', async ({ page }) => {
    await page.goto('/smoke/new');
    
    await waitForBuilderReady(page);
    
    // Open the add component popover from the layers tree panel
    // This popover should NOT have drag handles
    const layersTree = page.getByTestId('layers-tree');
    const treePlusButton = layersTree.locator('button:has([class*="lucide-plus"])').first();
    
    if (await treePlusButton.isVisible()) {
      await treePlusButton.click();
      await page.waitForTimeout(500);
      
      // Navigate to the "Ui" tab
      const uiTab = page.getByRole('tab', { name: 'Ui @/components/ui' });
      if (await uiTab.isVisible()) {
        await uiTab.click();
        await page.waitForTimeout(300);
      }
      
      // Look for drag handles - should NOT be present in tree popover
      const dragHandles = page.locator('[aria-label*="Drag"][aria-label*="to canvas"]');
      await expect(dragHandles).not.toBeVisible();
    }
  });
  
});

// Function Registry tests have been moved to function-registry.spec.ts
