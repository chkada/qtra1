const puppeteer = require('puppeteer');

describe('UI Animations Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      slowMo: 50, // Slow down by 50ms for better visibility
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  });

  describe('Page Transition Animations', () => {
    test('should have smooth page transitions', async () => {
      // Wait for initial page load
      await page.waitForSelector('[data-testid="page-content"]', { timeout: 5000 });
      
      // Check if page transition component is present
      const pageTransition = await page.$('[data-testid="page-transition"]');
      expect(pageTransition).toBeTruthy();
      
      // Test navigation transition
      await page.click('a[href="/teachers"]');
      await page.waitForSelector('[data-testid="page-content"]', { timeout: 5000 });
      
      // Verify smooth transition occurred
      const opacity = await page.evaluate(() => {
        const element = document.querySelector('[data-testid="page-transition"]');
        return window.getComputedStyle(element).opacity;
      });
      expect(parseFloat(opacity)).toBeGreaterThan(0);
    });
  });

  describe('Button Micro-interactions', () => {
    test('should have hover effects on buttons', async () => {
      // Find a button element
      await page.waitForSelector('button', { timeout: 5000 });
      
      // Get initial button styles
      const initialTransform = await page.evaluate(() => {
        const button = document.querySelector('button');
        return window.getComputedStyle(button).transform;
      });
      
      // Hover over the button
      await page.hover('button');
      await page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, 300))); // Wait for animation
      
      // Check if transform changed (indicating hover effect)
      const hoverTransform = await page.evaluate(() => {
        const button = document.querySelector('button');
        return window.getComputedStyle(button).transform;
      });
      
      // Transform should change on hover (scale effect)
      expect(hoverTransform).not.toBe(initialTransform);
    });

    test('should have tap/click animations', async () => {
      await page.waitForSelector('button', { timeout: 5000 });
      
      // Click and hold to test tap animation
      await page.mouse.move(100, 100);
      await page.mouse.down();
      await page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const tapTransform = await page.evaluate(() => {
        const button = document.querySelector('button');
        return window.getComputedStyle(button).transform;
      });
      
      await page.mouse.up();
      
      // Should have some transform during tap
      expect(tapTransform).toContain('scale');
    });
  });

  describe('Input Animations', () => {
    test('should animate input labels on focus', async () => {
      // Find an input element
      await page.waitForSelector('input', { timeout: 5000 });
      
      // Get label initial position
      const initialLabelTransform = await page.evaluate(() => {
        const label = document.querySelector('label');
        return label ? window.getComputedStyle(label).transform : 'none';
      });
      
      // Focus on input
      await page.focus('input');
      await page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, 300)));
      
      // Check if label moved (animated)
      const focusLabelTransform = await page.evaluate(() => {
        const label = document.querySelector('label');
        return label ? window.getComputedStyle(label).transform : 'none';
      });
      
      expect(focusLabelTransform).not.toBe(initialLabelTransform);
    });
  });

  describe('Card Hover Effects', () => {
    test('should have subtle hover effects on teacher cards', async () => {
      // Navigate to teachers page if not already there
      await page.goto('http://localhost:3000/teachers', { waitUntil: 'networkidle0' });
      
      // Wait for teacher cards to load
      await page.waitForSelector('[data-testid="teacher-card"]', { timeout: 5000 });
      
      // Get initial card transform
      const initialTransform = await page.evaluate(() => {
        const card = document.querySelector('[data-testid="teacher-card"]');
        return window.getComputedStyle(card).transform;
      });
      
      // Hover over the card
      await page.hover('[data-testid="teacher-card"]');
      await page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, 300)));
      
      // Check if card lifted (y-transform changed)
      const hoverTransform = await page.evaluate(() => {
        const card = document.querySelector('[data-testid="teacher-card"]');
        return window.getComputedStyle(card).transform;
      });
      
      expect(hoverTransform).not.toBe(initialTransform);
    });

    test('should animate card elements on hover', async () => {
      await page.goto('http://localhost:3000/teachers', { waitUntil: 'networkidle0' });
      await page.waitForSelector('[data-testid="teacher-card"]', { timeout: 5000 });
      
      // Test image scaling on card hover
      const imageSelector = '[data-testid="teacher-card"] img';
      await page.waitForSelector(imageSelector, { timeout: 5000 });
      
      const initialImageTransform = await page.evaluate((selector) => {
        const img = document.querySelector(selector);
        return img ? window.getComputedStyle(img).transform : 'none';
      }, imageSelector);
      
      await page.hover('[data-testid="teacher-card"]');
      await page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, 300)));
      
      const hoverImageTransform = await page.evaluate((selector) => {
        const img = document.querySelector(selector);
        return img ? window.getComputedStyle(img).transform : 'none';
      }, imageSelector);
      
      expect(hoverImageTransform).not.toBe(initialImageTransform);
    });
  });

  describe('Loading Animations', () => {
    test('should display loading animations', async () => {
      // Test loading component if it exists
      const loadingExists = await page.evaluate(() => {
        return document.querySelector('[data-testid="loading-animation"]') !== null;
      });
      
      if (loadingExists) {
        const isAnimating = await page.evaluate(() => {
          const loading = document.querySelector('[data-testid="loading-animation"]');
          const computedStyle = window.getComputedStyle(loading);
          return computedStyle.animationName !== 'none' || computedStyle.transform !== 'none';
        });
        
        expect(isAnimating).toBe(true);
      }
    });
  });

  describe('Reduced Motion Accessibility', () => {
    test('should respect prefers-reduced-motion setting', async () => {
      // Emulate reduced motion preference
      await page.emulateMediaFeatures([
        { name: 'prefers-reduced-motion', value: 'reduce' }
      ]);
      
      await page.reload({ waitUntil: 'networkidle0' });
      
      // Test that animations are reduced
      await page.waitForSelector('button', { timeout: 5000 });
      await page.hover('button');
      await page.waitForTimeout(300);
      
      // With reduced motion, scale effects should be minimal or absent
      const transform = await page.evaluate(() => {
        const button = document.querySelector('button');
        return window.getComputedStyle(button).transform;
      });
      
      // Should not have significant scale transforms with reduced motion
      const hasSignificantScale = transform.includes('scale(1.1)') || transform.includes('scale(1.2)');
      expect(hasSignificantScale).toBe(false);
    });
  });

  describe('Link Animations', () => {
    test('should animate links on hover', async () => {
      await page.waitForSelector('a', { timeout: 5000 });
      
      const initialLinkStyle = await page.evaluate(() => {
        const link = document.querySelector('a');
        const style = window.getComputedStyle(link);
        return {
          transform: style.transform,
          textDecoration: style.textDecoration
        };
      });
      
      await page.hover('a');
      await page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, 200)));
      
      const hoverLinkStyle = await page.evaluate(() => {
        const link = document.querySelector('a');
        const style = window.getComputedStyle(link);
        return {
          transform: style.transform,
          textDecoration: style.textDecoration
        };
      });
      
      // Either transform or text decoration should change
      const hasChanged = 
        hoverLinkStyle.transform !== initialLinkStyle.transform ||
        hoverLinkStyle.textDecoration !== initialLinkStyle.textDecoration;
      
      expect(hasChanged).toBe(true);
    });
  });
});