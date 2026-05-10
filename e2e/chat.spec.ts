import { test, expect } from '@playwright/test'

/**
 * Chat & Messaging E2E Tests
 * 
 * Tests:
 * 1. User A starts a conversation with User B
 * 2. User A sends a message
 * 3. User B logs in and verifies the message was received
 * 4. User B replies
 * 5. User A sees the reply in real-time
 */

const TEST_USER_A = {
  email: process.env.TEST_USER_A_EMAIL || 'usera@test.com',
  password: process.env.TEST_USER_A_PASSWORD || 'TestPassword123!',
  name: 'User A',
}

const TEST_USER_B = {
  email: process.env.TEST_USER_B_EMAIL || 'userb@test.com',
  password: process.env.TEST_USER_B_PASSWORD || 'TestPassword123!',
  name: 'User B',
}

const TEST_MESSAGE = `Hello! I'm interested in your gig. Can we discuss the project details? ${Date.now()}`
const REPLY_MESSAGE = `Hi! Sure, I'd be happy to help. What are your requirements? ${Date.now()}`

test.describe('Chat Flow', () => {
  test('user A starts conversation and sends message', async ({ page }) => {
    // Login as User A
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_A.email)
    await page.fill('input[name="password"]', TEST_USER_A.password)
    await page.click('button:has-text("Login")')
    await expect(page).toHaveURL(/.*dashboard.*/)
    
    // Navigate to a seller's profile or gig to start conversation
    await page.goto('/explore')
    
    // Click on a gig
    await page.waitForSelector('[data-testid="gig-card"]', { timeout: 10000 })
    await page.locator('[data-testid="gig-card"]').first().click()
    
    // Click "Contact Seller" or similar button
    await page.click('button:has-text("Contact Seller")')
    
    // Should open chat or navigate to inbox with new conversation
    await expect(page).toHaveURL(/.*dashboard\/inbox.*/)
    
    // Wait for chat to load
    await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 })
    
    // Type and send message
    await page.fill('[data-testid="chat-input"]', TEST_MESSAGE)
    await page.click('[data-testid="send-message-button"]')
    
    // Verify message appears in chat
    await expect(page.locator(`text=${TEST_MESSAGE}`)).toBeVisible()
    
    // Verify message shows as sent (checkmark)
    await expect(page.locator('[data-testid="message-sent"]').last()).toBeVisible()
  })

  test('user B receives and sees the message', async ({ page }) => {
    // Login as User B
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_B.email)
    await page.fill('input[name="password"]', TEST_USER_B.password)
    await page.click('button:has-text("Login")')
    await expect(page).toHaveURL(/.*dashboard.*/)
    
    // Check notification badge
    const notificationBadge = page.locator('[data-testid="notification-badge"]')
    await expect(notificationBadge).toBeVisible()
    const badgeCount = await notificationBadge.textContent()
    expect(parseInt(badgeCount || '0')).toBeGreaterThan(0)
    
    // Navigate to inbox
    await page.goto('/dashboard/inbox')
    
    // Wait for conversation list to load
    await page.waitForSelector('[data-testid="conversation-list"]', { timeout: 10000 })
    
    // Find conversation with User A (should have unread indicator)
    const conversationWithUserA = page.locator('[data-testid="conversation-item"]:has-text("User A")').first()
    await expect(conversationWithUserA).toBeVisible()
    
    // Verify unread badge is present
    await expect(conversationWithUserA.locator('[data-testid="unread-badge"]')).toBeVisible()
    
    // Click on conversation
    await conversationWithUserA.click()
    
    // Wait for chat window to load
    await page.waitForSelector('[data-testid="chat-window"]', { timeout: 10000 })
    
    // Verify the message from User A is displayed
    await expect(page.locator(`text=${TEST_MESSAGE}`)).toBeVisible()
    
    // Verify sender name
    await expect(page.locator('text=User A')).toBeVisible()
  })

  test('user B replies to the message', async ({ page }) => {
    // Login as User B
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_B.email)
    await page.fill('input[name="password"]', TEST_USER_B.password)
    await page.click('button:has-text("Login")')
    
    // Go to inbox
    await page.goto('/dashboard/inbox')
    
    // Open conversation with User A
    await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 10000 })
    await page.locator('[data-testid="conversation-item"]:has-text("User A")').first().click()
    
    // Wait for chat window
    await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 })
    
    // Type and send reply
    await page.fill('[data-testid="chat-input"]', REPLY_MESSAGE)
    await page.click('[data-testid="send-message-button"]')
    
    // Verify reply appears in chat
    await expect(page.locator(`text=${REPLY_MESSAGE}`)).toBeVisible()
    
    // Verify message is on the right side (sent by User B)
    const lastMessage = page.locator('[data-testid="chat-message"]').last()
    await expect(lastMessage).toHaveClass(/sent/)
  })

  test('user A sees the reply in real-time', async ({ page }) => {
    // Login as User A
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_A.email)
    await page.fill('input[name="password"]', TEST_USER_A.password)
    await page.click('button:has-text("Login")')
    
    // Go to inbox
    await page.goto('/dashboard/inbox')
    
    // Open conversation with User B
    await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 10000 })
    await page.locator('[data-testid="conversation-item"]:has-text("User B")').first().click()
    
    // Wait for chat window
    await page.waitForSelector('[data-testid="chat-window"]', { timeout: 10000 })
    
    // Verify both messages are visible
    await expect(page.locator(`text=${TEST_MESSAGE}`)).toBeVisible()
    await expect(page.locator(`text=${REPLY_MESSAGE}`)).toBeVisible()
    
    // Verify the reply is on the left side (received from User B)
    const replyMessage = page.locator(`[data-testid="chat-message"]:has-text("${REPLY_MESSAGE}")`)
    await expect(replyMessage).toHaveClass(/received/)
  })

  test('typing indicator shows when user is typing', async ({ page }) => {
    // Login as User A
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_A.email)
    await page.fill('input[name="password"]', TEST_USER_A.password)
    await page.click('button:has-text("Login")')
    
    // Go to inbox and open conversation
    await page.goto('/dashboard/inbox')
    await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 10000 })
    await page.locator('[data-testid="conversation-item"]').first().click()
    
    // Type in input field
    await page.fill('[data-testid="chat-input"]', 'Typing a message')
    
    // Typing indicator should appear in the chat
    // This depends on WebSocket implementation
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible()
  })

  test('file upload in chat', async ({ page }) => {
    // Login as User A
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER_A.email)
    await page.fill('input[name="password"]', TEST_USER_A.password)
    await page.click('button:has-text("Login")')
    
    // Go to inbox
    await page.goto('/dashboard/inbox')
    await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 10000 })
    await page.locator('[data-testid="conversation-item"]').first().click()
    
    // Click file attachment button
    await page.click('[data-testid="attach-file-button"]')
    
    // Upload a test file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-file.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is a test file content'),
    })
    
    // Wait for upload to complete and file to appear
    await expect(page.locator('[data-testid="file-message"]')).toBeVisible()
    await expect(page.locator('text=test-file.txt')).toBeVisible()
  })
})
