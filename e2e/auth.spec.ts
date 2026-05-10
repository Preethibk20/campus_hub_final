import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 * 
 * Tests the complete registration and login flow:
 * 1. Register with valid college email
 * 2. Receive OTP
 * 3. Verify email
 * 4. Complete profile
 * 5. Land on dashboard
 */

// Test user credentials (should match backend seed data or create new ones)
const TEST_USER = {
  name: 'Test Student',
  email: `test${Date.now()}@lnmiit.ac.in`, // Use dynamic email to avoid conflicts
  password: 'TestPassword123!',
  phone: '9876543210',
  college: 'LNMIIT',
  otp: '123456', // Mock OTP - adjust based on your backend
}

test.describe('Authentication Flow', () => {
  test('complete registration flow', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register')
    
    // Verify registration page loaded
    await expect(page.locator('h1')).toContainText('Create Account')
    
    // Fill registration form - Step 1: Basic info
    await page.fill('input[name="name"]', TEST_USER.name)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="confirmPassword"]', TEST_USER.password)
    
    // Click continue to next step
    await page.click('button:has-text("Continue")')
    
    // Step 2: Verify email with OTP
    await expect(page.locator('text=Verify your email')).toBeVisible()
    
    // Fill OTP (in production, you'd get this from email or mock service)
    await page.fill('input[name="otp"]', TEST_USER.otp)
    await page.click('button:has-text("Verify")')
    
    // Step 3: Complete profile
    await expect(page.locator('text=Complete your profile')).toBeVisible()
    await page.fill('input[name="phone"]', TEST_USER.phone)
    await page.selectOption('select[name="college"]', TEST_USER.college)
    
    // Submit profile
    await page.click('button:has-text("Complete Registration")')
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard.*/)
    await expect(page.locator('text=Welcome back')).toBeVisible()
  })

  test('login with valid credentials', async ({ page }) => {
    // Navigate to login
    await page.goto('/login')
    
    // Fill credentials
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    
    // Submit login
    await page.click('button:has-text("Login")')
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard.*/)
    await expect(page.locator('text=Welcome back')).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    
    // Fill invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    
    // Submit
    await page.click('button:has-text("Login")')
    
    // Error message should appear
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
    
    // Should stay on login page
    await expect(page).toHaveURL(/.*login.*/)
  })

  test('logout functionality', async ({ page }) => {
    // First login
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button:has-text("Login")')
    await expect(page).toHaveURL(/.*dashboard.*/)
    
    // Click on profile dropdown and logout
    await page.click('[data-testid="profile-dropdown"]')
    await page.click('text=Logout')
    
    // Should be redirected to home
    await expect(page).toHaveURL('/')
    
    // Verify logged out state (Login button visible)
    await expect(page.locator('text=Login')).toBeVisible()
  })

  test('protected routes redirect to login when not authenticated', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/)
  })
})
