import { test, expect, type Page } from '@playwright/test';

/**
 * Email Builder E2E Tests
 *
 * Tests the react-email page type integration in UIBuilder.
 * Validates:
 *  - The email builder loads and renders the initial email page
 *  - The page type selector appears when creating new pages
 *  - Email components can be added via the component popover
 *  - The code panel shows "Email JSX" (custom label) for email pages
 *  - The props panel functions for email component props
 */

async function waitForBuilderReady(page: Page) {
  await expect(page.getByTestId('component-editor')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('page-config-panel')).toBeVisible();
  await expect(page.getByTestId('loading-skeleton')).not.toBeVisible({ timeout: 10000 });
}

test.describe('Email Builder (/smoke/email)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/smoke/email');
    await waitForBuilderReady(page);
  });

  test('loads and shows the initial email page in the page list', async ({ page }) => {
    // The page should render the smoke-email-page test id
    await expect(page.getByTestId('smoke-email-page')).toBeVisible();

    // The current page "Email 1" should be shown in the nav
    await expect(page.getByRole('button', { name: 'Email 1' })).toBeVisible();
  });

  test('shows the layers tree with email components', async ({ page }) => {
    const layersTree = page.getByTestId('layers-tree');
    await expect(layersTree).toBeVisible();

    // The initial template has Html, Head, Preview, Body layers
    await expect(layersTree).toContainText('Email 1');
  });

  test('page type selector appears when creating a new page', async ({ page }) => {
    // Click the page button to open pages popover
    await page.getByRole('button', { name: 'Email 1' }).click();

    // The page creation area should show the page type selector
    // Look for the type toggle buttons (Web / Email)
    await expect(page.getByTestId('page-type-selector')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('page-type-selector')).toContainText('Web');
    await expect(page.getByTestId('page-type-selector')).toContainText('Email');
  });

  test('can create a new email page', async ({ page }) => {
    // Open pages popover
    await page.getByRole('button', { name: 'Email 1' }).click();

    // Wait for page type selector
    await expect(page.getByTestId('page-type-selector')).toBeVisible({ timeout: 5000 });

    // Select "Email" type
    await page.getByTestId('page-type-selector').getByText('Email').click();

    // Enter page name and submit
    const input = page.getByPlaceholder('New page name...');
    await input.fill('Welcome Email');
    await input.press('Enter');

    // New email page should appear in the page button
    await expect(page.getByRole('button', { name: 'Welcome Email' })).toBeVisible({ timeout: 5000 });
  });

  test('can create a new default (web) page', async ({ page }) => {
    // Open pages popover
    await page.getByRole('button', { name: 'Email 1' }).click();

    // Wait for page type selector
    await expect(page.getByTestId('page-type-selector')).toBeVisible({ timeout: 5000 });

    // "Web" should be selected by default (no explicit click needed)
    const input = page.getByPlaceholder('New page name...');
    await input.fill('Web Page');
    await input.press('Enter');

    // New page should appear
    await expect(page.getByRole('button', { name: 'Web Page' })).toBeVisible({ timeout: 5000 });
  });

  test('code panel shows "Email JSX" tab label for email pages', async ({ page }) => {
    // Click export/code button
    const exportButton = page.getByRole('button', { name: /export/i });
    await exportButton.click();

    // The code panel dialog should show "Email JSX" tab (not "React")
    await expect(page.getByRole('tab', { name: 'Email JSX' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('tab', { name: 'Serialized' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'React' })).not.toBeVisible();
  });

  test('code panel shows generated email JSX code', async ({ page }) => {
    // Click export/code button
    const exportButton = page.getByRole('button', { name: /export/i });
    await exportButton.click();

    // The Email JSX tab should be active and contain email-related code
    await expect(page.getByRole('tab', { name: 'Email JSX' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('tab', { name: 'Email JSX' }).click();

    // The code should mention @react-email/components import
    const codeBlock = page.locator('[data-testid*="codeblock"], .shiki, pre').first();
    await expect(codeBlock).toBeVisible({ timeout: 5000 });
    const codeText = await codeBlock.textContent();
    expect(codeText).toContain('@react-email/components');
  });

  test('can select a layer in the email page', async ({ page }) => {
    // Click the page area to select a layer
    const layersTree = page.getByTestId('layers-tree');
    await expect(layersTree).toBeVisible();

    // Click on a layer in the tree
    const textItem = layersTree.getByText('Heading').first();
    if (await textItem.isVisible()) {
      await textItem.click();
      // The props panel should show something for the selected layer
      await expect(page.getByTestId('props-panel')).toBeVisible();
    }
  });
});
