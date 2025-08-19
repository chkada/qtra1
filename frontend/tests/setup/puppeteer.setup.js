// Simple Puppeteer setup
jest.setTimeout(30000);

// Global utilities
global.waitForAnimation = async (page, duration = 1000) => {
  await new Promise(resolve => setTimeout(resolve, duration));
};

global.waitForPageLoad = async (page, url = 'http://localhost:3000') => {
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 500));
};