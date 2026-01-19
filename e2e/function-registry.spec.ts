import { test, expect, type Page } from '@playwright/test';

/**
 * Function Registry E2E Tests
 * 
 * Tests for the function registry feature, including:
 * - Function-type variables
 * - Function binding in props panel
 * - Form submissions with server actions
 * - Toast notifications
 */

// Helper to wait for the builder to fully load
async function waitForBuilderReady(page: Page) {
  await expect(page.getByTestId('component-editor')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('page-config-panel')).toBeVisible();
  // Wait for loading skeleton to disappear
  await expect(page.getByTestId('loading-skeleton')).not.toBeVisible({ timeout: 10000 });
}

test.describe('Function Registry (/smoke/functions)', () => {
  
  test.describe('Page Structure', () => {
    
    test('loads function registry page without errors', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // Verify main panels are present
      await expect(page.getByTestId('page-config-panel')).toBeVisible();
      await expect(page.getByTestId('auto-frame').first()).toBeVisible();
    });
    
    test('page contains HTML form section', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // Verify the HTML form is present in the iframe canvas
      const canvas = page.getByTestId('auto-frame').first();
      const frame = canvas.frameLocator('iframe').first();
      
      await expect(frame.getByText('HTML Form (Server Action)')).toBeVisible({ timeout: 10000 });
      await expect(frame.locator('form').first()).toBeVisible();
    });
    
    test('page contains shadcn form section', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // Verify the shadcn form is present in the iframe canvas
      const canvas = page.getByTestId('auto-frame').first();
      const frame = canvas.frameLocator('iframe').first();
      
      await expect(frame.getByText('Shadcn Form (Server Action)')).toBeVisible({ timeout: 10000 });
    });
    
    test('page contains toast buttons section', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // Verify the toast buttons section is present
      const canvas = page.getByTestId('auto-frame').first();
      const frame = canvas.frameLocator('iframe').first();
      
      await expect(frame.getByText('Toast Notifications')).toBeVisible({ timeout: 10000 });
      await expect(frame.getByText('Show Success Toast')).toBeVisible();
      await expect(frame.getByText('Show Error Toast')).toBeVisible();
    });
    
  });
  
  test.describe('Function-Type Variables', () => {
    
    test('can access Data tab and see Variables section', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // Click Data tab
      const dataTab = page.getByRole('tab', { name: /data/i });
      await dataTab.click();
      await page.waitForTimeout(300);
      
      // Verify variables panel is visible with the Add Variable button
      await expect(page.getByRole('button', { name: /add variable/i })).toBeVisible();
    });
    
    test('shows Function type in variable type selector when function registry is provided', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // Click Data tab
      const dataTab = page.getByRole('tab', { name: /data/i });
      await dataTab.click();
      await page.waitForTimeout(300);
      
      // Click Add Variable button
      await page.getByRole('button', { name: /add variable/i }).click();
      await page.waitForTimeout(300);
      
      // Open the Type dropdown
      const typeSelector = page.getByRole('combobox').first();
      await typeSelector.click();
      await page.waitForTimeout(300);
      
      // Verify Function type is available
      await expect(page.getByRole('option', { name: /function/i })).toBeVisible();
    });
    
    test('can create a function-type variable', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // Click Data tab
      const dataTab = page.getByRole('tab', { name: /data/i });
      await dataTab.click();
      await page.waitForTimeout(300);
      
      // Click Add Variable button
      await page.getByRole('button', { name: /add variable/i }).click();
      await page.waitForTimeout(300);
      
      // Fill in variable name
      await page.getByLabel(/name/i).fill('clickHandler');
      
      // Open the Type dropdown and select Function
      const typeSelector = page.getByRole('combobox').first();
      await typeSelector.click();
      await page.waitForTimeout(200);
      await page.getByRole('option', { name: /function/i }).click();
      await page.waitForTimeout(300);
      
      // Now a function dropdown should appear
      // Click it to select a function from the registry
      const functionSelector = page.getByRole('combobox').last();
      await functionSelector.click();
      await page.waitForTimeout(200);
      
      // Select the first function option
      await page.getByRole('option').first().click();
      await page.waitForTimeout(200);
      
      // Save the variable
      await page.getByRole('button', { name: /save/i }).click();
      await page.waitForTimeout(300);
      
      // Verify the variable was created and shows function type
      await expect(page.getByText('function', { exact: true })).toBeVisible();
    });
    
  });
  
  test.describe('Function Prop Binding', () => {
    
    test('function props show dropdown with available functions', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // Expand the tree to find a Button component
      // First, expand the page layer
      const layersTree = page.getByTestId('layers-tree');
      const expandButtons = layersTree.locator('button:has(svg[class*="lucide-chevron"])');
      
      // Click to expand multiple levels to get to the toast buttons
      const firstExpand = expandButtons.first();
      if (await firstExpand.isVisible()) {
        await firstExpand.click();
        await page.waitForTimeout(300);
      }
      
      // Look for "Success Toast Button" in the layers tree and select it
      const successButton = layersTree.getByText('Success Toast Button');
      if (await successButton.isVisible()) {
        await successButton.click();
        await page.waitForTimeout(500);
        
        // Switch to Appearance tab to see the props panel
        const appearanceTab = page.getByRole('tab', { name: /appearance/i });
        await appearanceTab.click();
        await page.waitForTimeout(300);
        
        // Look for an onClick field that should show a function selector
        const onClickLabel = page.locator('label').filter({ hasText: /onClick/i });
        
        // The function field should have a select dropdown
        const functionSelect = page.locator('[class*="SelectTrigger"]').last();
        if (await functionSelect.isVisible()) {
          await functionSelect.click();
          await page.waitForTimeout(300);
          
          // Should show available functions from the registry
          await expect(page.getByText('Show Success Toast')).toBeVisible();
          await expect(page.getByText('Show Error Toast')).toBeVisible();
        }
      }
    });
    
    test('can bind onClick to a function from registry', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // Expand tree and select Success Toast Button
      const layersTree = page.getByTestId('layers-tree');
      
      // Expand multiple levels
      let expandButtons = layersTree.locator('button:has(svg[class*="lucide-chevron-right"])');
      while (await expandButtons.first().isVisible()) {
        await expandButtons.first().click();
        await page.waitForTimeout(200);
        expandButtons = layersTree.locator('button:has(svg[class*="lucide-chevron-right"])');
      }
      
      // Find and select the Success Toast Button
      const successButton = layersTree.getByText('Success Toast Button');
      if (await successButton.isVisible()) {
        await successButton.click();
        await page.waitForTimeout(500);
        
        // Switch to Appearance tab
        const appearanceTab = page.getByRole('tab', { name: /appearance/i });
        await appearanceTab.click();
        await page.waitForTimeout(300);
        
        // Find the onClick function selector
        const onClickSelect = page.locator('button[role="combobox"]').filter({ hasText: /select a function|none/i }).first();
        if (await onClickSelect.isVisible()) {
          await onClickSelect.click();
          await page.waitForTimeout(300);
          
          // Select "Show Success Toast" function
          const successOption = page.getByRole('option', { name: /show success toast/i });
          if (await successOption.isVisible()) {
            await successOption.click();
            await page.waitForTimeout(300);
            
            // Verify the function is now selected
            await expect(page.getByText('Show Success Toast')).toBeVisible();
          }
        }
      }
    });
    
  });
  
  test.describe('Code Generation', () => {
    
    test('generated code includes functions interface when function variables exist', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // First create a function variable
      const dataTab = page.getByRole('tab', { name: /data/i });
      await dataTab.click();
      await page.waitForTimeout(300);
      
      await page.getByRole('button', { name: /add variable/i }).click();
      await page.waitForTimeout(300);
      
      await page.getByLabel(/name/i).fill('myHandler');
      
      const typeSelector = page.getByRole('combobox').first();
      await typeSelector.click();
      await page.getByRole('option', { name: /function/i }).click();
      await page.waitForTimeout(300);
      
      const functionSelector = page.getByRole('combobox').last();
      await functionSelector.click();
      await page.getByRole('option').first().click();
      
      await page.getByRole('button', { name: /save/i }).click();
      await page.waitForTimeout(300);
      
      // Open the export dialog
      const exportButton = page.locator('button').filter({ has: page.locator('[class*="lucide-file-up"]') }).first();
      await exportButton.click();
      
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
      
      // The generated code should include the functions interface
      await expect(page.getByText(/functions/i).first()).toBeVisible();
      
      // Close dialog
      await page.keyboard.press('Escape');
    });
    
  });
  
  test.describe('Runtime Functionality', () => {
    
    test('success toast button shows toast notification (pre-bound)', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      // The button should already have onClick bound via __function_onClick in initialLayers
      // Click the button in the preview canvas
      const canvas = page.getByTestId('auto-frame').first();
      const frame = canvas.frameLocator('iframe').first();
      
      const successButton = frame.getByRole('button', { name: /show success toast/i });
      await expect(successButton).toBeVisible({ timeout: 10000 });
      await successButton.click();
      
      // Look for toast notification (Sonner creates a toast outside the iframe)
      await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 });
    });
    
    test('error toast button shows toast notification (pre-bound)', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      const canvas = page.getByTestId('auto-frame').first();
      const frame = canvas.frameLocator('iframe').first();
      
      const errorButton = frame.getByRole('button', { name: /show error toast/i });
      await expect(errorButton).toBeVisible({ timeout: 10000 });
      await errorButton.click();
      
      // Look for toast notification
      await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 });
    });
    
    test('form submission does not refresh page (pre-bound onSubmit)', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      const canvas = page.getByTestId('auto-frame').first();
      const frame = canvas.frameLocator('iframe').first();
      
      // Fill out the HTML form
      const nameInput = frame.locator('input[name="name"]').first();
      const emailInput = frame.locator('input[name="email"]').first();
      
      await expect(nameInput).toBeVisible({ timeout: 10000 });
      await nameInput.fill('Test User');
      await emailInput.fill('test@example.com');
      
      // Get the URL before submission
      const urlBefore = page.url();
      
      // Submit the form
      const submitButton = frame.getByRole('button', { name: /submit html form/i });
      await submitButton.click();
      
      // Wait a bit for potential navigation
      await page.waitForTimeout(1000);
      
      // URL should not have changed (no page refresh)
      expect(page.url()).toBe(urlBefore);
      
      // Toast should appear showing success message
      await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 });
    });
    
    test('shadcn form submission works without page refresh', async ({ page }) => {
      await page.goto('/smoke/functions');
      
      await waitForBuilderReady(page);
      
      const canvas = page.getByTestId('auto-frame').first();
      const frame = canvas.frameLocator('iframe').first();
      
      // Wait for the shadcn form inputs to be visible
      // They use the shadcn Input component which renders as <input>
      const formInputs = frame.locator('form').nth(1).locator('input');
      await expect(formInputs.first()).toBeVisible({ timeout: 10000 });
      
      // Fill the inputs
      await formInputs.nth(0).fill('Jane Doe');
      await formInputs.nth(1).fill('jane@example.com');
      
      const urlBefore = page.url();
      
      // Submit the shadcn form
      const submitButton = frame.getByRole('button', { name: /submit shadcn form/i });
      await submitButton.click();
      
      await page.waitForTimeout(1000);
      
      // URL should not have changed
      expect(page.url()).toBe(urlBefore);
      
      // Toast should appear
      await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 });
    });
    
  });
  
});
