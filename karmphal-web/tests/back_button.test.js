import test from 'node:test';
import assert from 'node:assert';
import { backButtonService, BACK_PRIORITY } from '../src/services/backButtonService.js';

test('Global Back Button Handler Test Suite', async (t) => {
  // Test 1: Priority Order - Modal closes before PDF reader or navigation
  await t.test('Test 1: Closes top-most modal first before PDF reader or navigation', async () => {
    let modalClosed = false;
    let pdfClosed = false;
    let navPopped = false;

    // Register navigation handler
    backButtonService.configureNavigation({
      isHome: () => false,
      popNavigation: () => { navPopped = true; return true; },
      showExitNotice: () => {},
      exitApp: () => {}
    });

    // Register PDF Reader handler
    const unregPdf = backButtonService.register(() => {
      pdfClosed = true;
      return true;
    }, BACK_PRIORITY.PDF_READER);

    // Register Top Modal handler
    const unregModal = backButtonService.register(() => {
      modalClosed = true;
      return true;
    }, BACK_PRIORITY.MODAL);

    const result = await backButtonService.handleBackButton();
    assert.strictEqual(result, 'MODAL_CLOSED', 'Result must be MODAL_CLOSED');
    assert.strictEqual(modalClosed, true, 'Modal close handler must have executed');
    assert.strictEqual(pdfClosed, false, 'PDF reader must NOT have closed while modal was open');
    assert.strictEqual(navPopped, false, 'Navigation must NOT have popped while modal was open');

    unregModal();
    unregPdf();
  });

  // Test 2: Nested Modals - Most recently opened modal (LIFO) closes first
  await t.test('Test 2: Closes newest nested modal before parent modal', async () => {
    let outerModalClosed = false;
    let innerModalClosed = false;

    const unregOuter = backButtonService.register(() => {
      outerModalClosed = true;
      return true;
    }, BACK_PRIORITY.MODAL);

    // Small delay to ensure timestamp difference
    await new Promise(r => setTimeout(r, 5));

    const unregInner = backButtonService.register(() => {
      innerModalClosed = true;
      return true;
    }, BACK_PRIORITY.MODAL + 1);

    const result = await backButtonService.handleBackButton();
    assert.strictEqual(result, 'MODAL_CLOSED');
    assert.strictEqual(innerModalClosed, true, 'Inner modal must close first');
    assert.strictEqual(outerModalClosed, false, 'Outer modal must remain open');

    unregInner();
    unregOuter();
  });

  // Test 3: PDF Reader closes when no modals are open
  await t.test('Test 3: Closes PDF Reader when no modals are open', async () => {
    let pdfClosed = false;
    let navPopped = false;

    backButtonService.configureNavigation({
      isHome: () => false,
      popNavigation: () => { navPopped = true; return true; },
      showExitNotice: () => {},
      exitApp: () => {}
    });

    const unregPdf = backButtonService.register(() => {
      pdfClosed = true;
      return true;
    }, BACK_PRIORITY.PDF_READER);

    const result = await backButtonService.handleBackButton();
    assert.strictEqual(result, 'PDF_CLOSED');
    assert.strictEqual(pdfClosed, true, 'PDF reader close handler must have executed');
    assert.strictEqual(navPopped, false, 'Navigation must not pop when PDF reader closes');

    unregPdf();
  });

  // Test 4: Screen / Tab Navigation - pops previous screen when no modals/readers
  await t.test('Test 4: Navigates back to previous screen when no modals or readers are active', async () => {
    let navPopped = false;

    backButtonService.configureNavigation({
      isHome: () => false,
      popNavigation: () => {
        navPopped = true;
        return true;
      },
      showExitNotice: () => {},
      exitApp: () => {}
    });

    const result = await backButtonService.handleBackButton();
    assert.strictEqual(result, 'NAVIGATED_BACK');
    assert.strictEqual(navPopped, true, 'Navigation stack must have popped to previous screen');
  });

  // Test 5: On Home Screen - First back press shows "press again to exit" toast
  await t.test('Test 5: First press on Home screen prompts exit notice without exiting', async () => {
    let exitPrompted = false;
    let appExited = false;

    // Reset lastBackPressTime to 0
    backButtonService.lastBackPressTime = 0;

    backButtonService.configureNavigation({
      isHome: () => true,
      popNavigation: () => false,
      showExitNotice: () => { exitPrompted = true; },
      exitApp: () => { appExited = true; }
    });

    const result = await backButtonService.handleBackButton();
    assert.strictEqual(result, 'EXIT_PROMPTED');
    assert.strictEqual(exitPrompted, true, 'Exit notice prompt must be triggered');
    assert.strictEqual(appExited, false, 'App must NOT exit on first press');
  });

  // Test 6: On Home Screen - Double-press within 2s exits the app
  await t.test('Test 6: Second press on Home screen within 2s triggers App.exitApp()', async () => {
    let exitPrompted = false;
    let appExited = false;

    backButtonService.configureNavigation({
      isHome: () => true,
      popNavigation: () => false,
      showExitNotice: () => { exitPrompted = true; },
      exitApp: () => { appExited = true; }
    });

    // 1st press
    backButtonService.lastBackPressTime = Date.now();

    // 2nd press within 200ms (< 2000ms)
    await new Promise(r => setTimeout(r, 200));
    const result = await backButtonService.handleBackButton();

    assert.strictEqual(result, 'EXITED');
    assert.strictEqual(appExited, true, 'App.exitApp() must be executed');
  });

  // Test 7: On Home Screen - Second press after > 2s does NOT exit (resets timer)
  await t.test('Test 7: Second press on Home screen after > 2s resets timer and prompts again', async () => {
    let exitPromptedCount = 0;
    let appExited = false;

    backButtonService.configureNavigation({
      isHome: () => true,
      popNavigation: () => false,
      showExitNotice: () => { exitPromptedCount++; },
      exitApp: () => { appExited = true; }
    });

    // 1st press: Simulated 2500ms ago
    backButtonService.lastBackPressTime = Date.now() - 2500;

    const result = await backButtonService.handleBackButton();
    assert.strictEqual(result, 'EXIT_PROMPTED');
    assert.strictEqual(appExited, false, 'App must not exit after timeout expired');
    assert.strictEqual(exitPromptedCount, 1, 'Exit notice prompted again');
  });
});
