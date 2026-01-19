import { test, expect } from '@playwright/test';

test.describe('Inventory Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@lumono.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display dashboard after login', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should navigate to products page', async ({ page }) => {
    await page.click('text=Products');
    await expect(page).toHaveURL('/dashboard/products');
    await expect(page.locator('h1')).toContainText('Products');
  });

  test('should display inventory movements', async ({ page }) => {
    await page.click('text=Inventory');
    await expect(page).toHaveURL('/dashboard/inventory');
    await expect(page.locator('h1')).toContainText('Inventory Movements');
  });

  test('should display product list', async ({ page }) => {
    await page.goto('/dashboard/products');
    
    // Wait for the table to load
    await page.waitForSelector('table');
    
    // Check if table has headers
    await expect(page.locator('th')).toContainText('SKU');
    await expect(page.locator('th')).toContainText('Name');
  });

  test('complete flow: login → view products → view inventory → logout', async ({ page }) => {
    // Already logged in via beforeEach
    
    // View products
    await page.click('text=Products');
    await expect(page).toHaveURL('/dashboard/products');
    
    // View inventory
    await page.click('text=Inventory');
    await expect(page).toHaveURL('/dashboard/inventory');
    
    // Logout
    await page.click('text=Logout');
    await expect(page).toHaveURL('/auth/login');
  });
});

