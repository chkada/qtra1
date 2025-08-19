module.exports = {
  // Launch options for Puppeteer
  launch: {
    headless: process.env.CI ? true : false, // Headless in CI, visible locally
    slowMo: process.env.CI ? 0 : 50, // Slow down for better visibility in local dev
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
    defaultViewport: {
      width: 1280,
      height: 720
    }
  },
  
  // Server configuration
  server: {
    command: 'npm run dev',
    port: 3000,
    launchTimeout: 30000,
    debug: true
  },
  
  // Test configuration
  testTimeout: 30000,
  
  // Browser context options
  browserContext: {
    ignoreHTTPSErrors: true
  }
};