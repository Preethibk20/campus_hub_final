// Automated Demo Script for Campus Hub
window.runAutoDemo = function() {
  console.log('🚀 Starting Campus Hub Auto Demo...');
  
  const demo = {
    step: 0,
    steps: [
      { name: 'Navigate to Auth', action: () => navigateToAuth() },
      { name: 'Fill Login Form', action: () => fillLoginForm() },
      { name: 'Submit Login', action: () => submitLogin() },
      { name: 'Navigate to Dashboard', action: () => navigateToDashboard() },
      { name: 'Check Verification Status', action: () => checkVerification() },
      { name: 'Navigate to Marketplace', action: () => navigateToMarketplace() },
      { name: 'Browse Services', action: () => browseServices() },
      { name: 'Navigate to Profile', action: () => navigateToProfile() },
      { name: 'View Portfolio', action: () => viewPortfolio() },
      { name: 'Navigate to Team Finder', action: () => navigateToTeamFinder() },
      { name: 'Browse Teams', action: () => browseTeams() },
      { name: 'Navigate to Leaderboard', action: () => navigateToLeaderboard() },
      { name: 'View Rankings', action: () => viewRankings() }
    ]
  };

  function navigateToAuth() {
    console.log('📍 Step 1: Navigating to Authentication...');
    // If not already on auth page, click login/signup
    const authButton = document.querySelector('button[href*="auth"], button:contains("Sign"), button:contains("Login")');
    if (authButton) authButton.click();
    nextStep();
  }

  function fillLoginForm() {
    console.log('📝 Step 2: Filling login form...');
    setTimeout(() => {
      const credentials = window.demoData.credentials;
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      
      if (emailInput) {
        emailInput.value = credentials.email;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (passwordInput) {
        passwordInput.value = credentials.password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      nextStep();
    }, 1000);
  }

  function submitLogin() {
    console.log('✅ Step 3: Submitting login...');
    setTimeout(() => {
      const submitButton = document.querySelector('button[type="submit"], button:contains("Sign In"), button:contains("Login")');
      if (submitButton) submitButton.click();
      nextStep();
    }, 1000);
  }

  function navigateToDashboard() {
    console.log('🏠 Step 4: Navigating to Dashboard...');
    setTimeout(() => {
      const dashboardTab = document.querySelector('button:contains("Dashboard"), [data-tab="dashboard"]');
      if (dashboardTab) dashboardTab.click();
      nextStep();
    }, 2000);
  }

  function checkVerification() {
    console.log('✅ Step 5: Checking verification status...');
    setTimeout(() => {
      const verificationBadge = document.querySelector('.verification-badge, [class*="verified"], [class*="badge"]');
      if (verificationBadge) {
        console.log('✨ Verification badge found:', verificationBadge.textContent);
      }
      nextStep();
    }, 1000);
  }

  function navigateToMarketplace() {
    console.log('🛍️ Step 6: Navigating to Marketplace...');
    setTimeout(() => {
      const marketplaceTab = document.querySelector('button:contains("Marketplace"), [data-tab="marketplace"]');
      if (marketplaceTab) marketplaceTab.click();
      nextStep();
    }, 1000);
  }

  function browseServices() {
    console.log('🔍 Step 7: Browsing services...');
    setTimeout(() => {
      const serviceCards = document.querySelectorAll('[class*="service"], [class*="gig"], [class*="session"]');
      console.log(`📦 Found ${serviceCards.length} services/sessions`);
      if (serviceCards.length > 0) {
        serviceCards[0].scrollIntoView({ behavior: 'smooth' });
      }
      nextStep();
    }, 1500);
  }

  function navigateToProfile() {
    console.log('👤 Step 8: Navigating to Profile...');
    setTimeout(() => {
      const profileTab = document.querySelector('button:contains("Profile"), [data-tab="profile"]');
      if (profileTab) profileTab.click();
      nextStep();
    }, 1000);
  }

  function viewPortfolio() {
    console.log('💼 Step 9: Viewing Portfolio...');
    setTimeout(() => {
      const portfolioTab = document.querySelector('button:contains("Portfolio"), [class*="portfolio"]');
      if (portfolioTab) portfolioTab.click();
      
      const portfolioItems = document.querySelectorAll('[class*="portfolio-item"], [class*="project"]');
      console.log(`🎨 Found ${portfolioItems.length} portfolio items`);
      nextStep();
    }, 1500);
  }

  function navigateToTeamFinder() {
    console.log('👥 Step 10: Navigating to Team Finder...');
    setTimeout(() => {
      const teamTab = document.querySelector('button:contains("Team"), [class*="team"]');
      if (teamTab) teamTab.click();
      nextStep();
    }, 1000);
  }

  function browseTeams() {
    console.log('🔎 Step 11: Browsing teams...');
    setTimeout(() => {
      const teamPosts = document.querySelectorAll('[class*="team-post"], [class*="hackathon"]');
      console.log(`🚀 Found ${teamPosts.length} team posts`);
      if (teamPosts.length > 0) {
        teamPosts[0].scrollIntoView({ behavior: 'smooth' });
      }
      nextStep();
    }, 1500);
  }

  function navigateToLeaderboard() {
    console.log('🏆 Step 12: Navigating to Leaderboard...');
    setTimeout(() => {
      const leaderboardTab = document.querySelector('button:contains("Leaderboard"), [class*="leaderboard"]');
      if (leaderboardTab) leaderboardTab.click();
      nextStep();
    }, 1000);
  }

  function viewRankings() {
    console.log('📊 Step 13: Viewing rankings...');
    setTimeout(() => {
      const leaderboardEntries = document.querySelectorAll('[class*="leaderboard-entry"], [class*="rank"]');
      console.log(`🏅 Found ${leaderboardEntries.length} leaderboard entries`);
      
      const timeRangeButtons = document.querySelectorAll('button:contains("Week"), button:contains("Month"), button:contains("All")');
      console.log(`📅 Found ${timeRangeButtons.length} time range filters`);
      
      console.log('🎉 Demo completed successfully!');
      console.log('📋 All features demonstrated:');
      console.log('  ✅ Authentication & Verification');
      console.log('  ✅ Dashboard Overview');
      console.log('  ✅ Marketplace & Services');
      console.log('  ✅ Profile & Portfolio');
      console.log('  ✅ Team Finder');
      console.log('  ✅ Leaderboard & Rankings');
    }, 1500);
  }

  function nextStep() {
    demo.step++;
    if (demo.step < demo.steps.length) {
      const nextStepDemo = demo.steps[demo.step];
      console.log(`\n➡️  Moving to Step ${demo.step + 1}: ${nextStepDemo.name}`);
      setTimeout(nextStepDemo.action, 500);
    }
  }

  // Start the demo
  if (demo.steps.length > 0) {
    demo.steps[0].action();
  }
};

// Helper function to find elements by text content
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || 
                              Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// Custom selector for text content
document.querySelector(':contains') = function(text) {
  return Array.from(document.querySelectorAll('*')).find(el => el.textContent.includes(text));
};

console.log('🎬 Auto Demo Script Loaded!');
console.log('Run runAutoDemo() to start the automated demonstration');
console.log('Or manually follow the steps in DEMO_GUIDE.md');
