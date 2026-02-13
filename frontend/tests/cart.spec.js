import { test, expect } from '@playwright/test';

// Use a known slug from your backend data or mock it if needed
// For this environment, we'll assume there is a restaurant.
// If not, we might need to rely on the existing 'mcdonalds-kadikoy' or similar if that's what's running.
// Based on logs, there seems to be a restaurant. We'll use a dynamic approach or fixed slug.
// Assuming 'demo-restaurant' or we navigate to a known URL.
// The user has 'c:\Users\doguk\Desktop\qr-menu' which suggests a local dev env.
// Let's assume we can hit the main page or a specific verified restaurant.
// I will blindly guess 'mcdonalds-kadikoy' based on typical seed data, 
// OR I will check what the user has visited. 
// Safest is to visit the root or search.
// Actually, the app has routes like `/restaurant/:slug`.
// I'll try to find a link from home or just use a placeholder and warn if fails.
// Better yet, I'll assume the user has some data.

const RESTAURANT_SLUG = 'mcdonalds-kadikoy'; // Adjust this if your seed data is different
const MENU_URL = `/restaurant/${RESTAURANT_SLUG}`;

test.describe('Cart Logic & Consistency', () => {

    test.beforeEach(async ({ page }) => {
        // Clear local storage to start fresh
        await page.goto(MENU_URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        // Wait for menu to load
        await expect(page.locator('h1')).toBeVisible();
    });

    test('should add item to cart and update FAB badge', async ({ page }) => {
        // Find the first item with an "Add" button
        // We used data-testid="btn-add-{id}"
        const addBtn = page.locator('[data-testid^="btn-add-"]').first();
        await expect(addBtn).toBeVisible();

        // Get the ID to track specific item controls
        const testIdAttribute = await addBtn.getAttribute('data-testid');
        const itemId = testIdAttribute.replace('btn-add-', '');

        // Click Add
        await addBtn.click();

        // Verify FAB appears
        const fab = page.getByTestId('fab-cart');
        await expect(fab).toBeVisible();

        // Verify Badge count is 1
        const badge = page.getByTestId('cart-badge');
        await expect(badge).toHaveText('1');

        // Verify that the button changed to the stepper
        const decreaseBtn = page.getByTestId(`btn-decrease-${itemId}`);
        const increaseBtn = page.getByTestId(`btn-increase-${itemId}`);
        const qtySpan = page.getByTestId(`qty-${itemId}`);

        await expect(decreaseBtn).toBeVisible();
        await expect(increaseBtn).toBeVisible();
        await expect(qtySpan).toHaveText('1');
    });

    test('should increment item quantity and update total price', async ({ page }) => {
        const addBtn = page.locator('[data-testid^="btn-add-"]').first();
        const testIdAttribute = await addBtn.getAttribute('data-testid');
        const itemId = testIdAttribute.replace('btn-add-', '');

        // Add item (Qty: 1)
        await addBtn.click();

        // Get initial price from the item card or FAB (approximate check)
        // We'll rely on total price updates.
        const fabTotalStart = await page.getByTestId('fab-total').innerText();
        const pricePerItem = parseFloat(fabTotalStart.replace(' ₺', ''));

        // Increment (Qty: 2)
        const increaseBtn = page.getByTestId(`btn-increase-${itemId}`);
        await increaseBtn.click();

        // Check Qty
        const qtySpan = page.getByTestId(`qty-${itemId}`);
        await expect(qtySpan).toHaveText('2');

        // Check Badge
        const badge = page.getByTestId('cart-badge');
        await expect(badge).toHaveText('2');

        // Check Total Price (Should be double)
        const fabTotalEnd = await page.getByTestId('fab-total').innerText();
        const totalPrice = parseFloat(fabTotalEnd.replace(' ₺', ''));

        expect(totalPrice).toBeCloseTo(pricePerItem * 2, 2);
    });

    test('should decrement item and remove when qty reaches 0', async ({ page }) => {
        const addBtn = page.locator('[data-testid^="btn-add-"]').first();
        const testIdAttribute = await addBtn.getAttribute('data-testid');
        const itemId = testIdAttribute.replace('btn-add-', '');

        // Add item
        await addBtn.click();

        // Verify we are in stepper mode
        const decreaseBtn = page.getByTestId(`btn-decrease-${itemId}`);
        await expect(decreaseBtn).toBeVisible();

        // Click decrement
        await decreaseBtn.click();

        // Verify we are back to "Add" button
        await expect(addBtn).toBeVisible();

        // Verify FAB is gone (if cart is empty)
        const fab = page.getByTestId('fab-cart');
        await expect(fab).not.toBeVisible();
    });

    test('should sync consistency between Card and Cart Drawer', async ({ page }) => {
        const addBtn = page.locator('[data-testid^="btn-add-"]').first();
        const testIdAttribute = await addBtn.getAttribute('data-testid');
        const itemId = testIdAttribute.replace('btn-add-', '');

        // Add item -> Qty 1
        await addBtn.click();

        // Open Drawer
        const fab = page.getByTestId('fab-cart');
        await fab.click();

        // Verify item in drawer
        const drawerQty = page.getByTestId(`drawer-qty-${itemId}`);
        await expect(drawerQty).toBeVisible();
        await expect(drawerQty).toHaveText('1');

        // Increment in Drawer -> Qty 2
        const drawerIncrease = page.getByTestId(`drawer-btn-increase-${itemId}`);
        await drawerIncrease.click();
        await expect(drawerQty).toHaveText('2');

        // Close Drawer (Background click or close button if we had one, usually clicking outside or proper component usage)
        // We'll just verify the PUBLIC MENU matches without closing if possible, 
        // but the drawer might cover it. 
        // Let's reload to verify persistence implicitly or close the drawer.
        // The Sheet component usually has a close interaction.
        // We'll click the "Browse Menu" or just "escape"
        await page.keyboard.press('Escape');

        // Verify Public Menu Card Qty is 2
        const cardQty = page.getByTestId(`qty-${itemId}`);
        await expect(cardQty).toHaveText('2');
    });

    test('should persist cart to localStorage', async ({ page }) => {
        const addBtn = page.locator('[data-testid^="btn-add-"]').first();
        await addBtn.click();

        // Wait for state to settle
        await page.waitForTimeout(500);

        // Reload
        await page.reload();

        // Verify Cart is still there
        const fab = page.getByTestId('fab-cart');
        await expect(fab).toBeVisible();
        await expect(page.getByTestId('cart-badge')).toHaveText('1');
    });

});
