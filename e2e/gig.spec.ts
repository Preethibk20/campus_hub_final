import { test, expect } from '@playwright/test'

/**
 * Gig Management E2E Tests
 * 
 * Tests:
 * 1. Create a new gig as seller
 * 2. Verify gig appears on Explore page
 * 3. Search for a gig by keyword
 * 4. Click gig to see detail page
 */

// Test data
const TEST_GIG = {
  title: `Test Web Development Gig ${Date.now()}`,
  description: 'I will create a responsive React website with modern design principles. Includes 3 pages and mobile optimization.',
  category: 'Coding',
  price: '2500',
  tags: ['React', 'Web Development', 'Frontend'],
}

const TEST_USER_SELLER = {
  email: process.env.TEST_SELLER_EMAIL || 'seller@test.com',
  password: process.env.TEST_SELLER_PASSWORD || 'TestPassword123!',
}

test.describe('Gig Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as seller before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_SELLER.email)
    await page.fill('input[name="password"]', TEST_USER_SELLER.password)
    await page.click('button:has-text("Login")')
    await expect(page).toHaveURL(/.*dashboard.*/)
  })

  test('create a new gig and verify it appears', async ({ page }) => {
    // Navigate to create gig page
    await page.goto('/dashboard/gigs/create')
    
    // Fill gig creation form
    await page.fill('input[name="title"]', TEST_GIG.title)
    await page.fill('textarea[name="description"]', TEST_GIG.description)
    await page.selectOption('select[name="category"]', TEST_GIG.category)
    await page.fill('input[name="price"]', TEST_GIG.price)
    
    // Add tags
    for (const tag of TEST_GIG.tags) {
      await page.fill('input[name="tagInput"]', tag)
      await page.keyboard.press('Enter')
    }
    
    // Submit form
    await page.click('button:has-text("Create Gig")')
    
    // Should redirect to my gigs page with success message
    await expect(page).toHaveURL('/dashboard/my-gigs')
    await expect(page.locator('text=Gig created successfully')).toBeVisible()
    
    // Verify gig appears in the list
    await expect(page.locator(`text=${TEST_GIG.title}`)).toBeVisible()
  })

  test('created gig appears on Explore page', async ({ page }) => {
    // Go to explore page
    await page.goto('/explore')
    
    // Wait for gigs to load
    await page.waitForSelector('[data-testid="gig-card"]', { timeout: 10000 })
    
    // Search for the created gig
    await page.fill('input[name="search"]', TEST_GIG.title)
    await page.keyboard.press('Enter')
    
    // Wait for search results
    await page.waitForTimeout(1000)
    
    // Verify the gig appears in search results
    await expect(page.locator(`text=${TEST_GIG.title}`)).toBeVisible()
  })

  test('search for a gig by keyword and view details', async ({ page }) => {
    // Go to explore page
    await page.goto('/explore')
    
    // Search by category keyword
    await page.fill('input[name="search"]', 'web development')
    await page.keyboard.press('Enter')
    
    // Wait for results
    await page.waitForTimeout(1000)
    
    // Find and click on a gig card
    const gigCard = page.locator('[data-testid="gig-card"]').first()
    await expect(gigCard).toBeVisible()
    
    // Get the gig title for verification
    const gigTitle = await gigCard.locator('h3').textContent()
    
    // Click on the gig
    await gigCard.click()
    
    // Should navigate to gig detail page
    await expect(page).toHaveURL(/.*gigs\/.+/)
    
    // Verify gig details are displayed
    await expect(page.locator(`text=${gigTitle}`)).toBeVisible()
    await expect(page.locator('button:has-text("Apply for this Gig")')).toBeVisible()
    await expect(page.locator('text=About this gig')).toBeVisible()
  })

  test('filter gigs by category', async ({ page }) => {
    // Go to explore page
    await page.goto('/explore')
    
    // Select a category from filter
    await page.selectOption('select[name="category"]', 'Coding')
    
    // Wait for filtered results
    await page.waitForTimeout(1000)
    
    // Verify only coding gigs are shown
    const gigCards = page.locator('[data-testid="gig-card"]')
    const count = await gigCards.count()
    expect(count).toBeGreaterThan(0)
    
    // Verify category badge on first card
    await expect(gigCards.first().locator('text=Coding')).toBeVisible()
  })

  test('edit an existing gig', async ({ page }) => {
    // Go to my gigs
    await page.goto('/dashboard/my-gigs')
    
    // Click edit on the first gig
    await page.click('[data-testid="edit-gig-button"]').first()
    
    // Update the price
    const newPrice = '3000'
    await page.fill('input[name="price"]', newPrice)
    
    // Save changes
    await page.click('button:has-text("Save Changes")')
    
    // Verify success message
    await expect(page.locator('text=Gig updated successfully')).toBeVisible()
  })

  test('delete a gig', async ({ page }) => {
    // Go to my gigs
    await page.goto('/dashboard/my-gigs')
    
    // Get initial count
    const initialCount = await page.locator('[data-testid="gig-card"]').count()
    
    // Click delete on the first gig
    await page.click('[data-testid="delete-gig-button"]').first()
    
    // Confirm deletion in modal
    await page.click('button:has-text("Delete")')
    
    // Verify success message
    await expect(page.locator('text=Gig deleted successfully')).toBeVisible()
    
    // Verify count decreased
    await page.waitForTimeout(500)
    const newCount = await page.locator('[data-testid="gig-card"]').count()
    expect(newCount).toBe(initialCount - 1)
  })
})
