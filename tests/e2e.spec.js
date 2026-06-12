const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

test.describe('YouTube Deep Pause E2E', () => {
  let browserContext;
  let extensionId;

  test.beforeAll(async () => {
    const pathToExtension = path.join(__dirname, '../');
    browserContext = await chromium.launchPersistentContext('', {
      headless: false, // Chrome extensions only load in headful mode in Playwright
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    });

    // Find the extension ID to navigate to options page
    let [background] = browserContext.serviceWorkers();
    if (!background) {
      background = await browserContext.waitForEvent('serviceworker');
    }
    const extensionUri = background.url().split('/')[2];
    extensionId = extensionUri;
  });

  test.afterAll(async () => {
    await browserContext.close();
  });

  test('Options page loads and saves preferences', async () => {
    const page = await browserContext.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    
    await expect(page.locator('h2')).toHaveText('Deep Pause Settings');
    
    // Test Saving API Key
    await page.fill('#apiKey', 'test-gemini-key-123');
    await page.fill('#previewLength', '120');
    await page.click('#save');
    
    await expect(page.locator('#status')).toHaveText('Preferences saved successfully!');
  });
});
