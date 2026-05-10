import { test, expect } from '@playwright/test'

/**
 * Order & Application E2E Tests
 * 
 * Tests:
 * 1. Buyer finds a gig, clicks Apply, fills message, submits
 * 2. Seller sees the application on My Gigs
 * 3. Seller accepts application → creates order
 * 4. Order appears in both buyer's and seller's orders
 */

const TEST_USER_BUYER = {
  email: process.env.TEST_BUYER_EMAIL || 'buyer@test.com',
  password: process.env.TEST_BUYER_PASSWORD || 'TestPassword123!',
}

const TEST_USER_SELLER = {
  email: process.env.TEST_SELLER_EMAIL || 'seller@test.com',
  password: process.env.TEST_SELLER_PASSWORD || 'TestPassword123!',
}

const APPLICATION_MESSAGE = 'Hi! I need a website for my college project. Can you help me build a responsive portfolio site with 3 pages?'

test.describe('Order Flow', () => {
  test('buyer applies for a gig', async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_BUYER.email)
    await page.fill('input[name="password"]', TEST_USER_BUYER.password)
    await page.click('button:has-text("Login")')
    await expect(page).toHaveURL(/.*dashboard.*/)
    
    // Go to explore page
    await page.goto('/explore')
    
    // Wait for gigs to load
    await page.waitForSelector('[data-testid="gig-card"]', { timeout: 10000 })
    
    // Click on first gig
    await page.locator('[data-testid="gig-card"]').first().click()
    
    // Should be on gig detail page
    await expect(page).toHaveURL(/.*gigs\/.+/)
    await expect(page.locator('button:has-text("Apply for this Gig")')).toBeVisible()
    
    // Click Apply button
    await page.click('button:has-text("Apply for this Gig")')
    
    // Application modal should open
    await expect(page.locator('text=Apply for this Gig')).toBeVisible()
    
    // Fill application message
    await page.fill('textarea[name="message"]', APPLICATION_MESSAGE)
    
    // Submit application
    await page.click('button:has-text("Submit Application")')
    
    // Verify success message
    await expect(page.locator('text=Application submitted successfully')).toBeVisible()
  })

  test('seller sees application and accepts it', async ({ page }) => {
    // Login as seller
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_SELLER.email)
    await page.fill('input[name="password"]', TEST_USER_SELLER.password)
    await page.click('button:has-text("Login")')
    await expect(page).toHaveURL(/.*dashboard.*/)
    
    // Go to My Gigs
    await page.goto('/dashboard/my-gigs')
    
    // Click on Applications tab
    await page.click('text=Applications')
    
    // Wait for applications to load
    await page.waitForSelector('[data-testid="application-card"]', { timeout: 10000 })
    
    // Verify the application from buyer is visible
    await expect(page.locator(`text=${APPLICATION_MESSAGE.substring(0, 30)}`)).toBeVisible()
    
    // Click to view application details
    await page.locator('[data-testid="view-application-button"]').first().click()
    
    // Application detail modal should open
    await expect(page.locator('text=Application Details')).toBeVisible()
    await expect(page.locator(`text=${APPLICATION_MESSAGE}`)).toBeVisible()
    
    // Accept the application
    await page.click('button:has-text("Accept & Create Order")')
    
    // Confirm in dialog
    await page.click('button:has-text("Confirm")')
    
    // Verify success and redirect to orders
    await expect(page.locator('text=Order created successfully')).toBeVisible()
    await expect(page).toHaveURL(/.*dashboard\/orders.*/)
  })

  test('order appears in buyer orders', async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_BUYER.email)
    await page.fill('input[name="password"]', TEST_USER_BUYER.password)
    await page.click('button:has-text("Login")')
    await expect(page).toHaveURL(/.*dashboard.*/)
    
    // Go to Orders page
    await page.goto('/dashboard/orders')
    
    // Click on Buying tab
    await page.click('text=Buying')
    
    // Wait for orders to load
    await page.waitForSelector('[data-testid="order-card"]', { timeout: 10000 })
    
    // Verify at least one order exists
    const orderCount = await page.locator('[data-testid="order-card"]').count()
    expect(orderCount).toBeGreaterThan(0)
    
    // Click on first order
    await page.locator('[data-testid="order-card"]').first().click()
    
    // Should navigate to order detail
    await expect(page).toHaveURL(/.*dashboard\/orders\/.+/)
    
    // Verify order details are displayed
    await expect(page.locator('text=Order Status')).toBeVisible()
    await expect(page.locator('text=Payment')).toBeVisible()
  })

  test('buyer pays for order via Razorpay', async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_BUYER.email)
    await page.fill('input[name="password"]', TEST_USER_BUYER.password)
    await page.click('button:has-text("Login")')
    
    // Go to pending order
    await page.goto('/dashboard/orders')
    await page.click('text=Buying')
    
    // Find order with Pay Now button
    const orderWithPayButton = page.locator('[data-testid="order-card"]:has-text("Pay Now")').first()
    await orderWithPayButton.click()
    
    // On order detail page
    await expect(page).toHaveURL(/.*dashboard\/orders\/.+/)
    
    // Click Pay Now
    await page.click('button:has-text("Pay Now")')
    
    // Razorpay modal should appear (mock in test mode)
    // In production, you'd interact with Razorpay iframe
    await expect(page.locator('text=Processing Payment')).toBeVisible()
    
    // After successful payment
    await expect(page.locator('text=Payment successful')).toBeVisible()
    await expect(page.locator('text=Payment Held in Escrow')).toBeVisible()
  })

  test('seller marks order as delivered', async ({ page }) => {
    // Login as seller
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_SELLER.email)
    await page.fill('input[name="password"]', TEST_USER_SELLER.password)
    await page.click('button:has-text("Login")')
    
    // Go to orders
    await page.goto('/dashboard/orders')
    await page.click('text=Selling')
    
    // Find order with Mark as Delivered button
    const orderWithDeliverButton = page.locator('[data-testid="order-card"]:has-text("Mark as Delivered")').first()
    await orderWithDeliverButton.click()
    
    // Click Mark as Delivered
    await page.click('button:has-text("Mark as Delivered")')
    
    // Confirm in modal
    await page.fill('textarea[name="deliveryNotes"]', 'Website files uploaded to shared drive. Check the README for instructions.')
    await page.click('button:has-text("Confirm Delivery")')
    
    // Verify status changed
    await expect(page.locator('text=Order Delivered')).toBeVisible()
  })

  test('buyer completes order and releases payment', async ({ page }) => {
    // Login as buyer
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_BUYER.email)
    await page.fill('input[name="password"]', TEST_USER_BUYER.password)
    await page.click('button:has-text("Login")')
    
    // Go to delivered order
    await page.goto('/dashboard/orders')
    await page.click('text=Buying')
    
    // Find order with Complete Order button
    const orderWithCompleteButton = page.locator('[data-testid="order-card"]:has-text("Complete Order")').first()
    await orderWithCompleteButton.click()
    
    // Click Complete Order
    await page.click('button:has-text("Complete Order")')
    
    // Confirm in modal
    await page.click('button:has-text("Confirm & Release Payment")')
    
    // Verify order completed
    await expect(page.locator('text=Order Completed')).toBeVisible()
    await expect(page.locator('text=Payment Released')).toBeVisible()
  })
})
