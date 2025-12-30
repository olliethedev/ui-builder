import { test, expect, Page } from '@playwright/test';

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
      
      // Find and click Button in the list
      const buttonItem = page.locator('[cmdk-item]').filter({ hasText: /^Button$/ }).first();
      if (await buttonItem.isVisible()) {
        await buttonItem.click();
      } else {
        // Try alternate selector
        await page.getByRole('option', { name: 'Button' }).first().click();
      }
      
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
      const pageRow = page.getByTestId('layers-tree').locator('button', { hasText: 'Page' }).first();
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
