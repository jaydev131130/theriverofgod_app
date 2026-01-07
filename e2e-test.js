const { firefox } = require('playwright');

(async () => {
  console.log('Starting E2E test for chapter navigation...\n');

  const browser = await firefox.launch({
    headless: true
  });
  const context = await browser.newContext({
    javaScriptEnabled: true,
  });
  const page = await context.newPage();

  // Enable ALL console log capture
  page.on('console', msg => {
    console.log('CONSOLE:', msg.type(), msg.text());
  });

  // Capture page errors
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });

  try {
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:8082', { waitUntil: 'load', timeout: 60000 });
    console.log('   Page loaded, waiting for React to mount...');
    await page.waitForTimeout(10000);

    // Take screenshot
    await page.screenshot({ path: '/tmp/test-1-initial.png' });
    console.log('   Screenshot saved: /tmp/test-1-initial.png');

    // Get page content
    const title = await page.title();
    console.log('   Page title:', title);

    // Check HTML structure
    const html = await page.content();
    console.log('   HTML length:', html.length);
    console.log('   HTML preview:', html.substring(0, 500));

    // Check #root element
    const rootElement = await page.locator('#root').innerHTML();
    console.log('   #root content length:', rootElement.length);
    console.log('   #root preview:', rootElement.substring(0, 300));

    // Check for any visible text
    const bodyText = await page.locator('body').innerText();
    console.log('   Body text preview:', bodyText.substring(0, 200));

    // Look for Library tab or books
    console.log('\n2. Looking for Library/Books...');
    const libraryTab = page.locator('text=Library').first();
    if (await libraryTab.isVisible()) {
      console.log('   Found Library tab, clicking...');
      await libraryTab.click();
      await page.waitForTimeout(1000);
    }

    // Look for any book or reader elements
    console.log('\n3. Looking for Reader elements...');
    const readerTab = page.locator('text=Reading').first();
    if (await readerTab.isVisible()) {
      console.log('   Found Reading tab, clicking...');
      await readerTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/test-2-reader.png' });
      console.log('   Screenshot saved: /tmp/test-2-reader.png');
    }

    // Look for chapter list button
    console.log('\n4. Looking for chapter list button...');
    const listButton = page.locator('[data-testid="chapter-list-button"]').first();
    const listIcon = page.locator('svg, [name="list-outline"]').first();

    // Get all buttons
    const buttons = await page.locator('button, [role="button"]').all();
    console.log('   Found', buttons.length, 'buttons');

    // Check for DEBUG banner
    console.log('\n5. Checking for DEBUG banner...');
    const debugBanner = page.locator('text=DEBUG').first();
    if (await debugBanner.isVisible()) {
      const debugText = await debugBanner.innerText();
      console.log('   DEBUG banner content:', debugText);
    } else {
      console.log('   DEBUG banner not visible');
    }

    // Final screenshot
    await page.screenshot({ path: '/tmp/test-3-final.png', fullPage: true });
    console.log('\n   Final screenshot saved: /tmp/test-3-final.png');

    // Print full page content for debugging
    console.log('\n=== FULL PAGE CONTENT ===');
    console.log(bodyText);
    console.log('=== END PAGE CONTENT ===\n');

  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: '/tmp/test-error.png' });
  } finally {
    await browser.close();
    console.log('\nTest completed.');
  }
})();
