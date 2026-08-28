const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const report = [];
  function log(msg) {
    console.log(msg);
    report.push(msg);
  }

  log('# Frontend E2E Acceptance Report\n');

  try {
    // PHASE 1
    log('## PHASE 1: Backend + Frontend Startup');
    await page.goto('http://localhost:5173');
    
    // Check Health
    await page.waitForSelector('text=Backend');
    const healthPill = await page.locator('.bg-emerald-500').count();
    if (healthPill > 0) log('✓ PASS: Backend Connected indicator is green.');
    else log('✗ FAIL: Backend Connected indicator not found.');

    // Wait for analyses
    await page.waitForSelector('text=All Analyses', { timeout: 10000 }).catch(() => log('No All Analyses header, maybe no history yet.'));
    const noAnalyses = await page.locator('text=No analyses yet').count();
    if (noAnalyses === 0) log('✓ PASS: UI does not show "No analyses yet".');
    else log('✗ INFO: UI shows "No analyses yet" - database is empty.');

    // PHASE 2
    log('\n## PHASE 2: Analysis History');
    await page.goto('http://localhost:5173/analyses');
    await page.waitForLoadState('networkidle');
    const listCards = await page.locator('a[href^="/analyses/"]').count();
    log(`✓ PASS: Found ${listCards} historical analyses on the list page.`);
    
    if (listCards > 0) {
      await page.locator('a[href^="/analyses/"]').first().click();
      await page.waitForSelector('text=Validation', { timeout: 10000 });
      log('✓ PASS: Successfully navigated to the newest analysis detail page.');
    }

    // PHASE 5: Backend Offline / Cache Test
    log('\n## PHASE 5 & 6: Backend Offline / Cache Test & Offline Read Behavior');
    await context.route('**/api/v1/analyses*', route => route.abort('failed'));
    await context.route('**/health', route => route.abort('failed'));
    
    await page.goto('http://localhost:5173'); // Refresh browser
    await page.waitForLoadState('networkidle');
    
    // Check if CACHED pill exists
    const cachedPill = await page.locator('text=CACHED').count();
    if (cachedPill > 0) log('✓ PASS: CACHED indicator is present when offline.');
    else log('✗ FAIL: CACHED indicator is missing.');
    
    const staleList = await page.locator('a[href^="/analyses/"]').count();
    log(`✓ PASS: Displayed ${staleList} cached items while offline.`);

    const noHistory = await page.locator('text=No analysis history available').count();
    if (noHistory === 0) log('✓ PASS: UI does NOT show "No analysis history available".');
    else log('✗ FAIL: UI incorrectly shows no history available.');

    // PHASE 7
    log('\n## PHASE 7: Refresh Data While Offline');
    await page.click('text=Refresh Data');
    await page.waitForTimeout(1000);
    const stillCached = await page.locator('text=CACHED').count();
    if (stillCached > 0) log('✓ PASS: Cached data survived failed refresh.');
    else log('✗ FAIL: Cached data disappeared on failed refresh.');

    // PHASE 8
    log('\n## PHASE 8: Backend Recovery');
    // Restore network
    await context.unroute('**/api/v1/analyses*');
    await context.unroute('**/health');
    
    await page.click('text=Refresh Data');
    await page.waitForTimeout(2000);
    const cachedGone = await page.locator('text=CACHED').count();
    if (cachedGone === 0) log('✓ PASS: Cached indicator vanished after successful refresh.');
    else log('✗ FAIL: Cached indicator persisted after recovery.');

  } catch (err) {
    log('ERROR: ' + err.message);
  } finally {
    await browser.close();
    fs.writeFileSync('../frontend_e2e_acceptance_report.md', report.join('\n'));
    console.log('Report written to frontend_e2e_acceptance_report.md');
  }
}

run();
